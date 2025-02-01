import type { DepositActionDirection } from '../../models';

export interface VaultDepositActionUpdateDto {
  userAddress: string;
  timestamp: number;
  txnHash: string;
  direction: DepositActionDirection;
  tokenSymbol: string;
  tokenAmount: string;
  usdValue: number;
  lpAmount: string;
  commissionUsd: number;
}

export interface VaultDepositorUpdateDto {
  userAddress: string;
  lpAmount: string;
  lastTouched: number;
}

export interface VaultHistoryUpdateDto {
  pnl: number;
  totalUSDValue: number;
  time: number;
}

export interface VaultTotalValuesUpdateDto {
  totalUSDValue: number;
  totalUSDCostBasis: number;
  pastWeekReturn: number;
  leaderAddress: string;
  leaderUSDValue: number;
  vaultPerfomance: {
    pnlPerfomance: number;
    maxDrowdownPercentage: number;
    volume: number;
    profitShare: number;
  };
  totalSupply: string;
  totalWeight: number;
  tokens: {
    address: string;
    symbol: string;
    tokenPriceUSD: number;
    tokenBalance: string;
    tokenReserved: string;
    tokenWeight: number;
  }[];
}
