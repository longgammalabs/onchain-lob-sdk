import type { Signer } from 'ethers/providers';

import { OnchainLobPerps, type PerpsMockOptions } from './perps';
import { OnchainLobSpot } from './spot';
import { OnchainLobVault } from './vault';

/**
 * The options for the OnchainLobClient.
 *
 * @interface OnchainLobClientOptions
 */
export interface OnchainLobClientOptions {
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
   * Whether to connect to the WebSocket immediately after creating the OnchainLobClient (true)
   * or when will be called the first subscription (false).
   * By default, the WebSocket is connected immediately.
   *
   * @type {boolean}
   */
  webSocketConnectImmediately?: boolean;

  /**
   * Whether to automatically wait for transactions to be confirmed.
   *
   * @type {boolean}
   * @optional
   */
  autoWaitTransaction?: boolean;

  /**
   * Whether to use a fast algorithm for waiting for transactions to be confirmed.
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

  /**
   * API key for the Pyth Hermes price service, used when fetching price update data for
   * vault deposits/withdrawals.
   *
   * @type {string}
   * @optional
   */
  pythApiKey?: string;

  /**
   * Base URL of the Pyth Hermes price service. Defaults to `https://hermes.pyth.network`.
   *
   * @type {string}
   * @optional
   */
  pythHermesUrl?: string;

  /**
   * Options of the perps module (`client.perps`).
   *
   * @type {OnchainLobClientPerpsOptions}
   * @optional
   */
  perps?: OnchainLobClientPerpsOptions;
}

/**
 * The options of the perps module of the OnchainLobClient.
 *
 * @interface OnchainLobClientPerpsOptions
 */
export interface OnchainLobClientPerpsOptions {
  /**
   * Where the perps data comes from: the Onchain LOB API (`'api'`, default) or fixtures (`'mock'`).
   * The mock lets the frontend develop before the backend is live: no network is used for the REST and
   * WebSocket data. Transactions still go to the chain through the signer.
   *
   * @default 'api'
   */
  dataSource?: 'api' | 'mock';

  /**
   * Options of the mock data source (`dataSource: 'mock'`).
   */
  mock?: PerpsMockOptions;

  /**
   * Whether to connect the perps WebSocket immediately. Unlike spot and vault, the perps WebSocket is connected
   * on the first subscription by default, so that a client that does not use perps does not open one more socket.
   *
   * @default false
   */
  webSocketConnectImmediately?: boolean;
}

/**
 * The client for interacting with the exchange.
 *
 * @class OnchainLobClient
 */
export class OnchainLobClient implements Disposable {
  /**
   * The OnchainLobSpot instance that provides the API functions to interact with the Onchain LOB Spot contracts.
   *
   * @type {OnchainLobSpot}
   * @readonly
   */
  readonly spot: OnchainLobSpot;

  /**
   * The OnchainLobVault instance that provides the API functions to interact with the Onchain LOB Vault contract.
   *
   * @type {OnchainLobVault}
   * @readonly
   */
  readonly vault: OnchainLobVault;

  /**
   * The OnchainLobPerps instance that provides the API functions to interact with the Onchain LOB perpetual markets.
   *
   * @type {OnchainLobPerps}
   * @readonly
   */
  readonly perps: OnchainLobPerps;

  /**
   * Creates a new OnchainLobClient instance.
   *
   * @param {OnchainLobClientOptions} options - The options for the OnchainLobClient.
   */
  constructor(options: Readonly<OnchainLobClientOptions>) {
    this.spot = new OnchainLobSpot(options);
    this.vault = new OnchainLobVault(options);
    this.perps = new OnchainLobPerps({
      apiBaseUrl: options.apiBaseUrl,
      webSocketApiBaseUrl: options.webSocketApiBaseUrl,
      signer: options.signer,
      autoWaitTransaction: options.autoWaitTransaction,
      fastWaitTransaction: options.fastWaitTransaction,
      fastWaitTransactionInterval: options.fastWaitTransactionInterval,
      fastWaitTransactionTimeout: options.fastWaitTransactionTimeout,
      dataSource: options.perps?.dataSource,
      mock: options.perps?.mock,
      webSocketConnectImmediately: options.perps?.webSocketConnectImmediately ?? false,
    });
  }

  /**
   * Sets the signer for the OnchainLobClient.
   *
   * @param {Signer | null} signer - The signer to set. For only http/ws operations, you can set this to null.
   */
  setSigner(signer: Signer | null): void {
    this.spot.setSigner(signer);
    this.vault.setSigner(signer);
    this.perps.setSigner(signer);
  }

  /**
   * Forces an immediate reconnect of the spot, vault and perps WebSockets,
   * preserving all active subscriptions.
   */
  reconnect(): void {
    this.spot.reconnect();
    this.vault.reconnect();
    this.perps.reconnect();
  }

  /**
   * Disposes the client: detaches event listeners and stops the spot, vault and
   * perps WebSocket connections. Call this when the client is being replaced
   * (e.g. on chain switch) so the old sockets and their subscriptions don't
   * linger open and keep emitting updates into a discarded client.
   */
  dispose(): void {
    this.spot[Symbol.dispose]();
    this.vault[Symbol.dispose]();
    this.perps[Symbol.dispose]();
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}
