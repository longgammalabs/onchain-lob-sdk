import type { ContractTransactionResponse } from 'ethers';
import type { Signer } from 'ethers/providers';

import * as mappers from './mappers';
import { OnchainLobPerpMarketContract } from './onchainLobPerpMarketContract';
import { OnchainLobPerpsMockService, OnchainLobPerpsMockWebSocketService, PerpsMockDataSource, type PerpsMockOptions } from './mock';
import type {
  ApproveQuoteTokenPerpParams, CancelAllOrdersPerpParams, CancelOrderPerpParams, DepositPerpParams, FaucetPerpParams,
  ForceCancelPerpParams, GetPerpAccountOverviewParams, GetPerpAccountStateParams, GetPerpAccountsParams, GetPerpBookOrdersParams,
  GetPerpCandlesParams, GetPerpCollateralHistoryParams, GetPerpFillsParams, GetPerpFundingPaymentsParams, GetPerpFundingRatesParams,
  GetPerpLiquidationsParams, GetPerpMarketStateParams, GetPerpMarketsParams, GetPerpOperatorParams, GetPerpOraclePriceParams,
  GetPerpOrderbookParams, GetPerpOrdersParams, GetPerpPositionsParams, GetPerpQuoteAllowanceParams, GetPerpQuoteBalanceParams,
  GetPerpRiskParamsParams, GetPerpTradesParams, LiquidatePerpParams, MulticallPerpParams, OpenAccountPerpParams, PlaceOrderPerpParams,
  RefreshFundingPerpParams, RefreshPricePerpParams, ReplaceOrdersPerpParams, SetOperatorPerpParams, SubscribeToPerpCandlesParams,
  SubscribeToPerpMarketParams, SubscribeToPerpOrderbookParams, SubscribeToPerpTradesParams, SubscribeToUserPerpAccountsParams,
  SubscribeToUserPerpCollateralParams, SubscribeToUserPerpFillsParams, SubscribeToUserPerpOrdersParams, TakeOrderPerpParams,
  TransferPerpParams, UnsubscribeFromPerpCandlesParams, UnsubscribeFromPerpMarketParams, UnsubscribeFromPerpOrderbookParams,
  UnsubscribeFromPerpTradesParams, UnsubscribeFromUserPerpAccountsParams, UnsubscribeFromUserPerpCollateralParams,
  UnsubscribeFromUserPerpFillsParams, UnsubscribeFromUserPerpOrdersParams, WithdrawPerpParams
} from './params';
import { EventEmitter, type PublicEventEmitter, type ToEventEmitter } from '../common';
import { getErrorLogMessage } from '../logging';
import type {
  PerpAccount, PerpAccountOverview, PerpAccountState, PerpAccountUpdate, PerpBookOrder, PerpCandle, PerpCandleUpdate, PerpCollateralEvent,
  PerpCollateralEventUpdate, PerpFill, PerpFillUpdate, PerpFundingPayment, PerpFundingRate, PerpLiquidation, PerpMarket, PerpMarketState,
  PerpMarketUpdate, PerpOrder, PerpOrderUpdate, PerpOrderbook, PerpOrderbookUpdate, PerpPosition, PerpRiskParams, PerpTrade, PerpTradeUpdate
} from '../models';
import {
  OnchainLobPerpsService, OnchainLobPerpsWebSocketService,
  type IOnchainLobPerpsService, type IOnchainLobPerpsWebSocketService
} from '../services';

/**
 * Options for configuring the OnchainLobPerps instance.
 *
 * @interface OnchainLobPerpsOptions
 */
export interface OnchainLobPerpsOptions {
  /**
   * The base URL for the Onchain LOB API. The perps endpoints are mounted under `/perps`.
   */
  apiBaseUrl: string;

  /**
   * The base URL for the Onchain LOB WebSocket API.
   */
  webSocketApiBaseUrl: string;

  /**
   * The ethers signer used for signing transactions.
   * For only http/ws operations, you can set this to null.
   */
  signer: Signer | null;

  /**
   * Where the REST and WebSocket data come from.
   * - `'api'` (default): the Onchain LOB API;
   * - `'mock'`: fixtures of WETH-tUSDC-PERP, no network is used for the data (`apiBaseUrl` and `webSocketApiBaseUrl` are ignored).
   *   The transactions still go to the chain through the signer.
   *
   * @default 'api'
   */
  dataSource?: 'api' | 'mock';

  /**
   * Options of the mock data source (`dataSource: 'mock'`).
   */
  mock?: PerpsMockOptions;

  /**
   * Whether to connect to the WebSocket immediately after creating the OnchainLobPerps (true)
   * or when the first subscription is called (false).
   * By default, the WebSocket is connected immediately.
   */
  webSocketConnectImmediately?: boolean;

  /**
   * Whether to automatically wait for transactions to be confirmed.
   */
  autoWaitTransaction?: boolean;

  /**
   * Whether to use a fast algorithm for waiting for transaction to be confirmed.
   */
  fastWaitTransaction?: boolean;

  /**
   * Interval between requests in milliseconds when using a fast algorithm for waiting for transaction confirmations.
   */
  fastWaitTransactionInterval?: number;

  /**
   * Timeout in milliseconds when using a fast algorithm for waiting for transaction confirmations.
   */
  fastWaitTransactionTimeout?: number;
}

/**
 * Events are emitted when data related to subscriptions is updated.
 */
export interface OnchainLobPerpsEvents {
  /** Emitted when a market is updated. */
  perpMarketUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpMarketUpdate]>;
  /** Emitted when markets are updated (the `allPerpMarkets` channel). */
  allPerpMarketsUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: PerpMarketUpdate[]]>;
  /** Emitted when the orderbook of a market is updated. */
  perpOrderbookUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpOrderbookUpdate]>;
  /** Emitted when the trades of a market are updated. */
  perpTradesUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpTradeUpdate[]]>;
  /** Emitted when the candles are updated. The id is `${market}-${resolution}`, see `parsePerpCandlesChannelId`. */
  perpCandlesUpdated: PublicEventEmitter<readonly [id: string, isSnapshot: boolean, data: PerpCandleUpdate[]]>;
  /** Emitted when the accounts (positions) of a user are updated. The id is the market or `allMarkets`. */
  userPerpAccountsUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpAccountUpdate[]]>;
  /** Emitted when the orders of a user are updated. */
  userPerpOrdersUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpOrderUpdate[]]>;
  /** Emitted when the fills of a user are updated. */
  userPerpFillsUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpFillUpdate[]]>;
  /** Emitted when the collateral events (deposits, withdrawals, transfers) of a user are updated. */
  userPerpCollateralUpdated: PublicEventEmitter<readonly [marketId: string, isSnapshot: boolean, data: PerpCollateralEventUpdate[]]>;
  /** Emitted when there is an error related to a subscription. */
  subscriptionError: PublicEventEmitter<readonly [error: string]>;
}

/**
 * The OnchainLobPerps is a class for interacting with the perpetual futures of Onchain LOB.
 * It provides methods for retrieving market, account, order and history data, subscribing to updates,
 * and sending transactions (deposits, orders, withdrawals, liquidations) to the PerpMarket contracts.
 * Use the {@link OnchainLobPerps#events} property to handle subscription events.
 */
export class OnchainLobPerps implements Disposable {
  /**
   * The events related to subscriptions.
   */
  readonly events: OnchainLobPerpsEvents = {
    perpMarketUpdated: new EventEmitter(),
    allPerpMarketsUpdated: new EventEmitter(),
    perpOrderbookUpdated: new EventEmitter(),
    perpTradesUpdated: new EventEmitter(),
    perpCandlesUpdated: new EventEmitter(),
    userPerpAccountsUpdated: new EventEmitter(),
    userPerpOrdersUpdated: new EventEmitter(),
    userPerpFillsUpdated: new EventEmitter(),
    userPerpCollateralUpdated: new EventEmitter(),
    subscriptionError: new EventEmitter(),
  };

  /** Whether transactions are automatically waited for. */
  autoWaitTransaction: boolean | undefined;
  fastWaitTransaction: boolean | undefined;
  fastWaitTransactionInterval: number | undefined;
  fastWaitTransactionTimeout: number | undefined;

  protected signer: Signer | null;
  protected readonly onchainLobService: IOnchainLobPerpsService;
  protected readonly onchainLobWebSocketService: IOnchainLobPerpsWebSocketService;
  protected readonly mappers: typeof mappers;
  private marketContracts: Map<string, OnchainLobPerpMarketContract> = new Map();
  private readonly cachedMarkets: Map<string, PerpMarket> = new Map();
  private cachedMarketsPromise: Promise<Map<string, PerpMarket>> | undefined = undefined;

  constructor(options: Readonly<OnchainLobPerpsOptions>) {
    this.signer = options.signer;
    this.autoWaitTransaction = options.autoWaitTransaction;
    this.fastWaitTransaction = options.fastWaitTransaction;
    this.fastWaitTransactionInterval = options.fastWaitTransactionInterval;
    this.fastWaitTransactionTimeout = options.fastWaitTransactionTimeout;
    this.mappers = mappers;

    if (options.dataSource === 'mock') {
      const dataSource = new PerpsMockDataSource(options.mock);
      this.onchainLobService = new OnchainLobPerpsMockService(dataSource);
      this.onchainLobWebSocketService = new OnchainLobPerpsMockWebSocketService(dataSource, options.mock?.updateIntervalMs);
    }
    else {
      this.onchainLobService = new OnchainLobPerpsService(options.apiBaseUrl);
      this.onchainLobWebSocketService = new OnchainLobPerpsWebSocketService(options.webSocketApiBaseUrl, options.webSocketConnectImmediately);
    }

    this.attachEvents();
  }

  /**
   * Sets a new signer for the OnchainLobPerps instance.
   *
   * @param signer - The new signer to be set. For only http/ws operations, you can set this to null.
   * @returns The OnchainLobPerps instance for method chaining.
   */
  setSigner(signer: Signer | null): OnchainLobPerps {
    this.signer = signer;
    this.marketContracts = new Map();

    return this;
  }

  // ---- REST --------------------------------------------------------------------------------------------------

  /**
   * Retrieves the perp markets. The result refreshes the cache the transactions use.
   */
  async getMarkets(params: GetPerpMarketsParams = {}): Promise<PerpMarket[]> {
    const markets = (await this.onchainLobService.getMarkets(params)).map(this.mappers.mapPerpMarketDtoToPerpMarket);
    for (const market of markets)
      this.cachedMarkets.set(market.id, market);

    return markets;
  }

  /**
   * Retrieves one perp market by its contract address.
   */
  async getMarket(params: { market: string }): Promise<PerpMarket> {
    const [market] = await this.getMarkets({ market: params.market });
    if (!market)
      throw new Error(`Market not found by the ${params.market} address`);

    return market;
  }

  async getOrderbook(params: GetPerpOrderbookParams): Promise<PerpOrderbook> {
    return this.mappers.mapPerpOrderbookDtoToPerpOrderbook(await this.onchainLobService.getOrderbook(params));
  }

  async getTrades(params: GetPerpTradesParams): Promise<PerpTrade[]> {
    return (await this.onchainLobService.getTrades(params)).map(this.mappers.mapPerpTradeDtoToPerpTrade);
  }

  async getCandles(params: GetPerpCandlesParams): Promise<PerpCandle[]> {
    return (await this.onchainLobService.getCandles(params)).map(this.mappers.mapPerpCandleDtoToPerpCandle);
  }

  /**
   * Retrieves the accounts of a user, one per subaccount including the closed ones.
   */
  async getAccounts(params: GetPerpAccountsParams): Promise<PerpAccount[]> {
    return (await this.onchainLobService.getAccounts(params)).map(this.mappers.mapPerpAccountDtoToPerpAccount);
  }

  async getPositions(params: GetPerpPositionsParams): Promise<PerpPosition[]> {
    return (await this.onchainLobService.getPositions(params)).map(this.mappers.mapPerpPositionDtoToPerpPosition);
  }

  async getOrders(params: GetPerpOrdersParams): Promise<PerpOrder[]> {
    return (await this.onchainLobService.getOrders(params)).map(this.mappers.mapPerpOrderDtoToPerpOrder);
  }

  async getFills(params: GetPerpFillsParams): Promise<PerpFill[]> {
    return (await this.onchainLobService.getFills(params)).map(this.mappers.mapPerpFillDtoToPerpFill);
  }

  async getFundingRates(params: GetPerpFundingRatesParams): Promise<PerpFundingRate[]> {
    return (await this.onchainLobService.getFundingRates(params)).map(this.mappers.mapPerpFundingRateDtoToPerpFundingRate);
  }

  async getFundingPayments(params: GetPerpFundingPaymentsParams): Promise<PerpFundingPayment[]> {
    return (await this.onchainLobService.getFundingPayments(params)).map(this.mappers.mapPerpFundingPaymentDtoToPerpFundingPayment);
  }

  /**
   * Retrieves the liquidations of a user or of a market. Either `user` or `market` is required.
   */
  async getLiquidations(params: GetPerpLiquidationsParams): Promise<PerpLiquidation[]> {
    return (await this.onchainLobService.getLiquidations(params)).map(this.mappers.mapPerpLiquidationDtoToPerpLiquidation);
  }

  async getCollateralHistory(params: GetPerpCollateralHistoryParams): Promise<PerpCollateralEvent[]> {
    return (await this.onchainLobService.getCollateralHistory(params)).map(this.mappers.mapPerpCollateralEventDtoToPerpCollateralEvent);
  }

  // ---- on-chain reads ----------------------------------------------------------------------------------------

  /**
   * Reads the live on-chain state of an account (equity, margin requirements, health, oracle freshness).
   */
  async getAccountState(params: GetPerpAccountStateParams): Promise<PerpAccountState> {
    return (await this.getPerpMarketContract(params)).getAccountState(params.account);
  }

  /**
   * Reads the live on-chain state of an account and derives the entry, mark, liquidation and bankruptcy prices.
   */
  async getAccountOverview(params: GetPerpAccountOverviewParams): Promise<PerpAccountOverview> {
    return (await this.getPerpMarketContract(params)).getAccountOverview(params.account);
  }

  async getMarketState(params: GetPerpMarketStateParams): Promise<PerpMarketState> {
    return (await this.getPerpMarketContract(params)).getMarketState();
  }

  async getRiskParams(params: GetPerpRiskParamsParams): Promise<PerpRiskParams> {
    return (await this.getPerpMarketContract(params)).getRiskParams();
  }

  /**
   * Reads one side of the on-chain book by walking it (`head`/`next`/`order`).
   */
  async getBookOrders(params: GetPerpBookOrdersParams): Promise<PerpBookOrder[]> {
    return (await this.getPerpMarketContract(params)).getBookOrders(params);
  }

  /**
   * Reads the operator permissions an owner granted to an operator.
   */
  async getOperator(params: GetPerpOperatorParams): Promise<{ permissions: number; expiry: number }> {
    const contract = await this.getPerpMarketContract(params);

    return contract.getOperator(params.owner ?? await this.getSignerAddress(), params.operator);
  }

  /** The balance of the collateral token of the wallet (raw units). */
  async getQuoteBalance(params: GetPerpQuoteBalanceParams): Promise<bigint> {
    return (await this.getPerpMarketContract(params)).getQuoteBalance(params.owner);
  }

  /** The allowance of the collateral token given to the market (raw units). */
  async getQuoteAllowance(params: GetPerpQuoteAllowanceParams): Promise<bigint> {
    return (await this.getPerpMarketContract(params)).getQuoteAllowance(params.owner);
  }

  /** The price of the oracle adapter of the market. Throws when the adapter reverts. */
  async getOraclePrice(params: GetPerpOraclePriceParams): Promise<{ priceWad: bigint; confWad: bigint; publishTime: number }> {
    return (await this.getPerpMarketContract(params)).getOraclePrice();
  }

  // ---- transactions ------------------------------------------------------------------------------------------

  /**
   * Approves the collateral token for the market contract. Not needed before {@link deposit}: it checks the allowance itself.
   */
  async approveQuoteToken(params: ApproveQuoteTokenPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).approveQuoteToken(params);
  }

  /** Mints the faucet amount of the collateral token (test tokens only). */
  async faucetQuoteToken(params: FaucetPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).faucetQuoteToken(params);
  }

  /** Opens an account (a subaccount of the signer). */
  async openAccount(params: OpenAccountPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).openAccount(params);
  }

  /** Deposits the collateral token into an account, approving the missing allowance first. */
  async deposit(params: DepositPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).deposit(params);
  }

  /** Withdraws the collateral from an account to its owner. */
  async withdraw(params: WithdrawPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).withdraw(params);
  }

  /** Moves collateral between two accounts of the same owner. */
  async transfer(params: TransferPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).transfer(params);
  }

  /** Places a resting (post-only) limit order. */
  async placeOrder(params: PlaceOrderPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).placeOrder(params);
  }

  /** Takes liquidity from the book: an IOC or a market order. */
  async takeOrder(params: TakeOrderPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).takeOrder(params);
  }

  /** Cancels an order by its handle. */
  async cancelOrder(params: CancelOrderPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).cancelOrder(params);
  }

  /** Cancels all the orders of an account. */
  async cancelAllOrders(params: CancelAllOrdersPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).cancelAllOrders(params);
  }

  /** Replaces or cancels several orders in one call (`replaceBatch`). */
  async replaceOrders(params: ReplaceOrdersPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).replaceOrders(params);
  }

  /** Liquidates an account that is below the maintenance margin. */
  async liquidate(params: LiquidatePerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).liquidate(params);
  }

  /** Cancels the open orders of an account in the forced-cancel (or worse) health state. */
  async forceCancel(params: ForceCancelPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).forceCancel(params);
  }

  /** Refreshes the cached oracle price of the market. */
  async refreshPrice(params: RefreshPricePerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).refreshPrice(params);
  }

  /** Accrues the funding and refreshes the funding rate of the market. */
  async refreshFunding(params: RefreshFundingPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).refreshFunding(params);
  }

  /** Grants or revokes operator permissions. */
  async setOperator(params: SetOperatorPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).setOperator(params);
  }

  /** Sends several actions in one transaction. */
  async multicall(params: MulticallPerpParams): Promise<ContractTransactionResponse> {
    return (await this.getPerpMarketContract(params)).multicall(params);
  }

  /**
   * Returns the contract wrapper of a market for the calls the facade does not cover.
   * Requires the signer.
   */
  async getMarketContract(params: { market: string }): Promise<OnchainLobPerpMarketContract> {
    return this.getPerpMarketContract(params);
  }

  // ---- WebSocket ---------------------------------------------------------------------------------------------

  /**
   * Whether the perps WebSocket connection is currently open.
   */
  get isConnected(): boolean {
    return this.onchainLobWebSocketService.isConnected;
  }

  /**
   * Forces an immediate reconnect of the perps WebSocket, preserving all active subscriptions.
   */
  reconnect(): void {
    this.onchainLobWebSocketService.reconnect();
  }

  subscribeToPerpMarket(params: SubscribeToPerpMarketParams): void {
    this.onchainLobWebSocketService.subscribeToPerpMarket(params);
  }

  unsubscribeFromPerpMarket(params: UnsubscribeFromPerpMarketParams): void {
    this.onchainLobWebSocketService.unsubscribeFromPerpMarket(params);
  }

  subscribeToAllPerpMarkets(): void {
    this.onchainLobWebSocketService.subscribeToAllPerpMarkets();
  }

  unsubscribeFromAllPerpMarkets(): void {
    this.onchainLobWebSocketService.unsubscribeFromAllPerpMarkets();
  }

  subscribeToPerpOrderbook(params: SubscribeToPerpOrderbookParams): void {
    this.onchainLobWebSocketService.subscribeToPerpOrderbook(params);
  }

  unsubscribeFromPerpOrderbook(params: UnsubscribeFromPerpOrderbookParams): void {
    this.onchainLobWebSocketService.unsubscribeFromPerpOrderbook(params);
  }

  subscribeToPerpTrades(params: SubscribeToPerpTradesParams): void {
    this.onchainLobWebSocketService.subscribeToPerpTrades(params);
  }

  unsubscribeFromPerpTrades(params: UnsubscribeFromPerpTradesParams): void {
    this.onchainLobWebSocketService.unsubscribeFromPerpTrades(params);
  }

  subscribeToPerpCandles(params: SubscribeToPerpCandlesParams): void {
    this.onchainLobWebSocketService.subscribeToPerpCandles(params);
  }

  unsubscribeFromPerpCandles(params: UnsubscribeFromPerpCandlesParams): void {
    this.onchainLobWebSocketService.unsubscribeFromPerpCandles(params);
  }

  subscribeToUserPerpAccounts(params: SubscribeToUserPerpAccountsParams): void {
    this.onchainLobWebSocketService.subscribeToUserPerpAccounts(params);
  }

  unsubscribeFromUserPerpAccounts(params: UnsubscribeFromUserPerpAccountsParams): void {
    this.onchainLobWebSocketService.unsubscribeFromUserPerpAccounts(params);
  }

  subscribeToUserPerpOrders(params: SubscribeToUserPerpOrdersParams): void {
    this.onchainLobWebSocketService.subscribeToUserPerpOrders(params);
  }

  unsubscribeFromUserPerpOrders(params: UnsubscribeFromUserPerpOrdersParams): void {
    this.onchainLobWebSocketService.unsubscribeFromUserPerpOrders(params);
  }

  subscribeToUserPerpFills(params: SubscribeToUserPerpFillsParams): void {
    this.onchainLobWebSocketService.subscribeToUserPerpFills(params);
  }

  unsubscribeFromUserPerpFills(params: UnsubscribeFromUserPerpFillsParams): void {
    this.onchainLobWebSocketService.unsubscribeFromUserPerpFills(params);
  }

  subscribeToUserPerpCollateral(params: SubscribeToUserPerpCollateralParams): void {
    this.onchainLobWebSocketService.subscribeToUserPerpCollateral(params);
  }

  unsubscribeFromUserPerpCollateral(params: UnsubscribeFromUserPerpCollateralParams): void {
    this.onchainLobWebSocketService.unsubscribeFromUserPerpCollateral(params);
  }

  [Symbol.dispose](): void {
    this.detachEvents();
    this.onchainLobWebSocketService[Symbol.dispose]();
  }

  // ---- internals ---------------------------------------------------------------------------------------------

  protected async ensureMarket(params: { market: string }): Promise<PerpMarket> {
    const markets = await this.getCachedMarkets();
    const market = markets.get(params.market.toLowerCase());
    if (!market)
      throw new Error(`Market not found by the ${params.market} address`);

    return market;
  }

  protected async getCachedMarkets(): Promise<Map<string, PerpMarket>> {
    if (this.cachedMarkets.size)
      return this.cachedMarkets;

    // Concurrent callers share one request.
    this.cachedMarketsPromise ??= this.getMarkets()
      .then(() => this.cachedMarkets)
      .finally(() => {
        this.cachedMarketsPromise = undefined;
      });

    return this.cachedMarketsPromise;
  }

  protected async getPerpMarketContract(params: { market: string }): Promise<OnchainLobPerpMarketContract> {
    if (this.signer === null)
      throw new Error('Signer is not set');

    const key = params.market.toLowerCase();
    let marketContract = this.marketContracts.get(key);
    if (!marketContract) {
      const market = await this.ensureMarket(params);
      marketContract = new OnchainLobPerpMarketContract({
        market,
        signer: this.signer,
        autoWaitTransaction: this.autoWaitTransaction,
        fastWaitTransaction: this.fastWaitTransaction,
        fastWaitTransactionInterval: this.fastWaitTransactionInterval,
        fastWaitTransactionTimeout: this.fastWaitTransactionTimeout,
      });
      this.marketContracts.set(key, marketContract);
    }

    return marketContract;
  }

  private async getSignerAddress(): Promise<string> {
    if (this.signer === null)
      throw new Error('Signer is not set');

    return (await this.signer.getAddress()).toLowerCase();
  }

  protected attachEvents(): void {
    const events = this.onchainLobWebSocketService.events;
    events.perpMarketUpdated.addListener(this.onPerpMarketUpdated);
    events.allPerpMarketsUpdated.addListener(this.onAllPerpMarketsUpdated);
    events.perpOrderbookUpdated.addListener(this.onPerpOrderbookUpdated);
    events.perpTradesUpdated.addListener(this.onPerpTradesUpdated);
    events.perpCandlesUpdated.addListener(this.onPerpCandlesUpdated);
    events.userPerpAccountsUpdated.addListener(this.onUserPerpAccountsUpdated);
    events.userPerpOrdersUpdated.addListener(this.onUserPerpOrdersUpdated);
    events.userPerpFillsUpdated.addListener(this.onUserPerpFillsUpdated);
    events.userPerpCollateralUpdated.addListener(this.onUserPerpCollateralUpdated);
    events.subscriptionError.addListener(this.onSubscriptionError);
  }

  protected detachEvents(): void {
    const events = this.onchainLobWebSocketService.events;
    events.perpMarketUpdated.removeListener(this.onPerpMarketUpdated);
    events.allPerpMarketsUpdated.removeListener(this.onAllPerpMarketsUpdated);
    events.perpOrderbookUpdated.removeListener(this.onPerpOrderbookUpdated);
    events.perpTradesUpdated.removeListener(this.onPerpTradesUpdated);
    events.perpCandlesUpdated.removeListener(this.onPerpCandlesUpdated);
    events.userPerpAccountsUpdated.removeListener(this.onUserPerpAccountsUpdated);
    events.userPerpOrdersUpdated.removeListener(this.onUserPerpOrdersUpdated);
    events.userPerpFillsUpdated.removeListener(this.onUserPerpFillsUpdated);
    events.userPerpCollateralUpdated.removeListener(this.onUserPerpCollateralUpdated);
    events.subscriptionError.removeListener(this.onSubscriptionError);
  }

  private safely(action: () => void) {
    try {
      action();
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  }

  protected onPerpMarketUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['perpMarketUpdated']['addListener']>[0] = (marketId, isSnapshot, data) => {
    this.safely(() => {
      const market = this.mappers.mapPerpMarketDtoToPerpMarket(data);
      this.cachedMarkets.set(market.id, market);
      (this.events.perpMarketUpdated as ToEventEmitter<typeof this.events.perpMarketUpdated>).emit(marketId, isSnapshot, market);
    });
  };

  protected onAllPerpMarketsUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['allPerpMarketsUpdated']['addListener']>[0] = (isSnapshot, data) => {
    this.safely(() => {
      const markets = data.map(this.mappers.mapPerpMarketDtoToPerpMarket);
      for (const market of markets)
        this.cachedMarkets.set(market.id, market);
      (this.events.allPerpMarketsUpdated as ToEventEmitter<typeof this.events.allPerpMarketsUpdated>).emit(isSnapshot, markets);
    });
  };

  protected onPerpOrderbookUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['perpOrderbookUpdated']['addListener']>[0] = (marketId, isSnapshot, data) => {
    this.safely(() => {
      (this.events.perpOrderbookUpdated as ToEventEmitter<typeof this.events.perpOrderbookUpdated>).emit(marketId, isSnapshot, this.mappers.mapPerpOrderbookDtoToPerpOrderbook(data));
    });
  };

  protected onPerpTradesUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['perpTradesUpdated']['addListener']>[0] = (marketId, isSnapshot, data) => {
    this.safely(() => {
      (this.events.perpTradesUpdated as ToEventEmitter<typeof this.events.perpTradesUpdated>).emit(marketId, isSnapshot, data.map(this.mappers.mapPerpTradeDtoToPerpTrade));
    });
  };

  protected onPerpCandlesUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['perpCandlesUpdated']['addListener']>[0] = (id, isSnapshot, data) => {
    this.safely(() => {
      (this.events.perpCandlesUpdated as ToEventEmitter<typeof this.events.perpCandlesUpdated>).emit(id, isSnapshot, data.map(this.mappers.mapPerpCandleDtoToPerpCandle));
    });
  };

  protected onUserPerpAccountsUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['userPerpAccountsUpdated']['addListener']>[0] = (marketId, isSnapshot, data) => {
    this.safely(() => {
      (this.events.userPerpAccountsUpdated as ToEventEmitter<typeof this.events.userPerpAccountsUpdated>).emit(marketId, isSnapshot, data.map(this.mappers.mapPerpAccountDtoToPerpAccount));
    });
  };

  protected onUserPerpOrdersUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['userPerpOrdersUpdated']['addListener']>[0] = (marketId, isSnapshot, data) => {
    this.safely(() => {
      (this.events.userPerpOrdersUpdated as ToEventEmitter<typeof this.events.userPerpOrdersUpdated>).emit(marketId, isSnapshot, data.map(this.mappers.mapPerpOrderDtoToPerpOrder));
    });
  };

  protected onUserPerpFillsUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['userPerpFillsUpdated']['addListener']>[0] = (marketId, isSnapshot, data) => {
    this.safely(() => {
      (this.events.userPerpFillsUpdated as ToEventEmitter<typeof this.events.userPerpFillsUpdated>).emit(marketId, isSnapshot, data.map(this.mappers.mapPerpFillDtoToPerpFill));
    });
  };

  protected onUserPerpCollateralUpdated: Parameters<IOnchainLobPerpsWebSocketService['events']['userPerpCollateralUpdated']['addListener']>[0] = (marketId, isSnapshot, data) => {
    this.safely(() => {
      (this.events.userPerpCollateralUpdated as ToEventEmitter<typeof this.events.userPerpCollateralUpdated>).emit(marketId, isSnapshot, data.map(this.mappers.mapPerpCollateralEventDtoToPerpCollateralEvent));
    });
  };

  protected onSubscriptionError: Parameters<IOnchainLobPerpsWebSocketService['events']['subscriptionError']['addListener']>[0] = error => {
    (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(error);
  };
}
