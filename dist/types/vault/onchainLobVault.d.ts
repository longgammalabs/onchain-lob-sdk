import { Signer } from 'ethers/providers';
import { type PublicEventEmitter } from '../common';
import type { VaultInfo, VaultUpdate, VaultValueHistoryUpdate } from '../models';
import { OnchainLobSpotService, OnchainLobSpotWebSocketService } from '../services';
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
export declare class OnchainLobVault {
    /**
     * The events related to user subscriptions.
     *
     * These events are emitted when data is updated related to subscriptions.
     */
    readonly events: OnchainLobVaultEvents;
    protected readonly onchainLobVaultService: OnchainLobSpotService;
    protected readonly onchainLobVaultWebSocketService: OnchainLobSpotWebSocketService;
    private mockVault;
    constructor(options: Readonly<OnchainLobVaultOptions>);
    setSigner(signer: Signer | null): void;
    /**
     * Subscribes to the vault updates.
     *
     * @emits OnchainLobVault#events#vaultUpdated
     */
    subscribeToVaultUpdates(params: SubscribeToVaultUpdatesParams): void;
    /**
     * Unsubscribes from the vault updates.
     */
    unsubscribeFromVaultUpdates(): void;
    subscribeToVaultValueHistory(params: SubscribeToVaultValueHistoryParams): void;
    unsubscribeFromVaultValueHistory(): void;
    protected attachEvents(): void;
    protected onVaultUpdated: Parameters<typeof this.mockVault.events.vaultUpdated['addListener']>[0];
    protected onVaultValueHistoryUpdated: Parameters<typeof this.mockVault.events.vaultValueHistoryUpdated['addListener']>[0];
    protected onSubscriptionError: Parameters<typeof this.mockVault.events.subscriptionError['addListener']>[0];
    calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails;
    calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails;
    deposit(params: DepositParams): Promise<void>;
    withdraw(params: WithdrawParams): Promise<void>;
    getVaultInfo(): Promise<VaultInfo>;
}
export {};
