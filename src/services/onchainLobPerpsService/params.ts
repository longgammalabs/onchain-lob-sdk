import type { CandleResolution, PerpOrderStatus, PerpPositionStatus } from '../../models';

export interface GetPerpMarketsParams {
  /** The market contract address. All markets are returned when omitted. */
  market?: string;
}

export interface GetPerpOrderbookParams {
  market: string;
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
  /** Unix seconds. */
  fromTime: number;
  /** Unix seconds. */
  toTime: number;
}

export interface GetPerpAccountsParams {
  /** The owner address. */
  user: string;
  market?: string;
}

export interface GetPerpPositionsParams {
  user: string;
  market?: string;
  /** Defaults to the API default (`open`). */
  status?: PerpPositionStatus | 'all';
}

export interface GetPerpOrdersParams {
  user: string;
  market?: string;
  /** Defaults to the API default (`open`). */
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
