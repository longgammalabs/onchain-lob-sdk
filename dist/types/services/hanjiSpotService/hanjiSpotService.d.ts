import type { CandleDto, FillDto, LimitDetailsDto, MarketDetailsDto, MarketDto, OrderDto, OrderHistoryDto, OrderbookDto, TokenDto, TradeDto, UserBalancesDto } from './dtos';
import type { CalculateLimitDetailsParams, CalculateMarketDetailsParams, GetCandlesParams, GetFillsParams, GetMarketsParams, GetOrderbookParams, GetOrderHistoryParams, GetOrdersParams, GetTokensParams, GetTradesParams, GetUserBalancesParams } from './params';
import { RemoteService } from '../remoteService';
/**
 * HanjiSpotService provides methods to interact with the Hanji spot market API.
 * It extends the RemoteService class to leverage common remote service functionalities.
 */
export declare class HanjiSpotService extends RemoteService {
    /**
     * Retrieves the orderbook for a given market.
     * @param params - The parameters for the orderbook request.
     * @returns The orderbook data.
     */
    getOrderbook(params: GetOrderbookParams): Promise<OrderbookDto>;
    /**
     * Retrieves the orders for a given market.
     * @param params - The parameters for the orders request.
     * @returns The orders data.
     */
    getOrders(params: GetOrdersParams): Promise<OrderDto[]>;
    /**
     * Retrieves the order history for a given market.
     * @param params - The parameters for the order history request.
     * @returns The order history data.
     */
    getOrderHistory(params: GetOrderHistoryParams): Promise<OrderHistoryDto[]>;
    /**
     * Retrieves the trades for a given market.
     * @param params - The parameters for the trades request.
     * @returns The trades data.
     */
    getTrades(params: GetTradesParams): Promise<TradeDto[]>;
    /**
     * Retrieves the fills for a given market.
     * @param params - The parameters for the fills request.
     * @returns The fills data.
     */
    getFills(params: GetFillsParams): Promise<FillDto[]>;
    /**
     * Retrieves the tokens for a given market.
     * @param params - The parameters for the tokens request.
     * @returns The tokens data.
     */
    getTokens(params: GetTokensParams): Promise<TokenDto[]>;
    /**
     * Retrieves the markets for a given market.
     * @param params - The parameters for the markets request.
     * @returns The markets data.
     */
    getMarkets(params: GetMarketsParams): Promise<MarketDto[]>;
    /**
     * Retrieves the candle data for a given market.
     * @param params - The parameters for the candles request.
     * @returns The candle data.
     */
    getCandles(params: GetCandlesParams): Promise<CandleDto[]>;
    /**
     * Calculates the market order details for a given token inputs.
     * @param params - The parameters for the market details calculation.
     * @returns The market order details data.
     */
    calculateMarketDetails(params: CalculateMarketDetailsParams): Promise<MarketDetailsDto>;
    /**
     * Calculates the limit order details for a given token inputs.
     * @param params - The parameters for the limit details calculation.
     * @returns The limit order details data.
     */
    calculateLimitDetails(params: CalculateLimitDetailsParams): Promise<LimitDetailsDto>;
    getUserBalances(params: GetUserBalancesParams): Promise<UserBalancesDto>;
}
