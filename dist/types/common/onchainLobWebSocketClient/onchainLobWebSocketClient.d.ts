import type { OnchainLobWebSocketResponseDto } from './dtos';
import type { Subscription } from './subscription';
import { type PublicEventEmitter } from '../eventEmitter';
import { TimeoutScheduler } from '../timeoutScheduler';
import { WebSocketClient, type WebSocketCloseEvent } from '../webSocketClient';
interface OnchainLobWebSocketClientEvents {
    messageReceived: PublicEventEmitter<readonly [message: OnchainLobWebSocketResponseDto]>;
}
export type SubscriptionData = boolean | string | number | Record<string, unknown>;
export declare class OnchainLobWebSocketClient implements Disposable {
    readonly baseUrl: string;
    readonly events: OnchainLobWebSocketClientEvents;
    protected socket: WebSocketClient;
    protected subscriptions: Map<string, Subscription>;
    protected subscriptionIdCounter: number;
    protected reconnectScheduler: TimeoutScheduler;
    private _isStarted;
    private _isStarting;
    private _isReconnecting;
    private _connectPromise;
    constructor(baseUrl: string);
    get isStarted(): boolean;
    get isConnected(): boolean;
    protected get isSocketOpen(): boolean;
    start(): Promise<void>;
    stop(): void;
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
    reconnect(): Promise<void>;
    subscribe(subscriptionData: SubscriptionData): number;
    unsubscribe(subscriptionData: SubscriptionData): boolean;
    unsubscribeFromAllSubscriptions(): boolean;
    [Symbol.dispose](): void;
    protected connect(): Promise<void>;
    protected performConnect(): Promise<void>;
    protected subscribeToAllSubscriptions(): void;
    protected subscribeToSubscription(subscription: Subscription): void;
    protected unsubscribeFromSubscription(subscription: Subscription): void;
    protected disconnect(): void;
    protected onSocketClosed: (_socket: WebSocketClient, event: WebSocketCloseEvent) => void;
    protected onSocketMessageReceived: (message: unknown) => void;
    protected serializeSubscriptionData(data: SubscriptionData): string;
}
export {};
