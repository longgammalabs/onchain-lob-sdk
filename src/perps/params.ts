import type BigNumber from 'bignumber.js';

import type { CandleResolution, PerpOrderStatus, PerpPositionStatus } from '../models';

export type {
  GetPerpMarketsParams,
  GetPerpOrderbookParams,
  GetPerpTradesParams,
  GetPerpCandlesParams,
  GetPerpAccountsParams,
  GetPerpPositionsParams,
  GetPerpOrdersParams,
  GetPerpFillsParams,
  GetPerpFundingRatesParams,
  GetPerpFundingPaymentsParams,
  GetPerpLiquidationsParams,
  GetPerpCollateralHistoryParams
} from '../services/onchainLobPerpsService';
export type {
  SubscribeToPerpMarketParams, UnsubscribeFromPerpMarketParams,
  SubscribeToPerpOrderbookParams, UnsubscribeFromPerpOrderbookParams,
  SubscribeToPerpTradesParams, UnsubscribeFromPerpTradesParams,
  SubscribeToPerpCandlesParams, UnsubscribeFromPerpCandlesParams,
  SubscribeToUserPerpAccountsParams, UnsubscribeFromUserPerpAccountsParams,
  SubscribeToUserPerpOrdersParams, UnsubscribeFromUserPerpOrdersParams,
  SubscribeToUserPerpFillsParams, UnsubscribeFromUserPerpFillsParams,
  SubscribeToUserPerpCollateralParams, UnsubscribeFromUserPerpCollateralParams
} from '../services/onchainLobPerpsWebSocketService';
export type { CandleResolution, PerpOrderStatus, PerpPositionStatus };

/**
 * Transaction parameters, the same as for the spot contracts.
 */
export interface PerpTransactionParams {
  /**
   * Transaction gas limit.
   * If not provided, the value obtained through an additional `eth_estimateGas` call is used.
   * Note: Monad charges the whole gas limit, not the gas used, so prefer the estimate to a hand-picked
   * large limit.
   *
   * @optional
   */
  gasLimit?: BigNumber | bigint;

  /**
   * The maximum fee per unit of gas willing to be paid for the transaction.
   *
   * @optional
   */
  maxFeePerGas?: BigNumber | bigint;

  /**
   * The maximum price of the consumed gas to be included as a tip to the validator.
   *
   * @optional
   */
  maxPriorityFeePerGas?: BigNumber | bigint;

  /**
   * Transaction nonce (counter).
   *
   * @optional
   */
  nonce?: BigNumber | bigint;
}

/**
 * A reference to an account of a perp market (`uint176` = `owner << 16 | subaccount`).
 * - `bigint`: the account id itself;
 * - `{ subaccount }`: an account of the signer;
 * - `{ owner, subaccount }`: an account of any owner (the signer must be its operator).
 */
export type PerpAccountRef = bigint | { owner?: string; subaccount: number };

/**
 * An amount of the collateral (quote) token.
 * `bigint` is the raw token unit, `BigNumber` is the human-readable amount scaled with the token decimals.
 */
export type PerpQuoteAmount = BigNumber | bigint;

/**
 * Whether the transaction starts with `refreshPrice()` (batched with the action through `multicall`).
 * Orders that open risk, takes, withdrawals with a position and liquidations need a fresh oracle price.
 * - `'auto'` (default): refresh when the account view reports `oracleFresh = false` (one extra `eth_call`);
 * - `true`: always refresh;
 * - `false`: never refresh.
 */
export type PerpRefreshPrice = boolean | 'auto';

interface RefreshPriceParams {
  /**
   * @default 'auto'
   */
  refreshPrice?: PerpRefreshPrice;
}

interface MarketParams {
  /** The market contract address. */
  market: string;
}

export interface OpenAccountPerpArgs {
  /** The subaccount number, `0..65535`. Isolated margin: use one subaccount per position. */
  subaccount: number;
}

export interface DepositPerpArgs {
  /** The account to credit. */
  account: PerpAccountRef;
  amount: PerpQuoteAmount;
}

export interface WithdrawPerpArgs {
  account: PerpAccountRef;
  /** The amount to withdraw. Ignored when `withdrawAll` is set. */
  amount?: PerpQuoteAmount;
  /**
   * Withdraw the maximal withdrawable amount computed from the live account state
   * (`collateral - owed funding + min(0, unrealized) - ADM`, never unrealized profit).
   */
  withdrawAll?: boolean;
}

export interface TransferPerpArgs {
  from: PerpAccountRef;
  /** Both accounts must belong to the same owner. */
  to: PerpAccountRef;
  amount: PerpQuoteAmount;
}

export interface PlaceOrderPerpArgs {
  account: PerpAccountRef;
  side: 'buy' | 'sell';
  /**
   * The limit price. `BigNumber` is the human price (quote per base, rounded to a tick: down for a buy, up for a sell),
   * `bigint` is the price in ticks.
   */
  price: BigNumber | bigint;
  /** The order size. `BigNumber` is the size in base (rounded down to a lot), `bigint` is lots. */
  size: BigNumber | bigint;
  /**
   * Reduce-only: the order may only shrink the position.
   */
  reduceOnly?: boolean;
  /**
   * The order expiry, unix seconds. `undefined` or `0` is good-till-cancelled.
   */
  expiry?: number;
  /**
   * The hint of the insertion position: the handle of the order after which the new one is linked (`0n` for the head).
   * When set, the contract does not scan the book (`hinted = true`) and reverts `InvalidHint` if the hint is wrong.
   */
  prev?: bigint;
  /**
   * Compute `prev` by walking the book with `eth_call` before sending the transaction. The hint is
   * exact for the current book; a concurrent change makes the transaction revert with `InvalidHint`.
   * Ignored when `prev` is set. Without a hint the contract scans the book from the head, which costs
   * gas proportional to the number of orders ahead of the new one.
   */
  autoHint?: boolean;
}

export interface TakeOrderPerpArgs {
  account: PerpAccountRef;
  side: 'buy' | 'sell';
  /** The size to take. `BigNumber` is the size in base (rounded down to a lot), `bigint` is lots. */
  size: BigNumber | bigint;
  /**
   * The worst acceptable price (an IOC limit): a buy takes asks at or below it, a sell takes bids at or above it.
   * `BigNumber` is the human price, `bigint` is ticks. Omit it for a market order: the limit is then the
   * extreme price (`maxTradePrice` for a buy, 1 tick for a sell), the fill is bounded only by the oracle collar.
   */
  limitPrice?: BigNumber | bigint;
  /**
   * The minimal filled size, the transaction reverts (`MinimumFill`) below it.
   * `BigNumber` is the size in base, `bigint` is lots. Use `'all'` for fill-or-kill. Defaults to 0.
   */
  minFill?: BigNumber | bigint | 'all';
  /** The maximal number of makers to match, `1..512`. Defaults to 64. */
  maxSteps?: number;
  /** The unix time in seconds after which the transaction reverts (`DeadlineExpired`). Defaults to now + 5 minutes. */
  deadline?: number;
  reduceOnly?: boolean;
  /** Gate from the first maker: a shortfall becomes a stop instead of an out-of-gas revert. */
  strictGate?: boolean;
}

export interface CancelOrderPerpArgs {
  /** The order handle. */
  handle: bigint;
  /**
   * The handle of the order before the cancelled one in the book. When set (`hinted = true`) the contract
   * does not scan the book; `0n` means the cancelled order is the head.
   */
  prev?: bigint;
  /** Compute `prev` by walking the book with `eth_call`. Ignored when `prev` is set. */
  autoHint?: boolean;
}

export interface CancelAllOrdersPerpArgs {
  account: PerpAccountRef;
}

/** One update of `replaceBatch` (A2 §4.2). */
export interface ReplaceOrderPerpUpdate {
  handle: bigint;
  /** The new price in ticks. */
  price: bigint;
  /** The new size in lots. */
  lots: bigint;
  /** The new expiry, unix seconds, 0 for good-till-cancelled. */
  expiry?: number;
  /** `'cancel'` removes the order. Defaults to `'replace'`. */
  op?: 'replace' | 'cancel';
  /**
   * Compare-and-swap against partial fills: when not zero, `lots` is the size the order had when the update was
   * prepared, and the contract subtracts what was filled since.
   */
  expectedLots?: bigint;
  /** The predecessor before the update (hinted mode only). */
  oldPrev?: bigint;
  /** The predecessor after the update (hinted mode only). */
  newPrev?: bigint;
}

export interface ReplaceOrdersPerpArgs {
  updates: ReplaceOrderPerpUpdate[];
  /** Use the `oldPrev`/`newPrev` of the updates instead of scanning. */
  hinted?: boolean;
}

export interface LiquidatePerpArgs {
  victim: PerpAccountRef;
  /** The account of the caller that takes over the position. */
  liquidator: PerpAccountRef;
  /** The cap of liquidated lots. Defaults to the whole `uint64` range (the contract closes the minimum that restores health). */
  maxLots?: bigint;
}

export interface ForceCancelPerpArgs {
  account: PerpAccountRef;
}

export interface SetOperatorPerpArgs {
  operator: string;
  /** The permission bits, see `PerpOperatorPermissions`. */
  permissions: number;
  /** The unix time in seconds when the permissions expire, 0 revokes. */
  expiry: number;
}

export type ApproveQuoteTokenPerpParams = MarketParams & PerpTransactionParams & {
  /** The amount to approve. Defaults to the unlimited approval. */
  amount?: PerpQuoteAmount;
};

export type OpenAccountPerpParams = MarketParams & OpenAccountPerpArgs & PerpTransactionParams;

export type DepositPerpParams = MarketParams & DepositPerpArgs & PerpTransactionParams & {
  /**
   * Check the allowance of the collateral token and approve the missing part first (the approval is
   * always waited for). Defaults to `true`.
   */
  autoApprove?: boolean;
  /** Approve the unlimited amount instead of the exact one when `autoApprove` sends an approval. */
  approveMax?: boolean;
};

export type WithdrawPerpParams = MarketParams & WithdrawPerpArgs & PerpTransactionParams & RefreshPriceParams;
export type TransferPerpParams = MarketParams & TransferPerpArgs & PerpTransactionParams;
export type PlaceOrderPerpParams = MarketParams & PlaceOrderPerpArgs & PerpTransactionParams & RefreshPriceParams;
export type TakeOrderPerpParams = MarketParams & TakeOrderPerpArgs & PerpTransactionParams & RefreshPriceParams;
export type CancelOrderPerpParams = MarketParams & CancelOrderPerpArgs & PerpTransactionParams;
export type CancelAllOrdersPerpParams = MarketParams & CancelAllOrdersPerpArgs & PerpTransactionParams;
export type ReplaceOrdersPerpParams = MarketParams & ReplaceOrdersPerpArgs & PerpTransactionParams & RefreshPriceParams;
export type LiquidatePerpParams = MarketParams & LiquidatePerpArgs & PerpTransactionParams & RefreshPriceParams;
export type ForceCancelPerpParams = MarketParams & ForceCancelPerpArgs & PerpTransactionParams & RefreshPriceParams;
export type RefreshPricePerpParams = MarketParams & PerpTransactionParams;
export type RefreshFundingPerpParams = MarketParams & PerpTransactionParams;
export type SetOperatorPerpParams = MarketParams & SetOperatorPerpArgs & PerpTransactionParams;
export type FaucetPerpParams = MarketParams & PerpTransactionParams;

/**
 * An action of a batched transaction (`multicall`). The actions are executed in order in one transaction
 * and the whole transaction reverts when any of them reverts.
 */
export type PerpMulticallItem =
  | { type: 'refreshPrice' }
  | { type: 'refreshFunding' }
  | { type: 'openAccount'; params: OpenAccountPerpArgs }
  | { type: 'deposit'; params: DepositPerpArgs }
  | { type: 'withdraw'; params: WithdrawPerpArgs }
  | { type: 'transfer'; params: TransferPerpArgs }
  | { type: 'placeOrder'; params: PlaceOrderPerpArgs }
  | { type: 'takeOrder'; params: TakeOrderPerpArgs }
  | { type: 'cancelOrder'; params: CancelOrderPerpArgs }
  | { type: 'cancelAllOrders'; params: CancelAllOrdersPerpArgs }
  | { type: 'replaceOrders'; params: ReplaceOrdersPerpArgs }
  | { type: 'liquidate'; params: LiquidatePerpArgs }
  | { type: 'forceCancel'; params: ForceCancelPerpArgs }
  | { type: 'setOperator'; params: SetOperatorPerpArgs };

export type MulticallPerpParams = MarketParams & PerpTransactionParams & RefreshPriceParams & {
  calls: PerpMulticallItem[];
};

export interface GetPerpAccountStateParams extends MarketParams {
  account: PerpAccountRef;
}

export interface GetPerpMarketStateParams extends MarketParams {}
export interface GetPerpRiskParamsParams extends MarketParams {}

export interface GetPerpBookOrdersParams extends MarketParams {
  /** `true` for the bid side, `false` for the ask side. */
  bid: boolean;
  /** The maximal number of orders to read. Defaults to 50. */
  limit?: number;
}

export interface GetPerpOperatorParams extends MarketParams {
  owner?: string;
  operator: string;
}

export interface GetPerpQuoteBalanceParams extends MarketParams {
  /** Defaults to the signer address. */
  owner?: string;
}

export type GetPerpQuoteAllowanceParams = GetPerpQuoteBalanceParams;

export interface GetPerpOraclePriceParams extends MarketParams {}

export interface GetPerpAccountOverviewParams extends MarketParams {
  account: PerpAccountRef;
}
