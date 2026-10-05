import BigNumber from 'bignumber.js';
import { JsonRpcProvider, VoidSigner } from 'ethers';

import { encodePerpAccountId } from './accounts';
import { PERP_MOCK_MARKET_ID } from './mock';
import { OnchainLobPerps } from './onchainLobPerps';

const owner = '0x9c72ee4ef78d523da2b604214a7d29b983033234';

const createPerps = (options: { signer?: boolean } = {}) => {
  const provider = new JsonRpcProvider('http://localhost:1', 10143, { staticNetwork: true });
  const perps = new OnchainLobPerps({
    apiBaseUrl: 'https://example.test',
    webSocketApiBaseUrl: 'wss://example.test',
    signer: options.signer === false ? null : new VoidSigner(owner, provider),
    dataSource: 'mock',
    mock: { now: 1_791_198_360, seed: 5 },
    autoWaitTransaction: false,
  });

  return perps;
};

describe('OnchainLobPerps with the mock data source', () => {
  test('REST getters return the mapped models', async () => {
    const perps = createPerps();

    const [market] = await perps.getMarkets();
    expect(market!.id).toBe(PERP_MOCK_MARKET_ID);
    expect(market!.indexPrice).toBeInstanceOf(BigNumber);
    expect(typeof market!.baseLot).toBe('bigint');
    expect((await perps.getMarket({ market: PERP_MOCK_MARKET_ID })).name).toBe('WETH-tUSDC-PERP');
    await expect(perps.getMarket({ market: '0xdead' })).rejects.toThrow('Market not found');

    const positions = await perps.getPositions({ user: owner, status: 'open' });
    expect(positions).toHaveLength(1);
    expect(positions[0]!.rawSize).toBe(12000n);
    expect(positions[0]!.size).toEqual(new BigNumber('1.2'));

    const orderbook = await perps.getOrderbook({ market: PERP_MOCK_MARKET_ID });
    expect(orderbook.levels.bids[0]!.rawPrice).toBeLessThan(orderbook.levels.asks[0]!.rawPrice);
    expect((await perps.getTrades({ market: PERP_MOCK_MARKET_ID, limit: 3 }))).toHaveLength(3);
    expect((await perps.getCandles({ market: PERP_MOCK_MARKET_ID, resolution: '60', fromTime: (1_791_198_360 - 86400) * 1000, toTime: 1_791_198_360_000 })).length).toBeGreaterThan(10);
    expect((await perps.getOrders({ user: owner, status: 'all' }))).toHaveLength(4);
    expect((await perps.getFills({ user: owner }))[0]!.rawFee).toBe(300050n);
    expect((await perps.getFundingRates({ market: PERP_MOCK_MARKET_ID, limit: 2 }))[0]!.rateE15).toEqual(expect.any(BigInt));
    expect((await perps.getFundingPayments({ user: owner })).length).toBeGreaterThan(0);
    expect((await perps.getLiquidations({ market: PERP_MOCK_MARKET_ID })).length).toBeGreaterThan(0);
    expect((await perps.getCollateralHistory({ user: owner })).length).toBeGreaterThan(0);
    expect((await perps.getAccounts({ user: owner })).map(account => account.subaccount)).toEqual([0, 1]);
  });

  test('subscriptions emit mapped snapshots', () => {
    jest.useFakeTimers();
    const perps = createPerps({ signer: false });
    const market = jest.fn();
    const accounts = jest.fn();
    const trades = jest.fn();
    perps.events.perpMarketUpdated.addListener(market);
    perps.events.userPerpAccountsUpdated.addListener(accounts);
    perps.events.perpTradesUpdated.addListener(trades);

    perps.subscribeToPerpMarket({ market: PERP_MOCK_MARKET_ID });
    perps.subscribeToUserPerpAccounts({ user: owner });
    perps.subscribeToPerpTrades({ market: PERP_MOCK_MARKET_ID });
    jest.advanceTimersByTime(5);

    expect(market).toHaveBeenCalledWith(PERP_MOCK_MARKET_ID, true, expect.objectContaining({ rawIndexPrice: 300000n }));
    expect(accounts).toHaveBeenCalledWith('allMarkets', true, expect.any(Array));
    expect(accounts.mock.calls[0]![2][0].rawCollateral).toBe(1_485_000_000n);
    expect(trades.mock.calls[0]![2][0].price).toBeInstanceOf(BigNumber);

    perps[Symbol.dispose]();
    jest.useRealTimers();
  });

  test('transactions resolve the market from the data source and use the signer', async () => {
    const perps = createPerps();
    const contract = await perps.getMarketContract({ market: PERP_MOCK_MARKET_ID.toUpperCase().replace('0X', '0x') });
    expect(contract.market).toMatchObject({ id: PERP_MOCK_MARKET_ID, baseLot: 100000000000000n, quoteTick: 1n, sizeDecimals: 4, priceDecimals: 2 });
    expect(contract.market.quoteToken.decimals).toBe(6);

    const calls = await contract.buildCalls([{
      type: 'placeOrder',
      params: { account: { subaccount: 0 }, side: 'buy', price: new BigNumber('2998.5'), size: new BigNumber('0.5') },
    }]);
    expect(calls).toEqual([{ name: 'place', args: [encodePerpAccountId(owner, 0), true, 299850n, 5000n, 0, 0n, false, 0] }]);

    // the facade delegates to the wrapper of the market
    const placeOrder = jest.spyOn(contract, 'placeOrder').mockResolvedValue('tx' as never);
    const params = { market: PERP_MOCK_MARKET_ID, account: { subaccount: 0 }, side: 'sell' as const, price: 310000n, size: 100n };
    expect(await perps.placeOrder(params)).toBe('tx');
    expect(placeOrder).toHaveBeenCalledWith(params);
  });

  test('transactions need a signer; the contract wrappers are rebuilt after setSigner', async () => {
    const perps = createPerps({ signer: false });
    await expect(perps.deposit({ market: PERP_MOCK_MARKET_ID, account: 0n, amount: 1n })).rejects.toThrow('Signer is not set');

    perps.setSigner(new VoidSigner(owner, new JsonRpcProvider('http://localhost:1', 10143, { staticNetwork: true })));
    const first = await perps.getMarketContract({ market: PERP_MOCK_MARKET_ID });
    expect(await perps.getMarketContract({ market: PERP_MOCK_MARKET_ID })).toBe(first);

    perps.setSigner(null);
    await expect(perps.getMarketContract({ market: PERP_MOCK_MARKET_ID })).rejects.toThrow('Signer is not set');
  });

  test('is connected until disposed', () => {
    const perps = createPerps();
    expect(perps.isConnected).toBe(true);
    perps[Symbol.dispose]();
    expect(perps.isConnected).toBe(false);
  });
});
