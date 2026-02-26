import type { VaultTotalValuesUpdateDto, VaultDepositActionUpdateDto, VaultDepositorUpdateDto, VaultHistoryUpdateDto } from './dtos';
import type { SubscribeToVaultTotalValuesParams, SubscribeToVaultDepositActionsParams, SubscribeToVaultDepositorsParams, SubscribeToVaultHistoryParams, UnsubscribeFromVaultTotalValuesParams, UnsubscribeFromVaultDepositActionsParams, UnsubscribeFromVaultDepositorsParams, UnsubscribeFromVaultHistoryParams } from './params';
import { OnchainLobWebSocketClient, type OnchainLobWebSocketResponseDto, type PublicEventEmitter } from '../../common';
interface OnchainLobVaultWebSocketServiceEvents {
    vaultTotalValuesUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultTotalValuesUpdateDto]>;
    vaultDepositActionsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositActionUpdateDto[]]>;
    vaultDepositorsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositorUpdateDto[]]>;
    vaultHistoryUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultHistoryUpdateDto[]]>;
    subscriptionError: PublicEventEmitter<readonly [error: string]>;
}
/**
 * OnchainLobVaultWebSocketService provides methods to interact with the Onchain LOB vault via WebSocket.
 * It allows subscribing and unsubscribing to various vault events.
 */
export declare class OnchainLobVaultWebSocketService implements Disposable {
    readonly baseUrl: string;
    /**
     * Event emitters for various WebSocket events.
     */
    readonly events: OnchainLobVaultWebSocketServiceEvents;
    /**
     * The WebSocket client used to communicate with the Onchain LOB vault.
     */
    protected readonly onchainLobWebSocketClient: OnchainLobWebSocketClient;
    /**
     * Creates an instance of OnchainLobVaultWebSocketService.
     * @param baseUrl - The base URL for the WebSocket connection.
     * @param startImmediately - Whether to start the WebSocket client immediately.
     */
    constructor(baseUrl: string, startImmediately?: boolean);
    /**
     * Subscribes to vault total values updates.
     * @param params - The parameters for the vault total values subscription.
     */
    subscribeToVaultTotalValues(params: SubscribeToVaultTotalValuesParams): void;
    /**
     * Unsubscribes from vault total values updates.
     * @param params - The parameters for the vault total values unsubscription.
     */
    unsubscribeFromVaultTotalValues(params: UnsubscribeFromVaultTotalValuesParams): void;
    /**
     * Subscribes to vault deposit actions updates.
     * @param params - The parameters for the vault deposit actions subscription.
     */
    subscribeToVaultDepositActions(params: SubscribeToVaultDepositActionsParams): void;
    /**
     * Unsubscribes from vault deposit actions updates.
     * @param params - The parameters for the vault deposit actions unsubscription.
     */
    unsubscribeFromVaultDepositActions(params: UnsubscribeFromVaultDepositActionsParams): void;
    /**
     * Subscribes to vault depositors updates.
     * @param params - The parameters for the vault depositors subscription.
     */
    subscribeToVaultDepositors(params: SubscribeToVaultDepositorsParams): void;
    /**
     * Unsubscribes from vault depositors updates.
     * @param params - The parameters for the vault depositors unsubscription.
     */
    unsubscribeFromVaultDepositors(params: UnsubscribeFromVaultDepositorsParams): void;
    /**
     * Subscribes to vault history updates.
     * @param params - The parameters for the vault history subscription.
     */
    subscribeToVaultHistory(params: SubscribeToVaultHistoryParams): void;
    /**
     * Unsubscribes from vault history updates.
     * @param params - The parameters for the vault history unsubscription.
     */
    unsubscribeFromVaultHistory(params: UnsubscribeFromVaultHistoryParams): void;
    /**
     * Disposes the WebSocket client and removes the message listener.
     */
    [Symbol.dispose](): void;
    /**
     * Starts the WebSocket client if it is not already started.
     */
    protected startOnchainLobWebSocketClientIfNeeded(): void;
    /**
     * Handles incoming WebSocket messages and emits the appropriate events.
     * @param message - The WebSocket message received.
     */
    protected readonly onSocketMessageReceived: (message: OnchainLobWebSocketResponseDto) => void;
}
export {};
