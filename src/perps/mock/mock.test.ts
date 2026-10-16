import { OnchainLobPerpsMockService } from './onchainLobPerpsMockService';
import { OnchainLobPerpsMockWebSocketService } from './onchainLobPerpsMockWebSocketService';
import { PerpsMockDataSource, PERP_MOCK_MARKET_ID } from './perpsMockDataSource';
import { decodePerpAccountId } from '../accounts';

const user = '0x9c72ee4ef78d523da2b604214a7d29b983033234';
const options = { now: 1_791_198_360, seed: 3 };

describe('OnchainLobPerpsMockService', () => {
  const service = new OnchainLobPerpsMockService(options);

  test('market describes WETH-tUSDC-PERP at ~3000', async () => {
    const [market, ...rest] = await service.getMarkets({});
    expect(rest).toHaveLength(0);
    expect(market).toMatchObject({ id: PERP_MOCK_MARKET_ID, symbol: 'WETHtUSDCPERP', baseLot: '100000000000000', quoteTick: '1' });
    expect(Number(market!.indexPrice)).toBeCloseTo(3000, -1);
    expect(await service.getMarkets({ market: '0x0000000000000000000000000000000000000001' })).toEqual([]);
    expect(await service.getMarkets({ market: PERP_MOCK_MARKET_ID.toUpperCase().replace('0X', '0x') })).toHaveLength(1);
  });

  test('orderbook: sorted, not crossed, raw and human values agree', async () => {
    const { levels } = await service.getOrderbook({ market: PERP_MOCK_MARKET_ID });
    expect(levels.asks.length).toBeGreaterThanOrEqual(5);
    expect(levels.bids.length).toBeGreaterThanOrEqual(5);
    const asks = levels.asks.map(level => BigInt(level.rawPrice));
    const bids = levels.bids.map(level => BigInt(level.rawPrice));
    expect(asks).toEqual([...asks].sort((a, b) => a < b ? -1 : 1));
    expect(bids).toEqual([...bids].sort((a, b) => a > b ? -1 : 1));
    expect(bids[0]!).toBeLessThan(asks[0]!);
    for (const level of [...levels.asks, ...levels.bids]) {
      expect(Number(level.price) * 100).toBeCloseTo(Number(level.rawPrice), 6);
      expect(Number(level.size) * 10_000).toBeCloseTo(Number(level.rawSize), 6);
    }
  });

  test('trades are newest first and paginated', async () => {
    const trades = await service.getTrades({ market: PERP_MOCK_MARKET_ID });
    const timestamps = trades.map(trade => trade.timestamp);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
    expect(await service.getTrades({ market: PERP_MOCK_MARKET_ID, limit: 5, offset: 2 })).toEqual(trades.slice(2, 7));
    for (const trade of trades)
      expect(BigInt(trade.rawNotional)).toBe(BigInt(trade.rawPrice) * BigInt(trade.rawSize));
  });

  test('candles are like the spot ones: ms times, raw ticks and lots, OHLC-consistent, inside the requested range', async () => {
    const nowMs = options.now * 1000;
    const candles = await service.getCandles({ market: PERP_MOCK_MARKET_ID, resolution: '15', fromTime: nowMs - 86_400_000, toTime: nowMs });
    expect(candles.length).toBeGreaterThan(50);
    for (const candle of candles) {
      expect(BigInt(candle.high)).toBeGreaterThanOrEqual(BigInt(candle.open) > BigInt(candle.close) ? BigInt(candle.open) : BigInt(candle.close));
      expect(BigInt(candle.low)).toBeLessThanOrEqual(BigInt(candle.open) < BigInt(candle.close) ? BigInt(candle.open) : BigInt(candle.close));
      expect(candle.open).toMatch(/^\d+$/);
      expect(candle.volume).toMatch(/^\d+$/);
      expect(candle.resolution).toBe('15');
      expect(candle.time % 900_000).toBe(0);
      expect(candle.time).toBeGreaterThanOrEqual(nowMs - 86_400_000);
      expect(candle.time).toBeLessThanOrEqual(nowMs);
    }
    // without a range the latest candles are returned
    expect((await service.getCandles({ market: PERP_MOCK_MARKET_ID, resolution: '60' })).length).toBeGreaterThan(100);
  });

  test('orderbook grouping is in ticks: bids round down, asks round up', async () => {
    expect((await service.getMarkets({}))[0]!.aggregations).toEqual([1, 5, 10, 50, 100]);
    const { aggregation, levels } = await service.getOrderbook({ market: PERP_MOCK_MARKET_ID, aggregation: 50 });
    expect(aggregation).toBe(50);
    for (const level of [...levels.asks, ...levels.bids])
      expect(BigInt(level.rawPrice) % 50n).toBe(0n);
    expect(BigInt(levels.bids[0]!.rawPrice)).toBeLessThan(BigInt(levels.asks[0]!.rawPrice));
    expect((await service.getOrderbook({ market: PERP_MOCK_MARKET_ID })).aggregation).toBe(1);
  });

  test('user data is keyed by the requested user', async () => {
    const accounts = await service.getAccounts({ user });
    expect(accounts.map(account => decodePerpAccountId(account.account))).toEqual([{ owner: user, subaccount: 0 }, { owner: user, subaccount: 1 }]);

    const other = '0x1111111111111111111111111111111111111111';
    expect((await service.getAccounts({ user: other }))[0]!.owner).toBe(other);
  });

  test('one open position: entry price is |costBasis| / |size|', async () => {
    const open = await service.getPositions({ user, status: 'open' });
    expect(open).toHaveLength(1);
    const [position] = open;
    expect(position).toMatchObject({ status: 'open', side: 'long', subaccount: 0 });
    expect(Number(position!.entryPrice)).toBeCloseTo(Number(position!.costBasis) / Number(position!.size), 6);

    const all = await service.getPositions({ user, status: 'all' });
    expect(all.map(item => item.status)).toEqual(['open', 'closed']);
    expect(await service.getPositions({ user, status: 'closed' })).toHaveLength(1);
    expect(await service.getPositions({ user })).toHaveLength(2); // all statuses when omitted
  });

  test('orders can be filtered by status; remaining = original - filled for open orders', async () => {
    expect(await service.getOrders({ user })).toHaveLength(4); // all statuses when omitted
    const open = await service.getOrders({ user, status: 'open' });
    expect(open.map(order => order.status)).toEqual(['open', 'open']);
    for (const order of open)
      expect(BigInt(order.rawRemainingSize)).toBe(BigInt(order.rawOrigSize) - BigInt(order.rawFilledSize));
    expect((await service.getOrders({ user, status: 'all' }))).toHaveLength(4);
    expect(await service.getOrders({ user, status: 'cancelled' })).toHaveLength(1);
    expect(await service.getOrders({ user, status: 'all', limit: 1, offset: 3 })).toHaveLength(1);
  });

  test('funding history and the other user lists are populated', async () => {
    const rates = await service.getFundingRates({ market: PERP_MOCK_MARKET_ID, limit: 10 });
    expect(rates).toHaveLength(10);
    expect(await service.getFundingRates({ market: PERP_MOCK_MARKET_ID, fromTime: options.now - 7200 })).toHaveLength(2);
    expect((await service.getFundingPayments({ user })).length).toBeGreaterThan(0);
    expect((await service.getFills({ user })).length).toBeGreaterThan(0);
    expect((await service.getCollateralHistory({ user })).map(event => event.type)).toContain('transfer_in');
    expect((await service.getLiquidations({ market: PERP_MOCK_MARKET_ID })).length).toBeGreaterThan(0);
  });

  test('errors are rejected promises', async () => {
    await expect(service.getOrderbook({ market: '0xdead' })).rejects.toThrow('Market not found');
    await expect(service.getLiquidations({})).rejects.toThrow('Either user or market');
  });
});

describe('OnchainLobPerpsMockWebSocketService', () => {
  // Fake timers make the snapshot (setTimeout 0) and the simulation (setInterval) deterministic.
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const advance = (ms: number) => jest.advanceTimersByTime(ms);

  test('answers a subscription with a snapshot and stops after unsubscribe', () => {
    const socket = new OnchainLobPerpsMockWebSocketService(options);
    const markets = jest.fn();
    const orders = jest.fn();
    socket.events.perpMarketUpdated.addListener(markets);
    socket.events.userPerpOrdersUpdated.addListener(orders);

    socket.subscribeToPerpMarket({ market: PERP_MOCK_MARKET_ID });
    socket.subscribeToUserPerpOrders({ user });
    expect(markets).not.toHaveBeenCalled(); // asynchronous, like a real socket
    advance(1);

    expect(markets).toHaveBeenCalledTimes(1);
    expect(markets.mock.calls[0]![0]).toBe(PERP_MOCK_MARKET_ID);
    expect(markets.mock.calls[0]![1]).toBe(true);
    expect(orders).toHaveBeenCalledWith('allMarkets', true, expect.any(Array));
    expect(orders.mock.calls[0]![2]).toHaveLength(4); // open and recent orders of any status

    socket.unsubscribeFromPerpMarket({ market: PERP_MOCK_MARKET_ID });
    socket.subscribeToPerpMarket({ market: PERP_MOCK_MARKET_ID });
    advance(1);
    expect(markets).toHaveBeenCalledTimes(2);
    socket[Symbol.dispose]();
  });

  test('a snapshot that was not delivered yet is dropped by an unsubscribe', () => {
    const socket = new OnchainLobPerpsMockWebSocketService(options);
    const markets = jest.fn();
    socket.events.perpMarketUpdated.addListener(markets);
    socket.subscribeToPerpMarket({ market: PERP_MOCK_MARKET_ID });
    socket.unsubscribeFromPerpMarket({ market: PERP_MOCK_MARKET_ID });
    advance(10);
    expect(markets).not.toHaveBeenCalled();
    socket[Symbol.dispose]();
  });

  test('candles have no snapshot; the simulation updates the last candle with the market id', () => {
    const socket = new OnchainLobPerpsMockWebSocketService(new PerpsMockDataSource(options), 10);
    const candles = jest.fn();
    socket.events.perpCandlesUpdated.addListener(candles);
    socket.subscribeToPerpCandles({ market: PERP_MOCK_MARKET_ID, resolution: '60' });
    advance(5);
    expect(candles).not.toHaveBeenCalled();

    advance(10);
    expect(candles).toHaveBeenCalledTimes(1);
    expect(candles).toHaveBeenCalledWith(PERP_MOCK_MARKET_ID, false, expect.objectContaining({ resolution: '60', time: expect.any(Number) }));
    socket[Symbol.dispose]();
  });

  test('emits simulated updates only for active subscriptions and stops on dispose', () => {
    const socket = new OnchainLobPerpsMockWebSocketService(new PerpsMockDataSource(options), 10);
    const trades = jest.fn();
    const books = jest.fn();
    socket.events.perpTradesUpdated.addListener(trades);
    socket.events.perpOrderbookUpdated.addListener(books);

    socket.subscribeToPerpTrades({ market: PERP_MOCK_MARKET_ID });
    advance(1); // the snapshot
    expect(trades).toHaveBeenCalledTimes(1);
    advance(30);
    const updates = trades.mock.calls.filter(call => call[1] === false);
    expect(updates).toHaveLength(3);
    expect(updates[0]![2]).toHaveLength(1);
    expect(books).not.toHaveBeenCalled();

    socket[Symbol.dispose]();
    const count = trades.mock.calls.length;
    advance(100);
    expect(trades.mock.calls.length).toBe(count);
    expect(socket.isConnected).toBe(false);
  });

  test('the simulation stops when the last subscription is removed', () => {
    const socket = new OnchainLobPerpsMockWebSocketService(new PerpsMockDataSource(options), 10);
    const trades = jest.fn();
    socket.events.perpTradesUpdated.addListener(trades);
    socket.subscribeToPerpTrades({ market: PERP_MOCK_MARKET_ID });
    advance(21);
    socket.unsubscribeFromPerpTrades({ market: PERP_MOCK_MARKET_ID });
    const count = trades.mock.calls.length;
    advance(100);
    expect(trades.mock.calls.length).toBe(count);
    expect(jest.getTimerCount()).toBe(0);
    socket[Symbol.dispose]();
  });

  test('reconnect does nothing: the mock has no socket and keeps its subscriptions', () => {
    const socket = new OnchainLobPerpsMockWebSocketService(new PerpsMockDataSource(options), 10);
    const trades = jest.fn();
    socket.events.perpTradesUpdated.addListener(trades);

    socket.reconnect(); // never subscribed: no timers, no events
    expect(jest.getTimerCount()).toBe(0);
    expect(trades).not.toHaveBeenCalled();

    socket.subscribeToPerpTrades({ market: PERP_MOCK_MARKET_ID });
    advance(1);
    const count = trades.mock.calls.length;
    socket.reconnect();
    advance(1);
    expect(trades.mock.calls.length).toBe(count); // no second snapshot
    advance(10);
    expect(trades.mock.calls.length).toBe(count + 1); // the subscription is kept
    socket[Symbol.dispose]();
  });

  test('tick moves the shared state seen by the REST mock', async () => {
    const dataSource = new PerpsMockDataSource(options);
    const service = new OnchainLobPerpsMockService(dataSource);
    const before = (await service.getTrades({ market: PERP_MOCK_MARKET_ID })).length;
    const { trade } = dataSource.tick();

    const after = await service.getTrades({ market: PERP_MOCK_MARKET_ID });
    expect(after).toHaveLength(before + 1);
    expect(after[0]).toEqual(trade);
  });
});
