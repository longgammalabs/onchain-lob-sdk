import type {
  PerpAccountDto, PerpCandleDto, PerpCollateralEventDto, PerpFillDto, PerpFundingPaymentDto, PerpFundingRateDto,
  PerpLiquidationDto, PerpMarketDto, PerpOrderbookDto, PerpOrderDto, PerpPositionDto, PerpTradeDto
} from './dtos';
import type {
  GetPerpAccountsParams, GetPerpCandlesParams, GetPerpCollateralHistoryParams, GetPerpFillsParams,
  GetPerpFundingPaymentsParams, GetPerpFundingRatesParams, GetPerpLiquidationsParams, GetPerpMarketsParams,
  GetPerpOrderbookParams, GetPerpOrdersParams, GetPerpPositionsParams, GetPerpTradesParams
} from './params';
import { RemoteService } from '../remoteService';

/**
 * The REST API of the perps module. Every method corresponds to one `GET /perps/*` endpoint.
 * It is the contract the mock service (`OnchainLobPerpsMockService`) implements too.
 */
export interface IOnchainLobPerpsService {
  getMarkets(params: GetPerpMarketsParams): Promise<PerpMarketDto[]>;
  getOrderbook(params: GetPerpOrderbookParams): Promise<PerpOrderbookDto>;
  getTrades(params: GetPerpTradesParams): Promise<PerpTradeDto[]>;
  getCandles(params: GetPerpCandlesParams): Promise<PerpCandleDto[]>;
  getAccounts(params: GetPerpAccountsParams): Promise<PerpAccountDto[]>;
  getPositions(params: GetPerpPositionsParams): Promise<PerpPositionDto[]>;
  getOrders(params: GetPerpOrdersParams): Promise<PerpOrderDto[]>;
  getFills(params: GetPerpFillsParams): Promise<PerpFillDto[]>;
  getFundingRates(params: GetPerpFundingRatesParams): Promise<PerpFundingRateDto[]>;
  getFundingPayments(params: GetPerpFundingPaymentsParams): Promise<PerpFundingPaymentDto[]>;
  getLiquidations(params: GetPerpLiquidationsParams): Promise<PerpLiquidationDto[]>;
  getCollateralHistory(params: GetPerpCollateralHistoryParams): Promise<PerpCollateralEventDto[]>;
}

type QueryValue = string | number | undefined;

/**
 * OnchainLobPerpsService provides methods to interact with the Onchain LOB perps REST API (`/perps/*`).
 * It extends the RemoteService class to leverage common remote service functionalities.
 */
export class OnchainLobPerpsService extends RemoteService implements IOnchainLobPerpsService {
  /**
   * Retrieves the perp markets.
   * @param params - The parameters for the markets request.
   * @returns The markets data.
   */
  async getMarkets(params: GetPerpMarketsParams): Promise<PerpMarketDto[]> {
    return this.fetch<PerpMarketDto[]>(this.buildUri('/perps/markets', { market: params.market }), 'json');
  }

  /**
   * Retrieves the orderbook of a perp market.
   * @param params - The parameters for the orderbook request.
   * @returns The orderbook data.
   */
  async getOrderbook(params: GetPerpOrderbookParams): Promise<PerpOrderbookDto> {
    return this.fetch<PerpOrderbookDto>(this.buildUri('/perps/orderbook', {
      market: params.market,
      aggregation: params.aggregation,
      limit: params.limit,
    }), 'json');
  }

  /**
   * Retrieves the public trades of a perp market.
   * @param params - The parameters for the trades request.
   * @returns The trades data.
   */
  async getTrades(params: GetPerpTradesParams): Promise<PerpTradeDto[]> {
    return this.fetch<PerpTradeDto[]>(this.buildUri('/perps/trades', {
      market: params.market,
      limit: params.limit,
      offset: params.offset,
    }), 'json');
  }

  /**
   * Retrieves the candles of a perp market.
   * @param params - The parameters for the candles request.
   * @returns The candles data.
   */
  async getCandles(params: GetPerpCandlesParams): Promise<PerpCandleDto[]> {
    return this.fetch<PerpCandleDto[]>(this.buildUri('/perps/candles', {
      market: params.market,
      resolution: params.resolution,
      fromTime: params.fromTime,
      toTime: params.toTime,
    }), 'json');
  }

  /**
   * Retrieves the perp accounts (one per subaccount, including closed ones) of a user.
   * @param params - The parameters for the accounts request.
   * @returns The accounts data.
   */
  async getAccounts(params: GetPerpAccountsParams): Promise<PerpAccountDto[]> {
    return this.fetch<PerpAccountDto[]>(this.buildUri('/perps/accounts', { user: params.user, market: params.market }), 'json');
  }

  /**
   * Retrieves the positions of a user.
   * @param params - The parameters for the positions request.
   * @returns The positions data.
   */
  async getPositions(params: GetPerpPositionsParams): Promise<PerpPositionDto[]> {
    return this.fetch<PerpPositionDto[]>(this.buildUri('/perps/positions', {
      user: params.user,
      market: params.market,
      status: params.status,
    }), 'json');
  }

  /**
   * Retrieves the orders of a user.
   * @param params - The parameters for the orders request.
   * @returns The orders data.
   */
  async getOrders(params: GetPerpOrdersParams): Promise<PerpOrderDto[]> {
    return this.fetch<PerpOrderDto[]>(this.buildUri('/perps/orders', {
      user: params.user,
      market: params.market,
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    }), 'json');
  }

  /**
   * Retrieves the fills (user-side view of trades) of a user.
   * @param params - The parameters for the fills request.
   * @returns The fills data.
   */
  async getFills(params: GetPerpFillsParams): Promise<PerpFillDto[]> {
    return this.fetch<PerpFillDto[]>(this.buildUri('/perps/fills', {
      user: params.user,
      market: params.market,
      limit: params.limit,
      offset: params.offset,
    }), 'json');
  }

  /**
   * Retrieves the funding rate history of a perp market.
   * @param params - The parameters for the funding rates request.
   * @returns The funding rates data.
   */
  async getFundingRates(params: GetPerpFundingRatesParams): Promise<PerpFundingRateDto[]> {
    return this.fetch<PerpFundingRateDto[]>(this.buildUri('/perps/funding-rates', {
      market: params.market,
      fromTime: params.fromTime,
      toTime: params.toTime,
      limit: params.limit,
    }), 'json');
  }

  /**
   * Retrieves the funding payments of a user.
   * @param params - The parameters for the funding payments request.
   * @returns The funding payments data.
   */
  async getFundingPayments(params: GetPerpFundingPaymentsParams): Promise<PerpFundingPaymentDto[]> {
    return this.fetch<PerpFundingPaymentDto[]>(this.buildUri('/perps/funding-payments', {
      user: params.user,
      market: params.market,
      limit: params.limit,
      offset: params.offset,
    }), 'json');
  }

  /**
   * Retrieves the liquidations of a user or a market.
   * @param params - The parameters for the liquidations request. Either `user` or `market` is required.
   * @returns The liquidations data.
   */
  async getLiquidations(params: GetPerpLiquidationsParams): Promise<PerpLiquidationDto[]> {
    if (!params.user && !params.market)
      throw new Error('Either user or market must be specified');

    return this.fetch<PerpLiquidationDto[]>(this.buildUri('/perps/liquidations', {
      user: params.user,
      market: params.market,
      limit: params.limit,
      offset: params.offset,
    }), 'json');
  }

  /**
   * Retrieves the collateral history (deposits, withdrawals, transfers) of a user.
   * @param params - The parameters for the collateral history request.
   * @returns The collateral events data.
   */
  async getCollateralHistory(params: GetPerpCollateralHistoryParams): Promise<PerpCollateralEventDto[]> {
    return this.fetch<PerpCollateralEventDto[]>(this.buildUri('/perps/collateral-history', {
      user: params.user,
      market: params.market,
      limit: params.limit,
      offset: params.offset,
    }), 'json');
  }

  protected buildUri(path: string, query: Record<string, QueryValue>): string {
    const queryParams = new URLSearchParams();
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined && value !== '')
        queryParams.append(name, value.toString());
    }

    const queryParamsString = decodeURIComponent(queryParams.toString());

    return queryParamsString ? `${path}?${queryParamsString}` : path;
  }
}
