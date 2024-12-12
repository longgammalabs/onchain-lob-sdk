import type { CandleDto, FillDto, LimitDetailsDto, MarketDetailsDto, MarketDto, OrderDto, OrderHistoryDto, OrderbookDto, TokenDto, TradeDto, UserBalancesDto } from './dtos';
import type { CalculateLimitDetailsParams, CalculateMarketDetailsParams, GetCandlesParams, GetFillsParams, GetMarketsParams, GetOrderbookParams, GetOrderHistoryParams, GetOrdersParams, GetTokensParams, GetTradesParams, GetUserBalancesParams } from './params';
import { guards } from '../../utils';
import { RemoteService } from '../remoteService';
import { ALL_MARKETS_ID } from '../constants';

/**
 * OnchainLobSpotService provides methods to interact with the Onchain LOB spot market API.
 * It extends the RemoteService class to leverage common remote service functionalities.
 */
export class OnchainLobSpotService extends RemoteService {
  /**
   * Retrieves the orderbook for a given market.
   * @param params - The parameters for the orderbook request.
   * @returns The orderbook data.
   */
  async getOrderbook(params: GetOrderbookParams): Promise<OrderbookDto> {
    const queryParams = new URLSearchParams({
      market: params.market,
    });
    if (params.limit)
      queryParams.append('limit', params.limit.toString());
    if (params.aggregation)
      queryParams.append('aggregation', params.aggregation.toString());

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<OrderbookDto>(`/orderbook?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the orders for a given market.
   * @param params - The parameters for the orders request.
   * @returns The orders data.
   */
  async getOrders(params: GetOrdersParams): Promise<OrderDto[]> {
    const queryParams = new URLSearchParams({
      market: params.market,
      user: params.user,
    });
    if (params.limit)
      queryParams.append('limit', params.limit.toString());
    if (params.status) {
      if (guards.isArray(params.status))
        params.status.forEach(status => queryParams.append('status', status.toString()));
      else
        queryParams.append('status', params.status.toString());
    }

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<OrderDto[]>(`/orders?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the order history for a given market.
   * @param params - The parameters for the order history request.
   * @returns The order history data.
   */
  async getOrderHistory(params: GetOrderHistoryParams): Promise<OrderHistoryDto[]> {
    const queryParams = new URLSearchParams({
      market: params.market,
      user: params.user,
    });
    if (params.limit)
      queryParams.append('limit', params.limit.toString());

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<OrderHistoryDto[]>(`/order-history?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the trades for a given market.
   * @param params - The parameters for the trades request.
   * @returns The trades data.
   */
  async getTrades(params: GetTradesParams): Promise<TradeDto[]> {
    const queryParams = new URLSearchParams({
      market: params.market,
    });
    if (params.limit)
      queryParams.append('limit', params.limit.toString());

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<TradeDto[]>(`/trades?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the fills for a given market.
   * @param params - The parameters for the fills request.
   * @returns The fills data.
   */
  async getFills(params: GetFillsParams): Promise<FillDto[]> {
    const queryParams = new URLSearchParams({
      market: params.market,
      user: params.user,
    });
    if (params.limit)
      queryParams.append('limit', params.limit.toString());

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<FillDto[]>(`/fills?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the tokens for a given market.
   * @param params - The parameters for the tokens request.
   * @returns The tokens data.
   */
  async getTokens(params: GetTokensParams): Promise<TokenDto[]> {
    const queryParams = new URLSearchParams();
    if (params.token)
      queryParams.append('token', params.token);

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<TokenDto[]>(`/tokens?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the markets for a given market.
   * @param params - The parameters for the markets request.
   * @returns The markets data.
   */
  async getMarkets(params: GetMarketsParams): Promise<MarketDto[]> {
    const queryParams = new URLSearchParams();
    if (params.market && params.market !== ALL_MARKETS_ID)
      queryParams.append('market', params.market);

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<MarketDto[]>(`/markets?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the candle data for a given market.
   * @param params - The parameters for the candles request.
   * @returns The candle data.
   */
  async getCandles(params: GetCandlesParams): Promise<CandleDto[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('market', params.market);
    queryParams.append('resolution', params.resolution);
    if (params.fromTime)
      queryParams.append('fromTime', params.fromTime.toString());
    if (params.toTime)
      queryParams.append('toTime', params.toTime.toString());

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<CandleDto[]>(`/candles?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Calculates the market order details for a given token inputs.
   * @param params - The parameters for the market details calculation.
   * @returns The market order details data.
   */
  async calculateMarketDetails(params: CalculateMarketDetailsParams): Promise<MarketDetailsDto> {
    const queryParams = new URLSearchParams();
    queryParams.append('market', params.market);
    queryParams.append('direction', params.direction);
    queryParams.append('tokenInput', params.inputToken);
    if (params.inputs.tokenXInput)
      queryParams.append('tokenXInput', params.inputs.tokenXInput);
    if (params.inputs.tokenYInput)
      queryParams.append('tokenYInput', params.inputs.tokenYInput);
    queryParams.append('slippage', params.inputs.slippage.toString());
    if (params.inputs.useAutoSlippage)
      queryParams.append('useAutoSlippage', params.inputs.useAutoSlippage.toString());

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<MarketDetailsDto>(`calculate/market-details?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Calculates the limit order details for a given token inputs.
   * @param params - The parameters for the limit details calculation.
   * @returns The limit order details data.
   */
  async calculateLimitDetails(params: CalculateLimitDetailsParams): Promise<LimitDetailsDto> {
    const queryParams = new URLSearchParams();
    queryParams.append('market', params.market);
    queryParams.append('direction', params.direction);
    queryParams.append('tokenInput', params.inputToken);
    if (params.inputs.tokenXInput)
      queryParams.append('tokenXInput', params.inputs.tokenXInput);
    if (params.inputs.tokenYInput)
      queryParams.append('tokenYInput', params.inputs.tokenYInput);
    queryParams.append('postOnly', params.inputs.postOnly.toString());
    queryParams.append('priceInput', params.inputs.priceInput);

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<LimitDetailsDto>(`calculate/limit-details?${queryParamsString}`, 'json');

    return response;
  }

  async getUserBalances(params: GetUserBalancesParams): Promise<UserBalancesDto> {
    const queryParams = new URLSearchParams();
    queryParams.append('user', params.user);

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<UserBalancesDto>(`user-balances?${queryParamsString}`, 'json');

    return response;
  }
}
