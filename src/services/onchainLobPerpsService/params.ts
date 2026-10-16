import type { CandleResolution, PerpOrderStatus, PerpPositionStatus } from '../../models';

export interface GetPerpMarketsParams {
  /** The market contract address. All markets are returned when omitted. */
  market?: string;
}

export interface GetPerpOrderbookParams {
  market: string;
  /** The grouping in ticks (one of `PerpMarket.aggregations`, 1 by default): bids round down, asks round up. */
  aggregation?: number;
  limit?: number;
}

export interface GetPerpTradesParams {
  market: string;
  limit?: number;
  offset?: number;
}

export interface GetPerpCandlesParams {
  market: string;
  resolution: CandleResolution;
  /** Milliseconds, like the spot candles (every other perps time is in seconds). Optional. */
  fromTime?: number;
  /** Milliseconds. Optional. */
  toTime?: number;
}

export interface GetPerpAccountsParams {
  /** The owner address. */
  user: string;
  market?: string;
}

export interface GetPerpPositionsParams {
  user: string;
  market?: string;
  /** All statuses when omitted. */
  status?: PerpPositionStatus | 'all';
}

export interface GetPerpOrdersParams {
  user: string;
  market?: string;
  /** All statuses when omitted. */
  status?: PerpOrderStatus | 'all';
  limit?: number;
  offset?: number;
}

export interface GetPerpFillsParams {
  user: string;
  market?: string;
  limit?: number;
  offset?: number;
}

export interface GetPerpFundingRatesParams {
  market: string;
  /** Unix seconds. */
  fromTime?: number;
  /** Unix seconds. */
  toTime?: number;
  limit?: number;
}

export interface GetPerpFundingPaymentsParams {
  user: string;
  market?: string;
  limit?: number;
  offset?: number;
}

/** Either `user` or `market` must be specified. */
export interface GetPerpLiquidationsParams {
  user?: string;
  market?: string;
  limit?: number;
  offset?: number;
}

export interface GetPerpCollateralHistoryParams {
  user: string;
  market?: string;
  limit?: number;
  offset?: number;
}
