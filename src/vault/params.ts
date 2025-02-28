import BigNumber from 'bignumber.js';
import { Token, VaultHistoryPeriod } from '../models';

/**
 * Transaction parameters.
 *
 * @interface TransactionParams
 */
interface TransactionParams {
  /**
   * Transaction gas limit.
   * If not provided, the value obtained through an additional `eth_estimateGas` call is used.
   *
   * @type {BigNumber | bigint}
   * @optional
   */
  gasLimit?: BigNumber | bigint;

  /**
   * The maximum fee per unit of gas willing to be paid for the transaction.
   *
   * `maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas`.
   *
   * If not provided the value obtained through an additional `eth_maxPriorityFeePerGas` call is used.
   *
   * @type {BigNumber | bigint}
   * @optional
   */
  maxFeePerGas?: BigNumber | bigint;

  /**
   * The maximum price of the consumed gas to be included as a tip to the validator.
   *
   * If not provided the value obtained through an additional `eth_maxPriorityFeePerGas` call is used.
   *
   * @type {BigNumber | bigint}
   * @optional
   */
  maxPriorityFeePerGas?: BigNumber | bigint;

  /**
   * Transaction nonce (counter).
   * If not provided, the value obtained through an additional `eth_getTransactionCount` call is used.
   *
   * @type {BigNumber | bigint}
   * @optional
   */
  nonce?: BigNumber | bigint;
}

/**
 * Parameters for approving tokens for the token transfer.
 *
 * @interface ApproveVaultParams
 * @extends TransactionParams
 */
export interface ApproveVaultParams extends TransactionParams {
  /**
   * The vault identifier.
   *
   * @type {string}
   */
  vault: string;

  /**
   * Address of the token to be approved.
   *
   * @type {boolean}
   */
  token: string;

  /**
   * The amount of tokens to approve.
   * If `bigint` is provided, then the token's contract unit is used.
   * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
   *
   * @type {BigNumber | bigint}
   */
  amount: BigNumber | bigint;
}

/**
 * Parameters for wrapping native tokens.
 *
 * @interface WrapNativeTokenVaultParams
 * @extends TransactionParams
 */
export interface WrapNativeTokenVaultParams extends TransactionParams {
  /**
   * The vault identifier.
   *
   * @type {string}
   */
  vault: string;
  /**
   * The Wrapped native token.
   *
   * @type {string}
   */
  token: Token;
  /**
   * The amount of tokens to wrap.
   * If `bigint` is provided, then the token's contract unit is used.
   * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
   *
   * @type {BigNumber | bigint}
   */
  amount: BigNumber | bigint;
}

/**
 * Parameters for wrapping native tokens.
 *
 * @interface UnwrapNativeTokenVaultParams
 * @extends TransactionParams
 */
export interface UnwrapNativeTokenVaultParams extends TransactionParams {
  /**
   * The vault identifier.
   *
   * @type {string}
   */
  vault: string;
  /**
   * The Wrapped native token.
   *
   * @type {string}
   */
  token: Token;
  /**
   * The amount of tokens to unwrap.
   * If `bigint` is provided, then the token's contract unit is used.
   * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
   *
   * @type {BigNumber | bigint}
   */
  amount: BigNumber | bigint;
}

/**
 * Parameters for depositing tokens into the vault.
 *
 * @interface AddLiquidityVaultParams
 * @extends TransactionParams
 */
export interface AddLiquidityVaultParams extends TransactionParams {
  /**
   * The vault identifier.
   *
   * @type {string}
   */
  vault: string;
  /**
   * Address of the token to be deposited.
   *
   * @type {boolean}
   */
  token: string;

  /**
   * The amount of tokens to deposit.
   * If `bigint` is provided, then the token's contract unit is used.
   * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
   *
   * @type {BigNumber | bigint}
   */
  amount: BigNumber | bigint;

  /**
     * The amount of tokens to deposit in Usd.
     * If `bigint` is provided, then the token's contract unit is used.
     * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
     *
     * @type {BigNumber | bigint}
     */
  amountUsd: BigNumber | bigint;

  /**
     * The minimal amount of LP tokens user will receive after deposit.
     * If `bigint` is provided, then the token's contract unit is used.
     * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
     *
     * @type {BigNumber | bigint}
     */
  minLpMinted: BigNumber | bigint;
}

/**
 * Parameters to withdraw tokens from the vault.
 *
 * @interface RemoveLiquidityVaultParams
 * @extends TransactionParams
 */
export interface RemoveLiquidityVaultParams extends TransactionParams {
  /**
   * The vault identifier.
   *
   * @type {string}
   */
  vault: string;
  /**
   * Address of the token to be approved.
   *
   * @type {boolean}
   */
  token: string;

  /**
   * The amount of LP tokens to withdraw.
   * If `bigint` is provided, then the token's contract unit is used.
   * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
   *
   * @type {BigNumber | bigint}
   */
  burnLP: BigNumber | bigint;

  /**
     * The minimal amount of tokens to get after withdrawal in Usd.
     * If `bigint` is provided, then the token's contract unit is used.
     * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
     *
     * @type {BigNumber | bigint}
     */
  minUsdValue: BigNumber | bigint;

  /**
     * The minimal amount of tokens to get after withdrawal.
     * If `bigint` is provided, then the token's contract unit is used.
     * If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
     *
     * @type {BigNumber | bigint}
     */
  minTokenGet: BigNumber | bigint;
}

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

export type CalculateDepositDetailsSyncParams = {
  isLpTokenInput: boolean;
  tokenPriceUSD: BigNumber;
  totalSupply: BigNumber;
  totalValue: BigNumber;
  tokenValue: BigNumber;
  targetTokenWeight: BigNumber;
  totalWeight: BigNumber;
  tokenDecimals: number;
  lpTokenDecimals: number;
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
    slippageBps: number;
  };
};

export type DepositDetails = {
  tokenSpend: BigNumber;
  lpReceive: BigNumber;
  fee: BigNumber;
  params: {
    amount: bigint;
    amountUsd: bigint;
    minLpMinted: bigint;
  };
};

export type CalculateWithdrawDetailsSyncParams = {
  isLpTokenInput: boolean;
  tokenPriceUSD: BigNumber;
  totalSupply: BigNumber;
  totalValue: BigNumber;
  tokenValue: BigNumber;
  targetTokenWeight: BigNumber;
  totalWeight: BigNumber;
  tokenDecimals: number;
  lpTokenDecimals: number;
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
    slippageBps: number;
  };
};

export type WithdrawDetails = {
  lpSpend: BigNumber;
  tokenReceive: BigNumber;
  fee: BigNumber;
  params: {
    burnLP: bigint;
    minUsdValue: bigint;
    minTokenGet: bigint;
  };
};

export interface GetVaultConfigParams {
  /**
   * Id of the requested vault
   *
   * @type {string}
   */
  vault: string;
}

export interface GetVaultConfigsParams {
  /**
   * Id of the requested vault
   *
   * @type {string}
   * @optional
   * @note If not provided, all configs will be returned
   */
  vault?: string;
}

export interface GetVaultTotalValuesParams {
  /**
   * Id of the requested vault
   *
   * @type {string}
   */
  vault: string;
}

export interface GetVaultDepositActionsParams {
  /**
   * Id of the requested vault
   *
   * @type {string}
   */
  vault: string;
  /**
   * Number of deposit actions to retrieve
   *
   * @type {number}
   * @optional
   * @default 100
   */
  limit?: number;
}

export interface GetVaultDepositorsParams {
  /**
   * Id of the requested vault
   *
   * @type {string}
   */
  vault: string;
  /**
   * Address of depositor to retrieve
   *
   * @type {string}
   * @optional
   * @note If not provided, all depositors will be returned
   */
  address?: string;
  /**
   * Number of depositors to retrieve
   *
   * @type {number}
   * @optional
   * @default 100
   */
  limit?: number;
}

export interface GetVaultHistoryParams {
  /**
   * Id of the requested vault
   *
   * @type {string}
   */
  vault: string;
  /**
   * Period of the historical data to retrieve
   *
   * @type {VaultHistoryPeriod}
   */
  period: VaultHistoryPeriod;
}
