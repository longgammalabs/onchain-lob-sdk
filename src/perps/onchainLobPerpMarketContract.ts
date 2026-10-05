import BigNumber from 'bignumber.js';
import { Contract, MaxUint256, type ContractTransactionResponse, type Provider, type Signer } from 'ethers';

import { decodePerpAccountId, encodePerpAccountId } from './accounts';
import { calculateCancelHint, calculatePlaceHint, decodeBookOrder, encodeReplaceBatchUpdates } from './book';
import {
  PERP_DEFAULT_TAKE_DEADLINE_SECONDS, PERP_DEFAULT_TAKE_MAX_STEPS, PERP_MAX_TAKE_STEPS, PerpPlaceFlags, PerpTakeFlags
} from './constants';
import {
  mapPerpAccountStateFromContract, mapPerpMarketStateFromContract, mapPerpRiskParamsFromContract
} from './mappers';
import type {
  ApproveQuoteTokenPerpParams, CancelAllOrdersPerpParams, CancelOrderPerpParams, DepositPerpParams, FaucetPerpParams,
  ForceCancelPerpParams, GetPerpBookOrdersParams, LiquidatePerpParams, MulticallPerpParams, OpenAccountPerpParams, PerpAccountRef,
  PerpMulticallItem, PerpQuoteAmount, PerpRefreshPrice, PerpTransactionParams, PlaceOrderPerpParams, RefreshFundingPerpParams,
  RefreshPricePerpParams, ReplaceOrdersPerpParams, SetOperatorPerpParams, TakeOrderPerpParams, TransferPerpParams, WithdrawPerpParams
} from './params';
import {
  calculateBankruptcyPrice, calculateEntryPrice, calculateImpliedMarkPrice, calculateLiquidationPrice, calculateMaxWithdrawable,
  type PerpRiskInput
} from './risk';
import { priceToTicks, quoteAmountToUnits, sizeToLots } from './units';
import { devnetTokenAbi, erc20Abi, perpMarketAbi } from '../abi';
import type {
  PerpAccountOverview, PerpAccountState, PerpBookOrder, PerpMarketParams, PerpMarketState, PerpRiskParams
} from '../models';
import { TransactionFailedError } from '../spot/errors';
import { wait } from '../utils/delay';

/**
 * The part of a market the contract wrapper needs. `PerpMarket` (the model returned by the API) satisfies it.
 */
export interface PerpMarketConfig {
  /** The market contract address. */
  id: string;
  /** The collateral token. */
  quoteToken: { address: string; decimals: number };
  /** Base units per lot. */
  baseLot: bigint;
  /** Quote units per tick. */
  quoteTick: bigint;
  /** Size (base) = lots / 10^sizeDecimals. */
  sizeDecimals: number;
  /** Price (quote per base) = ticks / 10^priceDecimals. */
  priceDecimals: number;
  params?: Pick<PerpMarketParams, 'maxTradePrice'>;
}

export interface OnchainLobPerpMarketContractOptions {
  market: PerpMarketConfig;
  /** Required for the transactions. */
  signer?: Signer | null;
  /** Used for the reads when there is no signer (a read-only wrapper). */
  provider?: Provider | null;
  autoWaitTransaction?: boolean;
  fastWaitTransaction?: boolean;
  fastWaitTransactionInterval?: number;
  fastWaitTransactionTimeout?: number;
}

/** The name of a `PerpMarket` function the wrapper sends. */
export type PerpFunctionName =
  | 'openAccount' | 'deposit' | 'withdraw' | 'transfer' | 'place' | 'take' | 'cancel' | 'cancelAll' | 'replaceBatch'
  | 'liquidate' | 'forceCancel' | 'refreshPrice' | 'refreshFunding' | 'setOperator';

/** A resolved call of the market contract: the function and its raw arguments. */
export interface PerpEncodedCall {
  name: PerpFunctionName;
  args: readonly unknown[];
}

const MAX_UINT64 = (1n << 64n) - 1n;
const DEFAULT_BOOK_ORDERS_LIMIT = 50;
const MAX_HINT_STEPS = 256;
const getDeadline = () => Math.floor(Date.now() / 1000) + PERP_DEFAULT_TAKE_DEADLINE_SECONDS;

/**
 * The wrapper of one `PerpMarket` contract: transactions (ethers v6, the same pattern as the spot market
 * contract wrapper) and the reads of the live on-chain state.
 *
 * About gas: transactions pass `gasLimit` through when given and otherwise use `eth_estimateGas` — exactly like spot.
 * Monad charges the whole gas limit (not the gas used), so the estimate is the right limit; do not set a large
 * limit "just in case".
 */
export class OnchainLobPerpMarketContract {
  static readonly defaultAutoWaitTransaction = true;
  static readonly defaultFastWaitTransaction = false;
  static readonly defaultFastWaitTransactionInterval = 100;

  readonly market: Readonly<PerpMarketConfig>;
  autoWaitTransaction: boolean;
  fastWaitTransaction: boolean;
  fastWaitTransactionInterval: number;
  fastWaitTransactionTimeout?: number;

  protected readonly signer: Signer | null;
  protected readonly marketContract: Contract;
  protected readonly quoteTokenContract: Contract;
  protected readonly devnetTokenContract: Contract;
  private maxTradePrice: bigint | undefined;
  private riskParams: PerpRiskParams | undefined;

  constructor(options: Readonly<OnchainLobPerpMarketContractOptions>) {
    const runner = options.signer ?? options.provider ?? null;
    if (!runner)
      throw new Error('Either a signer or a provider is required');

    this.market = options.market;
    this.signer = options.signer ?? null;
    this.autoWaitTransaction = options.autoWaitTransaction ?? OnchainLobPerpMarketContract.defaultAutoWaitTransaction;
    this.fastWaitTransaction = options.fastWaitTransaction ?? OnchainLobPerpMarketContract.defaultFastWaitTransaction;
    this.fastWaitTransactionInterval = options.fastWaitTransactionInterval ?? OnchainLobPerpMarketContract.defaultFastWaitTransactionInterval;
    this.fastWaitTransactionTimeout = options.fastWaitTransactionTimeout;

    this.marketContract = new Contract(this.market.id, perpMarketAbi, runner);
    this.quoteTokenContract = new Contract(this.market.quoteToken.address, erc20Abi, runner);
    this.devnetTokenContract = new Contract(this.market.quoteToken.address, devnetTokenAbi, runner);
  }

  /**
   * Creates a wrapper reading the market parameters from the chain. The scaling of the display units
   * (`sizeDecimals`, `priceDecimals`) is derived from the on-chain lot and tick for the given `baseDecimals`
   * (18 for WETH); it requires `baseLot` and `quoteTick` to be powers of ten.
   */
  static async fromChain(
    options: Omit<OnchainLobPerpMarketContractOptions, 'market'> & { marketAddress: string; baseDecimals?: number }
  ): Promise<OnchainLobPerpMarketContract> {
    const runner = options.signer ?? options.provider;
    if (!runner)
      throw new Error('Either a signer or a provider is required');

    const contract = new Contract(options.marketAddress, perpMarketAbi, runner);
    const [risk, quoteToken] = await Promise.all([contract.riskParams!(), contract.quoteToken!() as Promise<string>]);
    const quoteDecimals = Number(await new Contract(quoteToken, erc20DecimalsAbi, runner).decimals!());
    const { baseLot, quoteTick } = mapPerpRiskParamsFromContract(risk);
    const sizeDecimals = (options.baseDecimals ?? 18) - powerOfTen(baseLot, 'baseLot');
    const priceDecimals = quoteDecimals - sizeDecimals - powerOfTen(quoteTick, 'quoteTick');

    return new OnchainLobPerpMarketContract({
      ...options,
      market: {
        id: options.marketAddress.toLowerCase(),
        quoteToken: { address: quoteToken.toLowerCase(), decimals: quoteDecimals },
        baseLot,
        quoteTick,
        sizeDecimals,
        priceDecimals,
      },
    });
  }

  // ---- transactions ------------------------------------------------------------------------------------------

  /**
   * Approves the collateral token for the market contract.
   */
  async approveQuoteToken(params: Omit<ApproveQuoteTokenPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    this.requireSigner();
    const amount = params.amount === undefined ? MaxUint256 : this.toQuoteUnits(params.amount);

    return this.processContractMethodCall(
      this.quoteTokenContract,
      this.quoteTokenContract.approve!(this.market.id, amount, this.getOverrides(params))
    );
  }

  /**
   * Checks the allowance of the collateral token and approves the missing amount.
   * The approval is waited for. Returns the approval transaction, or `null` when the allowance is enough.
   */
  async ensureQuoteAllowance(amount: PerpQuoteAmount, options: { approveMax?: boolean } & PerpTransactionParams = {}): Promise<ContractTransactionResponse | null> {
    this.requireSigner();
    const units = this.toQuoteUnits(amount);
    const owner = await this.getSignerAddress();
    const allowance = BigInt(await this.quoteTokenContract.allowance!(owner, this.market.id));
    if (allowance >= units)
      return null;

    const tx = await this.processContractMethodCall(
      this.quoteTokenContract,
      this.quoteTokenContract.approve!(this.market.id, options.approveMax ? MaxUint256 : units, this.getOverrides(options))
    );
    // The deposit needs the allowance in place, so the approval is always waited for.
    if (!this.autoWaitTransaction)
      await tx.wait();

    return tx;
  }

  /**
   * Mints the faucet amount of the collateral token. Works for test tokens only (`DevnetToken`).
   */
  async faucetQuoteToken(params: Omit<FaucetPerpParams, 'market'> = {}): Promise<ContractTransactionResponse> {
    this.requireSigner();

    return this.processContractMethodCall(
      this.devnetTokenContract,
      this.devnetTokenContract.faucet!(this.getOverrides(params))
    );
  }

  async openAccount(params: Omit<OpenAccountPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'openAccount', params }], params, 'never');
  }

  async deposit(params: Omit<DepositPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    let txParams: PerpTransactionParams = params;
    if (params.autoApprove ?? true) {
      // The approval is a separate transaction: it takes the nonce of the caller (if any) and the deposit the next one.
      const approval = await this.ensureQuoteAllowance(params.amount, {
        approveMax: params.approveMax,
        nonce: params.nonce,
        maxFeePerGas: params.maxFeePerGas,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas,
      });
      if (approval && params.nonce !== undefined)
        txParams = { ...params, nonce: BigInt(params.nonce.toString()) + 1n };
    }

    return this.execute([{ type: 'deposit', params }], txParams, 'never');
  }

  async withdraw(params: Omit<WithdrawPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'withdraw', params }], params, params.refreshPrice ?? 'auto');
  }

  async transfer(params: Omit<TransferPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'transfer', params }], params, 'never');
  }

  /**
   * Places a resting limit order (`place`). It is post-only: an order that would cross the book reverts.
   * Use {@link takeOrder} to execute against the book.
   */
  async placeOrder(params: Omit<PlaceOrderPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'placeOrder', params }], params, params.refreshPrice ?? 'auto');
  }

  /**
   * Takes liquidity from the book (`take`): an immediate-or-cancel order, a market order when no limit price is given.
   */
  async takeOrder(params: Omit<TakeOrderPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'takeOrder', params }], params, params.refreshPrice ?? 'auto');
  }

  async cancelOrder(params: Omit<CancelOrderPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'cancelOrder', params }], params, 'never');
  }

  async cancelAllOrders(params: Omit<CancelAllOrdersPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'cancelAllOrders', params }], params, 'never');
  }

  async replaceOrders(params: Omit<ReplaceOrdersPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'replaceOrders', params }], params, params.refreshPrice ?? 'auto');
  }

  async liquidate(params: Omit<LiquidatePerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'liquidate', params }], params, params.refreshPrice ?? 'auto');
  }

  async forceCancel(params: Omit<ForceCancelPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'forceCancel', params }], params, params.refreshPrice ?? 'auto');
  }

  async refreshPrice(params: Omit<RefreshPricePerpParams, 'market'> = {}): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'refreshPrice' }], params, 'never');
  }

  async refreshFunding(params: Omit<RefreshFundingPerpParams, 'market'> = {}): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'refreshFunding' }], params, 'never');
  }

  async setOperator(params: Omit<SetOperatorPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute([{ type: 'setOperator', params }], params, 'never');
  }

  /**
   * Sends several actions in one transaction (`multicall`). With `refreshPrice` (`'auto'` by default)
   * the transaction starts with `refreshPrice()` when an action needs a fresh oracle.
   */
  async multicall(params: Omit<MulticallPerpParams, 'market'>): Promise<ContractTransactionResponse> {
    return this.execute(params.calls, params, params.refreshPrice ?? 'auto');
  }

  /**
   * Resolves the actions to the raw contract calls without sending anything (hints and accounts are resolved,
   * reads are performed only when an action needs them).
   */
  async buildCalls(items: readonly PerpMulticallItem[]): Promise<PerpEncodedCall[]> {
    const calls: PerpEncodedCall[] = [];
    for (const item of items)
      calls.push(await this.buildCall(item));

    return calls;
  }

  /**
   * Encodes a resolved call to calldata.
   */
  encodeCall(call: PerpEncodedCall): string {
    return this.marketContract.interface.encodeFunctionData(call.name, [...call.args]);
  }

  /**
   * Encodes the calldata of `multicall(bytes[])` for the resolved calls.
   */
  encodeMulticall(calls: readonly PerpEncodedCall[]): string {
    return this.marketContract.interface.encodeFunctionData('multicall', [calls.map(call => this.encodeCall(call))]);
  }

  // ---- reads -------------------------------------------------------------------------------------------------

  /**
   * Resolves an account reference to the account id (`uint176`).
   */
  async resolveAccount(account: PerpAccountRef): Promise<bigint> {
    if (typeof account === 'bigint')
      return account;

    return encodePerpAccountId(account.owner ?? await this.getSignerAddress(), account.subaccount);
  }

  /**
   * Reads the live state of an account (`perpAccount`): equity, margin requirements, health and whether the oracle is fresh.
   */
  async getAccountState(account: PerpAccountRef): Promise<PerpAccountState> {
    return mapPerpAccountStateFromContract(await this.marketContract.perpAccount!(await this.resolveAccount(account)));
  }

  /**
   * Reads the live state of the market (`market`): funding indices, open interest, custody, insurance.
   */
  async getMarketState(): Promise<PerpMarketState> {
    return mapPerpMarketStateFromContract(await this.marketContract.market!());
  }

  /**
   * Reads the risk parameters (`riskParams`). The result is cached: the parameters are immutable.
   */
  async getRiskParams(): Promise<PerpRiskParams> {
    this.riskParams ??= mapPerpRiskParamsFromContract(await this.marketContract.riskParams!());

    return this.riskParams;
  }

  /**
   * The risk parameters in the form the pure formulas of `risk.ts` expect.
   */
  async getRiskInput(): Promise<PerpRiskInput> {
    const risk = await this.getRiskParams();

    return { ...risk, quoteTick: this.market.quoteTick };
  }

  /**
   * Reads the live account state and derives the entry, mark, liquidation and bankruptcy prices and the maximal withdrawal.
   * The prices are in quote per base. The funding owed is included in the liquidation price.
   * With a stale oracle the on-chain `adm` (and so `maxWithdrawable`) is computed for the cached mark.
   */
  async getAccountOverview(account: PerpAccountRef): Promise<PerpAccountOverview> {
    const id = await this.resolveAccount(account);
    const [state, risk] = await Promise.all([this.getAccountState(id), this.getRiskParams()]);
    const { owner, subaccount } = decodePerpAccountId(id);
    const quoteTick = this.market.quoteTick;
    const toPrice = (ticks: BigNumber | null) => ticks === null ? null : ticks.shiftedBy(-this.market.priceDecimals);
    const position = { size: state.size, costBasis: state.costBasis, collateral: state.collateral, owedCharges: state.owedCharges, mmrBps: risk.mmrBps, quoteTick };

    return {
      account: id,
      owner,
      subaccount,
      state,
      entryPrice: toPrice(calculateEntryPrice(state.size, state.costBasis, quoteTick)),
      markPrice: toPrice(calculateImpliedMarkPrice(state.size, state.costBasis, state.unrealized, quoteTick)),
      liquidationPrice: toPrice(calculateLiquidationPrice(position)),
      bankruptcyPrice: toPrice(calculateBankruptcyPrice(position)),
      maxWithdrawable: calculateMaxWithdrawable(state.collateral, state.owedCharges, state.unrealized, state.adm),
    };
  }

  /**
   * Reads one side of the book by walking `head`/`next`/`order` (two `eth_call` per order).
   * The result is in book order: the best price first.
   */
  async getBookOrders(params: Omit<GetPerpBookOrdersParams, 'market'>): Promise<PerpBookOrder[]> {
    const { orders } = await this.walkBook(params.bid, params.limit ?? DEFAULT_BOOK_ORDERS_LIMIT);

    return orders;
  }

  /**
   * Reads one order of the book. Returns `null` for a free or unknown handle.
   */
  async getBookOrder(handle: bigint): Promise<PerpBookOrder | null> {
    const [w0, w1] = await this.marketContract.order!(handle) as [bigint, bigint];
    const order = decodeBookOrder(handle, w0, w1);

    return order.lots === 0n ? null : order;
  }

  /**
   * The operator permissions an owner granted (`operatorOf`).
   */
  async getOperator(owner: string, operator: string): Promise<{ permissions: number; expiry: number }> {
    const [permissions, expiry] = await this.marketContract.operatorOf!(owner, operator) as [bigint, bigint];

    return { permissions: Number(permissions), expiry: Number(expiry) };
  }

  /**
   * The balance of the collateral token of the wallet (raw units).
   */
  async getQuoteBalance(owner?: string): Promise<bigint> {
    return BigInt(await this.quoteTokenContract.balanceOf!(owner ?? await this.getSignerAddress()));
  }

  /**
   * The allowance of the collateral token given to the market (raw units).
   */
  async getQuoteAllowance(owner?: string): Promise<bigint> {
    return BigInt(await this.quoteTokenContract.allowance!(owner ?? await this.getSignerAddress(), this.market.id));
  }

  /**
   * Reads the price of the oracle adapter (`IPriceSource.latestPrice`) in ticks per lot (fractional).
   * The adapter price is the source of the next `refreshPrice`; the market caches the last accepted one.
   * Throws when the adapter reverts.
   */
  async getOraclePrice(): Promise<{ priceWad: bigint; confWad: bigint; publishTime: number }> {
    const source = await this.marketContract.priceSource!() as string;
    const adapter = new Contract(source, priceSourceAbi, this.marketContract.runner);
    const [priceWad, confWad, publishTime] = await adapter.latestPrice!() as [bigint, bigint, bigint];

    return { priceWad, confWad, publishTime: Number(publishTime) };
  }

  // ---- internals ---------------------------------------------------------------------------------------------

  /**
   * Builds the calls, adds `refreshPrice()` when needed and sends one function call or a `multicall`.
   */
  protected async execute(
    items: readonly PerpMulticallItem[],
    txParams: PerpTransactionParams,
    refresh: PerpRefreshPrice | 'never'
  ): Promise<ContractTransactionResponse> {
    const calls = await this.buildCalls(items);
    if (await this.shouldRefreshPrice(items, refresh))
      calls.unshift({ name: 'refreshPrice', args: [] });

    this.requireSigner();
    const overrides = this.getOverrides(txParams);
    const writer = this.marketContract;
    const first = calls[0];
    if (!first)
      throw new Error('There are no calls to send');

    const methodCall = calls.length === 1
      ? writer[first.name]!(...first.args, overrides)
      : writer.multicall!(calls.map(call => this.encodeCall(call)), overrides);

    return this.processContractMethodCall(this.marketContract, methodCall);
  }

  protected async shouldRefreshPrice(items: readonly PerpMulticallItem[], refresh: PerpRefreshPrice | 'never'): Promise<boolean> {
    if (refresh === 'never' || refresh === false)
      return false;
    if (items.some(item => item.type === 'refreshPrice'))
      return false;
    if (refresh === true)
      return true;

    // 'auto': the first action that needs a fresh oracle decides.
    for (const item of items) {
      const account = this.getOracleDependentAccount(item);
      if (account === undefined)
        continue;

      const state = await this.getAccountState(account);

      return !state.oracleFresh;
    }

    return false;
  }

  /**
   * The account whose view tells whether the action needs a refresh of the oracle, `undefined` when the action
   * works at a stale oracle. Reduce-only orders can be placed on a stale oracle, fills of any kind cannot (D1 §7).
   */
  protected getOracleDependentAccount(item: PerpMulticallItem): PerpAccountRef | undefined {
    switch (item.type) {
      case 'placeOrder':
        return item.params.reduceOnly ? undefined : item.params.account;
      case 'takeOrder':
        return item.params.account;
      case 'withdraw':
        return item.params.account;
      case 'liquidate':
        return item.params.victim;
      case 'forceCancel':
        return item.params.account;
      default:
        return undefined;
    }
  }

  protected async buildCall(item: PerpMulticallItem): Promise<PerpEncodedCall> {
    switch (item.type) {
      case 'refreshPrice':
        return { name: 'refreshPrice', args: [] };
      case 'refreshFunding':
        return { name: 'refreshFunding', args: [] };
      case 'openAccount':
        return { name: 'openAccount', args: [item.params.subaccount] };
      case 'deposit':
        return { name: 'deposit', args: [await this.resolveAccount(item.params.account), this.toQuoteUnits(item.params.amount)] };
      case 'withdraw':
        return { name: 'withdraw', args: [await this.resolveAccount(item.params.account), await this.resolveWithdrawAmount(item.params)] };
      case 'transfer':
        return {
          name: 'transfer',
          args: [await this.resolveAccount(item.params.from), await this.resolveAccount(item.params.to), this.toQuoteUnits(item.params.amount)],
        };
      case 'placeOrder':
        return this.buildPlaceCall(item.params);
      case 'takeOrder':
        return this.buildTakeCall(item.params);
      case 'cancelOrder':
        return this.buildCancelCall(item.params);
      case 'cancelAllOrders':
        return { name: 'cancelAll', args: [await this.resolveAccount(item.params.account)] };
      case 'replaceOrders':
        return { name: 'replaceBatch', args: [encodeReplaceBatchUpdates(item.params.updates), item.params.hinted ?? false] };
      case 'liquidate':
        return {
          name: 'liquidate',
          args: [await this.resolveAccount(item.params.victim), await this.resolveAccount(item.params.liquidator), item.params.maxLots ?? MAX_UINT64],
        };
      case 'forceCancel':
        return { name: 'forceCancel', args: [await this.resolveAccount(item.params.account)] };
      case 'setOperator':
        return { name: 'setOperator', args: [item.params.operator, item.params.permissions, item.params.expiry] };
    }
  }

  private async buildPlaceCall(params: Extract<PerpMulticallItem, { type: 'placeOrder' }>['params']): Promise<PerpEncodedCall> {
    const bid = params.side === 'buy';
    const price = typeof params.price === 'bigint'
      ? params.price
      : priceToTicks(params.price, this.market.priceDecimals, bid ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP);
    const lots = this.toLots(params.size);
    if (price < 1n)
      throw new Error('The price must be at least one tick');
    if (lots < 1n)
      throw new Error('The size must be at least one lot');

    let prev = params.prev;
    if (prev === undefined && params.autoHint) {
      const { orders, complete } = await this.walkBook(bid, MAX_HINT_STEPS);
      prev = calculatePlaceHint(orders, bid, price, complete) ?? undefined;
    }

    return {
      name: 'place',
      args: [
        await this.resolveAccount(params.account),
        bid,
        price,
        lots,
        params.expiry ?? 0,
        prev ?? 0n,
        prev !== undefined,
        params.reduceOnly ? PerpPlaceFlags.ReduceOnly : PerpPlaceFlags.None,
      ],
    };
  }

  private async buildTakeCall(params: Extract<PerpMulticallItem, { type: 'takeOrder' }>['params']): Promise<PerpEncodedCall> {
    const buy = params.side === 'buy';
    const lots = this.toLots(params.size);
    if (lots < 1n)
      throw new Error('The size must be at least one lot');

    const maxSteps = params.maxSteps ?? PERP_DEFAULT_TAKE_MAX_STEPS;
    if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > PERP_MAX_TAKE_STEPS)
      throw new Error(`maxSteps must be an integer in 1..${PERP_MAX_TAKE_STEPS}`);

    let limit: bigint;
    if (params.limitPrice === undefined)
      limit = buy ? await this.getMaxTradePrice() : 1n;
    else if (typeof params.limitPrice === 'bigint')
      limit = params.limitPrice;
    else
      limit = priceToTicks(params.limitPrice, this.market.priceDecimals, buy ? BigNumber.ROUND_UP : BigNumber.ROUND_DOWN);

    const minFill = params.minFill === 'all' ? lots : params.minFill === undefined ? 0n : this.toLots(params.minFill);

    return {
      name: 'take',
      args: [
        await this.resolveAccount(params.account),
        buy,
        limit,
        lots,
        minFill,
        maxSteps,
        BigInt(params.deadline ?? getDeadline()),
        (params.reduceOnly ? PerpTakeFlags.ReduceOnly : PerpTakeFlags.None) | (params.strictGate ? PerpTakeFlags.StrictGate : PerpTakeFlags.None),
      ],
    };
  }

  private async buildCancelCall(params: Extract<PerpMulticallItem, { type: 'cancelOrder' }>['params']): Promise<PerpEncodedCall> {
    let prev = params.prev;
    if (prev === undefined && params.autoHint) {
      const order = await this.getBookOrder(params.handle);
      if (!order)
        throw new Error(`Order ${params.handle} is not in the book`);

      const { orders } = await this.walkBook(order.bid, MAX_HINT_STEPS, params.handle);
      prev = calculateCancelHint(orders, params.handle) ?? undefined;
    }

    return { name: 'cancel', args: [params.handle, prev ?? 0n, prev !== undefined] };
  }

  private async resolveWithdrawAmount(params: Extract<PerpMulticallItem, { type: 'withdraw' }>['params']): Promise<bigint> {
    if (params.withdrawAll) {
      const state = await this.getAccountState(params.account);

      return calculateMaxWithdrawable(state.collateral, state.owedCharges, state.unrealized, state.adm);
    }
    if (params.amount === undefined)
      throw new Error('Either amount or withdrawAll must be specified');

    return this.toQuoteUnits(params.amount);
  }

  /**
   * Walks one side of the book from the head. Stops after `limit` orders, or once `stopAfter` was read.
   */
  protected async walkBook(bid: boolean, limit: number, stopAfter?: bigint): Promise<{ orders: PerpBookOrder[]; complete: boolean }> {
    const orders: PerpBookOrder[] = [];
    let handle = BigInt(await this.marketContract.head!(bid));
    while (handle !== 0n) {
      if (orders.length >= limit)
        return { orders, complete: false };

      const [w0, w1] = await this.marketContract.order!(handle) as [bigint, bigint];
      orders.push(decodeBookOrder(handle, w0, w1));
      if (handle === stopAfter)
        return { orders, complete: false };

      handle = BigInt(await this.marketContract.next!(handle));
    }

    return { orders, complete: true };
  }

  private async getMaxTradePrice(): Promise<bigint> {
    this.maxTradePrice ??= this.market.params?.maxTradePrice ?? BigInt(await this.marketContract.maxTradePrice!());

    return this.maxTradePrice;
  }

  private toQuoteUnits(amount: PerpQuoteAmount): bigint {
    return typeof amount === 'bigint' ? amount : quoteAmountToUnits(amount, this.market.quoteToken.decimals);
  }

  private toLots(size: BigNumber | bigint): bigint {
    return typeof size === 'bigint' ? size : sizeToLots(size, this.market.sizeDecimals);
  }

  /**
   * The transactions need a signer even when the wrapper was created with a provider only.
   */
  private requireSigner(): void {
    if (!this.signer)
      throw new Error('Signer is not set');
  }

  private async getSignerAddress(): Promise<string> {
    if (!this.signer)
      throw new Error('Signer is not set');

    return (await this.signer.getAddress()).toLowerCase();
  }

  private getOverrides(params: PerpTransactionParams) {
    const toBigInt = (value: BigNumber | bigint | undefined) => value === undefined ? undefined : typeof value === 'bigint' ? value : BigInt(value.toFixed(0));

    return {
      gasLimit: toBigInt(params.gasLimit),
      nonce: toBigInt(params.nonce),
      maxFeePerGas: toBigInt(params.maxFeePerGas),
      maxPriorityFeePerGas: toBigInt(params.maxPriorityFeePerGas),
    };
  }

  protected async processContractMethodCall(contract: Contract, methodCall: Promise<ContractTransactionResponse>): Promise<ContractTransactionResponse> {
    try {
      const tx = await methodCall;

      if (this.autoWaitTransaction) {
        if (this.fastWaitTransaction) {
          const startingTime = Date.now();
          let receipt = await tx.provider.getTransactionReceipt(tx.hash);

          while (receipt == null) {
            if (this.fastWaitTransactionTimeout && Date.now() - startingTime >= this.fastWaitTransactionTimeout)
              break; // timeout reached

            await wait(this.fastWaitTransactionInterval);
            receipt = await tx.provider.getTransactionReceipt(tx.hash);
          }

          if (receipt && receipt.status === 0)
            throw new Error(`Transaction reverted: ${tx.hash}`);
        }
        else {
          await tx.wait();
        }
      }

      return tx;
    }
    catch (error) {
      const data = (error as { data?: unknown }).data;
      if (typeof data === 'string' && data !== '0x') {
        const decodedError = contract.interface.parseError(data);
        if (decodedError)
          throw new TransactionFailedError(data, decodedError, { cause: error });
      }

      throw error;
    }
  }
}

const powerOfTen = (value: bigint, name: string): number => {
  const text = value.toString();
  if (!/^10*$/.test(text))
    throw new Error(`${name} (${text}) is not a power of ten: pass the scaling of the market explicitly`);

  return text.length - 1;
};

const erc20DecimalsAbi = [{ type: 'function', name: 'decimals', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' }];

const priceSourceAbi = [{
  type: 'function',
  name: 'latestPrice',
  inputs: [],
  outputs: [{ name: 'priceWad', type: 'uint256' }, { name: 'confWad', type: 'uint256' }, { name: 'publishTime', type: 'uint64' }],
  stateMutability: 'view',
}];
