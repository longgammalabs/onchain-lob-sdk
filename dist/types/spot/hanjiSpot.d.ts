import type { ContractTransactionResponse } from 'ethers';
import type { Signer } from 'ethers/providers';
import { HanjiSpotMarketContract } from './hanjiSpotMarketContract';
import * as mappers from './mappers';
import type { ApproveSpotParams, BatchChangeOrderSpotParams, BatchClaimOrderSpotParams, BatchPlaceOrderSpotParams, ChangeOrderSpotParams, ClaimOrderSpotParams, DepositSpotParams, GetFillsParams, GetMarketParams, GetMarketsParams, GetOrderbookParams, GetOrdersParams, GetTokensParams, GetTradesParams, GetCandlesParams, PlaceOrderSpotParams, SetClaimableStatusParams, SubscribeToMarketParams, SubscribeToOrderbookParams, SubscribeToTradesParams, SubscribeToUserFillsParams, SubscribeToUserOrdersParams, UnsubscribeFromMarketParams, UnsubscribeFromOrderbookParams, UnsubscribeFromTradesParams, UnsubscribeFromUserFillsParams, UnsubscribeFromUserOrdersParams, WithdrawSpotParams, SubscribeToCandlesParams, UnsubscribeFromCandlesParams, CalculateLimitDetailsParams, CalculateMarketDetailsParams, GetUserBalancesParams, PlaceOrderWithPermitSpotParams, PlaceMarketOrderWithTargetValueParams, PlaceMarketOrderWithTargetValueWithPermitParams, GetOrderHistoryParams, UnsubscribeFromUserOrderHistoryParams, SubscribeToUserOrderHistoryParams, CalculateLimitDetailsSyncParams, CalculateMarketDetailsSyncParams } from './params';
import { type PublicEventEmitter } from '../common';
import type { Market, FillUpdate, MarketUpdate, OrderUpdate, OrderbookUpdate, TradeUpdate, Orderbook, Order, Trade, Fill, Token, Candle, CandleUpdate, MarketOrderDetails, LimitOrderDetails, UserBalances, OrderHistoryUpdate, OrderHistory } from '../models';
import { HanjiSpotService, HanjiSpotWebSocketService } from '../services';
/**
 * Options for configuring the HanjiSpot instance.
 *
 * @interface HanjiSpotOptions
 */
export interface HanjiSpotOptions {
    /**
     * The base URL for the Hanji API.
     *
     * @type {string}
     */
    apiBaseUrl: string;
    /**
     * The base URL for the Hanji WebSocket API.
     *
     * @type {string}
     */
    webSocketApiBaseUrl: string;
    /**
     * The ethers signer used for signing transactions.
     * For only http/ws operations, you can set this to null.
     *
     * @type {Signer | null}
     */
    signer: Signer | null;
    /**
     * Whether to connect to the WebSocket immediately after creating the HanjiSpot (true)
     * or when the first subscription is called (false).
     * By default, the WebSocket is connected immediately.
     *
     * @type {boolean}
     * @optional
     */
    webSocketConnectImmediately?: boolean;
    /**
     * Whether to enable the transfer of executed tokens.
     *
     * @type {boolean}
     * @optional
     */
    transferExecutedTokensEnabled?: boolean;
    /**
     * Whether to automatically wait for transactions to be confirmed.
     *
     * @type {boolean}
     * @optional
     */
    autoWaitTransaction?: boolean;
    /**
     * Whether to use a fast algorithm for waiting for transaction to be confirmed.
     *
     * @type {boolean}
     * @optional
     */
    fastWaitTransaction?: boolean;
    /**
     * Interval between requests in milliseconds when using a fast algorithm for waiting for transaction confirmations.
     *
     * @type {number}
     * @optional
     */
    fastWaitTransactionInterval?: number;
    /**
     * Timeout in milliseconds when using a fast algorithm for waiting for transaction confirmations.
     *
     * @type {number}
     * @optional
     */
    fastWaitTransactionTimeout?: number;
}
/**
 * Events are emitted when data related to subscriptions is updated.
 */
interface HanjiSpotEvents {
    /**
     * Emitted when some markets' data is updated.
     * @event
     * @type {PublicEventEmitter<readonly [isSnapshot: boolean, data: MarketUpdate[]]>}
     */
    allMarketUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: MarketUpdate[]]>;
    /**
     * Emitted when a market's data is updated.
     * @event
     * @type {PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: MarketUpdate]>}
     */
    marketUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: MarketUpdate]>;
    /**
     * Emitted when a market's orderbook is updated.
     * @event
     * @type {PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderbookUpdate]>}
     */
    orderbookUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderbookUpdate]>;
    /**
     * Emitted when a market's trades are updated.
     * @event
     * @type {PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: TradeUpdate[]]>}
     */
    tradesUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: TradeUpdate[]]>;
    /**
     * Emitted when a user's orders are updated.
     * @event
     * @type {PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderUpdate[]]>}
     */
    userOrdersUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderUpdate[]]>;
    /**
     * Emitted when a user's order history is updated.
     * @event
     * @type {PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderHistoryUpdate[]]>}
     */
    userOrderHistoryUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: OrderHistoryUpdate[]]>;
    /**
     * Emitted when a user's fills are updated.
     * @event
     * @type {PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: FillUpdate[]]>}
     */
    userFillsUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: FillUpdate[]]>;
    /**
     * Emitted when a market's candle is updated.
     * @event
     * @type {PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: CandleUpdate[]]>}
     */
    candlesUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: CandleUpdate]>;
    /**
     * Emitted when there is an error related to a subscription.
     * @event
     * @type {PublicEventEmitter<readonly [error: string]>}
     */
    subscriptionError: PublicEventEmitter<readonly [error: string]>;
}
/**
 * The HanjiSpot is a class for interacting with the Hanji Spot API.
 * It provides methods for retrieving market information, subscribing to market updates,
 * placing orders, managing user orders and fills, and and more.
 * Use the {@link HanjiClient#events} property to handle subscription events.
 */
export declare class HanjiSpot implements Disposable {
    /**
     * The events related to user subscriptions.
     *
     * These events are emitted when data is updated related to subscriptions.
     */
    readonly events: HanjiSpotEvents;
    /**
     * Indicates whether executed tokens should be transferred to the wallet or credited to the balance.
     * When true, executed tokens will be transferred to the wallet. When false, executed tokens will be credited to the balance.
     * If not set, the default value will be used.
     * This flag is used by the Hanji Spot contract.
     */
    transferExecutedTokensEnabled: boolean | undefined;
    /**
     * Indicates whether transactions should be automatically waited for by the client.
     * When true, transactions will be automatically waited for by the client until confirmation is received.
     * When false, transactions will not be waited for by the client.
     * If not set, the default value will be used.
     * This flag is used by the Hanji Spot contract.
     *
     * Note: "Wait" means that the client will wait until the transaction confirmation is received.
     */
    autoWaitTransaction: boolean | undefined;
    protected signer: Signer | null;
    protected readonly hanjiService: HanjiSpotService;
    protected readonly hanjiWebSocketService: HanjiSpotWebSocketService;
    private marketContracts;
    protected readonly cachedMarkets: Map<string, Market>;
    protected readonly mappers: typeof mappers;
    private cachedMarketsPromise;
    constructor(options: Readonly<HanjiSpotOptions>);
    /**
     * Sets a new signer for the HanjiSpot instance.
     *
     * @param {Signer | null} signer - The new signer to be set. For only http/ws operations, you can set this to null.
     * @returns {HanjiSpot} Returns the HanjiSpot instance for method chaining.
     */
    setSigner(signer: Signer | null): HanjiSpot;
    /**
    * Approves the specified amount of tokens for the corresponding market contract.
    * You need to approve the tokens before you can deposit or place an order.
    *
    * @param {ApproveSpotParams} params - The parameters for approving tokens.
    * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
    */
    approveTokens(params: ApproveSpotParams): Promise<ContractTransactionResponse>;
    /**
    * Deposits the specified amount of tokens to the corresponding market contract.
    * You need to approve the tokens before you can deposit them.
    * Use the {@link HanjiSpot#approveTokens} method for that.
    *
    * @param {DepositSpotParams} params - The parameters for depositing tokens.
    * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
    */
    depositTokens(params: DepositSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Withdraws the specified amount of tokens from the corresponding market contract.
     * If withdrawAll is true, the entire balance of tokens will be withdrawn.
     *
     * @param {WithdrawSpotParams} params - The parameters for withdrawing tokens.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    withdrawTokens(params: WithdrawSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Sets the claimable status for corresponding market contract.
     *
     * @param {SetClaimableStatusParams} params - The parameters for setting the claimable status.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    setClaimableStatus(params: SetClaimableStatusParams): Promise<ContractTransactionResponse>;
    /**
     * Places a new order in the corresponding market contract.
     *
     * @param {PlaceOrderSpotParams} params - The parameters for placing a new order.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    placeOrder(params: PlaceOrderSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Places a new order with a permit in the corresponding market contract.
     *
     * @param {PlaceOrderWithPermitSpotParams} params - The parameters for placing a new order with a permit.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    placeOrderWithPermit(params: PlaceOrderWithPermitSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Places a market order with a quote token value in the corresponding market contract.
     *
     * @param {PlaceMarketOrderWithTargetValueParams} params - The parameters for placing a market order with a target value.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    placeMarketOrderWithTargetValue(params: PlaceMarketOrderWithTargetValueParams): Promise<ContractTransactionResponse>;
    /**
     * Places a market order with a quote token value and a permit in the corresponding market contract.
     *
     * @param {PlaceMarketOrderWithTargetValueWithPermitParams} params - The parameters for placing a market order with a target value and a permit.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    placeMarketOrderWithTargetValueWithPermit(params: PlaceMarketOrderWithTargetValueWithPermitParams): Promise<ContractTransactionResponse>;
    /**
     * Places multiple orders in the corresponding market contract.
     *
     * @param {BatchPlaceOrderSpotParams} params - The parameters for placing multiple orders.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    batchPlaceOrder(params: BatchPlaceOrderSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Claims an order or fully cancel it in the corresponding market contract.
     *
     * @param {ClaimOrderSpotParams} params - The parameters for claiming an order.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    claimOrder(params: ClaimOrderSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Claims multiple orders or fully cancels them in the corresponding market contract.
     *
     * @param {BatchClaimOrderSpotParams} params - The parameters for claiming multiple orders.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    batchClaim(params: BatchClaimOrderSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Change an existing order in the corresponding market contract.
     *
     * @param {ChangeOrderSpotParams} params - The parameters for changing an existing order.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    changeOrder(params: ChangeOrderSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Change multiple existing orders in the corresponding market contract.
     *
     * @param {BatchChangeOrderSpotParams} params - The parameters for changing multiple existing orders.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    batchChangeOrder(params: BatchChangeOrderSpotParams): Promise<ContractTransactionResponse>;
    /**
     * Retrieves the markets information from cache.
     *
     * @returns {Promise<Map<string, Market> | undefined>} A Promise that resolves to the markets information or undefined if error when requesting markets.
     */
    getCachedMarkets(): Promise<Map<string, Market> | undefined>;
    /**
     * Retrieves the market information for the specified market.
     *
     * @param {GetMarketParams} params - The parameters for retrieving the market information.
     * @returns {Promise<Market | undefined>} A Promise that resolves to the market information or undefined if the market is not found.
     */
    getMarket(params: GetMarketParams): Promise<Market | undefined>;
    /**
     * Retrieves the markets.
     *
     * @param {GetMarketsParams} params - The parameters for retrieving the markets.
     * @returns {Promise<Market[]>} A Promise that resolves to an array of markets.
     */
    getMarkets(params: GetMarketsParams): Promise<Market[]>;
    /**
     * Retrieves the tokens.
     *
     * @param {GetTokensParams} params - The parameters for retrieving the tokens.
     * @returns {Promise<Token[]>} A Promise that resolves to an array of tokens.
     */
    getTokens(params: GetTokensParams): Promise<Token[]>;
    /**
     * Retrieves the orderbook for the specified market.
     *
     * @param {GetOrderbookParams} params - The parameters for retrieving the orderbook.
     * @returns {Promise<Orderbook>} A Promise that resolves to the orderbook.
     */
    getOrderbook(params: GetOrderbookParams): Promise<Orderbook>;
    /**
     * Retrieves the orders for the specified market.
     *
     * @param {GetOrdersParams} params - The parameters for retrieving the orders.
     * @returns {Promise<Order[]>} A Promise that resolves to an array of orders.
     */
    getOrders(params: GetOrdersParams): Promise<Order[]>;
    /**
     * Retrieves the order history for the specified market.
     *
     * @param {GetOrderHistoryParams} params - The parameters for retrieving the order history.
     * @returns {Promise<OrderHistory[]>} A Promise that resolves to an array of order history logs.
     */
    getOrderHistory(params: GetOrderHistoryParams): Promise<OrderHistory[]>;
    /**
     * Retrieves the trades for the specified market.
     *
     * @param {GetTradesParams} params - The parameters for retrieving the trades.
     * @returns {Promise<Trade[]>} A Promise that resolves to an array of trades.
     */
    getTrades(params: GetTradesParams): Promise<Trade[]>;
    /**
     * Retrieves the fills for the specified market.
     *
     * @param {GetFillsParams} params - The parameters for retrieving the fills.
     * @returns {Promise<Fill[]>} A Promise that resolves to an array of fills.
     */
    getFills(params: GetFillsParams): Promise<Fill[]>;
    /**
     * Retrieves the candles for the specified market and resolution.
     *
     * @param {GetCandlesParams} params - The parameters for retrieving the candles.
     * @returns {Promise<Candle[]>} A Promise that resolves to an array of candles.
     */
    getCandles(params: GetCandlesParams): Promise<Candle[]>;
    /**
     * Calculates the limit order details for a given token inputs.
     *
     * @param {CalculateLimitDetailsParams} params - The parameters for the limit details calculation.
     * @returns {Promise<LimitOrderDetails>} A Promise that resolves to the limit order details data.
     */
    calculateLimitDetails(params: CalculateLimitDetailsParams): Promise<LimitOrderDetails>;
    /**
     * Calculates the limit order details for a given token inputs without API request.
     *
     * @param {CalculateLimitDetailsSyncParams} params - The parameters for the limit details calculation.
     * @returns {LimitOrderDetails} Limit order details data.
     */
    calculateLimitDetailsSync(params: CalculateLimitDetailsSyncParams): LimitOrderDetails;
    /**
     * Calculates the market order details for a given token inputs.
     *
     * @param {CalculateMarketDetailsParams} params - The parameters for the market details calculation.
     * @returns {Promise<MarketOrderDetails>} A Promise that resolves to the market order details data.
     */
    calculateMarketDetails(params: CalculateMarketDetailsParams): Promise<MarketOrderDetails>;
    /**
     * Calculates the market order details for a given token inputs without API request.
     *
     * @param {CalculateMarketDetailsSyncParams} params - The parameters for the market details calculation.
     * @returns {MarketOrderDetails} Market order details data.
     */
    calculateMarketDetailsSync(params: CalculateMarketDetailsSyncParams): MarketOrderDetails;
    /**
     * Retrieves the user balances for the specified user.
     *
     * @param {GetUserBalancesParams} params - The parameters for retrieving the user balances.
     * @returns {Promise<UserBalances>} A Promise that resolves to the user balances data.
     */
    getUserBalances(params: GetUserBalancesParams): Promise<UserBalances>;
    /**
     * Subscribes to the market updates for the specified market.
     *
     * @param {SubscribeToMarketParams} params - The parameters for subscribing to the market updates.
     * @emits HanjiSpot#events#marketUpdated
     */
    subscribeToMarket(params: SubscribeToMarketParams): void;
    /**
     * Unsubscribes from the market updates for the specified market.
     *
     * @param {UnsubscribeFromMarketParams} params - The parameters for unsubscribing from the market updates.
     */
    unsubscribeFromMarket(params: UnsubscribeFromMarketParams): void;
    /**
     * Subscribes to the all markets updates.
     *
     * @emits HanjiSpot#events#marketUpdated
     */
    subscribeToAllMarkets(): void;
    /**
     * Unsubscribes from the all markets updates.
     */
    unsubscribeFromAllMarkets(): void;
    /**
     * Subscribes to the orderbook updates for the specified market and aggregation level.
     *
     * @param {SubscribeToOrderbookParams} params - The parameters for subscribing to the orderbook updates.
     * @emits HanjiSpot#events#orderbookUpdated
     */
    subscribeToOrderbook(params: SubscribeToOrderbookParams): void;
    /**
     * Unsubscribes from the orderbook updates for the specified market and aggregation level.
     *
     * @param {UnsubscribeFromOrderbookParams} params - The parameters for unsubscribing from the orderbook updates.
     */
    unsubscribeFromOrderbook(params: UnsubscribeFromOrderbookParams): void;
    /**
     * Subscribes to the trade updates for the specified market.
     *
     * @param {SubscribeToTradesParams} params - The parameters for subscribing to the trade updates.
     * @emits HanjiSpot#events#tradesUpdated
     */
    subscribeToTrades(params: SubscribeToTradesParams): void;
    /**
     * Unsubscribes from the trade updates for the specified market.
     *
     * @param {UnsubscribeFromTradesParams} params - The parameters for unsubscribing from the trade updates.
     */
    unsubscribeFromTrades(params: UnsubscribeFromTradesParams): void;
    /**
     * Subscribes to the user orders updates for the specified market and user.
     *
     * @param {SubscribeToUserOrdersParams} params - The parameters for subscribing to the user orders updates.
     * @emits HanjiSpot#events#ordersUpdated
     */
    subscribeToUserOrders(params: SubscribeToUserOrdersParams): void;
    /**
     * Unsubscribes from the user orders updates for the specified market and user.
     *
     * @param {UnsubscribeFromUserOrdersParams} params - The parameters for unsubscribing from the user orders updates.
     * @emits HanjiSpot#events#ordersUpdated
     */
    unsubscribeFromUserOrders(params: UnsubscribeFromUserOrdersParams): void;
    /**
     * Subscribes to the user order history updates for the specified market and user.
     *
     * @param {SubscribeToUserOrderHistoryParams} params - The parameters for subscribing to the user order history updates.
     * @emits HanjiSpot#events#userOrderHistoryUpdated
     */
    subscribeToUserOrderHistory(params: SubscribeToUserOrderHistoryParams): void;
    /**
       * Unsubscribes from the user order updates for the specified market and user.
       *
       * @param {UnsubscribeFromUserOrderHistoryParams} params - The parameters for unsubscribing from the user orders updates.
       * @emits HanjiSpot#events#userOrderHistoryUpdated
       */
    unsubscribeFromUserOrderHistory(params: UnsubscribeFromUserOrderHistoryParams): void;
    /**
     * Subscribes to the user fills updates for the specified market and user.
     *
     * @param {SubscribeToUserFillsParams} params - The parameters for subscribing to the user fills updates.
     * @emits HanjiSpot#events#userFillsUpdated
     */
    subscribeToUserFills(params: SubscribeToUserFillsParams): void;
    /**
     * Unsubscribes from the user fills updates for the specified market and user.
     *
     * @param {UnsubscribeFromUserFillsParams} params - The parameters for unsubscribing from the user fills updates.
     * @emits HanjiSpot#events#userFillsUpdated
     */
    unsubscribeFromUserFills(params: UnsubscribeFromUserFillsParams): void;
    /**
     * Subscribes to candle updates for the specified market and resolution.
     *
     * @param {SubscribeToCandlesParams} params - The parameters for subscribing to the candle updates.
     */
    subscribeToCandles(params: SubscribeToCandlesParams): void;
    /**
     * Unsubscribes from candle updates for the specified market and resolution.
     *
     * @param {UnsubscribeFromCandlesParams} params - The parameters for unsubscribing from the candle updates.
     */
    unsubscribeFromCandles(params: UnsubscribeFromCandlesParams): void;
    [Symbol.dispose](): void;
    protected ensureMarket(params: {
        market: string;
    }): Promise<Market>;
    protected getSpotMarketContract(params: {
        market: string;
    }): Promise<HanjiSpotMarketContract>;
    protected attachEvents(): void;
    protected detachEvents(): void;
    protected onMarketUpdated: Parameters<typeof this.hanjiWebSocketService.events.marketUpdated['addListener']>[0];
    protected onAllMarketsUpdated: Parameters<typeof this.hanjiWebSocketService.events.allMarketsUpdated['addListener']>[0];
    protected onOrderbookUpdated: Parameters<typeof this.hanjiWebSocketService.events.orderbookUpdated['addListener']>[0];
    protected onTradesUpdated: Parameters<typeof this.hanjiWebSocketService.events.tradesUpdated['addListener']>[0];
    protected onUserOrdersUpdated: Parameters<typeof this.hanjiWebSocketService.events.userOrdersUpdated['addListener']>[0];
    protected onUserOrderHistoryUpdated: Parameters<typeof this.hanjiWebSocketService.events.userOrderHistoryUpdated['addListener']>[0];
    protected onUserFillsUpdated: Parameters<typeof this.hanjiWebSocketService.events.userFillsUpdated['addListener']>[0];
    protected onCandlesUpdated: Parameters<typeof this.hanjiWebSocketService.events.candlesUpdated['addListener']>[0];
    protected onSubscriptionError: Parameters<typeof this.hanjiWebSocketService.events.subscriptionError['addListener']>[0];
}
export {};
