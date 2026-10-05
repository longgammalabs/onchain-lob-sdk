import BigNumber from 'bignumber.js';

import {
  calculateAccountMetrics, calculateAdm, calculateAdmc, calculateBankruptcyPrice, calculateEquity, calculateLiquidationPrice,
  calculateMaxLeverage, calculateRequiredMargin, calculateRequirement, calculateUnrealizedPnl, getHealthState, isWithinCollar,
  markValue, simulateFill, ticksToPriceX18, valueDown, valueUp, type PerpRiskInput
} from './risk';
import { PerpHealthState } from '../models';

// Risk parameters of the deployed WETH-tUSDC-PERP (riskParams() on Monad testnet).
const risk: PerpRiskInput = {
  imrBps: 1000,
  mmrBps: 500,
  cmrBps: 750,
  collarBps: 300,
  makerFeeBps: 0,
  quoteTick: 1n,
};
const mark = ticksToPriceX18(300000n);

describe('valuation', () => {
  test('ticks to the X18 mark', () => {
    expect(ticksToPriceX18(300000n)).toBe(300000n * 10n ** 18n);
    expect(ticksToPriceX18(new BigNumber('300000.5'))).toBe(3000005n * 10n ** 17n);
  });

  test('vUp and vDown round in opposite directions', () => {
    const price = ticksToPriceX18(new BigNumber('0.5'));
    expect(valueDown(3n, price, 1n)).toBe(1n);
    expect(valueUp(3n, price, 1n)).toBe(2n);
    expect(valueUp(-3n, price, 1n)).toBe(2n);
  });

  test('mark value: a long rounds down, a short rounds up (against the account)', () => {
    const price = ticksToPriceX18(new BigNumber('0.5'));
    expect(markValue(3n, price, 1n)).toBe(1n);
    expect(markValue(-3n, price, 1n)).toBe(-2n);
    expect(markValue(0n, price, 1n)).toBe(0n);
  });

  test('unrealized PnL and equity', () => {
    // long 10 lots entered at 300000, the mark is 310000
    const unrealized = calculateUnrealizedPnl(10n, 3_000_000n, ticksToPriceX18(310000n), 1n);
    expect(unrealized).toBe(100_000n);
    expect(calculateEquity(300_000n, unrealized, 2n)).toBe(399_998n);
    // short 10 lots entered at 300000, the mark is 310000: a loss
    expect(calculateUnrealizedPnl(-10n, -3_000_000n, ticksToPriceX18(310000n), 1n)).toBe(-100_000n);
  });
});

describe('margin requirements', () => {
  test('IM, MM and CM of a position are ceil(vUp * rate)', () => {
    expect(calculateRequirement(10n, mark, 1000, 1n)).toBe(300_000n);
    expect(calculateRequirement(-10n, mark, 500, 1n)).toBe(150_000n);
    expect(calculateRequirement(1n, ticksToPriceX18(333n), 750, 1n)).toBe(25n); // ceil(24.975)
  });

  test('ADM and ADMc match perpAccount() of the deployed market (no position, 5000 lots on each side)', () => {
    // Read on chain: qBid = qAsk = 5000, adm = 195000000, admc = 157500000, mark = 300000 ticks.
    expect(calculateAdm(0n, 5000n, 5000n, mark, risk)).toBe(195_000_000n);
    expect(calculateAdmc(0n, 5000n, 5000n, mark, risk)).toBe(157_500_000n);
  });

  test('ADM without orders is the initial margin', () => {
    expect(calculateAdm(10n, 0n, 0n, mark, risk)).toBe(calculateRequirement(10n, mark, 1000, 1n));
    expect(calculateAdm(-10n, 0n, 0n, mark, risk)).toBe(300_000n);
  });

  test('ADM takes the worse scenario: an order on the risk-increasing side adds exposure', () => {
    // long 10, a bid for 5 would make it 15 (scenario 1), an ask for 5 would make it 5 (scenario 2)
    const adm = calculateAdm(10n, 5n, 0n, mark, risk);
    expect(adm).toBe(calculateRequirement(15n, mark, 1000, 1n) + 45_000n); // + kappa * vUp(5) = 3% * 1.5M
  });

  test('the maker fee term is added', () => {
    const withFee = calculateAdm(0n, 100n, 0n, mark, { ...risk, makerFeeBps: 10 });
    const withoutFee = calculateAdm(0n, 100n, 0n, mark, risk);
    // ceil(10 * (10000 + 300) * 30_000_000 / 1e8) = 30900
    expect(withFee - withoutFee).toBe(30_900n);
  });

  test('ladder: ADM >= ADMc >= MM for every state', () => {
    for (const size of [0n, 10n, -10n, 123n]) {
      for (const [qBid, qAsk] of [[0n, 0n], [7n, 3n], [100n, 100n]] as const) {
        const adm = calculateAdm(size, qBid, qAsk, mark, risk);
        const admc = calculateAdmc(size, qBid, qAsk, mark, risk);
        expect(adm).toBeGreaterThanOrEqual(admc);
        expect(admc).toBeGreaterThanOrEqual(calculateRequirement(size, mark, risk.mmrBps, 1n));
      }
    }
  });

  test('health state follows the ladder', () => {
    const [adm, admc, mm] = [100n, 80n, 50n];
    expect(getHealthState(100n, adm, admc, mm)).toBe(PerpHealthState.Healthy);
    expect(getHealthState(99n, adm, admc, mm)).toBe(PerpHealthState.NoNewRisk);
    expect(getHealthState(80n, adm, admc, mm)).toBe(PerpHealthState.NoNewRisk);
    expect(getHealthState(79n, adm, admc, mm)).toBe(PerpHealthState.ForcedCancel);
    expect(getHealthState(50n, adm, admc, mm)).toBe(PerpHealthState.ForcedCancel);
    expect(getHealthState(49n, adm, admc, mm)).toBe(PerpHealthState.Liquidatable);
    expect(getHealthState(0n, adm, admc, mm)).toBe(PerpHealthState.Liquidatable);
    expect(getHealthState(-1n, adm, admc, mm)).toBe(PerpHealthState.Bankrupt);
  });

  test('account metrics reproduce the deployed account (collateral 20015.341311 tUSDC, 10 open orders)', () => {
    const metrics = calculateAccountMetrics({
      collateral: 20_015_341_311n, size: 0n, costBasis: 0n, owedCharges: 0n, qBid: 5000n, qAsk: 5000n, priceX18: mark,
    }, risk);
    expect(metrics).toMatchObject({
      unrealized: 0n,
      equity: 20_015_341_311n,
      maintenanceMargin: 0n,
      adm: 195_000_000n,
      admc: 157_500_000n,
      state: PerpHealthState.Healthy,
      availableMargin: 20_015_341_311n - 195_000_000n,
    });
  });

  test('a position that lost its margin is liquidatable', () => {
    // long 10 @ 300000 with 100000 collateral; the mark drops to 291000: equity = 100000 + 2_910_000 - 3_000_000 = 10_000 < MM 145_500
    const metrics = calculateAccountMetrics({
      collateral: 100_000n, size: 10n, costBasis: 3_000_000n, owedCharges: 0n, qBid: 0n, qAsk: 0n, priceX18: ticksToPriceX18(291000n),
    }, risk);
    expect(metrics.equity).toBe(10_000n);
    expect(metrics.maintenanceMargin).toBe(145_500n);
    expect(metrics.state).toBe(PerpHealthState.Liquidatable);
  });

  test('required margin and max leverage', () => {
    expect(calculateMaxLeverage(1000)).toBe(10);
    expect(calculateRequiredMargin(10n, mark, 1n, 5, 1000)).toBe(600_000n);
    expect(calculateRequiredMargin(10n, mark, 1n, 10, 1000)).toBe(300_000n);
    expect(() => calculateRequiredMargin(10n, mark, 1n, 11, 1000)).toThrow('exceeds the market maximum');
    expect(() => calculateRequiredMargin(10n, mark, 1n, 0.5, 1000)).toThrow('Invalid leverage');
  });

  test('collar: a bid at most +3%, an ask at least -3% of the mark', () => {
    expect(isWithinCollar(true, 309000n, mark, 300)).toBe(true);
    expect(isWithinCollar(true, 309001n, mark, 300)).toBe(false);
    expect(isWithinCollar(false, 291000n, mark, 300)).toBe(true);
    expect(isWithinCollar(false, 290999n, mark, 300)).toBe(false);
  });
});

describe('simulateFill', () => {
  const flat = { size: 0n, costBasis: 0n, collateral: 1_000_000n };

  test('opens a long and charges the taker fee', () => {
    expect(simulateFill(flat, 10n, 300000n, 1n, 5)).toEqual({
      size: 10n, costBasis: 3_000_000n, collateral: 1_000_000n - 1500n, realizedPnl: 0n, fee: 1500n,
    });
  });

  test('opens a short', () => {
    expect(simulateFill(flat, -10n, 300000n, 1n, 5)).toMatchObject({ size: -10n, costBasis: -3_000_000n });
  });

  test('adds to a position in the same direction', () => {
    const long = { size: 10n, costBasis: 3_000_000n, collateral: 1_000_000n };
    expect(simulateFill(long, 5n, 310000n, 1n, 0)).toMatchObject({ size: 15n, costBasis: 4_550_000n, realizedPnl: 0n });
  });

  test('partially closes a long realizing the proportional PnL', () => {
    const long = { size: 10n, costBasis: 3_000_000n, collateral: 1_000_000n };
    expect(simulateFill(long, -5n, 310000n, 1n, 0)).toEqual({
      size: 5n, costBasis: 1_500_000n, collateral: 1_050_000n, realizedPnl: 50_000n, fee: 0n,
    });
  });

  test('fully closes a short with a loss', () => {
    const short = { size: -10n, costBasis: -3_000_000n, collateral: 1_000_000n };
    expect(simulateFill(short, 10n, 310000n, 1n, 0)).toMatchObject({ size: 0n, costBasis: 0n, realizedPnl: -100_000n, collateral: 900_000n });
  });

  test('flips: closes the whole position and opens the rest at the fill price', () => {
    const long = { size: 10n, costBasis: 3_000_000n, collateral: 1_000_000n };
    expect(simulateFill(long, -15n, 310000n, 1n, 0)).toMatchObject({
      size: -5n, costBasis: -1_550_000n, realizedPnl: 100_000n, collateral: 1_100_000n,
    });
  });

  test('realized PnL rounds down against the account', () => {
    // long 3 lots with basis 1000001: closing 1 lot removes ceil(1000001 / 3) = 333334
    expect(simulateFill({ size: 3n, costBasis: 1_000_001n, collateral: 0n }, -1n, 333333n, 1n, 0).realizedPnl).toBe(-1n);
    // short 3 lots with basis -1000001: closing 1 lot removes floor(1000001 / 3) = 333333
    expect(simulateFill({ size: -3n, costBasis: -1_000_001n, collateral: 0n }, 1n, 333334n, 1n, 0).realizedPnl).toBe(-1n);
  });

  test('a zero fill is a no-op', () => {
    expect(simulateFill(flat, 0n, 300000n, 1n, 5)).toEqual({ ...flat, realizedPnl: 0n, fee: 0n });
  });

  test('the quote tick scales the notional', () => {
    expect(simulateFill(flat, 2n, 5n, 1000n, 0)).toMatchObject({ costBasis: 10_000n });
  });
});

describe('liquidation price', () => {
  test('long: equity equals the maintenance margin at the liquidation price', () => {
    // 10 lots entered at 300000, 10x (collateral 300000), mmr 5%
    const price = calculateLiquidationPrice({ size: 10n, costBasis: 3_000_000n, collateral: 300_000n, mmrBps: 500, quoteTick: 1n })!;
    expect(price.toFixed(3)).toBe('284210.526');
    const equity = new BigNumber(300_000).plus(price.times(10)).minus(3_000_000);
    expect(equity.toFixed(3)).toBe(price.times(10).times(0.05).toFixed(3));
  });

  test('short', () => {
    const price = calculateLiquidationPrice({ size: -10n, costBasis: -3_000_000n, collateral: 300_000n, mmrBps: 500, quoteTick: 1n })!;
    expect(price.toFixed(3)).toBe('314285.714');
  });

  test('pending funding moves the liquidation price closer for a payer', () => {
    const base = { size: 10n, costBasis: 3_000_000n, collateral: 300_000n, mmrBps: 500, quoteTick: 1n };
    const without = calculateLiquidationPrice(base)!;
    const withFunding = calculateLiquidationPrice({ ...base, owedCharges: 10_000n })!;
    expect(withFunding.gt(without)).toBe(true);
  });

  test('bankruptcy price is where the equity is zero', () => {
    expect(calculateBankruptcyPrice({ size: 10n, costBasis: 3_000_000n, collateral: 300_000n, mmrBps: 500, quoteTick: 1n })!.toFixed(0)).toBe('270000');
    expect(calculateBankruptcyPrice({ size: -10n, costBasis: -3_000_000n, collateral: 300_000n, mmrBps: 500, quoteTick: 1n })!.toFixed(0)).toBe('330000');
  });

  test('is null for a flat or a fully collateralized long position', () => {
    expect(calculateLiquidationPrice({ size: 0n, costBasis: 0n, collateral: 1n, mmrBps: 500, quoteTick: 1n })).toBeNull();
    expect(calculateLiquidationPrice({ size: 10n, costBasis: 3_000_000n, collateral: 3_000_000n, mmrBps: 500, quoteTick: 1n })).toBeNull();
  });

  test('the position becomes liquidatable just below the liquidation price (long)', () => {
    const input = { size: 10n, costBasis: 3_000_000n, collateral: 300_000n };
    const liquidationPrice = calculateLiquidationPrice({ ...input, mmrBps: 500, quoteTick: 1n })!;
    const stateAt = (ticks: bigint) => calculateAccountMetrics({ ...input, owedCharges: 0n, qBid: 0n, qAsk: 0n, priceX18: ticksToPriceX18(ticks) }, risk).state;
    expect(stateAt(BigInt(liquidationPrice.integerValue(BigNumber.ROUND_CEIL).toFixed(0)) + 1n)).not.toBe(PerpHealthState.Liquidatable);
    expect(stateAt(BigInt(liquidationPrice.integerValue(BigNumber.ROUND_FLOOR).toFixed(0)) - 1n)).toBe(PerpHealthState.Liquidatable);
  });
});
