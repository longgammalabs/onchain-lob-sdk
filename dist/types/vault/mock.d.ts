import { VaultInfo } from '../models';
import { EventEmitter } from '../common';
import { CalculateDepositDetailsSyncParams, CalculateWithdrawDetailsSyncParams, DepositDetails, DepositParams, SubscribeToVaultUpdatesParams, SubscribeToVaultValueHistoryParams, WithdrawDetails, WithdrawParams } from './params';
export declare class MockVault {
    subscribeParams: SubscribeToVaultUpdatesParams | undefined;
    constructor();
    private emitRandomVault;
    private emitRandomHistory;
    private emitHistory;
    events: {
        vaultUpdated: EventEmitter<[data: import("../models").Vault[]]>;
        vaultValueHistoryUpdated: EventEmitter<[data: import("../models").VaultValueHistory[]]>;
        subscriptionError: EventEmitter<[error: string]>;
    };
    subscribeToVaultUpdates(params: SubscribeToVaultUpdatesParams): void;
    unsubscribeFromVaultUpdates(): void;
    subscribeToVaultValueHistory(_params: SubscribeToVaultValueHistoryParams): void;
    unsubscribeFromVaultValueHistory(): void;
    calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails;
    calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails;
    deposit(params: DepositParams): void;
    withdraw(params: WithdrawParams): void;
    vaultInfo(): Promise<VaultInfo>;
}
