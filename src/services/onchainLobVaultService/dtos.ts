import type { DepositActionDirection } from '../../models';
import { TokenDto } from '../onchainLobSpotService';

export interface VaultListItemDto {
  vaultName: string;
  vaultAddress: string;
  makerAddress: string;
  lpTokenAddress: string;
  lpTokenSymbol: string;
  apr: number;
  apy: number;
  tvl: number;
  pnl: number;
  depositorsCount: number;
  userDepositUsd: number;
  creationTimestamp: number;
  isUserGenerated: boolean;
  isDeprecated: boolean;
}

export interface VaultConfigDto {
  vaultAddress: string;
  vaultName: string;
  pythAddress: string;
  marketCap: string;
  isMainTokenVault: boolean;
  mainTokenAddress: string | null;
  isDeprecated: boolean;
  tokensAllowedToDeposit: string[] | null;
  creationTimestamp: number;
  isUserGenerated: boolean;
  lpToken: TokenDto;
  tokens: TokenDto[];
  tokenIds: { tokenAddress: string; id: number }[];
  fees: {
    dynamicFeesEnabled: boolean;
    adminMintLPFeeBps: number;
    adminBurnLPFeeBps: number;
    feeBps: number;
    taxBps: number;
  };
}

export interface VaultDepositActionDto {
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

export interface VaultDepositorDto {
  vaultAddress: string;
  userAddress: string;
  lpAmount: string;
  usdCostBasis: number;
  lastTouched: number;
}

export interface VaultHistoryDto {
  vaultAddress: string;
  pnl: number;
  totalUSDValue: number;
  pnlMainToken: number;
  totalMainTokenValue: number;
  lpPrice: number;
  lpPriceMainToken: number;
  time: number;
}

export interface VaultTotalValuesDto {
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
