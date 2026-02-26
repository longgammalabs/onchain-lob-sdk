import { OnchainLobError } from '../common';
export type RemoteServiceResponseFormat = 'none' | 'json' | 'text';
export declare class RemoteServiceResponseError extends OnchainLobError {
    constructor(status: Response['status'], content: string);
    protected static getMessage(status: Response['status'], content: string): string;
}
export declare abstract class RemoteService {
    readonly baseUrl: string;
    constructor(baseUrl: string);
    protected getUrl(uri: string): URL;
    protected getRequestInit(requestInit?: RequestInit): Promise<RequestInit>;
    protected fetch<T>(uriOrUrl: string | URL, responseFormat: T extends void ? 'none' : Exclude<RemoteServiceResponseFormat, 'none'>, requestInit?: RequestInit, useDefaultRequestInitFields?: boolean): Promise<T>;
    protected ensureResponseOk(response: Response): Promise<void>;
}
