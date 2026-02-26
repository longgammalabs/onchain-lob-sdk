import { WebSocket, type Event, type MessageEvent, type ErrorEvent, type CloseEvent } from 'ws';
import type { WebSocketClient as WebSocketClientInterface } from './shared';
export type WebSocketOpenEvent = Event;
export type WebSocketCloseEvent = CloseEvent;
export declare class WebSocketClient implements WebSocketClientInterface<WebSocketClient, WebSocketOpenEvent, WebSocketCloseEvent> {
    protected readonly url: string | URL;
    readonly events: WebSocketClientInterface<WebSocketClient, WebSocketOpenEvent, WebSocketCloseEvent>['events'];
    get readyState(): 0 | 2 | 1 | 3;
    protected _socket: WebSocket | undefined;
    protected get socket(): WebSocket;
    constructor(url: string | URL);
    connect(): Promise<void>;
    disconnect(): void;
    send<T>(message: T): void;
    protected onMessageReceived: (event: MessageEvent) => void;
    protected onError: (event: ErrorEvent) => never;
    protected onOpened: (event: WebSocketOpenEvent) => void;
    protected onClosed: (event: WebSocketCloseEvent) => void;
}
