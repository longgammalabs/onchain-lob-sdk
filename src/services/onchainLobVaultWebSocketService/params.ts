import { VaultHistoryPeriod } from '../../models';

export interface SubscribeToVaultTotalValuesParams {}
export type UnsubscribeFromVaultTotalValuesParams = SubscribeToVaultTotalValuesParams;

export interface SubscribeToVaultDepositorsParams {}
export type UnsubscribeFromVaultDepositorsParams = SubscribeToVaultDepositorsParams;

export interface SubscribeToVaultDepositActionsParams {}
export type UnsubscribeFromVaultDepositActionsParams = SubscribeToVaultDepositActionsParams;

export interface SubscribeToVaultHistoryParams {
  period: VaultHistoryPeriod;
}
export type UnsubscribeFromVaultHistoryParams = SubscribeToVaultHistoryParams;
