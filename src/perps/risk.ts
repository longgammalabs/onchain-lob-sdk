import BigNumber from 'bignumber.js';

import { BPS, PRICE_X18 } from './constants';
import { calculateFee, calculateNotional, ceilDiv } from './units';
import { PerpHealthState } from '../models';

/**
 * Margin and risk math of a perp market. Pure functions over raw integers, a port of the formulas
 * the contract uses (D1 §2, §4; C1 §2-4, §10a; E1). Every rounding is against the account, exactly like
 * on chain, so the results match `PerpMarket.perpAccount` to the unit for the same oracle price.
 *
 * Conventions:
 * - `lots` and positions are signed `bigint` lots (positive = long);
 * - `priceX18` is the mark price in ticks per lot multiplied by 1e18 (the contract's canonical in-memory mark);
 * - money is raw quote-token units.
 */

/** The risk parameters the formulas need. */
export interface PerpRiskInput {
  imrBps: number;
  mmrBps: number;
  cmrBps: number;
  /** The collar (kappa). */
  collarBps: number;
  makerFeeBps: number;
  quoteTick: bigint;
}

const abs = (value: bigint): bigint => value < 0n ? -value : value;
const max = (a: bigint, b: bigint): bigint => a > b ? a : b;

/**
 * Converts a mark price in ticks (integer or fractional, as a BigNumber) to the contract's X18 form (rounded down).
 */
export const ticksToPriceX18 = (ticks: BigNumber | bigint): bigint =>
  typeof ticks === 'bigint'
    ? ticks * PRICE_X18
    : BigInt(ticks.shiftedBy(18).integerValue(BigNumber.ROUND_DOWN).toFixed(0));

/**
 * The value of `lots` at the mark in raw quote units rounded **up** (`vUp`): used for liabilities and exposure.
 * `ceil(|lots| * P * quoteTick / 1e18)`. The lot size cancels out (the contract divides by `baseLot` after multiplying the base units).
 */
export const valueUp = (lots: bigint, priceX18: bigint, quoteTick: bigint): bigint =>
  ceilDiv(abs(lots) * priceX18 * quoteTick, PRICE_X18);

/**
 * The value of `lots` at the mark in raw quote units rounded **down** (`vDown`).
 */
export const valueDown = (lots: bigint, priceX18: bigint, quoteTick: bigint): bigint =>
  abs(lots) * priceX18 * quoteTick / PRICE_X18;

/**
 * The signed mark value of a position: `floor(size * P * quoteTick / 1e18)` for a long and
 * `-ceil(|size| * P * quoteTick / 1e18)` for a short (D1 §2).
 */
export const markValue = (size: bigint, priceX18: bigint, quoteTick: bigint): bigint =>
  size >= 0n ? valueDown(size, priceX18, quoteTick) : -valueUp(size, priceX18, quoteTick);

/**
 * Unrealized PnL in raw quote units: `markValue(size) - costBasis`.
 */
export const calculateUnrealizedPnl = (size: bigint, costBasis: bigint, priceX18: bigint, quoteTick: bigint): bigint =>
  markValue(size, priceX18, quoteTick) - costBasis;

/**
 * Equity: `collateral + unrealized - owedCharges`.
 */
export const calculateEquity = (collateral: bigint, unrealized: bigint, owedCharges: bigint): bigint =>
  collateral + unrealized - owedCharges;

/**
 * A margin requirement `ceil(vUp(|lots|) * rateBps / 1e4)`: the initial margin (`imrBps`),
 * the maintenance margin (`mmrBps`) or the cancel margin (`cmrBps`) of a position of `lots`.
 */
export const calculateRequirement = (lots: bigint, priceX18: bigint, rateBps: number, quoteTick: bigint): bigint =>
  ceilDiv(valueUp(lots, priceX18, quoteTick) * BigInt(rateBps), BPS);

/**
 * The scenario requirement of `ADM`/`ADMc` (C1 §4): `max(bidScen, askScen) + F`, where
 * `scen = ceil(rate * vUp(|size ± Q|) / 1e4) + ceil(kappa * vUp(Q) / 1e4)` and
 * `F = ceil(makerFee * (1e4 + kappa) * vUp(qBid + qAsk) / 1e8)`.
 *
 * `qBid`/`qAsk` are the lots of ALL open orders, reduce-only included. The result does not depend
 * on the order prices.
 */
const scenarioRequirement = (size: bigint, qBid: bigint, qAsk: bigint, priceX18: bigint, rateBps: number, risk: PerpRiskInput): bigint => {
  const kappa = BigInt(risk.collarBps);
  const rate = BigInt(rateBps);
  const v = (lots: bigint) => valueUp(lots, priceX18, risk.quoteTick);

  const bidScenario = ceilDiv(rate * v(size + qBid), BPS) + ceilDiv(kappa * v(qBid), BPS);
  const askScenario = ceilDiv(rate * v(size - qAsk), BPS) + ceilDiv(kappa * v(qAsk), BPS);
  const makerFee = ceilDiv(BigInt(risk.makerFeeBps) * (BPS + kappa) * v(qBid + qAsk), BPS * BPS);

  return max(bidScenario, askScenario) + makerFee;
};

/**
 * `ADM`, the admission requirement: a risk-increasing action is accepted when `equity >= ADM` at a fresh oracle.
 * With no open orders it equals the initial margin.
 */
export const calculateAdm = (size: bigint, qBid: bigint, qAsk: bigint, priceX18: bigint, risk: PerpRiskInput): bigint =>
  scenarioRequirement(size, qBid, qAsk, priceX18, risk.imrBps, risk);

/**
 * `ADMc`, the cancel requirement: `ADM` with the cancel margin ratio. Below it anyone can force-cancel the open orders.
 */
export const calculateAdmc = (size: bigint, qBid: bigint, qAsk: bigint, priceX18: bigint, risk: PerpRiskInput): bigint =>
  scenarioRequirement(size, qBid, qAsk, priceX18, risk.cmrBps, risk);

/**
 * The health state of the risk ladder (C1 §10a):
 * `HEALTHY` (`E >= ADM`), `NO_NEW_RISK` (`ADMc <= E < ADM`), `FORCED_CANCEL` (`MM <= E < ADMc`),
 * `LIQUIDATABLE` (`0 <= E < MM`), `BANKRUPT` (`E < 0`).
 */
export const getHealthState = (equity: bigint, adm: bigint, admc: bigint, mm: bigint): PerpHealthState => {
  if (equity < 0n)
    return PerpHealthState.Bankrupt;
  if (equity < mm)
    return PerpHealthState.Liquidatable;
  if (equity < admc)
    return PerpHealthState.ForcedCancel;
  if (equity < adm)
    return PerpHealthState.NoNewRisk;

  return PerpHealthState.Healthy;
};

export interface PerpAccountMetricsInput {
  collateral: bigint;
  size: bigint;
  costBasis: bigint;
  /** Pending funding: positive is owed by the account. Use {@link calculateOwedCharges} or the `owedCharges` of `perpAccount`. */
  owedCharges: bigint;
  qBid: bigint;
  qAsk: bigint;
  priceX18: bigint;
}

export interface PerpAccountMetrics {
  unrealized: bigint;
  equity: bigint;
  /** The initial margin of the open position alone (no orders). */
  initialMargin: bigint;
  /** The maintenance margin. */
  maintenanceMargin: bigint;
  adm: bigint;
  admc: bigint;
  state: PerpHealthState;
  /** The value of the position at the mark. */
  notional: bigint;
  /** `equity - adm`: what is left for new risk or for a withdrawal; negative when new risk is blocked. */
  availableMargin: bigint;
}

/**
 * Computes the live account metrics off chain, the same way `PerpMarket.perpAccount` does it.
 */
export const calculateAccountMetrics = (input: PerpAccountMetricsInput, risk: PerpRiskInput): PerpAccountMetrics => {
  const { collateral, size, costBasis, owedCharges, qBid, qAsk, priceX18 } = input;
  const unrealized = calculateUnrealizedPnl(size, costBasis, priceX18, risk.quoteTick);
  const equity = calculateEquity(collateral, unrealized, owedCharges);
  const maintenanceMargin = calculateRequirement(size, priceX18, risk.mmrBps, risk.quoteTick);
  const adm = calculateAdm(size, qBid, qAsk, priceX18, risk);
  const admc = calculateAdmc(size, qBid, qAsk, priceX18, risk);

  return {
    unrealized,
    equity,
    initialMargin: calculateRequirement(size, priceX18, risk.imrBps, risk.quoteTick),
    maintenanceMargin,
    adm,
    admc,
    state: getHealthState(equity, adm, admc, maintenanceMargin),
    notional: valueUp(size, priceX18, risk.quoteTick),
    availableMargin: equity - adm,
  };
};

export interface PerpPositionInput {
  /** Signed lots: positive is long. */
  size: bigint;
  /** Signed open notional in raw quote units. */
  costBasis: bigint;
  /** Collateral in raw quote units. */
  collateral: bigint;
}

export interface PerpFillSimulation extends PerpPositionInput {
  /** The PnL realized by the fill, raw quote units. */
  realizedPnl: bigint;
  /** The taker fee, raw quote units. */
  fee: bigint;
}

/**
 * Simulates the position update of a fill of `lots` (positive buy, negative sell) at `priceTicks` (D1 §4):
 * same direction opens, the opposite direction closes `min(|d|, |size|)` lots realizing PnL against the
 * proportional cost basis, the rest flips the position. The fee is `ceil(notional * feeBps / 1e4)` and is
 * charged from the collateral together with the realized PnL.
 */
export const simulateFill = (
  position: PerpPositionInput,
  lots: bigint,
  priceTicks: bigint,
  quoteTick: bigint,
  feeBps: number
): PerpFillSimulation => {
  if (lots === 0n)
    return { ...position, realizedPnl: 0n, fee: 0n };

  const { size } = position;
  let { costBasis } = position;
  const direction = lots > 0n ? 1n : -1n;
  const fillNotional = calculateNotional(lots, priceTicks, quoteTick);
  const fee = calculateFee(fillNotional, feeBps);
  let realizedPnl = 0n;
  let newSize: bigint;

  if (size === 0n || (size > 0n) === (lots > 0n)) {
    costBasis += direction * fillNotional;
    newSize = size + lots;
  }
  else {
    const closing = abs(lots) < abs(size) ? abs(lots) : abs(size);
    const closingValue = closing * priceTicks * quoteTick;
    if (size > 0n) {
      // Closing a long: the consumed basis rounds up, so the realized PnL rounds down.
      const removed = ceilDiv(costBasis * closing, abs(size));
      realizedPnl = closingValue - removed;
      costBasis -= removed;
    }
    else {
      const removedAbs = (-costBasis) * closing / abs(size);
      realizedPnl = removedAbs - closingValue;
      costBasis += removedAbs;
    }
    newSize = size + direction * closing;

    const remainder = abs(lots) - closing;
    if (remainder > 0n) {
      // Flip: the rest opens the other side.
      costBasis = direction * remainder * priceTicks * quoteTick;
      newSize = direction * remainder;
    }
  }

  return {
    size: newSize,
    costBasis,
    collateral: position.collateral + realizedPnl - fee,
    realizedPnl,
    fee,
  };
};

export interface PerpLiquidationPriceInput extends PerpPositionInput {
  /** Pending funding: positive is owed by the account. Defaults to 0. */
  owedCharges?: bigint;
  /** The maintenance margin ratio, bps. */
  mmrBps: number;
  quoteTick: bigint;
}

/**
 * The mark price, in ticks per lot (a fractional `BigNumber`, convert with `ticksToPrice`),
 * at which the position becomes liquidatable (`equity = maintenance margin`), or `null` when the
 * position can never be liquidated at a positive price (a fully collateralized long) or is flat.
 *
 * Derivation (equity `E = C' + size*P*t - costBasis`, `C' = collateral - owedCharges`, `MM = |size|*P*t*m`):
 * - long: `P = (costBasis - C') / (size * t * (1 - m))`;
 * - short: `P = (C' + |costBasis|) / (|size| * t * (1 + m))`.
 * The ceilings of the contract are ignored, so the result is accurate to well below one tick.
 * Funding accrues continuously, so refresh the input regularly.
 */
export const calculateLiquidationPrice = (input: PerpLiquidationPriceInput): BigNumber | null =>
  solveMarkPrice(input, new BigNumber(input.mmrBps).div(10_000));

/**
 * The mark price, in ticks per lot, at which the equity of the position is zero (bankruptcy price), or `null`.
 */
export const calculateBankruptcyPrice = (input: PerpLiquidationPriceInput): BigNumber | null =>
  solveMarkPrice(input, new BigNumber(0));

const solveMarkPrice = (input: PerpLiquidationPriceInput, ratio: BigNumber): BigNumber | null => {
  const { size, costBasis, quoteTick } = input;
  if (size === 0n)
    return null;

  const collateral = new BigNumber((input.collateral - (input.owedCharges ?? 0n)).toString());
  const basis = new BigNumber(costBasis.toString());
  const lots = new BigNumber(abs(size).toString());
  const tick = new BigNumber(quoteTick.toString());

  if (size > 0n) {
    const numerator = basis.minus(collateral);
    if (numerator.lte(0))
      return null;

    return numerator.div(lots.times(tick).times(new BigNumber(1).minus(ratio)));
  }

  const numerator = collateral.plus(basis.abs());
  if (numerator.lte(0))
    return new BigNumber(0);

  return numerator.div(lots.times(tick).times(new BigNumber(1).plus(ratio)));
};

/**
 * The maximum leverage of a market: `10000 / imrBps`.
 */
export const calculateMaxLeverage = (imrBps: number): number => 10_000 / imrBps;

/**
 * The initial margin (raw quote units) needed for a position of `lots` at the mark, with the given leverage:
 * `ceil(notional / leverage)`. A leverage above the market maximum is rejected.
 */
export const calculateRequiredMargin = (lots: bigint, priceX18: bigint, quoteTick: bigint, leverage: number, imrBps: number): bigint => {
  if (!(leverage >= 1))
    throw new Error(`Invalid leverage: ${leverage}`);
  if (leverage > calculateMaxLeverage(imrBps))
    throw new Error(`Leverage ${leverage} exceeds the market maximum ${calculateMaxLeverage(imrBps)}`);

  const notional = valueUp(lots, priceX18, quoteTick);

  return BigInt(new BigNumber(notional.toString()).div(leverage).integerValue(BigNumber.ROUND_CEIL).toFixed(0));
};

/**
 * Whether a limit price is inside the collar around the mark (C1 §5): a bid must be
 * at most `P * (1 + kappa)` and an ask at least `P * (1 - kappa)`. Orders outside the collar are
 * deleted by the contract when the oracle is fresh.
 */
export const isWithinCollar = (buySide: boolean, priceTicks: bigint, priceX18: bigint, collarBps: number): boolean => {
  const p = priceTicks * PRICE_X18 * BPS;

  return buySide
    ? p <= priceX18 * (BPS + BigInt(collarBps))
    : p >= priceX18 * (BPS - BigInt(collarBps));
};
