import type { WebSocketClient as WebSocketClientInterface } from './shared';
export type WebSocketOpenEvent = WebSocketEventMap['open'];
export type WebSocketCloseEvent = WebSocketEventMap['close'];
export declare class WebSocketClient implements WebSocketClientInterface<WebSocketClient, WebSocketOpenEvent, WebSocketCloseEvent> {
    protected readonly url: string | URL;
    readonly events: WebSocketClientInterface<WebSocketClient, WebSocketOpenEvent, WebSocketCloseEvent>['events'];
    get readyState(): number;
    protected _socket: WebSocket | undefined;
    protected get socket(): WebSocket;
    constructor(url: string | URL);
    connect(): Promise<void>;
    disconnect(): void;
    send<T>(message: T): void;
    protected onMessageReceived: (event: MessageEvent<string>) => void;
    protected onError: (event: Event) => never;
    protected onOpened: (event: WebSocketOpenEvent) => void;
    protected onClosed: (event: WebSocketCloseEvent) => void;
}
