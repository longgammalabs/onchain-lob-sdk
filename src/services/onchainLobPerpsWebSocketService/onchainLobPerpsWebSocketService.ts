/* eslint-disable @stylistic/indent */
import type {
  PerpAccountUpdateDto,
  PerpCandleUpdateDto,
  PerpCollateralEventUpdateDto,
  PerpFillUpdateDto,
  PerpMarketUpdateDto,
  PerpOrderbookUpdateDto,
  PerpOrderUpdateDto,
  PerpTradeUpdateDto
} from './dtos';
import type {
  SubscribeToPerpCandlesParams,
  SubscribeToPerpMarketParams,
  SubscribeToPerpOrderbookParams,
  SubscribeToPerpTradesParams,
  SubscribeToUserPerpAccountsParams,
  SubscribeToUserPerpCollateralParams,
  SubscribeToUserPerpFillsParams,
  SubscribeToUserPerpOrdersParams,
  UnsubscribeFromPerpCandlesParams,
  UnsubscribeFromPerpMarketParams,
  UnsubscribeFromPerpOrderbookParams,
  UnsubscribeFromPerpTradesParams,
  UnsubscribeFromUserPerpAccountsParams,
  UnsubscribeFromUserPerpCollateralParams,
  UnsubscribeFromUserPerpFillsParams,
  UnsubscribeFromUserPerpOrdersParams
} from './params';
import {
  OnchainLobWebSocketClient, EventEmitter,
  type OnchainLobWebSocketResponseDto, type PublicEventEmitter, type ToEventEmitter
} from '../../common';
import { getErrorLogMessage } from '../../logging';
import { ALL_MARKETS_ID } from '../constants';

export const PERP_MARKET_CHANNEL = 'perpMarket';
export const ALL_PERP_MARKETS_CHANNEL = 'allPerpMarkets';
export const PERP_ORDERBOOK_CHANNEL = 'perpOrderbook';
export const PERP_TRADES_CHANNEL = 'perpTrades';
export const PERP_CANDLES_CHANNEL = 'perpCandles';
export const USER_PERP_ACCOUNTS_CHANNEL = 'userPerpAccounts';
export const USER_PERP_ORDERS_CHANNEL = 'userPerpOrders';
export const USER_PERP_FILLS_CHANNEL = 'userPerpFills';
export const USER_PERP_COLLATERAL_CHANNEL = 'userPerpCollateral';

export interface OnchainLobPerpsWebSocketServiceEvents {
  perpMarketUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpMarketUpdateDto]>;
  allPerpMarketsUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: PerpMarketUpdateDto[]]>;
  perpOrderbookUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpOrderbookUpdateDto]>;
  perpTradesUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpTradeUpdateDto[]]>;
  /** The id is the market; the resolution is in the candle. Candles are not sent as a snapshot: load them with REST. */
  perpCandlesUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpCandleUpdateDto]>;
  userPerpAccountsUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpAccountUpdateDto[]]>;
  userPerpOrdersUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpOrderUpdateDto[]]>;
  userPerpFillsUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpFillUpdateDto[]]>;
  userPerpCollateralUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpCollateralEventUpdateDto[]]>;
  subscriptionError: PublicEventEmitter<readonly [error: string]>;
}

/**
 * The WebSocket API of the perps module. It is the contract the mock service
 * (`OnchainLobPerpsMockWebSocketService`) implements too.
 */
export interface IOnchainLobPerpsWebSocketService extends Disposable {
  readonly events: OnchainLobPerpsWebSocketServiceEvents;
  readonly isConnected: boolean;
  reconnect(): void;

  subscribeToPerpMarket(params: SubscribeToPerpMarketParams): void;
  unsubscribeFromPerpMarket(params: UnsubscribeFromPerpMarketParams): void;
  subscribeToAllPerpMarkets(): void;
  unsubscribeFromAllPerpMarkets(): void;
  subscribeToPerpOrderbook(params: SubscribeToPerpOrderbookParams): void;
  unsubscribeFromPerpOrderbook(params: UnsubscribeFromPerpOrderbookParams): void;
  subscribeToPerpTrades(params: SubscribeToPerpTradesParams): void;
  unsubscribeFromPerpTrades(params: UnsubscribeFromPerpTradesParams): void;
  subscribeToPerpCandles(params: SubscribeToPerpCandlesParams): void;
  unsubscribeFromPerpCandles(params: UnsubscribeFromPerpCandlesParams): void;
  subscribeToUserPerpAccounts(params: SubscribeToUserPerpAccountsParams): void;
  unsubscribeFromUserPerpAccounts(params: UnsubscribeFromUserPerpAccountsParams): void;
  subscribeToUserPerpOrders(params: SubscribeToUserPerpOrdersParams): void;
  unsubscribeFromUserPerpOrders(params: UnsubscribeFromUserPerpOrdersParams): void;
  subscribeToUserPerpFills(params: SubscribeToUserPerpFillsParams): void;
  unsubscribeFromUserPerpFills(params: UnsubscribeFromUserPerpFillsParams): void;
  subscribeToUserPerpCollateral(params: SubscribeToUserPerpCollateralParams): void;
  unsubscribeFromUserPerpCollateral(params: UnsubscribeFromUserPerpCollateralParams): void;
}

/**
 * OnchainLobPerpsWebSocketService provides methods to interact with the Onchain LOB perps channels via WebSocket.
 * It allows subscribing and unsubscribing to market, orderbook, trades, candles and user channels.
 */
export class OnchainLobPerpsWebSocketService implements IOnchainLobPerpsWebSocketService {
  /**
   * Event emitters for various WebSocket events.
   */
  readonly events: OnchainLobPerpsWebSocketServiceEvents = {
    perpMarketUpdated: new EventEmitter(),
    allPerpMarketsUpdated: new EventEmitter(),
    perpOrderbookUpdated: new EventEmitter(),
    perpTradesUpdated: new EventEmitter(),
    perpCandlesUpdated: new EventEmitter(),
    userPerpAccountsUpdated: new EventEmitter(),
    userPerpOrdersUpdated: new EventEmitter(),
    userPerpFillsUpdated: new EventEmitter(),
    userPerpCollateralUpdated: new EventEmitter(),
    subscriptionError: new EventEmitter(),
  };

  /**
   * The WebSocket client used to communicate with the Onchain LOB.
   */
  protected readonly onchainLobWebSocketClient: OnchainLobWebSocketClient;

  /**
   * Creates an instance of OnchainLobPerpsWebSocketService.
   * @param baseUrl - The base URL for the WebSocket connection.
   * @param startImmediately - Whether to start the WebSocket client immediately.
   */
  constructor(readonly baseUrl: string, startImmediately = true) {
    this.onchainLobWebSocketClient = new OnchainLobWebSocketClient(baseUrl);
    this.onchainLobWebSocketClient.events.messageReceived.addListener(this.onSocketMessageReceived);
    if (startImmediately)
      this.startOnchainLobWebSocketClientIfNeeded();
  }

  subscribeToPerpMarket(params: SubscribeToPerpMarketParams) {
    this.subscribe({ channel: PERP_MARKET_CHANNEL, market: params.market });
  }

  unsubscribeFromPerpMarket(params: UnsubscribeFromPerpMarketParams) {
    this.onchainLobWebSocketClient.unsubscribe({ channel: PERP_MARKET_CHANNEL, market: params.market });
  }

  subscribeToAllPerpMarkets() {
    this.subscribe({ channel: ALL_PERP_MARKETS_CHANNEL });
  }

  unsubscribeFromAllPerpMarkets() {
    this.onchainLobWebSocketClient.unsubscribe({ channel: ALL_PERP_MARKETS_CHANNEL });
  }

  subscribeToPerpOrderbook(params: SubscribeToPerpOrderbookParams) {
    this.subscribe({ channel: PERP_ORDERBOOK_CHANNEL, market: params.market, aggregation: params.aggregation });
  }

  unsubscribeFromPerpOrderbook(params: UnsubscribeFromPerpOrderbookParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: PERP_ORDERBOOK_CHANNEL,
      market: params.market,
      aggregation: params.aggregation,
    });
  }

  subscribeToPerpTrades(params: SubscribeToPerpTradesParams) {
    this.subscribe({ channel: PERP_TRADES_CHANNEL, market: params.market });
  }

  unsubscribeFromPerpTrades(params: UnsubscribeFromPerpTradesParams) {
    this.onchainLobWebSocketClient.unsubscribe({ channel: PERP_TRADES_CHANNEL, market: params.market });
  }

  subscribeToPerpCandles(params: SubscribeToPerpCandlesParams) {
    this.subscribe({ channel: PERP_CANDLES_CHANNEL, resolution: params.resolution, market: params.market });
  }

  unsubscribeFromPerpCandles(params: UnsubscribeFromPerpCandlesParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: PERP_CANDLES_CHANNEL,
      resolution: params.resolution,
      market: params.market,
    });
  }

  subscribeToUserPerpAccounts(params: SubscribeToUserPerpAccountsParams) {
    this.subscribe({ channel: USER_PERP_ACCOUNTS_CHANNEL, user: params.user, market: params.market || ALL_MARKETS_ID });
  }

  unsubscribeFromUserPerpAccounts(params: UnsubscribeFromUserPerpAccountsParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: USER_PERP_ACCOUNTS_CHANNEL,
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  subscribeToUserPerpOrders(params: SubscribeToUserPerpOrdersParams) {
    this.subscribe({ channel: USER_PERP_ORDERS_CHANNEL, user: params.user, market: params.market || ALL_MARKETS_ID });
  }

  unsubscribeFromUserPerpOrders(params: UnsubscribeFromUserPerpOrdersParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: USER_PERP_ORDERS_CHANNEL,
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  subscribeToUserPerpFills(params: SubscribeToUserPerpFillsParams) {
    this.subscribe({ channel: USER_PERP_FILLS_CHANNEL, user: params.user, market: params.market || ALL_MARKETS_ID });
  }

  unsubscribeFromUserPerpFills(params: UnsubscribeFromUserPerpFillsParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: USER_PERP_FILLS_CHANNEL,
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  subscribeToUserPerpCollateral(params: SubscribeToUserPerpCollateralParams) {
    this.subscribe({ channel: USER_PERP_COLLATERAL_CHANNEL, user: params.user, market: params.market || ALL_MARKETS_ID });
  }

  unsubscribeFromUserPerpCollateral(params: UnsubscribeFromUserPerpCollateralParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: USER_PERP_COLLATERAL_CHANNEL,
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  /**
   * Disposes the WebSocket client and removes the message listener.
   */
  [Symbol.dispose]() {
    this.onchainLobWebSocketClient.events.messageReceived.removeListener(this.onSocketMessageReceived);
    this.onchainLobWebSocketClient.stop();
  }

  /**
   * Whether the underlying WebSocket connection is currently open.
   */
  get isConnected(): boolean {
    return this.onchainLobWebSocketClient.isConnected;
  }

  /**
   * Forces an immediate reconnect of the underlying WebSocket, preserving all active subscriptions.
   */
  reconnect(): void {
    this.onchainLobWebSocketClient.reconnect()
      .catch(error => console.error(`Onchain LOB Web Socket reconnect failed. Error = ${getErrorLogMessage(error)}`));
  }

  protected subscribe(subscription: Record<string, unknown>) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe(subscription);
  }

  /**
   * Starts the WebSocket client if it is not already started.
   */
  protected startOnchainLobWebSocketClientIfNeeded() {
    this.onchainLobWebSocketClient.start()
      .catch(error => console.error(`Onchain LOB Web Socket has not been started. Error = ${getErrorLogMessage(error)}`));
  }

  /**
   * Handles incoming WebSocket messages and emits the appropriate events.
   * @param message - The WebSocket message received.
   */
  protected readonly onSocketMessageReceived = (message: OnchainLobWebSocketResponseDto) => {
    try {
      if (!message.data)
        return;
      switch (message.channel) {
        case ALL_PERP_MARKETS_CHANNEL:
          (this.events.allPerpMarketsUpdated as ToEventEmitter<typeof this.events.allPerpMarketsUpdated>).emit(message.isSnapshot, toArray(message.data as PerpMarketUpdateDto | PerpMarketUpdateDto[]));
          break;
        case PERP_MARKET_CHANNEL: {
          // The contract sends a single market; a one-element array (the spot `market` channel shape) is tolerated.
          const market = toArray(message.data as PerpMarketUpdateDto | PerpMarketUpdateDto[])[0];
          if (market)
            (this.events.perpMarketUpdated as ToEventEmitter<typeof this.events.perpMarketUpdated>).emit(message.id, message.isSnapshot, market);
          break;
        }
        case PERP_ORDERBOOK_CHANNEL:
          (this.events.perpOrderbookUpdated as ToEventEmitter<typeof this.events.perpOrderbookUpdated>).emit(message.id, message.isSnapshot, message.data as PerpOrderbookUpdateDto);
          break;
        case PERP_TRADES_CHANNEL:
          (this.events.perpTradesUpdated as ToEventEmitter<typeof this.events.perpTradesUpdated>).emit(message.id, message.isSnapshot, toArray(message.data as PerpTradeUpdateDto | PerpTradeUpdateDto[]));
          break;
        case PERP_CANDLES_CHANNEL:
          (this.events.perpCandlesUpdated as ToEventEmitter<typeof this.events.perpCandlesUpdated>).emit(message.id, message.isSnapshot, message.data as PerpCandleUpdateDto);
          break;
        case USER_PERP_ACCOUNTS_CHANNEL:
          (this.events.userPerpAccountsUpdated as ToEventEmitter<typeof this.events.userPerpAccountsUpdated>).emit(message.id, message.isSnapshot, toArray(message.data as PerpAccountUpdateDto | PerpAccountUpdateDto[]));
          break;
        case USER_PERP_ORDERS_CHANNEL:
          (this.events.userPerpOrdersUpdated as ToEventEmitter<typeof this.events.userPerpOrdersUpdated>).emit(message.id, message.isSnapshot, toArray(message.data as PerpOrderUpdateDto | PerpOrderUpdateDto[]));
          break;
        case USER_PERP_FILLS_CHANNEL:
          (this.events.userPerpFillsUpdated as ToEventEmitter<typeof this.events.userPerpFillsUpdated>).emit(message.id, message.isSnapshot, toArray(message.data as PerpFillUpdateDto | PerpFillUpdateDto[]));
          break;
        case USER_PERP_COLLATERAL_CHANNEL:
          (this.events.userPerpCollateralUpdated as ToEventEmitter<typeof this.events.userPerpCollateralUpdated>).emit(message.id, message.isSnapshot, toArray(message.data as PerpCollateralEventUpdateDto | PerpCollateralEventUpdateDto[]));
          break;
        case 'error':
          (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(message.data as string);
          break;
        case 'subscriptionResponse':
          break;
        default:
          console.warn('Unknown channel in the perps socket message handler.', message.channel);
      }
    }
    catch (error: unknown) {
      console.error('Unknown error in the perps socket message handler.', getErrorLogMessage(error));
    }
  };
}

const toArray = <T>(data: T | T[]): T[] => Array.isArray(data) ? data : [data];
