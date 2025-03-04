export interface SubscribeToVaultTotalValuesParams {
  vault: string;
}
export type UnsubscribeFromVaultTotalValuesParams = SubscribeToVaultTotalValuesParams;

export interface SubscribeToVaultDepositorsParams {
  vault: string;
}
export type UnsubscribeFromVaultDepositorsParams = SubscribeToVaultDepositorsParams;

export interface SubscribeToVaultDepositActionsParams {
  vault: string;
}
export type UnsubscribeFromVaultDepositActionsParams = SubscribeToVaultDepositActionsParams;

export interface SubscribeToVaultHistoryParams {
  vault: string;
}
export type UnsubscribeFromVaultHistoryParams = SubscribeToVaultHistoryParams;
