import { PerpsMockDataSource, type PerpsMockOptions } from './perpsMockDataSource';
import { EventEmitter, type ToEventEmitter } from '../../common';
import { ALL_MARKETS_ID } from '../../services/constants';
import type {
  IOnchainLobPerpsWebSocketService, OnchainLobPerpsWebSocketServiceEvents,
  SubscribeToPerpCandlesParams, SubscribeToPerpMarketParams, SubscribeToPerpOrderbookParams, SubscribeToPerpTradesParams,
  SubscribeToUserPerpAccountsParams, SubscribeToUserPerpCollateralParams, SubscribeToUserPerpFillsParams, SubscribeToUserPerpOrdersParams,
  UnsubscribeFromPerpCandlesParams, UnsubscribeFromPerpMarketParams, UnsubscribeFromPerpOrderbookParams, UnsubscribeFromPerpTradesParams,
  UnsubscribeFromUserPerpAccountsParams, UnsubscribeFromUserPerpCollateralParams, UnsubscribeFromUserPerpFillsParams,
  UnsubscribeFromUserPerpOrdersParams
} from '../../services/onchainLobPerpsWebSocketService';

type Emit<K extends keyof OnchainLobPerpsWebSocketServiceEvents> = ToEventEmitter<OnchainLobPerpsWebSocketServiceEvents[K]>;

/**
 * A fixture-backed implementation of the perps WebSocket API. Every subscription is answered with a snapshot
 * (asynchronously, like on a real socket). When `updateIntervalMs` is set it also emits simulated market,
 * orderbook and trade updates for the active subscriptions.
 */
export class OnchainLobPerpsMockWebSocketService implements IOnchainLobPerpsWebSocketService {
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

  readonly dataSource: PerpsMockDataSource;

  private readonly subscriptions = new Map<string, number>();
  private readonly timeouts = new Set<ReturnType<typeof setTimeout>>();
  private interval: ReturnType<typeof setInterval> | undefined;
  private disposed = false;

  constructor(dataSourceOrOptions: PerpsMockDataSource | PerpsMockOptions = {}, private readonly updateIntervalMs = 0) {
    this.dataSource = dataSourceOrOptions instanceof PerpsMockDataSource ? dataSourceOrOptions : new PerpsMockDataSource(dataSourceOrOptions);
    const options = dataSourceOrOptions instanceof PerpsMockDataSource ? {} : dataSourceOrOptions;
    this.updateIntervalMs = updateIntervalMs || options.updateIntervalMs || 0;
  }

  /** A mock never drops the connection. */
  get isConnected(): boolean {
    return !this.disposed;
  }

  reconnect(): void {
    // Nothing to reconnect: the mock has no socket. The subscriptions are kept.
  }

  subscribeToPerpMarket(params: SubscribeToPerpMarketParams): void {
    this.subscribe(`perpMarket:${params.market}`, () => {
      const [market] = this.dataSource.getMarkets({ market: params.market });
      if (market)
        (this.events.perpMarketUpdated as Emit<'perpMarketUpdated'>).emit(market.id, true, market);
    });
  }

  unsubscribeFromPerpMarket(params: UnsubscribeFromPerpMarketParams): void {
    this.unsubscribe(`perpMarket:${params.market}`);
  }

  subscribeToAllPerpMarkets(): void {
    this.subscribe('allPerpMarkets', () => {
      (this.events.allPerpMarketsUpdated as Emit<'allPerpMarketsUpdated'>).emit(true, this.dataSource.getMarkets());
    });
  }

  unsubscribeFromAllPerpMarkets(): void {
    this.unsubscribe('allPerpMarkets');
  }

  subscribeToPerpOrderbook(params: SubscribeToPerpOrderbookParams): void {
    this.subscribe(`perpOrderbook:${params.market}:${params.aggregation ?? ''}`, () => {
      (this.events.perpOrderbookUpdated as Emit<'perpOrderbookUpdated'>).emit(
        params.market, true, this.dataSource.getOrderbook({ market: params.market, aggregation: params.aggregation })
      );
    });
  }

  unsubscribeFromPerpOrderbook(params: UnsubscribeFromPerpOrderbookParams): void {
    this.unsubscribe(`perpOrderbook:${params.market}:${params.aggregation ?? ''}`);
  }

  subscribeToPerpTrades(params: SubscribeToPerpTradesParams): void {
    this.subscribe(`perpTrades:${params.market}`, () => {
      (this.events.perpTradesUpdated as Emit<'perpTradesUpdated'>).emit(
        params.market, true, this.dataSource.getTrades({ market: params.market, limit: 50 })
      );
    });
  }

  unsubscribeFromPerpTrades(params: UnsubscribeFromPerpTradesParams): void {
    this.unsubscribe(`perpTrades:${params.market}`);
  }

  subscribeToPerpCandles(params: SubscribeToPerpCandlesParams): void {
    this.subscribe(`perpCandles:${params.market}:${params.resolution}`, () => {
      const now = Math.floor(Date.now() / 1000);
      const candles = this.dataSource.getCandles({ market: params.market, resolution: params.resolution, fromTime: now - 7 * 86400, toTime: now });
      (this.events.perpCandlesUpdated as Emit<'perpCandlesUpdated'>).emit(`${params.market}-${params.resolution}`, true, candles);
    });
  }

  unsubscribeFromPerpCandles(params: UnsubscribeFromPerpCandlesParams): void {
    this.unsubscribe(`perpCandles:${params.market}:${params.resolution}`);
  }

  subscribeToUserPerpAccounts(params: SubscribeToUserPerpAccountsParams): void {
    this.subscribe(`userPerpAccounts:${params.user}:${params.market ?? ''}`, () => {
      (this.events.userPerpAccountsUpdated as Emit<'userPerpAccountsUpdated'>).emit(
        params.market || ALL_MARKETS_ID, true, this.dataSource.getAccounts({ user: params.user, market: params.market })
      );
    });
  }

  unsubscribeFromUserPerpAccounts(params: UnsubscribeFromUserPerpAccountsParams): void {
    this.unsubscribe(`userPerpAccounts:${params.user}:${params.market ?? ''}`);
  }

  subscribeToUserPerpOrders(params: SubscribeToUserPerpOrdersParams): void {
    this.subscribe(`userPerpOrders:${params.user}:${params.market ?? ''}`, () => {
      (this.events.userPerpOrdersUpdated as Emit<'userPerpOrdersUpdated'>).emit(
        params.market || ALL_MARKETS_ID, true, this.dataSource.getOrders({ user: params.user, market: params.market, status: 'open' })
      );
    });
  }

  unsubscribeFromUserPerpOrders(params: UnsubscribeFromUserPerpOrdersParams): void {
    this.unsubscribe(`userPerpOrders:${params.user}:${params.market ?? ''}`);
  }

  subscribeToUserPerpFills(params: SubscribeToUserPerpFillsParams): void {
    this.subscribe(`userPerpFills:${params.user}:${params.market ?? ''}`, () => {
      (this.events.userPerpFillsUpdated as Emit<'userPerpFillsUpdated'>).emit(
        params.market || ALL_MARKETS_ID, true, this.dataSource.getFills({ user: params.user, market: params.market })
      );
    });
  }

  unsubscribeFromUserPerpFills(params: UnsubscribeFromUserPerpFillsParams): void {
    this.unsubscribe(`userPerpFills:${params.user}:${params.market ?? ''}`);
  }

  subscribeToUserPerpCollateral(params: SubscribeToUserPerpCollateralParams): void {
    this.subscribe(`userPerpCollateral:${params.user}:${params.market ?? ''}`, () => {
      (this.events.userPerpCollateralUpdated as Emit<'userPerpCollateralUpdated'>).emit(
        params.market || ALL_MARKETS_ID, true, this.dataSource.getCollateralHistory({ user: params.user, market: params.market })
      );
    });
  }

  unsubscribeFromUserPerpCollateral(params: UnsubscribeFromUserPerpCollateralParams): void {
    this.unsubscribe(`userPerpCollateral:${params.user}:${params.market ?? ''}`);
  }

  [Symbol.dispose](): void {
    this.disposed = true;
    this.stopSimulation();
    for (const timeout of this.timeouts)
      clearTimeout(timeout);
    this.timeouts.clear();
    this.subscriptions.clear();
  }

  private subscribe(key: string, sendSnapshot: () => void) {
    if (this.disposed)
      return;

    const count = this.subscriptions.get(key) ?? 0;
    this.subscriptions.set(key, count + 1);
    if (count > 0)
      return; // like the real socket, a repeated subscription only counts the subscribers

    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      if (this.subscriptions.has(key))
        this.safely(sendSnapshot);
    }, 0);
    this.timeouts.add(timeout);
    this.startSimulationIfNeeded();
  }

  private unsubscribe(key: string) {
    const count = this.subscriptions.get(key);
    if (count === undefined)
      return;

    if (count > 1)
      this.subscriptions.set(key, count - 1);
    else
      this.subscriptions.delete(key);

    if (!this.subscriptions.size)
      this.stopSimulation();
  }

  private startSimulationIfNeeded() {
    if (this.interval || this.updateIntervalMs <= 0)
      return;

    this.interval = setInterval(() => this.simulate(), this.updateIntervalMs);
    // The mock must not keep a Node.js process alive.
    (this.interval as { unref?: () => void }).unref?.();
  }

  private stopSimulation() {
    if (this.interval)
      clearInterval(this.interval);
    this.interval = undefined;
  }

  private simulate() {
    const { market, orderbook, trade } = this.dataSource.tick();
    const isSubscribed = (prefix: string) => [...this.subscriptions.keys()].some(key => key.startsWith(prefix));

    this.safely(() => {
      if (this.subscriptions.has(`perpMarket:${market.id}`))
        (this.events.perpMarketUpdated as Emit<'perpMarketUpdated'>).emit(market.id, false, market);
      if (this.subscriptions.has('allPerpMarkets'))
        (this.events.allPerpMarketsUpdated as Emit<'allPerpMarketsUpdated'>).emit(false, [market]);
      if (isSubscribed(`perpOrderbook:${market.id}:`))
        (this.events.perpOrderbookUpdated as Emit<'perpOrderbookUpdated'>).emit(market.id, false, orderbook);
      if (this.subscriptions.has(`perpTrades:${market.id}`))
        (this.events.perpTradesUpdated as Emit<'perpTradesUpdated'>).emit(market.id, false, [trade]);
    });
  }

  private safely(action: () => void) {
    try {
      action();
    }
    catch (error) {
      (this.events.subscriptionError as Emit<'subscriptionError'>).emit(error instanceof Error ? error.message : String(error));
    }
  }
}
