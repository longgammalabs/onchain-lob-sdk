import BigNumber from 'bignumber.js';
import { VaultValueHistoryResolution } from '../models';

export type SubscribeToVaultUpdatesParams = {
  user?: string;
};

export type SubscribeToVaultValueHistoryParams = {
  resolution?: VaultValueHistoryResolution;
};

export type CalculateDepositDetailsSyncParams = {
  isLpTokenInput: boolean;
  tokenPriceUSD: BigNumber;
  totalSupply: BigNumber;
  totalValue: BigNumber;
  tokenValue: BigNumber;
  targetTokenWeight: BigNumber;
  totalWeight: BigNumber;
  fee: {
    dynamicFeesEnabled: boolean;
    adminMintLPFeeBps: BigNumber;
    adminBurnLPFeeBps: BigNumber;
    feeBps: BigNumber;
    taxBps: BigNumber;
  };
  inputs: {
    tokenInput: string;
    lpInput: string;
  };
};

export type DepositDetails = {
  tokenSpend: BigNumber;
  minLpReceive: BigNumber;
  fee: BigNumber;
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
