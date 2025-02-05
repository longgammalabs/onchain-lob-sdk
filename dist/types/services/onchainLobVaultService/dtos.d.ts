import type { DepositActionDirection } from '../../models';
import { TokenDto } from '../onchainLobSpotService';
export interface VaultConfigDto {
    vaultAddress: string;
    pythAddress: string;
    lpToken: TokenDto;
    tokens: TokenDto[];
    tokenIds: {
        tokenAddress: string;
        id: number;
    }[];
    fees: {
        dynamicFeesEnabled: boolean;
        adminMintLPFeeBps: number;
        adminBurnLPFeeBps: number;
        feeBps: number;
        taxBps: number;
    };
}
export interface VaultDepositActionDto {
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
    userAddress: string;
    lpAmount: string;
    usdCostBasis: number;
    lastTouched: number;
}
export interface VaultHistoryDto {
    pnl: number;
    totalUSDValue: number;
    time: number;
}
export interface VaultTotalValuesDto {
    totalUSDValue: number;
    totalUSDCostBasis: number;
    lpPrice: number;
    pastWeekReturn: number;
    leaderAddress: string;
    leaderUSDValue: number;
    vaultPerformance: {
        pnlPerformance: number;
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
