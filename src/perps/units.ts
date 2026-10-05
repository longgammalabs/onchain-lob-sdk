import BigNumber from 'bignumber.js';

import { PERP_CHARGE_SCALE } from './constants';

/**
 * Units of a perp market
 * ----------------------
 * - `size` is counted in **lots**; one lot is `baseLot` base-token units.
 * - `price` is counted in **ticks**; one tick is `quoteTick` quote-token units *per lot*.
 *   A fill of `lots` at `price` ticks moves `lots * price * quoteTick` quote units (an exact integer).
 * - The human-readable size is `lots / 10^sizeDecimals` (base), the human-readable price is
 *   `ticks / 10^priceDecimals` (quote per base). The market DTO provides both scales; they satisfy
 *   `sizeDecimals + priceDecimals = quoteDecimals - log10(quoteTick)`.
 */

export interface PerpScaling {
  sizeDecimals: number;
  priceDecimals: number;
}

export interface PerpMarketUnits extends PerpScaling {
  /** Quote units per tick per lot. */
  quoteTick: bigint;
  /** Decimals of the quote (collateral) token. */
  quoteDecimals: number;
}

const toBigInt = (value: BigNumber): bigint => BigInt(value.toFixed(0));

const abs = (value: bigint): bigint => value < 0n ? -value : value;

/**
 * Converts lots to the human-readable size in base.
 */
export const lotsToSize = (lots: bigint | string, sizeDecimals: number): BigNumber =>
  new BigNumber(lots.toString()).shiftedBy(-sizeDecimals);

/**
 * Converts the human-readable size in base to lots. The result is rounded down by default
 * (a taker never gets more size than asked for).
 */
export const sizeToLots = (size: BigNumber, sizeDecimals: number, rounding: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): bigint =>
  toBigInt(size.shiftedBy(sizeDecimals).integerValue(rounding));

/**
 * Converts ticks to the human-readable price (quote per base).
 */
export const ticksToPrice = (ticks: bigint | string, priceDecimals: number): BigNumber =>
  new BigNumber(ticks.toString()).shiftedBy(-priceDecimals);

/**
 * Converts the human-readable price (quote per base) to ticks. The default rounding is down;
 * round asks up and bids down to stay on the passive side of the requested price.
 */
export const priceToTicks = (price: BigNumber, priceDecimals: number, rounding: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): bigint =>
  toBigInt(price.shiftedBy(priceDecimals).integerValue(rounding));

/**
 * Converts raw quote-token units to the human-readable amount.
 */
export const quoteUnitsToAmount = (units: bigint | string, quoteDecimals: number): BigNumber =>
  new BigNumber(units.toString()).shiftedBy(-quoteDecimals);

/**
 * Converts the human-readable quote amount to raw quote-token units (rounded down by default).
 */
export const quoteAmountToUnits = (amount: BigNumber, quoteDecimals: number, rounding: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): bigint =>
  toBigInt(amount.shiftedBy(quoteDecimals).integerValue(rounding));

/**
 * The exact notional in raw quote units: `|lots| * price * quoteTick`.
 */
export const calculateNotional = (lots: bigint, priceTicks: bigint, quoteTick: bigint): bigint =>
  abs(lots) * priceTicks * quoteTick;

/**
 * The fee in raw quote units: `ceil(notional * bps / 10^4)`.
 */
export const calculateFee = (notional: bigint, feeBps: number | bigint): bigint =>
  ceilDiv(notional * BigInt(feeBps), 10_000n);

/**
 * `ceil(a / b)` for non-negative `a` and positive `b`.
 */
export const ceilDiv = (a: bigint, b: bigint): bigint => (a + b - 1n) / b;

/**
 * `ceil(a / b)` for any sign of `a` (positive `b`): rounds toward +infinity.
 */
export const ceilDivSigned = (a: bigint, b: bigint): bigint => a >= 0n ? ceilDiv(a, b) : -((-a) / b);

/**
 * `floor(a / b)` for any sign of `a` (positive `b`): rounds toward -infinity.
 */
export const floorDivSigned = (a: bigint, b: bigint): bigint => a >= 0n ? a / b : -ceilDiv(-a, b);

/**
 * The funding rate per hour as a fraction (`0.0001` = 0.01%/h) from the on-chain per-second rate
 * multiplied by `1e15`. Positive: longs pay shorts.
 */
export const fundingRatePerHour = (rateE15: bigint | string): BigNumber =>
  new BigNumber(rateE15.toString()).times(3600).shiftedBy(-15);

/**
 * The annualised funding rate as a fraction (365 days, simple interest).
 */
export const fundingRateAnnualized = (rateE15: bigint | string): BigNumber =>
  new BigNumber(rateE15.toString()).times(365 * 24 * 3600).shiftedBy(-15);

/**
 * The pending funding (raw quote units, positive = the account pays) of a position given the
 * cumulative charge index of its side and the snapshot taken at the last settlement:
 * `|size| * (index - snap) / 1e9`, payers round up and receivers round down (D1 §2).
 */
export const calculateOwedCharges = (size: bigint, index: bigint, snap: bigint): bigint => {
  const owedScaled = abs(size) * (index - snap);

  return owedScaled > 0n
    ? ceilDiv(owedScaled, PERP_CHARGE_SCALE)
    : -(abs(owedScaled) / PERP_CHARGE_SCALE);
};

/**
 * The IOC limit of a market-like order that tolerates `slippageBps` from the reference price (ticks):
 * a buy limit is `ceil(reference * (1 + slippage))`, a sell limit is `floor(reference * (1 - slippage))` but at least 1.
 */
export const calculateLimitPriceWithSlippage = (referenceTicks: bigint, buy: boolean, slippageBps: number): bigint => {
  if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > 10_000)
    throw new Error(`Invalid slippage: ${slippageBps} bps`);

  if (buy)
    return ceilDiv(referenceTicks * (10_000n + BigInt(slippageBps)), 10_000n);

  const limit = referenceTicks * (10_000n - BigInt(slippageBps)) / 10_000n;

  return limit > 1n ? limit : 1n;
};

/**
 * Converts the price of the oracle adapter (`IPriceSource.latestPrice`: quote units per one base unit multiplied by 1e18)
 * to ticks per lot (fractional): `priceWad * baseLot / (quoteTick * 1e18)`.
 */
export const oraclePriceWadToTicks = (priceWad: bigint, baseLot: bigint, quoteTick: bigint): BigNumber =>
  new BigNumber((priceWad * baseLot).toString()).div(new BigNumber((quoteTick * 10n ** 18n).toString()));
