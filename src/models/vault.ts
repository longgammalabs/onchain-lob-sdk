import BigNumber from 'bignumber.js';
import { Token } from './common';

/**
 * Represents the direction of the deposit action in the vault.
 */
export type DepositActionDirection = 'deposit' | 'withdraw';

/**
 * Represents the dynamic vault values.
 */
export interface VaultTotalValues {
  /**
   * The total USD value of the vault.
   */
  totalUSDValue: number;

  /**
   * The total USD basis for calculating pnl.
   */
  totalUSDCostBasis: number;

  /**
   * The price of the LP token in USD.
   */
  lpPrice: number;

  /**
   * The past week return of the vault in percentage points.
   */
  pastWeekReturn: number;

  /**
   * The deposit leader address.
   */
  leaderAddress: string;

  /**
   * The deposit leader account value in USD.
   */
  leaderUSDValue: number;

  /**
   * The vault's performance.
   */
  vaultPerformance: {
    /**
     * The vault's pnl performance in USD.
     */
    pnlPerformance: number;

    /**
     * The vault's max drawdown percentage.
     */
    maxDrowdownPercentage: number;

    /**
     * The vault's volume in USD.
     */
    volume: number;

    /**
     * The vault's profit share in percentage.
     */
    profitShare: number;
  };

  /**
   * The raw total supply as a bigint.
   */
  rawTotalSupply: bigint;

  /**
   * The formatted total supply as a BigNumber.
   */
  totalSupply: BigNumber;

  /**
     * The total weight of the assets in the vault
     */
  totalWeight: number;

  /**
     * The vault's tokens info.
     */
  tokens: {
    /**
       * The token's address.
       */
    address: string;

    /**
       * The token's symbol.
       */
    symbol: string;

    /**
       * The token's price in USD.
       */
    tokenPriceUSD: number;

    /**
       * The raw vault's token balance in bigint.
       */
    rawTokenBalance: bigint;

    /**
       * The formatted vault's token balance in BigNumber.
       */
    tokenBalance: BigNumber;

    /**
       * The raw token's reserve in the pool in bigint.
       */
    rawTokenReserved: bigint;

    /**
       * The formatted token's reserve in the pool in BigNumber.
       */
    tokenReserved: BigNumber;

    /**
       * The token's weight in the pool.
       */
    tokenWeight: number;
  }[];
}

export type VaultTotalValuesUpdate = VaultTotalValues;

/**
 * Represents the period of a vault history.
 * '1h' indicates a 1-hour period,
 * '1D' indicates a 1-day period,
 * '1W' indicates a 1-week period,
 * '1M' indicates a 1-month period,
 * '1Y' indicates a 1-year period.
 */
export type VaultHistoryPeriod = '1h' | '1D' | '1W' | '1M' | '1Y';

/**
 * Represents the vault history.
 */
export type VaultHistory = {
  /**
   * The vault's pnl performance in USD.
   */
  pnl: number;

  /**
   * The vault's total USD value.
   */
  totalUSDValue: number;

  /**
   * The timestamp of the vault history.
   */
  time: number;
};

/**
 * Represents the vault history update.
 */
export type VaultHistoryUpdate = VaultHistory;

/**
 * Represents the static vault config.
 */
export type VaultConfig = {
  /**
   * The vault's contract address
   */
  vaultAddress: string;

  /**
   * The vault's pyth address
   */
  pythAddress: string;

  /**
   * The vault's lp token
   */
  lpToken: Token;

  /**
   * The vault's tokens
   */
  tokens: Token[];

  /**
   * The vault's tokens ids
   */
  tokenIds: {
    tokenAddress: string;
    id: number;
  }[];

  /**
   * Represents the fee configuration for vault.
   */
  fees: {
    dynamicFeesEnabled: boolean;
    adminMintLPFeeBps: number;
    adminBurnLPFeeBps: number;
    feeBps: number;
    taxBps: number;
  };
};

/**
 * Represents the deposit/withdraw action in the vault.
 */
export type VaultDepositAction = {
  /**
   * The action initiator's account address
   */
  userAddress: string;

  /**
   * The timestamp of the deposit action.
   */
  timestamp: number;

  /**
   * The transaction hash associated with the deposit action.
   */
  txnHash: string;

  /**
   * The direction of the deposit action.
   */
  direction: DepositActionDirection;

  /**
   * The symbol of the token in the deposit action.
   */
  tokenSymbol: string;

  /**
   * The raw amount of the token in the deposit action in bigint.
   */
  rawTokenAmount: bigint;

  /**
   * The formatted amount of the token in the deposit action in BigNumber.
   */
  tokenAmount: BigNumber;

  /**
   * The USD amount in the deposit action.
   */
  usdValue: number;

  /**
   * The raw amount of the LP token in the deposit action in bigint.
   */
  rawLpAmount: bigint;

  /**
   * The formatted amount of the LP token in the deposit action in BigNumber.
   */
  lpAmount: BigNumber;

  /**
   * The commision user paid fpr the deposit action in USD.
   */
  commissionUsd: number;
};

export type VaultDepositActionUpdate = VaultDepositAction;

/**
 * Represents the vault depositor.
 */
export type VaultDepositor = {
  /**
   * The depositor's account address
   */
  userAddress: string;

  /**
   * The raw amount of the depositor's LP tokens in bigint
   */
  rawLpAmount: bigint;

  /**
   * The formatted amount of the depositor's LP tokens in BigNumber
   */
  lpAmount: BigNumber;

  /**
   * The amount of the depositor's deposits and withdrawals. Need for pnl calculation
   */
  usdCostBasis: number;

  /**
   * The timestamp of the last depositor's interaction with the vault.
   */
  lastTouched: number;
};

export type VaultDepositorUpdate = VaultDepositor;
