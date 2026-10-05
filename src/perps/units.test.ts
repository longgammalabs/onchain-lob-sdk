import BigNumber from 'bignumber.js';

import {
  calculateFee, calculateLimitPriceWithSlippage, calculateNotional, oraclePriceWadToTicks, calculateOwedCharges, fundingRateAnnualized, fundingRatePerHour, lotsToSize,
  priceToTicks, quoteAmountToUnits, quoteUnitsToAmount, sizeToLots, ticksToPrice
} from './units';

// WETH-tUSDC-PERP: baseLot = 1e14 (0.0001 WETH), quoteTick = 1, tUSDC has 6 decimals
// => sizeDecimals 4, priceDecimals 2.
const sizeDecimals = 4;
const priceDecimals = 2;

describe('perp units', () => {
  test('lots <-> size', () => {
    expect(lotsToSize(15000n, sizeDecimals)).toEqual(new BigNumber(1.5));
    expect(lotsToSize('-2500', sizeDecimals)).toEqual(new BigNumber(-0.25));
    expect(sizeToLots(new BigNumber('1.5'), sizeDecimals)).toBe(15000n);
  });

  test('size is rounded down to a lot by default', () => {
    expect(sizeToLots(new BigNumber('0.00019'), sizeDecimals)).toBe(1n);
    expect(sizeToLots(new BigNumber('0.00019'), sizeDecimals, BigNumber.ROUND_UP)).toBe(2n);
  });

  test('ticks <-> price', () => {
    expect(ticksToPrice(299850n, priceDecimals)).toEqual(new BigNumber(2998.5));
    expect(priceToTicks(new BigNumber('2998.5'), priceDecimals)).toBe(299850n);
    expect(priceToTicks(new BigNumber('2998.519'), priceDecimals)).toBe(299851n);
    expect(priceToTicks(new BigNumber('2998.501'), priceDecimals, BigNumber.ROUND_UP)).toBe(299851n);
  });

  test('quote units <-> amount', () => {
    expect(quoteUnitsToAmount(20015341311n, 6)).toEqual(new BigNumber('20015.341311'));
    expect(quoteAmountToUnits(new BigNumber('100.5'), 6)).toBe(100500000n);
    expect(quoteAmountToUnits(new BigNumber('0.0000009'), 6)).toBe(0n);
  });

  test('notional and fee are exact integers, the fee rounds up', () => {
    expect(calculateNotional(-10n, 300000n, 1n)).toBe(3_000_000n);
    expect(calculateNotional(3n, 7n, 100n)).toBe(2100n);
    expect(calculateFee(3_000_000n, 5)).toBe(1500n);
    expect(calculateFee(3_000_001n, 5)).toBe(1501n);
    expect(calculateFee(0n, 5)).toBe(0n);
  });

  test('funding rate conversions (the fixture 27,777,778 E15/s is ~0.01%/hour)', () => {
    expect(fundingRatePerHour(27777778n).toFixed(8)).toBe('0.00010000');
    expect(fundingRateAnnualized(27777778n).toFixed(4)).toBe('0.8760');
    expect(fundingRatePerHour(-27777778n).toFixed(8)).toBe('-0.00010000');
  });

  test('owed charges: payers round up, receivers round down', () => {
    expect(calculateOwedCharges(10n, 1_500_000_001n, 1_500_000_000n)).toBe(1n);
    expect(calculateOwedCharges(-10n, -1_000_000_001n, -1_000_000_000n)).toBe(0n);
    expect(calculateOwedCharges(10n, -1_500_000_000n, 0n)).toBe(-15n);
    expect(calculateOwedCharges(0n, 5n, 1n)).toBe(0n);
  });
});

describe('slippage and oracle conversions', () => {
  test('IOC limit with slippage: a buy rounds up, a sell rounds down', () => {
    expect(calculateLimitPriceWithSlippage(300000n, true, 50)).toBe(301500n);
    expect(calculateLimitPriceWithSlippage(300000n, false, 50)).toBe(298500n);
    expect(calculateLimitPriceWithSlippage(333n, true, 50)).toBe(335n); // ceil(334.665)
    expect(calculateLimitPriceWithSlippage(1n, false, 10_000)).toBe(1n);
    expect(() => calculateLimitPriceWithSlippage(1n, true, -1)).toThrow('Invalid slippage');
  });

  test('oracle price in WAD to ticks per lot', () => {
    // 3000 tUSDC (6 decimals) per WETH (18 decimals): 3000e6 / 1e18 quote units per base unit, in WAD: 3000e6 * 1e18 / 1e18 = 3e9
    // baseLot 1e14, quoteTick 1: 3e9 * 1e14 / 1e18 = 300000 ticks
    expect(oraclePriceWadToTicks(3_000_000_000n, 100_000_000_000_000n, 1n).toString()).toBe('300000');
  });
});
