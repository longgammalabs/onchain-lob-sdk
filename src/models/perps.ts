import type BigNumber from 'bignumber.js';

import type { Direction } from './spot';

/**
 * Perps models.
 *
 * Conventions (see the perps API contract):
 * - `raw*` fields are the on-chain integers (`bigint`), the same-named field without the prefix is the
 *   human-readable `BigNumber` (size in base units, price in quote per base, amounts in quote tokens);
 * - `account` is the on-chain `uint176` (`owner << 16 | subaccount`) as a decimal string;
 * - times are unix seconds, addresses are lowercase.
 */

/** The side of a position. */
export type PerpPositionSide = 'long' | 'short';

/** The status of a position: `open` when its size is not zero. */
export type PerpPositionStatus = 'open' | 'closed';

/** The status of a perp order. */
export type PerpOrderStatus = 'open' | 'filled' | 'cancelled';

/** The role of an account in a fill. */
export type PerpFillRole = 'maker' | 'taker';

/** The type of a collateral event. */
export type PerpCollateralEventType = 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';

/** The reasons of removal of an order (`OrderRemoved.reason`). Values are the on-chain codes. */
export const PerpOrderRemoveReason = {
  Cancel: 0,
  Expired: 1,
  SelfTrade: 2,
  Unfunded: 3,
  Epoch: 4,
  Risk: 5,
  Collar: 6,
  ReduceOnlyExhausted: 7,
  OracleOutage: 8,
  Filled: 9,
} as const;

/** The outcomes of a liquidation (`Liquidated.outcome`). Values are the on-chain codes. */
export const PerpLiquidationOutcome = {
  Recovered: 0,
  Partial: 1,
  Exhausted: 2,
} as const;

export interface PerpQuoteToken {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

/** The risk and fee parameters of a perp market. */
export interface PerpMarketParams {
  /** Initial margin ratio, bps. */
  imrBps: number;
  /** Fill margin ratio, bps. */
  fmrBps: number;
  /** Maintenance margin ratio, bps. */
  mmrBps: number;
  /** Cancel margin ratio, bps. */
  cmrBps: number;
  /** Collar (kappa): the maximal distance of an order price from the oracle mark, bps. */
  collarBps: number;
  takerFeeBps: number;
  makerFeeBps: number;
  liqBonusBps: number;
  liqPenaltyBps: number;
  closeFactorBps: number;
  recoveryBufferBps: number;
  /** Seconds after which the oracle price is stale. */
  maxOracleAge: number;
  maxConfBps: number;
  maxFundingRateE15: number;
  /** The open interest cap in lots. */
  oiCap: bigint;
  /** The maximal position size in lots. */
  maxPositionLots: bigint;
  smallPositionLots: bigint;
  /** The maximal order price in ticks. */
  maxTradePrice: bigint;
  /** `10000 / imrBps`. */
  maxLeverage: number;
}

export interface PerpMarket {
  /** The market contract address. */
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  baseSymbol: string;
  quoteToken: PerpQuoteToken;
  /** Base units per lot (raw contract unit). */
  baseLot: bigint;
  /** Quote units per price tick (raw contract unit). */
  quoteTick: bigint;
  /** Size (base) = lots / 10^sizeDecimals. */
  sizeDecimals: number;
  /** Price (quote per base) = ticks / 10^priceDecimals. */
  priceDecimals: number;
  params: PerpMarketParams;
  priceSource: string;
  fundingSource: string;
  indexPrice: BigNumber | null;
  rawIndexPrice: bigint | null;
  indexPriceTime: number | null;
  lastPrice: BigNumber | null;
  rawLastPrice: bigint | null;
  bestBid: BigNumber | null;
  bestAsk: BigNumber | null;
  price24h: BigNumber | null;
  change24h: BigNumber | null;
  /** 24h volume in base. */
  volume24h: BigNumber;
  /** 24h volume in quote. */
  quoteVolume24h: BigNumber;
  /** Open interest (one side) in base. */
  openInterest: BigNumber;
  /** Open interest in lots. */
  rawOpenInterest: bigint;
  /** The funding rate per hour as a fraction (positive: longs pay shorts). */
  fundingRate: BigNumber;
  /** The funding rate per second multiplied by 1e15. */
  fundingRateE15: bigint;
  fundingRateTime: number | null;
  /** The cumulative funding charge per lot of longs (quote units * 1e9). */
  cLong: bigint;
  /** The cumulative funding charge per lot of shorts (quote units * 1e9). */
  cShort: bigint;
  fundingSaturated: boolean;
  /** The insurance fund in quote. */
  insurance: BigNumber;
  /** The unresolved deficit in quote. */
  unresolvedDeficit: BigNumber;
  reduceOnly: boolean;
  lastTouched: number;
}

export type PerpMarketUpdate = PerpMarket;

export interface PerpLevel {
  price: BigNumber;
  rawPrice: bigint;
  size: BigNumber;
  rawSize: bigint;
}

export interface PerpOrderbook {
  marketId: string;
  timestamp: number;
  aggregation: number;
  levels: {
    asks: PerpLevel[];
    bids: PerpLevel[];
  };
}

export type PerpOrderbookUpdate = PerpOrderbook;

export interface PerpTrade {
  /** `txHash-logIndex`. */
  id: string;
  marketId: string;
  makerHandle: string;
  /** The taker side. */
  side: Direction;
  price: BigNumber;
  rawPrice: bigint;
  size: BigNumber;
  rawSize: bigint;
  notional: BigNumber;
  rawNotional: bigint;
  fee: BigNumber;
  rawFee: bigint;
  timestamp: number;
  txnHash: string;
  blockNumber: number;
}

export type PerpTradeUpdate = PerpTrade;

/** The candle has the same shape as the spot candle. */
export interface PerpCandle {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  lastTouched: number;
}

export type PerpCandleUpdate = PerpCandle;

/** The state of an account of a perp market (isolated margin: one subaccount per position). */
export interface PerpAccount {
  marketId: string;
  /** The on-chain account id as a decimal string. */
  account: string;
  owner: string;
  subaccount: number;
  kind: number;
  /** Signed position size in base: positive is long, negative is short. */
  size: BigNumber;
  /** Signed position size in lots. */
  rawSize: bigint;
  side: PerpPositionSide | null;
  /** Signed open notional in quote. */
  costBasis: BigNumber;
  rawCostBasis: bigint;
  entryPrice: BigNumber | null;
  collateral: BigNumber;
  rawCollateral: bigint;
  /** Cumulative realized PnL in quote. */
  realizedPnl: BigNumber;
  rawRealizedPnl: bigint;
  /** Cumulative funding settled in quote. */
  chargesSettled: BigNumber;
  rawChargesSettled: bigint;
  chargeSnap: bigint;
  totalDeposited: BigNumber;
  totalWithdrawn: BigNumber;
  feesPaid: BigNumber;
  epoch: number;
  liquidated: boolean;
  createdAt: number;
  updatedAt: number;
}

export type PerpAccountUpdate = PerpAccount;

export interface PerpPosition extends PerpAccount {
  status: PerpPositionStatus;
}

export interface PerpOrder {
  /** `${marketId}-${handle}-${createdTxHash}`. */
  id: string;
  marketId: string;
  /** The on-chain order handle (a uint64 as a decimal string). Handles are reused. */
  handle: string;
  account: string;
  owner: string;
  subaccount: number;
  side: Direction;
  flags: number;
  postOnly: boolean;
  reduceOnly: boolean;
  price: BigNumber;
  rawPrice: bigint;
  origSize: BigNumber;
  rawOrigSize: bigint;
  filledSize: BigNumber;
  rawFilledSize: bigint;
  remainingSize: BigNumber;
  rawRemainingSize: bigint;
  /** Unix seconds, `null` for good-till-cancelled. */
  expiry: number | null;
  status: PerpOrderStatus;
  /** See {@link PerpOrderRemoveReason}. */
  removeReason: number | null;
  createdAt: number;
  updatedAt: number;
  txnHash: string;
}

export type PerpOrderUpdate = PerpOrder;

export interface PerpFill {
  id: string;
  marketId: string;
  account: string;
  owner: string;
  subaccount: number;
  role: PerpFillRole;
  side: Direction;
  orderHandle: string | null;
  price: BigNumber;
  rawPrice: bigint;
  size: BigNumber;
  rawSize: bigint;
  notional: BigNumber;
  fee: BigNumber;
  rawFee: bigint;
  isLiquidation: boolean;
  timestamp: number;
  txnHash: string;
}

export type PerpFillUpdate = PerpFill;

export interface PerpFundingRate {
  marketId: string;
  /** The funding rate per hour as a fraction. */
  rate: BigNumber;
  /** The funding rate per second multiplied by 1e15. */
  rateE15: bigint;
  cLong: bigint | null;
  cShort: bigint | null;
  timestamp: number;
  txnHash: string;
}

export interface PerpFundingPayment {
  marketId: string;
  account: string;
  owner: string;
  /** The funding amount in quote: positive is paid by the account, negative is received. */
  amount: BigNumber;
  rawAmount: bigint;
  positionSize: BigNumber;
  timestamp: number;
  txnHash: string;
}

export interface PerpLiquidation {
  marketId: string;
  victim: string;
  victimOwner: string;
  liquidator: string;
  liquidatorOwner: string;
  /** Liquidated lots. */
  lots: bigint;
  /** Liquidated size in base. */
  size: BigNumber;
  /** The notional of the transfer to the liquidator in quote. */
  transferNotional: BigNumber;
  /** The penalty in quote. */
  penalty: BigNumber;
  /** See {@link PerpLiquidationOutcome}. */
  outcome: number;
  deficitCovered: BigNumber | null;
  timestamp: number;
  txnHash: string;
}

export interface PerpCollateralEvent {
  marketId: string;
  account: string;
  owner: string;
  subaccount: number;
  type: PerpCollateralEventType;
  amount: BigNumber;
  rawAmount: bigint;
  counterparty: string | null;
  recipient: string | null;
  timestamp: number;
  txnHash: string;
}

export type PerpCollateralEventUpdate = PerpCollateralEvent;

/**
 * The health state of an account (C1 §10a, the risk ladder). Order matters: a greater value is worse.
 */
export const PerpHealthState = {
  /** Equity >= ADM: new risk is allowed. */
  Healthy: 0,
  /** ADMc <= equity < ADM: no new risk, existing orders stay. */
  NoNewRisk: 1,
  /** MM <= equity < ADMc: anyone can force-cancel the open orders. */
  ForcedCancel: 2,
  /** 0 <= equity < MM: liquidatable. */
  Liquidatable: 3,
  /** Equity < 0. */
  Bankrupt: 4,
} as const;
export type PerpHealthState = typeof PerpHealthState[keyof typeof PerpHealthState];

/**
 * The live on-chain state of an account (`PerpMarket.perpAccount`). All amounts are raw
 * (quote token units, lots) — the values the contract itself uses for margin checks.
 */
export interface PerpAccountState {
  epoch: number;
  openOrders: number;
  /** Realized collateral (quote units). */
  collateral: bigint;
  /** Signed position in lots. */
  size: bigint;
  /** Signed open notional (quote units). */
  costBasis: bigint;
  /** Pending funding charges (quote units), positive is owed by the account. */
  owedCharges: bigint;
  unrealized: bigint;
  /** `collateral + unrealized - owedCharges`. */
  equity: bigint;
  /** Admission requirement (initial margin including open orders). */
  adm: bigint;
  /** Maintenance margin. */
  mm: bigint;
  /** Open bid lots, including reduce-only. */
  qBid: bigint;
  /** Open ask lots, including reduce-only. */
  qAsk: bigint;
  state: PerpHealthState;
  /** Whether the cached oracle price is fresh. A stale oracle blocks new risk. */
  oracleFresh: boolean;
  /** The cancel requirement (ADM with the cancel margin ratio). */
  admc: bigint;
}

/** The live on-chain market state (`PerpMarket.market`). */
export interface PerpMarketState {
  cLong: bigint;
  cShort: bigint;
  fundingRateE15: bigint;
  lastChargeUpdate: number;
  /** Open interest in lots. */
  openInterest: bigint;
  custody: bigint;
  insurance: bigint;
  fees: bigint;
  dustScaled: bigint;
  unresolvedDeficit: bigint;
  reduceOnly: boolean;
  fundingSaturated: boolean;
}

/** The on-chain risk parameters (`PerpMarket.riskParams`). */
export interface PerpRiskParams {
  imrBps: number;
  fmrBps: number;
  mmrBps: number;
  cmrBps: number;
  collarBps: number;
  makerFeeBps: number;
  baseLot: bigint;
  quoteTick: bigint;
}

/** A resting order read from the on-chain book. */
export interface PerpBookOrder {
  handle: bigint;
  bid: boolean;
  /** Price in ticks. */
  price: bigint;
  lots: bigint;
  /** Unix seconds, 0 for good-till-cancelled. */
  expiry: number;
  reduceOnly: boolean;
  /** The on-chain account id of the maker. */
  account: bigint;
  owner: string;
  subaccount: number;
  generation: number;
  epoch: number;
}
