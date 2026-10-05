/**
 * Perps REST DTOs. They follow the API <-> SDK contract of FAC-694 (perps-api-contract.md):
 * - every on-chain integer is exposed as a raw decimal string (`raw*` fields);
 * - the human-readable twin is a decimal string scaled with the market decimals;
 * - `account` is the on-chain uint176 (`owner << 16 | subaccount`) as a decimal string;
 * - timestamps are unix seconds, addresses are lowercase.
 */

export interface PerpQuoteTokenDto {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface PerpMarketParamsDto {
  imrBps: number;
  fmrBps: number;
  mmrBps: number;
  cmrBps: number;
  collarBps: number;
  takerFeeBps: number;
  makerFeeBps: number;
  liqBonusBps: number;
  liqPenaltyBps: number;
  closeFactorBps: number;
  recoveryBufferBps: number;
  maxOracleAge: number;
  maxConfBps: number;
  maxFundingRateE15: number;
  oiCap: string;
  maxPositionLots: string;
  smallPositionLots: string;
  maxTradePrice: string;
  /** `10000 / imrBps`. */
  maxLeverage: number;
}

export interface PerpMarketDto {
  /** The market contract address. */
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  baseSymbol: string;
  quoteToken: PerpQuoteTokenDto;
  baseLot: string;
  quoteTick: string;
  sizeDecimals: number;
  priceDecimals: number;
  /** The supported orderbook groupings in ticks. */
  aggregations: number[];
  params: PerpMarketParamsDto;
  priceSource: string;
  fundingSource: string;
  indexPrice: string | null;
  rawIndexPrice: string | null;
  indexPriceTime: number | null;
  lastPrice: string | null;
  rawLastPrice: string | null;
  bestBid: string | null;
  bestAsk: string | null;
  price24h: string | null;
  /** A fraction of the last price against price24h: 0.05 is +5%. */
  change24h: string | null;
  volume24h: string;
  quoteVolume24h: string;
  openInterest: string;
  rawOpenInterest: string;
  /** The per-second rate as a decimal (`rateE15 / 1e15`); positive means longs pay shorts. */
  fundingRate: string;
  fundingRateE15: string;
  fundingRateTime: number | null;
  cLong: string;
  cShort: string;
  fundingSaturated: boolean;
  insurance: string;
  rawInsurance: string;
  unresolvedDeficit: string;
  rawUnresolvedDeficit: string;
  reduceOnly: boolean;
  lastTouched: number;
}

export interface PerpLevelDto {
  price: string;
  rawPrice: string;
  size: string;
  rawSize: string;
}

export interface PerpOrderbookDto {
  marketId: string;
  timestamp: number;
  aggregation: number;
  levels: {
    asks: PerpLevelDto[];
    bids: PerpLevelDto[];
  };
}

export interface PerpTradeDto {
  /** `txHash-logIndex`. */
  id: string;
  marketId: string;
  makerHandle: string;
  /** The taker side. */
  side: 'buy' | 'sell';
  price: string;
  rawPrice: string;
  size: string;
  rawSize: string;
  notional: string;
  rawNotional: string;
  fee: string;
  rawFee: string;
  timestamp: number;
  txnHash: string;
  blockNumber: number;
}

/**
 * The same shape as the spot candle: `time` is in milliseconds, OHLC are raw prices (ticks), `volume` is raw lots.
 */
export interface PerpCandleDto {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  resolution: string;
}

export interface PerpAccountDto {
  marketId: string;
  account: string;
  owner: string;
  subaccount: number;
  kind: number;
  size: string;
  rawSize: string;
  side: 'long' | 'short' | null;
  costBasis: string;
  rawCostBasis: string;
  entryPrice: string | null;
  collateral: string;
  rawCollateral: string;
  realizedPnl: string;
  rawRealizedPnl: string;
  chargesSettled: string;
  rawChargesSettled: string;
  chargeSnap: string;
  totalDeposited: string;
  totalWithdrawn: string;
  feesPaid: string;
  epoch: number;
  liquidated: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PerpPositionDto extends PerpAccountDto {
  status: 'open' | 'closed';
}

export interface PerpOrderDto {
  /** `${marketId}-${handle}-${createdTxHash}` (handles are reused). */
  id: string;
  marketId: string;
  handle: string;
  account: string;
  owner: string;
  subaccount: number;
  side: 'buy' | 'sell';
  flags: number;
  postOnly: boolean;
  reduceOnly: boolean;
  price: string;
  rawPrice: string;
  origSize: string;
  rawOrigSize: string;
  filledSize: string;
  rawFilledSize: string;
  remainingSize: string;
  rawRemainingSize: string;
  expiry: number | null;
  status: 'open' | 'filled' | 'cancelled';
  removeReason: number | null;
  createdAt: number;
  updatedAt: number;
  txnHash: string;
}

export interface PerpFillDto {
  id: string;
  marketId: string;
  account: string;
  owner: string;
  subaccount: number;
  role: 'maker' | 'taker';
  side: 'buy' | 'sell';
  orderHandle: string | null;
  price: string;
  rawPrice: string;
  size: string;
  rawSize: string;
  notional: string;
  rawNotional: string;
  fee: string;
  rawFee: string;
  realizedPnl: string;
  rawRealizedPnl: string;
  isLiquidation: boolean;
  timestamp: number;
  txnHash: string;
}

export interface PerpFundingRateDto {
  marketId: string;
  /** The per-second rate as a decimal (`rateE15 / 1e15`). */
  rate: string;
  rateE15: string;
  cLong: string | null;
  cShort: string | null;
  timestamp: number;
  txnHash: string;
}

export interface PerpFundingPaymentDto {
  marketId: string;
  account: string;
  owner: string;
  /** Positive means the account paid. */
  amount: string;
  rawAmount: string;
  positionSize: string;
  timestamp: number;
  txnHash: string;
}

export interface PerpLiquidationDto {
  marketId: string;
  victim: string;
  victimOwner: string;
  liquidator: string;
  liquidatorOwner: string;
  /** Signed raw lots from the victim's side. */
  lots: string;
  /** Signed base amount, the same sign as lots. */
  size: string;
  transferNotional: string;
  penalty: string;
  outcome: number;
  deficitCovered: string | null;
  timestamp: number;
  txnHash: string;
}

export type PerpCollateralEventTypeDto = 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';

export interface PerpCollateralEventDto {
  marketId: string;
  account: string;
  owner: string;
  subaccount: number;
  type: PerpCollateralEventTypeDto;
  amount: string;
  rawAmount: string;
  counterparty: string | null;
  recipient: string | null;
  timestamp: number;
  txnHash: string;
}
