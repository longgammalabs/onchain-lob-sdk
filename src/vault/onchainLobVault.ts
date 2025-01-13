import { Signer } from 'ethers/providers';
import { EventEmitter, type PublicEventEmitter, type ToEventEmitter } from '../common';
import type { VaultInfo, VaultUpdate, VaultValueHistoryUpdate } from '../models';
import { OnchainLobSpotService, OnchainLobSpotWebSocketService } from '../services';
import { MockVault } from './mock';
import { CalculateDepositDetailsSyncParams, CalculateWithdrawDetailsSyncParams, DepositDetails, DepositParams, SubscribeToVaultUpdatesParams, SubscribeToVaultValueHistoryParams, WithdrawDetails, WithdrawParams } from './params';

/**
 * Options for configuring the OnchainLobVault instance.
 *
 * @interface OnchainLobVaultOptions
 */
export interface OnchainLobVaultOptions {
  /**
   * The base URL for the Onchain LOB Vault API.
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
}

/**
 * Events are emitted when data related to subscriptions is updated.
 */
interface OnchainLobVaultEvents {
  /**
   * Emitted when a vault value changes, e.g. any user deposits in the vault or token prices are updated.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultUpdate[]]>}
   */
  vaultUpdated: PublicEventEmitter<readonly [data: VaultUpdate[]]>;

  /**
   * Emitted when a vault history value changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultHistoryUpdate[]]>;
   */
  vaultValueHistoryUpdated: PublicEventEmitter<readonly [data: VaultValueHistoryUpdate[]]>;

  /**
   * Emitted when there is an error related to a subscription.
   * @event
   * @type {PublicEventEmitter<readonly [error: string]>}
   */
  subscriptionError: PublicEventEmitter<readonly [error: string]>;
}

/**
 * The OnchainLobVault is a class for interacting with the Onchain LOB Vault API.
 * It provides methods for managing user deposits and handling subscription events.
 */
export class OnchainLobVault {
  /**
   * The events related to user subscriptions.
   *
   * These events are emitted when data is updated related to subscriptions.
   */
  readonly events: OnchainLobVaultEvents = {
    vaultUpdated: new EventEmitter(),
    vaultValueHistoryUpdated: new EventEmitter(),
    // userVaultHistoryUpdated: new EventEmitter(),
    // depositorsUpdated: new EventEmitter(),
    subscriptionError: new EventEmitter(),
  };

  protected readonly onchainLobVaultService: OnchainLobSpotService;
  protected readonly onchainLobVaultWebSocketService: OnchainLobSpotWebSocketService;
  private mockVault: MockVault;

  constructor(options: Readonly<OnchainLobVaultOptions>) {
    this.onchainLobVaultService = new OnchainLobSpotService(options.apiBaseUrl);
    this.onchainLobVaultWebSocketService = new OnchainLobSpotWebSocketService(options.webSocketApiBaseUrl);
    this.mockVault = new MockVault();
    this.attachEvents();
  }

  setSigner(signer: Signer | null): void {
  }

  /**
   * Subscribes to the vault updates.
   *
   * @emits OnchainLobVault#events#vaultUpdated
   */
  subscribeToVaultUpdates(params: SubscribeToVaultUpdatesParams): void {
    // this.onchainLobVaultWebSocketService.subscribeToVaultUpdates(params);
    this.mockVault.subscribeToVaultUpdates(params);
  }

  /**
   * Unsubscribes from the vault updates.
   */
  unsubscribeFromVaultUpdates(): void {
    // this.onchainLobVaultWebSocketService.unsubscribeFromVaultUpdates();
    this.mockVault.unsubscribeFromVaultUpdates();
  }

  subscribeToVaultValueHistory(params: SubscribeToVaultValueHistoryParams): void {
    this.mockVault.subscribeToVaultValueHistory(params);
  }

  unsubscribeFromVaultValueHistory(): void {
    this.mockVault.unsubscribeFromVaultValueHistory();
  }

  protected attachEvents(): void {
    // this.onchainLobVaultWebSocketService.events.vaultUpdated.addListener(this.onVaultUpdated);
    // this.onchainLobVaultWebSocketService.events.subscriptionError.addListener(this.onSubscriptionError);
    this.mockVault.events.vaultUpdated.addListener(this.onVaultUpdated);
    this.mockVault.events.vaultValueHistoryUpdated.addListener(this.onVaultValueHistoryUpdated);
    this.mockVault.events.subscriptionError.addListener(this.onSubscriptionError);
  }

  protected onVaultUpdated: Parameters<typeof this.mockVault.events.vaultUpdated['addListener']>[0] = data => {
    (this.events.vaultUpdated as ToEventEmitter<typeof this.events.vaultUpdated>).emit(data);
  };

  protected onVaultValueHistoryUpdated: Parameters<typeof this.mockVault.events.vaultValueHistoryUpdated['addListener']>[0] = data => {
    (this.events.vaultValueHistoryUpdated as ToEventEmitter<typeof this.events.vaultValueHistoryUpdated>).emit(data);
  };

  protected onSubscriptionError: Parameters<typeof this.mockVault.events.subscriptionError['addListener']>[0] = error => {
    (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(error);
  };

  calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails {
    return this.mockVault.calculateDepositDetailsSync(params);
  }

  calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails {
    return this.mockVault.calculateWithdrawDetailsSync(params);
  }

  async deposit(params: DepositParams): Promise<void> {
    this.mockVault.deposit(params);
  }

  async withdraw(params: WithdrawParams): Promise<void> {
    this.mockVault.withdraw(params);
  }

  async getVaultInfo(): Promise<VaultInfo> {
    return this.mockVault.vaultInfo();
  }
}
