/* eslint-disable @stylistic/indent */
import type {
  CandleUpdateDto,
  FillUpdateDto,
  MarketUpdateDto,
  OrderUpdateDto,
  OrderHistoryUpdateDto,
  OrderbookUpdateDto,
  TradeUpdateDto
} from './dtos';
import type {
  SubscribeToMarketParams, UnsubscribeFromMarketParams,
  SubscribeToOrderbookParams, UnsubscribeFromOrderbookParams,
  SubscribeToTradesParams, UnsubscribeFromTradesParams,
  SubscribeToUserOrdersParams, UnsubscribeFromUserOrdersParams,
  SubscribeToUserOrderHistoryParams, UnsubscribeFromUserOrderHistoryParams,
  SubscribeToUserFillsParams, UnsubscribeFromUserFillsParams,
  SubscribeToCandlesParams,
  UnsubscribeFromCandlesParams
} from './params';
import {
  OnchainLobWebSocketClient, EventEmitter,
  type OnchainLobWebSocketResponseDto, type PublicEventEmitter, type ToEventEmitter
} from '../../common';
import { getErrorLogMessage } from '../../logging';
import { ALL_MARKETS_ID } from '../constants';

const ALL_MARKETS_CHANNEL = 'allMarkets';

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
export class OnchainLobSpotWebSocketService implements Disposable {
  /**
   * Event emitters for various WebSocket events.
   */
  readonly events: OnchainLobSpotWebSocketServiceEvents = {
    subscriptionError: new EventEmitter(),
    allMarketsUpdated: new EventEmitter(),
    marketUpdated: new EventEmitter(),
    orderbookUpdated: new EventEmitter(),
    tradesUpdated: new EventEmitter(),
    userOrdersUpdated: new EventEmitter(),
    userOrderHistoryUpdated: new EventEmitter(),
    userFillsUpdated: new EventEmitter(),
    candlesUpdated: new EventEmitter(),
  };

  /**
   * The WebSocket client used to communicate with the Onchain LOB spot market.
   */
  protected readonly onchainLobWebSocketClient: OnchainLobWebSocketClient;

  /**
   * Creates an instance of OnchainLobSpotWebSocketService.
   * @param baseUrl - The base URL for the WebSocket connection.
   * @param startImmediately - Whether to start the WebSocket client immediately.
   */
  constructor(readonly baseUrl: string, startImmediately = true) {
    this.onchainLobWebSocketClient = new OnchainLobWebSocketClient(baseUrl);
    this.onchainLobWebSocketClient.events.messageReceived.addListener(this.onSocketMessageReceived);
    if (startImmediately)
      this.startOnchainLobWebSocketClientIfNeeded();
  }

  /**
   * Subscribes to market updates for a given market.
   * @param params - The parameters for the market subscription.
   */
  subscribeToMarket(params: SubscribeToMarketParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'market',
      market: params.market,
    });
  }

  /**
   * Unsubscribes from market updates for a given market.
   * @param params - The parameters for the market unsubscription.
   */
  unsubscribeFromMarket(params: UnsubscribeFromMarketParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'market',
      market: params.market,
    });
  }

  /**
   * Subscribes to all markets.
   */
  subscribeToAllMarkets() {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: ALL_MARKETS_CHANNEL,
    });
  }

  /**
   * Unsubscribes from all markets.
   */
  unsubscribeFromAllMarkets() {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: ALL_MARKETS_CHANNEL,
    });
  }

  /**
   * Subscribes to orderbook updates for a given market.
   * @param params - The parameters for the orderbook subscription.
   */
  subscribeToOrderbook(params: SubscribeToOrderbookParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'orderbook',
      market: params.market,
      aggregation: params.aggregation,
    });
  }

  /**
   * Unsubscribes from orderbook updates for a given market.
   * @param params - The parameters for the orderbook unsubscription.
   */
  unsubscribeFromOrderbook(params: UnsubscribeFromOrderbookParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'orderbook',
      market: params.market,
      aggregation: params.aggregation,
    });
  }

  /**
   * Subscribes to trade updates for a given market.
   * @param params - The parameters for the trade subscription.
   */
  subscribeToTrades(params: SubscribeToTradesParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'trades',
      market: params.market,
    });
  }

  /**
   * Unsubscribes from trade updates for a given market.
   * @param params - The parameters for the trade unsubscription.
   */
  unsubscribeFromTrades(params: UnsubscribeFromTradesParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'trades',
      market: params.market,
    });
  }

  /**
   * Subscribes to user order updates for a given market and user.
   * @param params - The parameters for the user order subscription.
   */
  subscribeToUserOrders(params: SubscribeToUserOrdersParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'userOrders',
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  /**
   * Unsubscribes from user order updates for a given market and user.
   * @param params - The parameters for the user order unsubscription.
   */
  unsubscribeFromUserOrders(params: UnsubscribeFromUserOrdersParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'userOrders',
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  /**
   * Subscribes to user order history updates for a given market and user.
   * @param params - The parameters for the user order history subscription.
   */
    subscribeToUserOrderHistory(params: SubscribeToUserOrderHistoryParams) {
      this.startOnchainLobWebSocketClientIfNeeded();

      this.onchainLobWebSocketClient.subscribe({
        channel: 'userOrderHistory',
        user: params.user,
        market: params.market || ALL_MARKETS_ID,
      });
    }

    /**
     * Unsubscribes from user order history updates for a given market and user.
     * @param params - The parameters for the user order history unsubscription.
     */
    unsubscribeFromUserOrderHistory(params: UnsubscribeFromUserOrderHistoryParams) {
      this.onchainLobWebSocketClient.unsubscribe({
        channel: 'userOrderHistory',
        user: params.user,
        market: params.market || ALL_MARKETS_ID,
      });
    }

  /**
   * Subscribes to user fill updates for a given market and user.
   * @param params - The parameters for the user fill subscription.
   */
  subscribeToUserFills(params: SubscribeToUserFillsParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'userFills',
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  /**
   * Unsubscribes from user fill updates for a given market and user.
   * @param params - The parameters for the user fill unsubscription.
   */
  unsubscribeFromUserFills(params: UnsubscribeFromUserFillsParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'userFills',
      user: params.user,
      market: params.market || ALL_MARKETS_ID,
    });
  }

  /**
   * Subscribes to candle updates for a given market and resolution.
   * @param params - The parameters for the candle subscription.
   */
  subscribeToCandles(params: SubscribeToCandlesParams) {
    this.startOnchainLobWebSocketClientIfNeeded();

    this.onchainLobWebSocketClient.subscribe({
      channel: 'candles',
      resolution: params.resolution,
      market: params.market,
    });
  }

  /**
   * Unsubscribes from candle updates for a given market and resolution.
   * @param params - The parameters for the candle unsubscription.
   */
  unsubscribeFromCandles(params: UnsubscribeFromCandlesParams) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: 'candles',
      resolution: params.resolution,
      market: params.market,
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
        case ALL_MARKETS_CHANNEL:
          (this.events.allMarketsUpdated as ToEventEmitter<typeof this.events.allMarketsUpdated>).emit(message.isSnapshot, message.data as MarketUpdateDto[]);
          break;
        case 'market':
          (this.events.marketUpdated as ToEventEmitter<typeof this.events.marketUpdated>).emit(message.id, message.isSnapshot, (message.data as MarketUpdateDto[])[0]!);
          break;
        case 'orderbook':
          (this.events.orderbookUpdated as ToEventEmitter<typeof this.events.orderbookUpdated>).emit(message.id, message.isSnapshot, message.data as OrderbookUpdateDto);
          break;
        case 'trades':
          (this.events.tradesUpdated as ToEventEmitter<typeof this.events.tradesUpdated>).emit(message.id, message.isSnapshot, message.data as TradeUpdateDto[]);
          break;
        case 'userOrders':
          (this.events.userOrdersUpdated as ToEventEmitter<typeof this.events.userOrdersUpdated>).emit(message.id, message.isSnapshot, message.data as OrderUpdateDto[]);
          break;
        case 'userOrderHistory':
          (this.events.userOrderHistoryUpdated as ToEventEmitter<typeof this.events.userOrderHistoryUpdated>).emit(message.id, message.isSnapshot, message.data as OrderHistoryUpdateDto[]);
          break;
        case 'userFills':
          (this.events.userFillsUpdated as ToEventEmitter<typeof this.events.userFillsUpdated>).emit(message.id, message.isSnapshot, message.data as FillUpdateDto[]);
          break;
        case 'candles':
          (this.events.candlesUpdated as ToEventEmitter<typeof this.events.candlesUpdated>).emit(message.id, message.isSnapshot, message.data as CandleUpdateDto);
          break;
        case 'error':
          (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(message.data as string);
          break;
        case 'subscriptionResponse':
          break;
        default:
          console.warn('Unknown channel in the socket message handler.', message.channel);
      }
    }
    catch (error: unknown) {
      console.error('Unknown error in the socket message handler.', getErrorLogMessage(error));
    }
  };
}
