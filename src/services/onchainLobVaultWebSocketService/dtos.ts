import type { DepositActionDirection } from '../../models';

export interface VaultDepositActionUpdateDto {
  vaultAddress: string;
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
  vaultAddress: string;
  userAddress: string;
  lpAmount: string;
  usdCostBasis: number;
  lastTouched: number;
}

export interface VaultHistoryUpdateDto {
  vaultAddress: string;
  pnl: number;
  totalUSDValue: number;
  pnlMainToken: number;
  lpPriceMainToken: number;
  totalMainTokenValue: number;
  lpPrice: number;
  time: number;
}

export interface VaultTotalValuesUpdateDto {
  vaultAddress: string;
  totalUSDValue: number;
  totalUSDCostBasis: number;
  totalMainTokenValue: number;
  totalMainTokenCostBasis: number;
  lpPrice: number;
  leaderAddress: string;
  leaderUSDValue: number;
  vaultPerformance: {
    pnlPerformance: number;
    mainTokenPnlPerformance: number;
    maxDrowdownPercentage: number;
    volume: number;
    profitShare: number;
    pastWeekReturn: number;
    pastWeekApr: number;
    pastWeekApy: number;
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
