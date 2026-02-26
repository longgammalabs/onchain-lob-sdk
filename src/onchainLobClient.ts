import type { Signer } from 'ethers/providers';
import type { TransactionLike } from 'ethers';

import { OnchainLobSpot } from './spot';
import { OnchainLobVault } from './vault';

/**
 * A custom function for signing transactions.
 * Receives a populated transaction and must return the signed raw transaction as a hex string.
 * Use this when the signer does not support signTransaction() natively
 * (e.g. Privy embedded wallets via useSignTransaction hook).
 */
export type CustomSignTransaction = (tx: TransactionLike) => Promise<string>;

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
   * Whether to use eth_sendRawTransactionSync for sending transactions.
   * This sends transactions synchronously and returns the receipt immediately (~50ms),
   * instead of waiting for block inclusion (~500ms+).
   *
   * Requires a signer that supports signTransaction() (e.g. ethers.Wallet).
   * For browser wallets (MetaMask, etc.) that don't support signTransaction,
   * the SDK will silently fall back to the standard transaction flow.
   *
   * @type {boolean}
   * @optional
   */
  syncSendRawTransaction?: boolean;

  /**
   * A custom function for signing transactions.
   * Use this when the signer does not support signTransaction() natively
   * (e.g. Privy embedded wallets via useSignTransaction hook).
   * The function receives a populated transaction and must return the signed raw transaction as a hex string.
   *
   * @type {CustomSignTransaction}
   * @optional
   */
  customSignTransaction?: CustomSignTransaction;
}

/**
 * The client for interacting with the exchange.
 *
 * @class OnchainLobClient
 */
export class OnchainLobClient {
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
   * Creates a new OnchainLobClient instance.
   *
   * @param {OnchainLobClientOptions} options - The options for the OnchainLobClient.
   */
  constructor(options: Readonly<OnchainLobClientOptions>) {
    this.spot = new OnchainLobSpot(options);
    this.vault = new OnchainLobVault(options);
  }

  /**
   * Sets the signer for the OnchainLobClient.
   *
   * @param {Signer | null} signer - The signer to set. For only http/ws operations, you can set this to null.
   * @param {object} [options] - Optional settings.
   * @param {CustomSignTransaction} [options.customSignTransaction] - A custom function for signing transactions.
   */
  setSigner(signer: Signer | null, options?: { customSignTransaction?: CustomSignTransaction }): void {
    this.spot.setSigner(signer, options);
    this.vault.setSigner(signer, options);
  }
}
