import BigNumber from 'bignumber.js';

import { encodePerpAccountId } from '../accounts';
import type { CandleResolution } from '../../models';
import type {
  GetPerpAccountsParams, GetPerpCandlesParams, GetPerpCollateralHistoryParams, GetPerpFillsParams, GetPerpFundingPaymentsParams,
  GetPerpFundingRatesParams, GetPerpLiquidationsParams, GetPerpMarketsParams, GetPerpOrderbookParams, GetPerpOrdersParams,
  GetPerpPositionsParams, GetPerpTradesParams, PerpAccountDto, PerpCandleDto, PerpCollateralEventDto, PerpFillDto, PerpFundingPaymentDto,
  PerpFundingRateDto, PerpLevelDto, PerpLiquidationDto, PerpMarketDto, PerpOrderbookDto, PerpOrderDto, PerpPositionDto, PerpTradeDto
} from '../../services/onchainLobPerpsService';

/**
 * The fixture-backed data of the perps mock. It describes WETH-tUSDC-PERP of Monad testnet
 * (baseLot 1e14 = 0.0001 WETH, quoteTick 1, tUSDC with 6 decimals) at ~3000 tUSDC per WETH:
 * `size = lots / 1e4`, `price = ticks / 1e2`, quote amounts are `raw / 1e6`.
 *
 * Every user gets the same account fixtures: subaccount 0 holds an open long, subaccount 1 is closed.
 */

export const PERP_MOCK_MARKET_ID = '0x96f3f420d7479e21e66460f21a8cb422a8ae865d';
export const PERP_MOCK_QUOTE_TOKEN = '0x0ad1630157f175f3813e5da0ebea8003684ebf10';
export const PERP_MOCK_CHAIN_ID = 10143;

const SIZE_DECIMALS = 4;
const PRICE_DECIMALS = 2;
const QUOTE_DECIMALS = 6;
const TICK = 1; // quoteTick
const HOUR = 3600;

export interface PerpsMockOptions {
  /** The "current" unix time in seconds of the fixtures. Defaults to the real time. */
  now?: number;
  /** The seed of the pseudo-random walk of prices. */
  seed?: number;
  /** When set (> 0), the WebSocket mock emits simulated updates (a trade, the market, the orderbook) with this period, ms. */
  updateIntervalMs?: number;
}

export interface PerpsMockTick {
  market: PerpMarketDto;
  orderbook: PerpOrderbookDto;
  trade: PerpTradeDto;
}

const dec = (raw: bigint | number, decimals: number): string => new BigNumber(raw.toString()).shiftedBy(-decimals).toFixed();
const sizeOf = (lots: bigint | number) => ({ size: dec(lots, SIZE_DECIMALS), rawSize: lots.toString() });
const priceOf = (ticks: bigint | number) => ({ price: dec(ticks, PRICE_DECIMALS), rawPrice: ticks.toString() });
const quote = (units: bigint | number): string => dec(units, QUOTE_DECIMALS);

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const RESOLUTION_SECONDS: Record<CandleResolution, number> = {
  '1': 60,
  '5': 300,
  '15': 900,
  '60': 3600,
  '240': 14400,
  '1D': 86400,
};

const addressFromSeed = (index: number): string => '0x' + (BigInt(index) * 0x9e3779b97f4a7c15n * 0x2545f4914f6cdd1dn).toString(16).padStart(40, '0').slice(-40);

/**
 * The state of the mock: it answers the REST requests and produces the simulated updates for the WebSocket mock.
 */
export class PerpsMockDataSource {
  readonly marketId = PERP_MOCK_MARKET_ID;

  private readonly now: number;
  private readonly random: () => number;
  private indexTicks = 300000n;
  private bestBidTicks = 299850n;
  private bestAskTicks = 300150n;
  private lastTicks = 299950n;
  private tradeCounter = 0;
  private readonly trades: PerpTradeDto[] = [];

  constructor(options: PerpsMockOptions = {}) {
    this.now = options.now ?? Math.floor(Date.now() / 1000);
    this.random = mulberry32(options.seed ?? 1);
    // Newest first.
    for (let i = 0; i < 30; i++)
      this.trades.push(this.createTrade(this.now - i * 45 - 7));
    this.lastTicks = BigInt(this.trades[0]!.rawPrice);
  }

  getMarkets(params: GetPerpMarketsParams = {}): PerpMarketDto[] {
    return !params.market || params.market.toLowerCase() === this.marketId ? [this.createMarket()] : [];
  }

  getOrderbook(params: GetPerpOrderbookParams): PerpOrderbookDto {
    this.ensureMarket(params.market);

    return this.createOrderbook(params.aggregation, params.limit);
  }

  getTrades(params: GetPerpTradesParams): PerpTradeDto[] {
    this.ensureMarket(params.market);

    return page(this.trades, params.limit, params.offset);
  }

  getCandles(params: GetPerpCandlesParams): PerpCandleDto[] {
    this.ensureMarket(params.market);
    const step = RESOLUTION_SECONDS[params.resolution];
    if (!step)
      throw new Error(`Unknown resolution: ${params.resolution}`);

    const stepMs = step * 1000;
    const nowMs = this.now * 1000;
    const candles: PerpCandleDto[] = [];
    const from = params.fromTime ?? nowMs - 400 * stepMs;
    const to = Math.min(params.toTime ?? nowMs, nowMs);
    // The walk is anchored to the current price and generated backwards from "now", so that candles
    // of different requests are consistent with each other and the last close is the last price.
    const lastSlot = Math.floor(nowMs / stepMs) * stepMs;
    const firstSlot = lastSlot - 400 * stepMs;
    let price = Number(this.lastTicks);
    const series: PerpCandleDto[] = [];
    for (let time = lastSlot; time >= firstSlot; time -= stepMs) {
      const random = mulberry32((time / 1000) ^ 0x5bd1e995);
      const close = price;
      const open = close * (1 + (random() - 0.5) * 0.004 * Math.sqrt(step / 60));
      const high = Math.max(open, close) * (1 + random() * 0.002);
      const low = Math.min(open, close) * (1 - random() * 0.002);
      series.push({
        time,
        // Like the spot candles: raw ticks and raw lots, the time in ms.
        open: Math.round(open).toString(),
        high: Math.round(high).toString(),
        low: Math.round(low).toString(),
        close: Math.round(close).toString(),
        volume: Math.round(random() * 40000 + 2000).toString(),
        resolution: params.resolution,
      });
      price = open;
    }
    series.reverse();
    for (const candle of series) {
      if (candle.time >= from && candle.time <= to)
        candles.push(candle);
    }

    return candles;
  }

  getAccounts(params: GetPerpAccountsParams): PerpAccountDto[] {
    this.ensureOptionalMarket(params.market);

    return [this.createOpenAccount(params.user), this.createClosedAccount(params.user)];
  }

  getPositions(params: GetPerpPositionsParams): PerpPositionDto[] {
    const status = params.status ?? 'all';

    return this.getAccounts(params)
      .map(account => ({ ...account, status: account.rawSize === '0' ? 'closed' as const : 'open' as const }))
      .filter(position => status === 'all' || position.status === status);
  }

  getOrders(params: GetPerpOrdersParams): PerpOrderDto[] {
    this.ensureOptionalMarket(params.market);
    const status = params.status ?? 'all';
    const orders = this.createOrders(params.user).filter(order => status === 'all' || order.status === status);

    return page(orders, params.limit, params.offset);
  }

  getFills(params: GetPerpFillsParams): PerpFillDto[] {
    this.ensureOptionalMarket(params.market);

    return page(this.createFills(params.user), params.limit, params.offset);
  }

  getFundingRates(params: GetPerpFundingRatesParams): PerpFundingRateDto[] {
    this.ensureMarket(params.market);
    const rates: PerpFundingRateDto[] = [];
    const lastHour = Math.floor(this.now / HOUR) * HOUR;
    for (let i = 0; i < 72; i++) {
      const timestamp = lastHour - i * HOUR;
      if ((params.fromTime && timestamp < params.fromTime) || (params.toTime && timestamp > params.toTime))
        continue;
      const rateE15 = Math.round(27777778 * (0.2 + 0.8 * Math.abs(Math.sin(i / 5))) * (Math.cos(i / 9) > -0.4 ? 1 : -1));
      rates.push({
        marketId: this.marketId,
        rate: new BigNumber(rateE15).shiftedBy(-15).toFixed(),
        rateE15: rateE15.toString(),
        cLong: (29438250244 - i * 120000).toString(),
        cShort: (-29438250230 + i * 120000).toString(),
        timestamp,
        txnHash: hash(0xf000 + i),
      });
    }

    return rates.slice(0, params.limit ?? rates.length);
  }

  getFundingPayments(params: GetPerpFundingPaymentsParams): PerpFundingPaymentDto[] {
    this.ensureOptionalMarket(params.market);
    const owner = params.user.toLowerCase();
    const payments: PerpFundingPaymentDto[] = [];
    const lastHour = Math.floor(this.now / HOUR) * HOUR;
    for (let i = 0; i < 12; i++) {
      // 1.2 WETH long at ~3000: 0.01%/h ~ 0.36 tUSDC per hour paid by the long, sometimes received.
      const rawAmount = i % 5 === 4 ? -210000 : 360000 + i * 1500;
      payments.push({
        marketId: this.marketId,
        account: encodePerpAccountId(owner, 0).toString(),
        owner,
        amount: quote(rawAmount),
        rawAmount: rawAmount.toString(),
        positionSize: dec(12000, SIZE_DECIMALS),
        timestamp: lastHour - i * HOUR,
        txnHash: hash(0xe000 + i),
      });
    }

    return page(payments, params.limit, params.offset);
  }

  getLiquidations(params: GetPerpLiquidationsParams): PerpLiquidationDto[] {
    this.ensureOptionalMarket(params.market);
    const user = params.user?.toLowerCase();
    const liquidations: PerpLiquidationDto[] = [0, 1].map(i => {
      const victimOwner = user ?? addressFromSeed(7 + i);
      const lots = i === 0 ? 20000n : 5000n;
      const ticks = i === 0 ? 281000n : 318000n;
      const notional = lots * ticks * BigInt(TICK);

      return {
        marketId: this.marketId,
        victim: encodePerpAccountId(victimOwner, i).toString(),
        victimOwner,
        liquidator: encodePerpAccountId(addressFromSeed(99), 0).toString(),
        liquidatorOwner: addressFromSeed(99),
        lots: (i === 0 ? lots : -lots).toString(),
        size: dec(i === 0 ? lots : -lots, SIZE_DECIMALS),
        transferNotional: quote(notional),
        penalty: quote(notional / 200n),
        outcome: i === 0 ? 0 : 1,
        deficitCovered: null,
        timestamp: this.now - (i + 1) * 5 * HOUR,
        txnHash: hash(0xd000 + i),
      };
    });

    return page(liquidations, params.limit, params.offset);
  }

  getCollateralHistory(params: GetPerpCollateralHistoryParams): PerpCollateralEventDto[] {
    this.ensureOptionalMarket(params.market);
    const owner = params.user.toLowerCase();
    const event = (index: number, subaccount: number, type: PerpCollateralEventDto['type'], rawAmount: number, hoursAgo: number): PerpCollateralEventDto => ({
      marketId: this.marketId,
      account: encodePerpAccountId(owner, subaccount).toString(),
      owner,
      subaccount,
      type,
      amount: quote(rawAmount),
      rawAmount: rawAmount.toString(),
      counterparty: type === 'transfer_in' ? encodePerpAccountId(owner, 1).toString() : null,
      recipient: type === 'withdraw' ? owner : type === 'transfer_out' ? encodePerpAccountId(owner, 0).toString() : null,
      timestamp: this.now - hoursAgo * HOUR,
      txnHash: hash(0xc000 + index),
    });
    const events = [
      event(0, 0, 'deposit', 500_000_000, 6),
      event(1, 1, 'transfer_out', 250_000_000, 30),
      event(2, 0, 'transfer_in', 250_000_000, 30),
      event(3, 0, 'deposit', 1_000_000_000, 72),
      event(4, 1, 'withdraw', 100_000_000, 96),
    ];

    return page(events, params.limit, params.offset);
  }

  /**
   * Moves the simulated market one step: a random-walk of the prices and one new trade.
   * The next calls of the getters return the updated state.
   */
  tick(): PerpsMockTick {
    const drift = BigInt(Math.round((this.random() - 0.5) * 120));
    this.indexTicks += drift;
    this.bestBidTicks = this.indexTicks - 150n + BigInt(Math.round(this.random() * 20) - 10);
    this.bestAskTicks = this.indexTicks + 150n + BigInt(Math.round(this.random() * 20) - 10);
    const trade = this.createTrade(Math.floor(Date.now() / 1000));
    this.trades.unshift(trade);
    this.trades.length = Math.min(this.trades.length, 200);

    return { market: this.createMarket(), orderbook: this.createOrderbook(), trade };
  }

  private createTrade(timestamp: number): PerpTradeDto {
    const buy = this.random() > 0.5;
    const ticks = buy ? this.bestAskTicks : this.bestBidTicks;
    const lots = BigInt(Math.round(this.random() * 4000) + 100);
    const notional = lots * ticks * BigInt(TICK);
    const index = this.tradeCounter++;
    this.lastTicks = ticks;

    return {
      id: `${hash(0xa000 + index)}-${index % 7}`,
      marketId: this.marketId,
      makerHandle: (4294967297n + BigInt(index % 12)).toString(),
      side: buy ? 'buy' : 'sell',
      ...priceOf(ticks),
      ...sizeOf(lots),
      notional: quote(notional),
      rawNotional: notional.toString(),
      fee: quote(notional * 5n / 10000n),
      rawFee: (notional * 5n / 10000n).toString(),
      timestamp,
      txnHash: hash(0xa000 + index),
      blockNumber: 68_300_000 + index,
    };
  }

  private createMarket(): PerpMarketDto {
    const lastTicks = this.lastTicks;
    const price24h = 295000n;

    return {
      id: this.marketId,
      name: 'WETH-tUSDC-PERP',
      symbol: 'WETHtUSDCPERP',
      chainId: PERP_MOCK_CHAIN_ID,
      baseSymbol: 'WETH',
      quoteToken: { address: PERP_MOCK_QUOTE_TOKEN, symbol: 'tUSDC', decimals: QUOTE_DECIMALS, name: 'Test USDC' },
      baseLot: '100000000000000',
      quoteTick: '1',
      sizeDecimals: SIZE_DECIMALS,
      priceDecimals: PRICE_DECIMALS,
      aggregations: [1, 5, 10, 50, 100],
      params: {
        imrBps: 1000,
        fmrBps: 1000,
        mmrBps: 500,
        cmrBps: 750,
        collarBps: 300,
        takerFeeBps: 5,
        makerFeeBps: 0,
        liqBonusBps: 250,
        liqPenaltyBps: 50,
        closeFactorBps: 5000,
        recoveryBufferBps: 50,
        maxOracleAge: 3600,
        maxConfBps: 100,
        maxFundingRateE15: 27777778,
        oiCap: '1000000',
        maxPositionLots: '100000',
        smallPositionLots: '100',
        maxTradePrice: '3000000',
        maxLeverage: 10,
      },
      priceSource: '0x405a0c15fdd3769e1b2d4af95097f6eba829bee2',
      fundingSource: '0x0b8f0da06b4c1ee7dd7bc56b87f76a1194fd80aa',
      indexPrice: dec(this.indexTicks, PRICE_DECIMALS),
      rawIndexPrice: this.indexTicks.toString(),
      indexPriceTime: this.now - 12,
      lastPrice: dec(lastTicks, PRICE_DECIMALS),
      rawLastPrice: lastTicks.toString(),
      bestBid: dec(this.bestBidTicks, PRICE_DECIMALS),
      bestAsk: dec(this.bestAskTicks, PRICE_DECIMALS),
      price24h: dec(price24h, PRICE_DECIMALS),
      change24h: new BigNumber((lastTicks - price24h).toString()).div(price24h.toString()).toFixed(6),
      volume24h: dec(12_504_000n, SIZE_DECIMALS),
      quoteVolume24h: quote(3_751_200_000_000n),
      openInterest: dec(853_000n, SIZE_DECIMALS),
      rawOpenInterest: '853000',
      fundingRate: new BigNumber(27777778).shiftedBy(-15).toFixed(),
      fundingRateE15: '27777778',
      fundingRateTime: Math.floor(this.now / HOUR) * HOUR,
      cLong: '29438250244',
      cShort: '-29438250230',
      fundingSaturated: false,
      insurance: quote(1_996_508_656n),
      rawInsurance: '1996508656',
      unresolvedDeficit: '0',
      rawUnresolvedDeficit: '0',
      reduceOnly: false,
      lastTouched: this.now,
    };
  }

  private createOrderbook(aggregation = 1, limit = 15): PerpOrderbookDto {
    // Grouping in ticks: bids round down, asks round up (like the API). Levels of one group are summed.
    const step = BigInt(Math.max(aggregation, 1));
    const levels = (side: 'asks' | 'bids'): PerpLevelDto[] => {
      const isAsk = side === 'asks';
      const direction = isAsk ? 1n : -1n;
      const best = isAsk ? this.bestAskTicks : this.bestBidTicks;
      const groups = new Map<bigint, bigint>();
      for (let i = 0; i < 60; i++) {
        const ticks = best + direction * BigInt(i) * 25n;
        const floor = (ticks / step) * step;
        const bucket = isAsk && floor !== ticks ? floor + step : floor;
        const lots = BigInt(1000 + ((i * 7919 + (isAsk ? 13 : 29)) % 9) * 450);
        groups.set(bucket, (groups.get(bucket) ?? 0n) + lots);
      }

      return [...groups.entries()]
        .sort(([a], [b]) => a < b ? (isAsk ? -1 : 1) : (isAsk ? 1 : -1))
        .slice(0, Math.min(limit, 12))
        .map(([ticks, lots]) => ({ ...priceOf(ticks), ...sizeOf(lots) }));
    };

    return {
      marketId: this.marketId,
      timestamp: Math.floor(Date.now() / 1000),
      aggregation,
      levels: { asks: levels('asks'), bids: levels('bids') },
    };
  }

  private createOpenAccount(user: string): PerpAccountDto {
    const owner = user.toLowerCase();
    const lots = 12000n; // 1.2 WETH long
    const entryTicks = 295000n;
    const costBasis = lots * entryTicks * BigInt(TICK);

    return {
      marketId: this.marketId,
      account: encodePerpAccountId(owner, 0).toString(),
      owner,
      subaccount: 0,
      kind: 3,
      ...sizeOf(lots),
      side: 'long',
      costBasis: quote(costBasis),
      rawCostBasis: costBasis.toString(),
      entryPrice: dec(entryTicks, PRICE_DECIMALS),
      collateral: quote(1_485_000_000n),
      rawCollateral: '1485000000',
      realizedPnl: quote(12_500_000n),
      rawRealizedPnl: '12500000',
      chargesSettled: quote(2_340_000n),
      rawChargesSettled: '2340000',
      chargeSnap: '29438250244',
      totalDeposited: quote(1_500_000_000n),
      totalWithdrawn: '0',
      feesPaid: quote(3_450_000n),
      epoch: 0,
      liquidated: false,
      createdAt: this.now - 3 * 86400,
      updatedAt: this.now - 1800,
    };
  }

  private createClosedAccount(user: string): PerpAccountDto {
    const owner = user.toLowerCase();

    return {
      marketId: this.marketId,
      account: encodePerpAccountId(owner, 1).toString(),
      owner,
      subaccount: 1,
      kind: 3,
      size: '0',
      rawSize: '0',
      side: null,
      costBasis: '0',
      rawCostBasis: '0',
      entryPrice: null,
      collateral: quote(150_000_000n),
      rawCollateral: '150000000',
      realizedPnl: quote(-8_750_000n),
      rawRealizedPnl: '-8750000',
      chargesSettled: quote(410_000n),
      rawChargesSettled: '410000',
      chargeSnap: '0',
      totalDeposited: quote(250_000_000n),
      totalWithdrawn: quote(100_000_000n),
      feesPaid: quote(1_100_000n),
      epoch: 1,
      liquidated: false,
      createdAt: this.now - 5 * 86400,
      updatedAt: this.now - 2 * 86400,
    };
  }

  private createOrders(user: string): PerpOrderDto[] {
    const owner = user.toLowerCase();
    const account = encodePerpAccountId(owner, 0).toString();
    const order = (
      index: number,
      side: 'buy' | 'sell',
      ticks: bigint,
      lots: bigint,
      filled: bigint,
      status: PerpOrderDto['status'],
      options: { reduceOnly?: boolean; expiry?: number | null; removeReason?: number | null; hoursAgo: number }
    ): PerpOrderDto => {
      const handle = (4294967310n + BigInt(index)).toString();
      const txnHash = hash(0xb000 + index);
      const reduceOnly = options.reduceOnly ?? false;

      return {
        id: `${this.marketId}-${handle}-${txnHash}`,
        marketId: this.marketId,
        handle,
        account,
        owner,
        subaccount: 0,
        side,
        flags: (side === 'buy' ? 1 : 0) | 2 | (reduceOnly ? 4 : 0),
        postOnly: true,
        reduceOnly,
        ...priceOf(ticks),
        origSize: dec(lots, SIZE_DECIMALS),
        rawOrigSize: lots.toString(),
        filledSize: dec(filled, SIZE_DECIMALS),
        rawFilledSize: filled.toString(),
        remainingSize: dec(status === 'open' ? lots - filled : 0n, SIZE_DECIMALS),
        rawRemainingSize: (status === 'open' ? lots - filled : 0n).toString(),
        expiry: options.expiry ?? null,
        status,
        removeReason: options.removeReason ?? null,
        createdAt: this.now - options.hoursAgo * HOUR,
        updatedAt: this.now - Math.max(options.hoursAgo - 1, 0) * HOUR,
        txnHash,
      };
    };

    return [
      order(0, 'buy', 290000n, 5000n, 0n, 'open', { hoursAgo: 2 }),
      order(1, 'sell', 310000n, 3000n, 1000n, 'open', { reduceOnly: true, expiry: this.now + 86400, hoursAgo: 1 }),
      order(2, 'buy', 295000n, 12000n, 12000n, 'filled', { hoursAgo: 70, removeReason: 9 }),
      order(3, 'sell', 305000n, 4000n, 0n, 'cancelled', { hoursAgo: 20, removeReason: 0 }),
    ];
  }

  private createFills(user: string): PerpFillDto[] {
    const owner = user.toLowerCase();
    const account = encodePerpAccountId(owner, 0).toString();
    const fill = (index: number, role: 'maker' | 'taker', side: 'buy' | 'sell', ticks: bigint, lots: bigint, hoursAgo: number, realized = 0n, isLiquidation = false): PerpFillDto => {
      const notional = lots * ticks * BigInt(TICK);
      const fee = role === 'taker' ? notional * 5n / 10000n : 0n;

      return {
        id: `${hash(0x9000 + index)}-${index}`,
        marketId: this.marketId,
        account,
        owner,
        subaccount: 0,
        role,
        side,
        orderHandle: role === 'maker' ? (4294967310n + BigInt(index)).toString() : null,
        ...priceOf(ticks),
        ...sizeOf(lots),
        notional: quote(notional),
        rawNotional: notional.toString(),
        fee: quote(fee),
        rawFee: fee.toString(),
        realizedPnl: quote(realized),
        rawRealizedPnl: realized.toString(),
        isLiquidation,
        timestamp: this.now - hoursAgo * HOUR,
        txnHash: hash(0x9000 + index),
      };
    };

    return [
      fill(0, 'taker', 'buy', 300050n, 2000n, 1),
      fill(1, 'maker', 'buy', 295000n, 12000n, 70),
      fill(2, 'taker', 'sell', 304000n, 6000n, 80, 54_000_000n),
      fill(3, 'taker', 'buy', 298000n, 6000n, 90),
    ];
  }

  private ensureMarket(market: string) {
    if (market.toLowerCase() !== this.marketId)
      throw new Error(`Market not found by the ${market} address`);
  }

  private ensureOptionalMarket(market: string | undefined) {
    if (market)
      this.ensureMarket(market);
  }
}

const hash = (n: number): string => '0x' + n.toString(16).padStart(64, '0');

const page = <T>(items: T[], limit?: number, offset = 0): T[] =>
  items.slice(offset, limit === undefined ? undefined : offset + limit);
