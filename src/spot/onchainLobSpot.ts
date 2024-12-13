import type { ContractTransactionResponse } from 'ethers';
import type { Signer } from 'ethers/providers';

import { OnchainLobSpotMarketContract } from './onchainLobSpotMarketContract';
import * as mappers from './mappers';
import type {
  ApproveSpotParams,
  BatchChangeOrderSpotParams,
  BatchClaimOrderSpotParams,
  BatchPlaceOrderSpotParams,
  ChangeOrderSpotParams,
  ClaimOrderSpotParams,
  DepositSpotParams,
  GetFillsParams,
  GetMarketParams,
  GetMarketsParams,
  GetOrderbookParams,
  GetOrdersParams,
  GetTokensParams,
  GetTradesParams,
  GetCandlesParams,
  PlaceOrderSpotParams,
  SetClaimableStatusParams,
  SubscribeToMarketParams,
  SubscribeToOrderbookParams,
  SubscribeToTradesParams,
  SubscribeToUserFillsParams,
  SubscribeToUserOrdersParams,
  UnsubscribeFromMarketParams,
  UnsubscribeFromOrderbookParams,
  UnsubscribeFromTradesParams,
  UnsubscribeFromUserFillsParams,
  UnsubscribeFromUserOrdersParams,
  WithdrawSpotParams,
  SubscribeToCandlesParams,
  UnsubscribeFromCandlesParams,
  CalculateLimitDetailsParams,
  CalculateMarketDetailsParams,
  GetUserBalancesParams,
  PlaceOrderWithPermitSpotParams,
  PlaceMarketOrderWithTargetValueParams,
  PlaceMarketOrderWithTargetValueWithPermitParams,
  GetOrderHistoryParams,
  UnsubscribeFromUserOrderHistoryParams,
  SubscribeToUserOrderHistoryParams,
  CalculateLimitDetailsSyncParams,
  CalculateMarketDetailsSyncParams
} from './params';
import { EventEmitter, type PublicEventEmitter, type ToEventEmitter } from '../common';
import { getErrorLogMessage } from '../logging';
import type { Market, FillUpdate, MarketUpdate, OrderUpdate, OrderbookUpdate, TradeUpdate, Orderbook, Order, Trade, Fill, Token, Candle, CandleUpdate, MarketOrderDetails, LimitOrderDetails, UserBalances, OrderHistoryUpdate, OrderHistory } from '../models';
import { OnchainLobSpotService, OnchainLobSpotWebSocketService } from '../services';
import { ALL_MARKETS_ID } from '../services/constants';
import { getLimitDetails } from './limitDetails';
import { getMarketDetails } from './marketDetails';

/**
 * Options for configuring the OnchainLobSpot instance.
 *
 * @interface OnchainLobSpotOptions
 */
export interface OnchainLobSpotOptions {
  /**
   * The base URL for the Onchain LOB API.
   *
   * @type {string}
   */
  apiBaseUrl: string;

  /**
   * The base URL for the Onchain LOB WebSocket API.
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
   * Whether to connect to the WebSocket immediately after creating the OnchainLobSpot (true)
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
interface OnchainLobSpotEvents {
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
 * The OnchainLobSpot is a class for interacting with the Onchain LOB Spot API.
 * It provides methods for retrieving market information, subscribing to market updates,
 * placing orders, managing user orders and fills, and and more.
 * Use the {@link OnchainLobClient#events} property to handle subscription events.
 */
export class OnchainLobSpot implements Disposable {
  /**
   * The events related to user subscriptions.
   *
   * These events are emitted when data is updated related to subscriptions.
   */
  readonly events: OnchainLobSpotEvents = {
    subscriptionError: new EventEmitter(),
    marketUpdated: new EventEmitter(),
    orderbookUpdated: new EventEmitter(),
    tradesUpdated: new EventEmitter(),
    userOrdersUpdated: new EventEmitter(),
    userOrderHistoryUpdated: new EventEmitter(),
    userFillsUpdated: new EventEmitter(),
    candlesUpdated: new EventEmitter(),
    allMarketUpdated: new EventEmitter(),
  };

  /**
   * Indicates whether executed tokens should be transferred to the wallet or credited to the balance.
   * When true, executed tokens will be transferred to the wallet. When false, executed tokens will be credited to the balance.
   * If not set, the default value will be used.
   * This flag is used by the Onchain LOB Spot contract.
   */
  transferExecutedTokensEnabled: boolean | undefined;
  /**
   * Indicates whether transactions should be automatically waited for by the client.
   * When true, transactions will be automatically waited for by the client until confirmation is received.
   * When false, transactions will not be waited for by the client.
   * If not set, the default value will be used.
   * This flag is used by the Onchain LOB Spot contract.
   *
   * Note: "Wait" means that the client will wait until the transaction confirmation is received.
   */
  autoWaitTransaction: boolean | undefined;

  protected signer: Signer | null;
  protected readonly onchainLobService: OnchainLobSpotService;
  protected readonly onchainLobWebSocketService: OnchainLobSpotWebSocketService;
  private marketContracts: Map<string, OnchainLobSpotMarketContract> = new Map();
  protected readonly cachedMarkets: Map<string, Market> = new Map();
  protected readonly mappers: typeof mappers;
  private cachedMarketsPromise: Promise<Market[]> | undefined = undefined;

  constructor(options: Readonly<OnchainLobSpotOptions>) {
    this.signer = options.signer;
    this.transferExecutedTokensEnabled = options.transferExecutedTokensEnabled;
    this.autoWaitTransaction = options.autoWaitTransaction;
    this.onchainLobService = new OnchainLobSpotService(options.apiBaseUrl);
    this.onchainLobWebSocketService = new OnchainLobSpotWebSocketService(options.webSocketApiBaseUrl, options.webSocketConnectImmediately);
    this.mappers = mappers;

    this.attachEvents();
  }

  /**
   * Sets a new signer for the OnchainLobSpot instance.
   *
   * @param {Signer | null} signer - The new signer to be set. For only http/ws operations, you can set this to null.
   * @returns {OnchainLobSpot} Returns the OnchainLobSpot instance for method chaining.
   */
  setSigner(signer: Signer | null): OnchainLobSpot {
    this.signer = signer;
    this.marketContracts = new Map();
    return this;
  }

  /**
  * Approves the specified amount of tokens for the corresponding market contract.
  * You need to approve the tokens before you can deposit or place an order.
  *
  * @param {ApproveSpotParams} params - The parameters for approving tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async approveTokens(params: ApproveSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.approveTokens(params);
  }

  /**
  * Deposits the specified amount of tokens to the corresponding market contract.
  * You need to approve the tokens before you can deposit them.
  * Use the {@link OnchainLobSpot#approveTokens} method for that.
  *
  * @param {DepositSpotParams} params - The parameters for depositing tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async depositTokens(params: DepositSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.depositTokens(params);
  }

  /**
   * Withdraws the specified amount of tokens from the corresponding market contract.
   * If withdrawAll is true, the entire balance of tokens will be withdrawn.
   *
   * @param {WithdrawSpotParams} params - The parameters for withdrawing tokens.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async withdrawTokens(params: WithdrawSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.withdrawTokens(params);
  }

  /**
   * Sets the claimable status for corresponding market contract.
   *
   * @param {SetClaimableStatusParams} params - The parameters for setting the claimable status.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async setClaimableStatus(params: SetClaimableStatusParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.setClaimableStatus(params);
  }

  /**
   * Places a new order in the corresponding market contract.
   *
   * @param {PlaceOrderSpotParams} params - The parameters for placing a new order.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeOrder(params: PlaceOrderSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.placeOrder(params);
  }

  /**
   * Places a new order with a permit in the corresponding market contract.
   *
   * @param {PlaceOrderWithPermitSpotParams} params - The parameters for placing a new order with a permit.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeOrderWithPermit(params: PlaceOrderWithPermitSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.placeOrderWithPermit(params);
  }

  /**
   * Places a market order with a quote token value in the corresponding market contract.
   *
   * @param {PlaceMarketOrderWithTargetValueParams} params - The parameters for placing a market order with a target value.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeMarketOrderWithTargetValue(params: PlaceMarketOrderWithTargetValueParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.placeMarketOrderWithTargetValue(params);
  }

  /**
   * Places a market order with a quote token value and a permit in the corresponding market contract.
   *
   * @param {PlaceMarketOrderWithTargetValueWithPermitParams} params - The parameters for placing a market order with a target value and a permit.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeMarketOrderWithTargetValueWithPermit(params: PlaceMarketOrderWithTargetValueWithPermitParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.placeMarketOrderWithTargetValueWithPermit(params);
  }

  /**
   * Places multiple orders in the corresponding market contract.
   *
   * @param {BatchPlaceOrderSpotParams} params - The parameters for placing multiple orders.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async batchPlaceOrder(params: BatchPlaceOrderSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.batchPlaceOrder(params);
  }

  /**
   * Claims an order or fully cancel it in the corresponding market contract.
   *
   * @param {ClaimOrderSpotParams} params - The parameters for claiming an order.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async claimOrder(params: ClaimOrderSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.claimOrder(params);
  }

  /**
   * Claims multiple orders or fully cancels them in the corresponding market contract.
   *
   * @param {BatchClaimOrderSpotParams} params - The parameters for claiming multiple orders.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async batchClaim(params: BatchClaimOrderSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.batchClaim(params);
  }

  /**
   * Change an existing order in the corresponding market contract.
   *
   * @param {ChangeOrderSpotParams} params - The parameters for changing an existing order.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async changeOrder(params: ChangeOrderSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.changeOrder(params);
  }

  /**
   * Change multiple existing orders in the corresponding market contract.
   *
   * @param {BatchChangeOrderSpotParams} params - The parameters for changing multiple existing orders.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async batchChangeOrder(params: BatchChangeOrderSpotParams): Promise<ContractTransactionResponse> {
    const marketContract = await this.getSpotMarketContract(params);

    return marketContract.batchChangeOrder(params);
  }

  /**
   * Retrieves the markets information from cache.
   *
   * @returns {Promise<Map<string, Market> | undefined>} A Promise that resolves to the markets information or undefined if error when requesting markets.
   */
  async getCachedMarkets(): Promise<Map<string, Market> | undefined> {
    const markets = this.cachedMarkets;

    if (!markets.size) {
      try {
        let getMarketsPromise = this.cachedMarketsPromise;
        if (!getMarketsPromise) {
          getMarketsPromise = this.getMarkets({ market: ALL_MARKETS_ID });
          this.cachedMarketsPromise = getMarketsPromise;
        }

        const marketsRes = await getMarketsPromise;
        this.cachedMarketsPromise = undefined;
        marketsRes.forEach(market => markets.set(market.id, market));
      }
      catch (error) {
        console.error(error);
      }

      if (!markets.size) return undefined;
    }

    return markets;
  }

  /**
   * Retrieves the market information for the specified market.
   *
   * @param {GetMarketParams} params - The parameters for retrieving the market information.
   * @returns {Promise<Market | undefined>} A Promise that resolves to the market information or undefined if the market is not found.
   */
  async getMarket(params: GetMarketParams): Promise<Market | undefined> {
    const markets = await this.getMarkets(params);
    const market = markets[0];

    return market;
  }

  /**
   * Retrieves the markets.
   *
   * @param {GetMarketsParams} params - The parameters for retrieving the markets.
   * @returns {Promise<Market[]>} A Promise that resolves to an array of markets.
   */
  async getMarkets(params: GetMarketsParams): Promise<Market[]> {
    const marketDtos = await this.onchainLobService.getMarkets(params);
    const markets = marketDtos.map(marketDto => this.mappers.mapMarketDtoToMarket(
      marketDto,
      marketDto.priceScalingFactor,
      marketDto.tokenXScalingFactor
    ));

    return markets;
  }

  /**
   * Retrieves the tokens.
   *
   * @param {GetTokensParams} params - The parameters for retrieving the tokens.
   * @returns {Promise<Token[]>} A Promise that resolves to an array of tokens.
   */
  async getTokens(params: GetTokensParams): Promise<Token[]> {
    const tokenDtos = await this.onchainLobService.getTokens(params);
    const tokens = tokenDtos.map(this.mappers.mapTokenDtoToToken);

    return tokens;
  }

  /**
   * Retrieves the orderbook for the specified market.
   *
   * @param {GetOrderbookParams} params - The parameters for retrieving the orderbook.
   * @returns {Promise<Orderbook>} A Promise that resolves to the orderbook.
   */
  async getOrderbook(params: GetOrderbookParams): Promise<Orderbook> {
    const [market, orderbookDto] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getOrderbook(params),
    ]);
    const orderbook = this.mappers.mapOrderbookDtoToOrderbook(orderbookDto, market.priceScalingFactor, market.tokenXScalingFactor);

    return orderbook;
  }

  /**
   * Retrieves the orders for the specified market.
   *
   * @param {GetOrdersParams} params - The parameters for retrieving the orders.
   * @returns {Promise<Order[]>} A Promise that resolves to an array of orders.
   */
  async getOrders(params: GetOrdersParams): Promise<Order[]> {
    const [market, orderDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getOrders(params),
    ]);
    const orders = orderDtos.map(orderDto => this.mappers.mapOrderDtoToOrder(orderDto, market.priceScalingFactor, market.tokenXScalingFactor));

    return orders;
  }

  /**
   * Retrieves the order history for the specified market.
   *
   * @param {GetOrderHistoryParams} params - The parameters for retrieving the order history.
   * @returns {Promise<OrderHistory[]>} A Promise that resolves to an array of order history logs.
   */
  async getOrderHistory(params: GetOrderHistoryParams): Promise<OrderHistory[]> {
    const [market, orderHistoryDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getOrderHistory(params),
    ]);
    const orderHistory = orderHistoryDtos.map(orderHistoryDto => this.mappers.mapOrderHistoryDtoToOrderHistory(orderHistoryDto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor));

    return orderHistory;
  }

  /**
   * Retrieves the trades for the specified market.
   *
   * @param {GetTradesParams} params - The parameters for retrieving the trades.
   * @returns {Promise<Trade[]>} A Promise that resolves to an array of trades.
   */
  async getTrades(params: GetTradesParams): Promise<Trade[]> {
    const [market, tradeDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getTrades(params),
    ]);
    const trades = tradeDtos.map(tradeDto => this.mappers.mapTradeDtoToTrade(tradeDto, market.priceScalingFactor, market.tokenXScalingFactor));

    return trades;
  }

  /**
   * Retrieves the fills for the specified market.
   *
   * @param {GetFillsParams} params - The parameters for retrieving the fills.
   * @returns {Promise<Fill[]>} A Promise that resolves to an array of fills.
   */
  async getFills(params: GetFillsParams): Promise<Fill[]> {
    const [market, fillDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getFills(params),
    ]);
    const fills = fillDtos.map(fillDto => this.mappers.mapFillDtoToFill(fillDto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor));

    return fills;
  }

  /**
   * Retrieves the candles for the specified market and resolution.
   *
   * @param {GetCandlesParams} params - The parameters for retrieving the candles.
   * @returns {Promise<Candle[]>} A Promise that resolves to an array of candles.
   */
  async getCandles(params: GetCandlesParams): Promise<Candle[]> {
    const candles = await this.onchainLobService.getCandles(params);

    return candles;
  }

  /**
   * Calculates the limit order details for a given token inputs.
   *
   * @param {CalculateLimitDetailsParams} params - The parameters for the limit details calculation.
   * @returns {Promise<LimitOrderDetails>} A Promise that resolves to the limit order details data.
   */
  async calculateLimitDetails(params: CalculateLimitDetailsParams): Promise<LimitOrderDetails> {
    return this.onchainLobService.calculateLimitDetails(params);
  }

  /**
   * Calculates the limit order details for a given token inputs without API request.
   *
   * @param {CalculateLimitDetailsSyncParams} params - The parameters for the limit details calculation.
   * @returns {LimitOrderDetails} Limit order details data.
   */
  calculateLimitDetailsSync(params: CalculateLimitDetailsSyncParams): LimitOrderDetails {
    return getLimitDetails(params);
  }

  /**
   * Calculates the market order details for a given token inputs.
   *
   * @param {CalculateMarketDetailsParams} params - The parameters for the market details calculation.
   * @returns {Promise<MarketOrderDetails>} A Promise that resolves to the market order details data.
   */
  async calculateMarketDetails(params: CalculateMarketDetailsParams): Promise<MarketOrderDetails> {
    return this.onchainLobService.calculateMarketDetails(params);
  }

  /**
   * Calculates the market order details for a given token inputs without API request.
   *
   * @param {CalculateMarketDetailsSyncParams} params - The parameters for the market details calculation.
   * @returns {MarketOrderDetails} Market order details data.
   */
  calculateMarketDetailsSync(params: CalculateMarketDetailsSyncParams): MarketOrderDetails {
    return getMarketDetails(params);
  }

  /**
   * Retrieves the user balances for the specified user.
   *
   * @param {GetUserBalancesParams} params - The parameters for retrieving the user balances.
   * @returns {Promise<UserBalances>} A Promise that resolves to the user balances data.
   */
  async getUserBalances(params: GetUserBalancesParams): Promise<UserBalances> {
    return this.onchainLobService.getUserBalances(params);
  }

  /**
   * Subscribes to the market updates for the specified market.
   *
   * @param {SubscribeToMarketParams} params - The parameters for subscribing to the market updates.
   * @emits OnchainLobSpot#events#marketUpdated
   */
  subscribeToMarket(params: SubscribeToMarketParams): void {
    this.onchainLobWebSocketService.subscribeToMarket(params);
  }

  /**
   * Unsubscribes from the market updates for the specified market.
   *
   * @param {UnsubscribeFromMarketParams} params - The parameters for unsubscribing from the market updates.
   */
  unsubscribeFromMarket(params: UnsubscribeFromMarketParams): void {
    this.onchainLobWebSocketService.unsubscribeFromMarket(params);
  }

  /**
   * Subscribes to the all markets updates.
   *
   * @emits OnchainLobSpot#events#marketUpdated
   */
  subscribeToAllMarkets(): void {
    this.onchainLobWebSocketService.subscribeToAllMarkets();
  }

  /**
   * Unsubscribes from the all markets updates.
   */
  unsubscribeFromAllMarkets(): void {
    this.onchainLobWebSocketService.unsubscribeFromAllMarkets();
  }

  /**
   * Subscribes to the orderbook updates for the specified market and aggregation level.
   *
   * @param {SubscribeToOrderbookParams} params - The parameters for subscribing to the orderbook updates.
   * @emits OnchainLobSpot#events#orderbookUpdated
   */
  subscribeToOrderbook(params: SubscribeToOrderbookParams): void {
    this.onchainLobWebSocketService.subscribeToOrderbook(params);
  }

  /**
   * Unsubscribes from the orderbook updates for the specified market and aggregation level.
   *
   * @param {UnsubscribeFromOrderbookParams} params - The parameters for unsubscribing from the orderbook updates.
   */
  unsubscribeFromOrderbook(params: UnsubscribeFromOrderbookParams): void {
    this.onchainLobWebSocketService.unsubscribeFromOrderbook(params);
  }

  /**
   * Subscribes to the trade updates for the specified market.
   *
   * @param {SubscribeToTradesParams} params - The parameters for subscribing to the trade updates.
   * @emits OnchainLobSpot#events#tradesUpdated
   */
  subscribeToTrades(params: SubscribeToTradesParams): void {
    this.onchainLobWebSocketService.subscribeToTrades(params);
  }

  /**
   * Unsubscribes from the trade updates for the specified market.
   *
   * @param {UnsubscribeFromTradesParams} params - The parameters for unsubscribing from the trade updates.
   */
  unsubscribeFromTrades(params: UnsubscribeFromTradesParams): void {
    this.onchainLobWebSocketService.unsubscribeFromTrades(params);
  }

  /**
   * Subscribes to the user orders updates for the specified market and user.
   *
   * @param {SubscribeToUserOrdersParams} params - The parameters for subscribing to the user orders updates.
   * @emits OnchainLobSpot#events#ordersUpdated
   */
  subscribeToUserOrders(params: SubscribeToUserOrdersParams): void {
    this.onchainLobWebSocketService.subscribeToUserOrders(params);
  }

  /**
   * Unsubscribes from the user orders updates for the specified market and user.
   *
   * @param {UnsubscribeFromUserOrdersParams} params - The parameters for unsubscribing from the user orders updates.
   * @emits OnchainLobSpot#events#ordersUpdated
   */
  unsubscribeFromUserOrders(params: UnsubscribeFromUserOrdersParams): void {
    this.onchainLobWebSocketService.unsubscribeFromUserOrders(params);
  }

  /**
   * Subscribes to the user order history updates for the specified market and user.
   *
   * @param {SubscribeToUserOrderHistoryParams} params - The parameters for subscribing to the user order history updates.
   * @emits OnchainLobSpot#events#userOrderHistoryUpdated
   */
  subscribeToUserOrderHistory(params: SubscribeToUserOrderHistoryParams): void {
    this.onchainLobWebSocketService.subscribeToUserOrderHistory(params);
  }

  /**
     * Unsubscribes from the user order updates for the specified market and user.
     *
     * @param {UnsubscribeFromUserOrderHistoryParams} params - The parameters for unsubscribing from the user orders updates.
     * @emits OnchainLobSpot#events#userOrderHistoryUpdated
     */
  unsubscribeFromUserOrderHistory(params: UnsubscribeFromUserOrderHistoryParams): void {
    this.onchainLobWebSocketService.unsubscribeFromUserOrderHistory(params);
  }

  /**
   * Subscribes to the user fills updates for the specified market and user.
   *
   * @param {SubscribeToUserFillsParams} params - The parameters for subscribing to the user fills updates.
   * @emits OnchainLobSpot#events#userFillsUpdated
   */
  subscribeToUserFills(params: SubscribeToUserFillsParams): void {
    this.onchainLobWebSocketService.subscribeToUserFills(params);
  }

  /**
   * Unsubscribes from the user fills updates for the specified market and user.
   *
   * @param {UnsubscribeFromUserFillsParams} params - The parameters for unsubscribing from the user fills updates.
   * @emits OnchainLobSpot#events#userFillsUpdated
   */
  unsubscribeFromUserFills(params: UnsubscribeFromUserFillsParams): void {
    this.onchainLobWebSocketService.unsubscribeFromUserFills(params);
  }

  /**
   * Subscribes to candle updates for the specified market and resolution.
   *
   * @param {SubscribeToCandlesParams} params - The parameters for subscribing to the candle updates.
   */
  subscribeToCandles(params: SubscribeToCandlesParams): void {
    this.onchainLobWebSocketService.subscribeToCandles(params);
  }

  /**
   * Unsubscribes from candle updates for the specified market and resolution.
   *
   * @param {UnsubscribeFromCandlesParams} params - The parameters for unsubscribing from the candle updates.
   */
  unsubscribeFromCandles(params: UnsubscribeFromCandlesParams): void {
    this.onchainLobWebSocketService.unsubscribeFromCandles(params);
  }

  [Symbol.dispose](): void {
    this.detachEvents();
    this.onchainLobWebSocketService[Symbol.dispose]();
  }

  protected async ensureMarket(params: { market: string }): Promise<Market> {
    const markets = await this.getCachedMarkets();
    const market = markets?.get(params.market);
    if (!market)
      throw new Error(`Market not found by the ${params.market} address`);

    return market;
  }

  protected async getSpotMarketContract(params: { market: string }): Promise<OnchainLobSpotMarketContract> {
    if (this.signer === null) {
      throw new Error('Signer is not set');
    }
    let marketContract = this.marketContracts.get(params.market);

    if (!marketContract) {
      const market = await this.ensureMarket(params);

      marketContract = new OnchainLobSpotMarketContract({
        market,
        signer: this.signer,
        transferExecutedTokensEnabled: this.transferExecutedTokensEnabled,
        autoWaitTransaction: this.autoWaitTransaction,
      });
      this.marketContracts.set(params.market, marketContract);
    }

    return marketContract;
  }

  protected attachEvents(): void {
    this.onchainLobWebSocketService.events.marketUpdated.addListener(this.onMarketUpdated);
    this.onchainLobWebSocketService.events.allMarketsUpdated.addListener(this.onAllMarketsUpdated);
    this.onchainLobWebSocketService.events.orderbookUpdated.addListener(this.onOrderbookUpdated);
    this.onchainLobWebSocketService.events.tradesUpdated.addListener(this.onTradesUpdated);
    this.onchainLobWebSocketService.events.userOrdersUpdated.addListener(this.onUserOrdersUpdated);
    this.onchainLobWebSocketService.events.userOrderHistoryUpdated.addListener(this.onUserOrderHistoryUpdated);
    this.onchainLobWebSocketService.events.userFillsUpdated.addListener(this.onUserFillsUpdated);
    this.onchainLobWebSocketService.events.candlesUpdated.addListener(this.onCandlesUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.addListener(this.onSubscriptionError);
  }

  protected detachEvents(): void {
    this.onchainLobWebSocketService.events.marketUpdated.removeListener(this.onMarketUpdated);
    this.onchainLobWebSocketService.events.orderbookUpdated.removeListener(this.onOrderbookUpdated);
    this.onchainLobWebSocketService.events.tradesUpdated.removeListener(this.onTradesUpdated);
    this.onchainLobWebSocketService.events.userOrdersUpdated.removeListener(this.onUserOrdersUpdated);
    this.onchainLobWebSocketService.events.userOrderHistoryUpdated.removeListener(this.onUserOrderHistoryUpdated);
    this.onchainLobWebSocketService.events.userFillsUpdated.removeListener(this.onUserFillsUpdated);
    this.onchainLobWebSocketService.events.candlesUpdated.removeListener(this.onCandlesUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.removeListener(this.onSubscriptionError);
  }

  protected onMarketUpdated: Parameters<typeof this.onchainLobWebSocketService.events.marketUpdated['addListener']>[0] = async (marketId, isSnapshot, data) => {
    try {
      const marketUpdate = this.mappers.mapMarketUpdateDtoToMarketUpdate(marketId, data, data.priceScalingFactor, data.tokenXScalingFactor);

      (this.events.marketUpdated as ToEventEmitter<typeof this.events.marketUpdated>).emit(marketId, isSnapshot, marketUpdate);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onAllMarketsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.allMarketsUpdated['addListener']>[0] = async (isSnapshot, data) => {
    try {
      const allMarketsUpdate = data.map(marketUpdateDot =>
        this.mappers.mapMarketUpdateDtoToMarketUpdate(marketUpdateDot.id, marketUpdateDot, marketUpdateDot.priceScalingFactor, marketUpdateDot.tokenXScalingFactor));

      (this.events.allMarketUpdated as ToEventEmitter<typeof this.events.allMarketUpdated>).emit(isSnapshot, allMarketsUpdate);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onOrderbookUpdated: Parameters<typeof this.onchainLobWebSocketService.events.orderbookUpdated['addListener']>[0] = async (marketId, isSnapshot, data) => {
    try {
      const markets = await this.getCachedMarkets();
      const market = markets?.get(marketId);
      if (!market)
        return;
      const orderbookUpdate = this.mappers.mapOrderbookUpdateDtoToOrderbookUpdate(marketId, data, market.priceScalingFactor, market.tokenXScalingFactor);

      (this.events.orderbookUpdated as ToEventEmitter<typeof this.events.orderbookUpdated>).emit(marketId, isSnapshot, orderbookUpdate);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onTradesUpdated: Parameters<typeof this.onchainLobWebSocketService.events.tradesUpdated['addListener']>[0] = async (marketId, isSnapshot, data) => {
    try {
      const markets = await this.getCachedMarkets();
      if (!markets)
        return;
      const tradeUpdates = data.map(dto => {
        const market = markets.get(dto.market.id);
        if (!market)
          throw new Error(`Market not found for marketId: ${dto.market.id}`);
        return this.mappers.mapTradeUpdateDtoToTradeUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor);
      });

      (this.events.tradesUpdated as ToEventEmitter<typeof this.events.tradesUpdated>).emit(marketId, isSnapshot, tradeUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onUserOrdersUpdated: Parameters<typeof this.onchainLobWebSocketService.events.userOrdersUpdated['addListener']>[0] = async (marketId, isSnapshot, data) => {
    try {
      const markets = await this.getCachedMarkets();
      if (!markets)
        return;
      const orderUpdates = data.map(dto => {
        const market = markets.get(dto.market.id);
        if (!market)
          throw new Error(`Market not found for marketId: ${dto.market.id}`);
        return this.mappers.mapOrderUpdateDtoToOrderUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor);
      });

      (this.events.userOrdersUpdated as ToEventEmitter<typeof this.events.userOrdersUpdated>).emit(marketId, isSnapshot, orderUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onUserOrderHistoryUpdated: Parameters<typeof this.onchainLobWebSocketService.events.userOrderHistoryUpdated['addListener']>[0] = async (marketId, isSnapshot, data) => {
    try {
      const markets = await this.getCachedMarkets();
      if (!markets)
        return;
      const orderHistoryUpdates = data.map(dto => {
        const market = markets.get(dto.market.id);
        if (!market)
          throw new Error(`Market not found for marketId: ${dto.market.id}`);
        return this.mappers.mapOrderHistoryUpdateDtoToOrderHistoryUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor);
      });

      (this.events.userOrderHistoryUpdated as ToEventEmitter<typeof this.events.userOrderHistoryUpdated>).emit(marketId, isSnapshot, orderHistoryUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onUserFillsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.userFillsUpdated['addListener']>[0] = async (marketId, isSnapshot, data) => {
    try {
      const markets = await this.getCachedMarkets();
      if (!markets)
        return;
      const fillUpdates = data.map(dto => {
        const market = markets.get(dto.market.id);
        if (!market)
          throw new Error(`Market not found for marketId: ${dto.market.id}`);
        return this.mappers.mapFillUpdateDtoToFillUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor);
      });

      (this.events.userFillsUpdated as ToEventEmitter<typeof this.events.userFillsUpdated>).emit(marketId, isSnapshot, fillUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onCandlesUpdated: Parameters<typeof this.onchainLobWebSocketService.events.candlesUpdated['addListener']>[0] = (marketId, isSnapshot, data) => {
    (this.events.candlesUpdated as ToEventEmitter<typeof this.events.candlesUpdated>).emit(marketId, isSnapshot, data);
  };

  protected onSubscriptionError: Parameters<typeof this.onchainLobWebSocketService.events.subscriptionError['addListener']>[0] = error => {
    (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(error);
  };
}
