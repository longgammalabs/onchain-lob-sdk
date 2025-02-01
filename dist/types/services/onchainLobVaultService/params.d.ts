import { VaultHistoryPeriod } from '../../models';
export interface GetVaultConfigParams {
}
export interface GetVaultTotalValuesParams {
}
export interface GetVaultDepositActionsParams {
    limit?: number;
}
export interface GetVaultDepositorsParams {
    limit?: number;
}
export interface GetVaultHistoryParams {
    period: VaultHistoryPeriod;
}
