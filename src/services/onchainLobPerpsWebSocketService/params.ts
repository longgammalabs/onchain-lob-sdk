import type { CandleResolution } from '../../models';

export interface SubscribeToPerpMarketParams {
  market: string;
}
export type UnsubscribeFromPerpMarketParams = SubscribeToPerpMarketParams;

export interface SubscribeToPerpOrderbookParams {
  market: string;
  /** The grouping in ticks (1 by default). */
  aggregation?: number;
}
export type UnsubscribeFromPerpOrderbookParams = SubscribeToPerpOrderbookParams;

export interface SubscribeToPerpTradesParams {
  market: string;
}
export type UnsubscribeFromPerpTradesParams = SubscribeToPerpTradesParams;

export interface SubscribeToPerpCandlesParams {
  market: string;
  resolution: CandleResolution;
}
export type UnsubscribeFromPerpCandlesParams = SubscribeToPerpCandlesParams;

/** Common params of the user channels. All markets are used when `market` is omitted. */
export interface SubscribeToUserPerpParams {
  /** The owner address. */
  user: string;
  market?: string;
}
export type SubscribeToUserPerpAccountsParams = SubscribeToUserPerpParams;
export type UnsubscribeFromUserPerpAccountsParams = SubscribeToUserPerpParams;
export type SubscribeToUserPerpOrdersParams = SubscribeToUserPerpParams;
export type UnsubscribeFromUserPerpOrdersParams = SubscribeToUserPerpParams;
export type SubscribeToUserPerpFillsParams = SubscribeToUserPerpParams;
export type UnsubscribeFromUserPerpFillsParams = SubscribeToUserPerpParams;
export type SubscribeToUserPerpCollateralParams = SubscribeToUserPerpParams;
export type UnsubscribeFromUserPerpCollateralParams = SubscribeToUserPerpParams;
