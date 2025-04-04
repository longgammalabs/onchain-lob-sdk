import type { CandleUpdateDto, FillUpdateDto, MarketUpdateDto, OrderUpdateDto, OrderHistoryUpdateDto, OrderbookUpdateDto, TradeUpdateDto } from './dtos';
import type { SubscribeToMarketParams, UnsubscribeFromMarketParams, SubscribeToOrderbookParams, UnsubscribeFromOrderbookParams, SubscribeToTradesParams, UnsubscribeFromTradesParams, SubscribeToUserOrdersParams, UnsubscribeFromUserOrdersParams, SubscribeToUserOrderHistoryParams, UnsubscribeFromUserOrderHistoryParams, SubscribeToUserFillsParams, UnsubscribeFromUserFillsParams, SubscribeToCandlesParams, UnsubscribeFromCandlesParams } from './params';
import { OnchainLobWebSocketClient, type OnchainLobWebSocketResponseDto, type PublicEventEmitter } from '../../common';
interface OnchainLobSpotWebSocketServiceEvents {
    marketUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: MarketUpdateDto]>;
    allMarketsUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: MarketUpdateDto[]]>;
    orderbookUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderbookUpdateDto]>;
    tradesUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: TradeUpdateDto[]]>;
    userOrdersUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderUpdateDto[]]>;
    userOrderHistoryUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderHistoryUpdateDto[]]>;
    userFillsUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: FillUpdateDto[]]>;
    candlesUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: CandleUpdateDto]>;
    subscriptionError: PublicEventEmitter<readonly [error: string]>;
}
/**
 * OnchainLobSpotWebSocketService provides methods to interact with the Onchain LOB spot market via WebSocket.
 * It allows subscribing and unsubscribing to various market events such as market updates, orderbook updates,
 * trades, user orders, and user fills.
 */
export declare class OnchainLobSpotWebSocketService implements Disposable {
    readonly baseUrl: string;
    /**
     * Event emitters for various WebSocket events.
     */
    readonly events: OnchainLobSpotWebSocketServiceEvents;
    /**
     * The WebSocket client used to communicate with the Onchain LOB spot market.
     */
    protected readonly onchainLobWebSocketClient: OnchainLobWebSocketClient;
    /**
     * Creates an instance of OnchainLobSpotWebSocketService.
     * @param baseUrl - The base URL for the WebSocket connection.
     * @param startImmediately - Whether to start the WebSocket client immediately.
     */
    constructor(baseUrl: string, startImmediately?: boolean);
    /**
     * Subscribes to market updates for a given market.
     * @param params - The parameters for the market subscription.
     */
    subscribeToMarket(params: SubscribeToMarketParams): void;
    /**
     * Unsubscribes from market updates for a given market.
     * @param params - The parameters for the market unsubscription.
     */
    unsubscribeFromMarket(params: UnsubscribeFromMarketParams): void;
    /**
     * Subscribes to all markets.
     */
    subscribeToAllMarkets(): void;
    /**
     * Unsubscribes from all markets.
     */
    unsubscribeFromAllMarkets(): void;
    /**
     * Subscribes to orderbook updates for a given market.
     * @param params - The parameters for the orderbook subscription.
     */
    subscribeToOrderbook(params: SubscribeToOrderbookParams): void;
    /**
     * Unsubscribes from orderbook updates for a given market.
     * @param params - The parameters for the orderbook unsubscription.
     */
    unsubscribeFromOrderbook(params: UnsubscribeFromOrderbookParams): void;
    /**
     * Subscribes to trade updates for a given market.
     * @param params - The parameters for the trade subscription.
     */
    subscribeToTrades(params: SubscribeToTradesParams): void;
    /**
     * Unsubscribes from trade updates for a given market.
     * @param params - The parameters for the trade unsubscription.
     */
    unsubscribeFromTrades(params: UnsubscribeFromTradesParams): void;
    /**
     * Subscribes to user order updates for a given market and user.
     * @param params - The parameters for the user order subscription.
     */
    subscribeToUserOrders(params: SubscribeToUserOrdersParams): void;
    /**
     * Unsubscribes from user order updates for a given market and user.
     * @param params - The parameters for the user order unsubscription.
     */
    unsubscribeFromUserOrders(params: UnsubscribeFromUserOrdersParams): void;
    /**
     * Subscribes to user order history updates for a given market and user.
     * @param params - The parameters for the user order history subscription.
     */
    subscribeToUserOrderHistory(params: SubscribeToUserOrderHistoryParams): void;
    /**
     * Unsubscribes from user order history updates for a given market and user.
     * @param params - The parameters for the user order history unsubscription.
     */
    unsubscribeFromUserOrderHistory(params: UnsubscribeFromUserOrderHistoryParams): void;
    /**
     * Subscribes to user fill updates for a given market and user.
     * @param params - The parameters for the user fill subscription.
     */
    subscribeToUserFills(params: SubscribeToUserFillsParams): void;
    /**
     * Unsubscribes from user fill updates for a given market and user.
     * @param params - The parameters for the user fill unsubscription.
     */
    unsubscribeFromUserFills(params: UnsubscribeFromUserFillsParams): void;
    /**
     * Subscribes to candle updates for a given market and resolution.
     * @param params - The parameters for the candle subscription.
     */
    subscribeToCandles(params: SubscribeToCandlesParams): void;
    /**
     * Unsubscribes from candle updates for a given market and resolution.
     * @param params - The parameters for the candle unsubscription.
     */
    unsubscribeFromCandles(params: UnsubscribeFromCandlesParams): void;
    /**
     * Disposes the WebSocket client and removes the message listener.
     */
    [Symbol.dispose](): void;
    /**
     * Starts the WebSocket client if it is not already started.
     */
    protected startOnchainLobWebSocketClientIfNeeded(): void;
    /**
     * Handles incoming WebSocket messages and emits the appropriate events.
     * @param message - The WebSocket message received.
     */
    protected readonly onSocketMessageReceived: (message: OnchainLobWebSocketResponseDto) => void;
}
export {};
