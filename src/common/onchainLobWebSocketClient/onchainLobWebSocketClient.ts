import type {
  SubscribeToSubscriptionWebSocketRequestDto, UnsubscribeFromSubscriptionWebSocketRequestDto,
  OnchainLobWebSocketResponseDto
} from './dtos';
import type { Subscription } from './subscription';
import { textUtils } from '../../utils';
import { EventEmitter, type PublicEventEmitter, type ToEventEmitter } from '../eventEmitter';
import { TimeoutScheduler } from '../timeoutScheduler';
import { ReadyState, WebSocketClient, type WebSocketCloseEvent } from '../webSocketClient';

interface OnchainLobWebSocketClientEvents {
  messageReceived: PublicEventEmitter<readonly [message: OnchainLobWebSocketResponseDto]>;
}

export type SubscriptionData = boolean | string | number | Record<string, unknown>;

export class OnchainLobWebSocketClient implements Disposable {
  readonly baseUrl: string;
  readonly events: OnchainLobWebSocketClientEvents = {
    messageReceived: new EventEmitter(),
  };

  protected socket: WebSocketClient;
  protected subscriptions: Map<string, Subscription> = new Map();
  protected subscriptionIdCounter: number = 0;
  protected reconnectScheduler = new TimeoutScheduler([1000, 5000, 30000, 60000], 120000);

  private _isStarted = false;
  private _isStarting = false;
  private _isReconnecting = false;
  private _connectPromise: Promise<void> | undefined;

  constructor(baseUrl: string) {
    this.baseUrl = textUtils.trimSlashes(baseUrl);
    this.socket = new WebSocketClient(new URL(this.baseUrl));
  }

  get isStarted() {
    return this._isStarted;
  }

  get isConnected() {
    return this.isSocketOpen;
  }

  protected get isSocketOpen() {
    return this.socket.readyState === ReadyState.Open;
  }

  async start(): Promise<void> {
    if (this.isStarted || this._isStarting)
      return;

    this._isStarting = true;

    try {
      this.socket.events.messageReceived.addListener(this.onSocketMessageReceived);
      this.socket.events.closed.addListener(this.onSocketClosed);
      await this.connect();
      this._isStarted = true;
    }
    catch (error: unknown) {
      this._isStarting = false;
      this._isStarted = false;
      throw new Error('Socket error', { cause: error });
    }
  }

  stop() {
    if (!(this.isStarted || this._isStarting))
      return;

    this.socket.events.messageReceived.removeListener(this.onSocketMessageReceived);
    this.socket.events.closed.removeListener(this.onSocketClosed);
    this.disconnect();
    this.reconnectScheduler[Symbol.dispose]();

    this._isStarted = false;
    this._isStarting = false;
  }

  /**
   * Forces an immediate reconnect, bypassing the escalated backoff of the
   * background reconnect loop. Intended for the case where the socket was
   * closed while the page was hidden/frozen (browsers throttle the reconnect
   * timers) and the user just returned — data should resume without waiting
   * out a tens-of-seconds backoff delay.
   *
   * Existing subscriptions are preserved and re-sent on the fresh socket.
   * A no-op when the socket is already open.
   */
  async reconnect(): Promise<void> {
    if (this._isReconnecting)
      return;

    this._isReconnecting = true;
    try {
      // Not started yet → a normal start performs the initial connect.
      if (!this.isStarted && !this._isStarting) {
        await this.start();
        return;
      }

      // Cancel any pending backoff attempt and reset the escalation so we
      // don't inherit a delay the background reconnect loop grew to tens of
      // seconds.
      this.reconnectScheduler.reset();

      // Already connected → nothing to do.
      if (this.isSocketOpen)
        return;

      // connect() opens a fresh socket and re-subscribes all subscriptions.
      await this.connect();
    }
    finally {
      this._isReconnecting = false;
    }
  }

  subscribe(subscriptionData: SubscriptionData): number {
    const serializedSubscriptionData = this.serializeSubscriptionData(subscriptionData);

    let subscription = this.subscriptions.get(serializedSubscriptionData);
    if (subscription) {
      subscription.subscribersCount++;

      return subscription.id;
    }

    subscription = {
      id: this.subscriptionIdCounter++,
      data: subscriptionData,
      serializedData: serializedSubscriptionData,
      subscribersCount: 1,
    };

    this.subscribeToSubscription(subscription);
    this.subscriptions.set(subscription.serializedData, subscription);

    return subscription.id;
  }

  unsubscribe(subscriptionData: SubscriptionData): boolean {
    const serializedSubscriptionData = this.serializeSubscriptionData(subscriptionData);

    const subscription = this.subscriptions.get(serializedSubscriptionData);
    if (!subscription)
      return false;

    if (--subscription.subscribersCount > 0)
      return false;

    this.unsubscribeFromSubscription(subscription);
    this.subscriptions.delete(subscription.serializedData);

    return true;
  }

  unsubscribeFromAllSubscriptions(): boolean {
    if (!this.subscriptions.size)
      return false;

    for (const subscription of this.subscriptions.values()) {
      this.unsubscribeFromSubscription(subscription);
    }
    this.subscriptions.clear();

    return true;
  }

  [Symbol.dispose](): void {
    this.stop();
  }

  protected connect(): Promise<void> {
    // Deduplicate concurrent connects. Without this, a manual reconnect() that
    // overlaps an already-in-flight connect (the background backoff timer that
    // just fired, or an initial start()) would open a second socket — the
    // second connect's internal disconnect() orphans the first, leaking its
    // unresolved promise and re-sending every subscription needlessly.
    if (!this._connectPromise) {
      this._connectPromise = this.performConnect()
        .finally(() => {
          this._connectPromise = undefined;
        });
    }

    return this._connectPromise;
  }

  protected async performConnect(): Promise<void> {
    await this.socket.connect();

    this.subscribeToAllSubscriptions();
  }

  protected subscribeToAllSubscriptions() {
    if (!this.isSocketOpen)
      return;

    for (const subscription of this.subscriptions.values())
      this.subscribeToSubscription(subscription);
  }

  protected subscribeToSubscription(subscription: Subscription) {
    if (!this.isSocketOpen)
      return;

    const message: SubscribeToSubscriptionWebSocketRequestDto = {
      method: 'subscribe',
      subscription: subscription.data,
    };
    this.socket.send(message);
  }

  protected unsubscribeFromSubscription(subscription: Subscription) {
    if (!this.isSocketOpen)
      return;

    const message: UnsubscribeFromSubscriptionWebSocketRequestDto = {
      method: 'unsubscribe',
      subscription: subscription.data,
    };
    this.socket.send(message);
  }

  protected disconnect(): void {
    this.socket.disconnect();
    this.subscriptions.clear();
  }

  protected onSocketClosed = (_socket: WebSocketClient, event: WebSocketCloseEvent) => {
    console.warn('Onchain LOB websocket is closed. Reason:', event.reason);
    this.reconnectScheduler
      .setTimeout(() => {
        console.log('Onchain LOB websocket reconnection...');
        this.connect()
          .catch(error => console.error('Reconnection error:', error));
      })
      .catch(error => console.error('Reconnect Scheduler error:', error));
  };

  protected onSocketMessageReceived = (message: unknown) => {
    switch ((message as OnchainLobWebSocketResponseDto).channel) {
      case 'connection':
        break;

      default:
        (this.events.messageReceived as ToEventEmitter<typeof this.events.messageReceived>).emit(message as OnchainLobWebSocketResponseDto);
    }
  };

  protected serializeSubscriptionData(data: SubscriptionData) {
    return JSON.stringify(data, Object.keys(data));
  }
}
