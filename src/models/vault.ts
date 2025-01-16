import { Token } from './common';

/**
 * Represents the dynamic vault values.
 */
export interface VaultValues {
  /**
   * The total amount of LP tokens in the vault.
   */
  totalAmount: bigint;

  /**
   * The total USD value of the vault.
   */
  totalUSDValue: number;

  /**
   * The past week return of the vault in percentage.
   */
  pastWeekReturn: number;

  /**
   * The user's deposit total USD value in the vault.
   */
  userUSDValue?: number;

  /**
   * The user's all time earned USD value in the vault.
   */
  userAllTimeEarnedUSDValue?: number;

  /**
   * The deposit leader address.
   */
  leader: string;

  /**
   * The vault's performance.
   */
  vaultPerfomance: {
    /**
     * The vault's pnl performance in USD.
     */
    pnlPerfomance: number;

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
     * The lp tokens total amount.
     */
  totalSupply: number;

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
       * The token's value in the pool.
       */
    tokenValue: number;

    /**
       * The token's weight in the pool.
       */
    tokenWeight: number;
  }[];
}

export type VaultValuesUpdate = VaultValues;

/**
 * Represents the resolution of a vault value history.
 * '1h' indicates a 1-hour resolution,
 * '1D' indicates a 1-day resolution,
 * '1W' indicates a 1-week resolution,
 * '1M' indicates a 1-month resolution,
 * '1Y' indicates a 1-year resolution.
 */
export type VaultValueHistoryResolution = '1h' | '1D' | '1W' | '1M' | '1Y';

/**
 * Represents the vault value history.
 */
export type VaultValueHistory = {
  /**
   * The vault's pnl performance in USD.
   */
  pnl: number;

  /**
   * The vault's total USD value.
   */
  totalUSDValue: number;

  /**
   * The timestamp of the vault value history.
   */
  time: number;

  /**
   * The timestamp of the last touch of the vault value history entry.
   */
  lastTouched: number;
};

/**
 * Represents the vault value history update.
 */
export type VaultValueHistoryUpdate = VaultValueHistory;

/**
 * Represents the static vault config.
 */
export type VaultConfig = {
  vaultAddress: string;
  lpToken: Token;
  tokens: Token[];
  fees: {
    dynamicFeesEnabled: boolean;
    adminMintLPFeeBps: number;
    adminBurnLPFeeBps: number;
    feeBps: number;
    taxBps: number;
  };
};
