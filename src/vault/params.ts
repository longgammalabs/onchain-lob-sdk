import BigNumber from 'bignumber.js';
import { VaultValueHistoryResolution } from '../models';

export type SubscribeToVaultUpdatesParams = {
  user?: string;
};

export type SubscribeToVaultValueHistoryParams = {
  resolution?: VaultValueHistoryResolution;
};

export type CalculateDepositDetailsSyncParams = {
  tokenSymbol: string;
  amount: BigNumber | bigint;
};

export type DepositDetails = {
  estTokenReceive: BigNumber | bigint;
  estFee: BigNumber | bigint;
};

export type CalculateWithdrawDetailsSyncParams = {
  tokenSymbol: string;
  amount: BigNumber | bigint;
};

export type WithdrawDetails = {
  estTokenReceive: BigNumber | bigint;
  estFee: BigNumber | bigint;
};

export type DepositParams = {
  tokenSymbol: string;
  amount: BigNumber | bigint;
};

export type WithdrawParams = {
  tokenSymbol: string;
  amount: BigNumber | bigint;
};
