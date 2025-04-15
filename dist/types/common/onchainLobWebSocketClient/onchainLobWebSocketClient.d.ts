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
    constructor(baseUrl: string);
    get isStarted(): boolean;
    protected get isSocketOpen(): boolean;
    start(): Promise<void>;
    stop(): void;
    subscribe(subscriptionData: SubscriptionData): number;
    unsubscribe(subscriptionData: SubscriptionData): boolean;
    unsubscribeFromAllSubscriptions(): boolean;
    [Symbol.dispose](): void;
    protected connect(): Promise<void>;
    protected subscribeToAllSubscriptions(): void;
    protected subscribeToSubscription(subscription: Subscription): void;
    protected unsubscribeFromSubscription(subscription: Subscription): void;
    protected disconnect(): void;
    protected onSocketClosed: (_socket: WebSocketClient, event: WebSocketCloseEvent) => void;
    protected onSocketMessageReceived: (message: unknown) => void;
    protected serializeSubscriptionData(data: SubscriptionData): string;
}
export {};
