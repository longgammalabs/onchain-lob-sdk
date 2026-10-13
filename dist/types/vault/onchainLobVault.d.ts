import { Signer } from 'ethers/providers';
import { type PublicEventEmitter } from '../common';
import type { VaultConfig, VaultTotalValuesUpdate, VaultHistoryUpdate, VaultDepositActionUpdate, VaultDepositorUpdate, VaultTotalValues, VaultDepositAction, VaultDepositor, VaultHistory, VaultListItem } from '../models';
import { OnchainLobVaultService, OnchainLobVaultWebSocketService } from '../services';
import { AddLiquidityVaultParams, ApproveVaultParams, CalculateDepositDetailsSyncParams, CalculateWithdrawDetailsSyncParams, DepositDetails, GetVaultConfigParams, GetVaultConfigsParams, GetVaultDepositActionsParams, GetVaultDepositorsParams, GetVaultHistoryParams, GetVaultsListParams, GetVaultTotalValuesParams, RemoveLiquidityVaultParams, SubscribeToVaultDepositActionsParams, SubscribeToVaultDepositorsParams, SubscribeToVaultHistoryParams, SubscribeToVaultTotalValuesParams, UnsubscribeFromVaultDepositActionsParams, UnsubscribeFromVaultDepositorsParams, UnsubscribeFromVaultHistoryParams, UnsubscribeFromVaultTotalValuesParams, UnwrapNativeTokenVaultParams, WithdrawDetails, WrapNativeTokenVaultParams } from './params';
import type { PreviewAddLiquidityPairParams, PreviewAddLiquidityPairResult, PreviewRemoveLiquidityPairParams, PreviewRemoveLiquidityPairResult, GetPairReservesParams, PairReserves, GetPairConfigParams, PairConfig, AddLiquidityPairParams, RemoveLiquidityPairParams } from './params';
import { OnchainLobVaultContract } from './onchainLobVaultContract';
import { ContractTransactionResponse } from 'ethers';
import * as mappers from './mappers';
/**
 * Options for configuring the OnchainLobVault instance.
 *
 * @interface OnchainLobVaultOptions
 */
export interface OnchainLobVaultOptions {
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
    /**
     * Whether to connect to the WebSocket immediately after creating the OnchainLobVault (true)
     * or when the first subscription is called (false).
     * By default, the WebSocket is connected immediately.
     *
     * @type {boolean}
     * @optional
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
     * Whether to use a fast algorithm for waiting for transaction to be confirmed.
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
}
/**
 * Events are emitted when data related to subscriptions is updated.
 */
interface OnchainLobVaultEvents {
    /**
     * Emitted when a vault total values changes, e.g. any user deposits in the vault or token prices are updated.
     * @event
     * @type {PublicEventEmitter<readonly [data: VaultTotalValuesUpdate]>}
     */
    vaultTotalValuesUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultTotalValuesUpdate]>;
    /**
     * Emitted when a vault history changes.
     * @event
     * @type {PublicEventEmitter<readonly [data: VaultHistoryUpdate[]]>};
     */
    vaultHistoryUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultHistoryUpdate[]]>;
    /**
     * Emitted when a vault deposit actions changes.
     * @event
     * @type {PublicEventEmitter<readonly [data: VaultDepositActionUpdate[]]>;}
     */
    vaultDepositActionsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositActionUpdate[]]>;
    /**
     * Emitted when a vault depositors changes.
     * @event
     * @type {PublicEventEmitter<readonly [data: VaultDepositorUpdate[]]>;}
     */
    vaultDepositorsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositorUpdate[]]>;
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
export declare class OnchainLobVault implements Disposable {
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
    fastWaitTransaction: boolean | undefined;
    fastWaitTransactionInterval: number | undefined;
    fastWaitTransactionTimeout: number | undefined;
    protected readonly pythApiKey: string | undefined;
    protected readonly pythHermesUrl: string | undefined;
    protected signer: Signer | null;
    protected readonly onchainLobService: OnchainLobVaultService;
    protected readonly onchainLobWebSocketService: OnchainLobVaultWebSocketService;
    private vaultContracts;
    protected readonly mappers: typeof mappers;
    protected readonly cachedVaultConfigs: Map<string, VaultConfig>;
    private cachedVaultConfigsPromise;
    constructor(options: Readonly<OnchainLobVaultOptions>);
    /**
     * Sets a new signer for the OnchainLobVault instance.
     *
     * @param {Signer | null} signer - The new signer to be set. For only http/ws operations, you can set this to null.
     * @returns {OnchainLobVault} Returns the OnchainLobVault instance for method chaining.
     */
    setSigner(signer: Signer | null): OnchainLobVault;
    /**
    * Approves the specified amount of tokens for the corresponding vault contract.
    * You need to approve the tokens before you can deposit or withdraw.
    *
    * @param {ApproveVaultParams} params - The parameters for approving tokens.
    * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
    */
    approveTokens(params: ApproveVaultParams): Promise<ContractTransactionResponse>;
    /**
     * Deposit tokens amount into the vault
     *
     * @param {AddLiquidityVaultParams} params - The parameters for deposit.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse>;
    /**
    * Wraps the specified amount of native tokens.
    * You need to wrap the tokens before you can deposit.
    *
    * @param {WrapNativeTokenVaultParams} params - The parameters for wrapping tokens.
    * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
    */
    wrapNativeTokens(params: WrapNativeTokenVaultParams): Promise<ContractTransactionResponse>;
    /**
      * Unwraps the specified amount of native tokens.
      * You need to unwrap the tokens after withdrawal to get native tokens.
      *
      * @param {UnwrapNativeTokenVaultParams} params - The parameters for unwrapping tokens.
      * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
      */
    unwrapNativeTokens(params: UnwrapNativeTokenVaultParams): Promise<ContractTransactionResponse>;
    /**
     * Withdraw LP amount from the vault
     *
     * @param {RemoveLiquidityVaultParams} params - The parameters for withdraw.
     * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
     */
    removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse>;
    /**
     * Preview the result of adding liquidity to a pair vault (read-only, no signer required).
     *
     * @param {PreviewAddLiquidityPairParams} params - vault address, provider, anchor tokenId, and raw amount.
     * @returns {Promise<PreviewAddLiquidityPairResult>} Projected token amounts and minted LP.
     */
    previewAddLiquidityPair(params: PreviewAddLiquidityPairParams): Promise<PreviewAddLiquidityPairResult>;
    /**
     * Preview the result of removing liquidity from a pair vault (read-only, no signer required).
     *
     * @param {PreviewRemoveLiquidityPairParams} params - vault address, provider, and LP amount to burn.
     * @returns {Promise<PreviewRemoveLiquidityPairResult>} Projected token amounts returned.
     */
    previewRemoveLiquidityPair(params: PreviewRemoveLiquidityPairParams): Promise<PreviewRemoveLiquidityPairResult>;
    /**
     * Get the current token reserves of a pair vault (read-only, no signer required).
     *
     * @param {GetPairReservesParams} params - vault address and provider.
     * @returns {Promise<PairReserves>} Total tokenX and tokenY held by the vault.
     */
    getPairReserves(params: GetPairReservesParams): Promise<PairReserves>;
    /**
     * Get the configuration of a pair vault (read-only, no signer required).
     *
     * @param {GetPairConfigParams} params - vault address and provider.
     * @returns {Promise<PairConfig>} Fee, liquidity, and native-token configuration.
     */
    getPairConfig(params: GetPairConfigParams): Promise<PairConfig>;
    /**
     * Add liquidity to a pair vault.
     *
     * @param {AddLiquidityPairParams} params - vault address, anchor tokenId, amount, and minLpMinted slippage guard.
     * @returns {Promise<ContractTransactionResponse>} Transaction response.
     */
    addLiquidityPair(params: AddLiquidityPairParams): Promise<ContractTransactionResponse>;
    /**
     * Remove liquidity from a pair vault.
     *
     * @param {RemoveLiquidityPairParams} params - vault address, LP amount to burn, and min token slippage guards.
     * @returns {Promise<ContractTransactionResponse>} Transaction response.
     */
    removeLiquidityPair(params: RemoveLiquidityPairParams): Promise<ContractTransactionResponse>;
    /**
     * Retrieves the vault configs information from cache.
     *
     * @returns {Promise<Map<string, VaultConfig> | undefined>} A Promise that resolves to the vault configs information or undefined if error when requesting vault configs.
     */
    getCachedVaultConfigs(): Promise<Map<string, VaultConfig> | undefined>;
    /**
     * Retrieves the vault config for the specified vault.
     *
     * @param {GetVaultConfigParams} params - The parameters for retrieving the vault config.
     * @returns {Promise<VaultConfig | undefined>} A Promise that resolves to vault config or undefined if vault is not found.
     */
    getVaultConfig(params: GetVaultConfigParams): Promise<VaultConfig | undefined>;
    /**
     * Retrieves the vaults configs.
     *
     * @param {GetVaultConfigsParams} params - The parameters for retrieving the vault config.
     * @returns {Promise<VaultConfig[]>} A Promise that resolves to vault config.
     */
    getVaultConfigs(params: GetVaultConfigsParams): Promise<VaultConfig[]>;
    /**
     * Retrieves the vaults list.
     *
     * @param {GetVaultsListParams} params - The parameters for retrieving the vault config.
     * @returns {Promise<VaultConfig[]>} A Promise that resolves to vault config.
     */
    getVaultsList(params: GetVaultsListParams): Promise<VaultListItem[]>;
    /**
     * Retrieves the vault total values.
     *
     * @param {GetVaultTotalValuesParams} params - The parameters for retrieving the vault total values.
     * @returns {Promise<VaultTotalValues | undefined>} A Promise that resolves to vault total values.
     */
    getVaultTotalValues(params: GetVaultTotalValuesParams): Promise<VaultTotalValues | undefined>;
    /**
     * Retrieves the vault deposit actions.
     *
     * @param {GetVaultDepositActionsParams} params - The parameters for retrieving the vault deposit actions.
     * @returns {Promise<VaultDepositAction[]>} A Promise that resolves to vault deposit actions.
     */
    getVaultDepositActions(params: GetVaultDepositActionsParams): Promise<VaultDepositAction[]>;
    /**
     * Retrieves the vault depositors.
     *
     * @param {GetVaultDepositorsParams} params - The parameters for retrieving the vault depositors.
     * @returns {Promise<VaultDepositor[]>} A Promise that resolves to vault depositors.
     */
    getVaultDepositors(params: GetVaultDepositorsParams): Promise<VaultDepositor[]>;
    /**
     * Retrieves the vault history.
     *
     * @param {GetVaultHistoryParams} params - The parameters for retrieving the vault history.
     * @returns {Promise<VaultDepositor[]>} A Promise that resolves to vault history.
     */
    getVaultHistory(params: GetVaultHistoryParams): Promise<VaultHistory[]>;
    /**
     * Calculates the deposit LP details for a given token inputs without API request.
     *
     * @param {CalculateDepositDetailsSyncParams} params - The parameters for the deposit LP details calculation.
     * @returns {DepositDetails} Deposit LP details data.
     * @deprecated This method is not ready for use yet and may produce incorrect results.
     * @todo Implement proper calculation logic for withdraw details.
     */
    calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails;
    /**
     * Calculates the withdraw LP details for a given token inputs without API request.
     *
     * @param {CalculateWithdrawDetailsSyncParams} params - The parameters for the withdraw LP details calculation.
     * @returns {WithdrawDetails} Withdraw LP details data.
     * @deprecated This method is not ready for use yet and may produce incorrect results.
     * @todo Implement proper calculation logic for withdraw details.
     */
    calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails;
    /**
     * Whether the vault WebSocket connection is currently open.
     */
    get isConnected(): boolean;
    /**
     * Forces an immediate reconnect of the vault WebSocket, preserving all active
     * subscriptions. Use when the socket may have been dropped while the page was
     * hidden/frozen and you want data to resume without waiting out the background
     * reconnect backoff.
     */
    reconnect(): void;
    /**
     * Detaches event listeners and stops the WebSocket connection. Call this when
     * the client is being discarded (e.g. on chain switch) so its socket and
     * subscriptions don't linger and keep emitting.
     */
    [Symbol.dispose](): void;
    /**
     * Subscribes to the vault total values updates.
     *
     * @emits OnchainLobVault#events#vaultTotalValuesUpdated
     */
    subscribeToVaultTotalValues(params: SubscribeToVaultTotalValuesParams): void;
    /**
     * Unsubscribes from the vault total values updates.
     */
    unsubscribeFromVaultTotalValues(params: UnsubscribeFromVaultTotalValuesParams): void;
    /**
     * Subscribes to the vault deposit actions updates.
     *
     * @emits OnchainLobVault#events#vaultDepositActionsUpdated
     */
    subscribeToVaultDepositActions(params: SubscribeToVaultDepositActionsParams): void;
    /**
     * Unsubscribes from the vault deposit actions updates.
     */
    unsubscribeFromVaultDepositActions(params: UnsubscribeFromVaultDepositActionsParams): void;
    /**
     * Subscribes to the vault depositors updates.
     *
     * @emits OnchainLobVault#events#vaultDepositorsUpdated
     */
    subscribeToVaultDepositors(params: SubscribeToVaultDepositorsParams): void;
    /**
     * Unsubscribes from the vault depositors updates.
     */
    unsubscribeFromVaultDepositors(params: UnsubscribeFromVaultDepositorsParams): void;
    /**
     * Subscribes to the vault history updates.
     *
     * @param {SubscribeToVaultHistoryParams} params - The parameters for subscribing to the vault history updates.
     * @emits OnchainLobVault#events#vaultHistoryUpdated
     */
    subscribeToVaultHistory(params: SubscribeToVaultHistoryParams): void;
    /**
     * Unsubscribes from the vault history updates.
     *
     * @param {UnsubscribeFromVaultHistoryParams} params - The parameters for unsubscribing from the vault history updates.
     */
    unsubscribeFromVaultHistory(params: UnsubscribeFromVaultHistoryParams): void;
    protected ensureVaultConfig(params: {
        vault: string;
    }): Promise<VaultConfig>;
    protected getVaultContract(params: {
        vault: string;
    }): Promise<OnchainLobVaultContract>;
    protected attachEvents(): void;
    protected detachEvents(): void;
    protected onVaultTotalValuesUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultTotalValuesUpdated['addListener']>[0];
    protected onVaultDepositActionsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultDepositActionsUpdated['addListener']>[0];
    protected onVaultDepositorsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultDepositorsUpdated['addListener']>[0];
    protected onVaultHistoryUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultHistoryUpdated['addListener']>[0];
    protected onSubscriptionError: Parameters<typeof this.onchainLobWebSocketService.events.subscriptionError['addListener']>[0];
}
export {};
