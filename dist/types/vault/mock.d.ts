import { VaultConfig } from '../models';
import { EventEmitter } from '../common';
import { SubscribeToVaultUpdatesParams, SubscribeToVaultValueHistoryParams } from './params';
export declare class MockVault {
    subscribeParams: SubscribeToVaultUpdatesParams | undefined;
    constructor();
    private emitRandomVault;
    private emitRandomHistory;
    private emitHistory;
    events: {
        vaultUpdated: EventEmitter<[data: VaultValuesUpdate[]]>;
        vaultValueHistoryUpdated: EventEmitter<[data: VaultValueHistoryUpdate[]]>;
        subscriptionError: EventEmitter<[error: string]>;
    };
    subscribeToVaultUpdates(params: SubscribeToVaultUpdatesParams): void;
    unsubscribeFromVaultUpdates(): void;
    subscribeToVaultValueHistory(_params: SubscribeToVaultValueHistoryParams): void;
    unsubscribeFromVaultValueHistory(): void;
    vaultInfo(): Promise<VaultConfig>;
}
