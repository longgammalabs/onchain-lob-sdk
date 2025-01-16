import { Signer } from 'ethers/providers';
import { type PublicEventEmitter } from '../common';
import type { VaultConfig, VaultValuesUpdate, VaultValueHistoryUpdate } from '../models';
import { OnchainLobSpotService, OnchainLobSpotWebSocketService } from '../services';
import { AddLiquidityVaultParams, CalculateDepositDetailsSyncParams, CalculateWithdrawDetailsSyncParams, DepositDetails, RemoveLiquidityVaultParams, SubscribeToVaultUpdatesParams, SubscribeToVaultValueHistoryParams, WithdrawDetails } from './params';
import { OnchainLobVaultContract } from './onchainLobVaultContract';
import { ContractTransactionResponse } from 'ethers';
/**
 * Options for configuring the OnchainLobVault instance.
 *
 * @interface OnchainLobVaultOptions
 */
export interface OnchainLobVaultOptions {
    /**
     * Whether to automatically wait for transactions to be confirmed.
     *
     * @type {boolean}
     * @optional
     */
    autoWaitTransaction?: boolean;
    /**
     * The ethers signer used for signing transactions.
     * For only http/ws operations, you can set this to null.
     *
     * @type {Signer | null}
     */
    signer: Signer | null;
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
    vaultUpdated: PublicEventEmitter<readonly [data: VaultValuesUpdate[]]>;
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
    /**
     * Indicates whether transactions should be automatically waited for by the client.
     * When true, transactions will be automatically waited for by the client until confirmation is received.
     * When false, transactions will not be waited for by the client.
     * If not set, the default value will be used.
     * This flag is used by the Onchain LOB Vault contract.
     *
     * Note: "Wait" means that the client will wait until the transaction confirmation is received.
     */
    autoWaitTransaction: boolean | undefined;
    protected signer: Signer | null;
    protected readonly onchainLobVaultService: OnchainLobSpotService;
    protected readonly onchainLobVaultWebSocketService: OnchainLobSpotWebSocketService;
    private mockVault;
    private vaultContract;
    constructor(options: Readonly<OnchainLobVaultOptions>);
    /**
     * Sets a new signer for the OnchainLobVault instance.
     *
     * @param {Signer | null} signer - The new signer to be set. For only http/ws operations, you can set this to null.
     * @returns {OnchainLobVault} Returns the OnchainLobVault instance for method chaining.
     */
    setSigner(signer: Signer | null): OnchainLobVault;
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
    /**
     * Calculates the deposit LP details for a given token inputs without API request.
     *
     * @param {CalculateDepositDetailsSyncParams} params - The parameters for the deposit LP details calculation.
     * @returns {DepositDetails} Deposit LP details data.
     */
    calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails;
    /**
     * Calculates the withdraw LP details for a given token inputs without API request.
     *
     * @param {CalculateWithdrawDetailsSyncParams} params - The parameters for the withdraw LP details calculation.
     * @returns {WithdrawDetails} Withdraw LP details data.
     */
    calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails;
    /**
     * Deposit tokens amount into the vault
     *
     * @param {AddLiquidityVaultParams} params - The parameters for deposit.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse>;
    /**
     * Withdraw LP amount from the vault
     *
     * @param {RemoveLiquidityVaultParams} params - The parameters for withdraw.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse>;
    getVaultConfig(): Promise<VaultConfig>;
    protected getVaultContract(): Promise<OnchainLobVaultContract>;
}
export {};
