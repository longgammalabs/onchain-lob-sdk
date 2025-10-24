import { VaultHistoryPeriod } from '../../models';
export interface GetVaultsListParams {
    address?: string;
}
export interface GetVaultConfigParams {
    vault?: string;
}
export interface GetVaultTotalValuesParams {
    vault?: string;
}
export interface GetVaultDepositActionsParams {
    vault: string;
    user?: string;
    limit?: number;
}
export interface GetVaultDepositorsParams {
    vault: string;
    address?: string;
    limit?: number;
}
export interface GetVaultHistoryParams {
    vault: string;
    period: VaultHistoryPeriod;
}
