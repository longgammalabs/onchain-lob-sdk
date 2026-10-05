import { JsonRpcProvider } from 'ethers';

import {
  calculateAdm, calculateAdmc, calculateRequirement, decodePerpAccountId, encodePerpAccountId, OnchainLobPerpMarketContract, PerpHealthState
} from '../../../src';

/**
 * Read-only checks of the SDK against the deployed perp market on Monad testnet (WETH-tUSDC-PERP).
 * Nothing is sent: the transactions are only simulated with `eth_call`.
 *
 * The RPC URL and the market can be overridden with PERPS_RPC_URL and PERPS_MARKET.
 */
const rpcUrl = process.env.PERPS_RPC_URL ?? 'https://testnet-rpc.monad.xyz';
const marketAddress = (process.env.PERPS_MARKET ?? '0x96F3f420D7479E21E66460F21A8cb422a8AE865d').toLowerCase();

jest.setTimeout(120_000);

const abs = (value: bigint) => value < 0n ? -value : value;

describe('Perps on-chain reads (Monad testnet)', () => {
  let provider: JsonRpcProvider;
  let contract: OnchainLobPerpMarketContract;

  beforeAll(async () => {
    // The public RPC rejects bursts: send the requests one by one.
    provider = new JsonRpcProvider(rpcUrl, 10143, { staticNetwork: true, batchMaxCount: 1 });
    contract = await OnchainLobPerpMarketContract.fromChain({ marketAddress, provider, baseDecimals: 18 });
  });

  test('market parameters and the derived display scaling', async () => {
    expect(contract.market).toMatchObject({
      id: marketAddress,
      baseLot: 100000000000000n,
      quoteTick: 1n,
      sizeDecimals: 4,
      priceDecimals: 2,
      quoteToken: { address: '0x0ad1630157f175f3813e5da0ebea8003684ebf10', decimals: 6 },
    });

    expect(await contract.getRiskParams()).toEqual({
      imrBps: 1000, fmrBps: 1000, mmrBps: 500, cmrBps: 750, collarBps: 300, makerFeeBps: 0, baseLot: 100000000000000n, quoteTick: 1n,
    });
  });

  test('market state', async () => {
    const state = await contract.getMarketState();

    expect(state.fundingRateE15).toBe(27777778n);
    expect(state.custody).toBeGreaterThan(0n);
    expect(state.insurance).toBeGreaterThan(0n);
    expect(typeof state.reduceOnly).toBe('boolean');
    expect(state.unresolvedDeficit).toBe(0n);
  });

  test('the order book is sorted by price priority and not crossed', async () => {
    const bids = await contract.getBookOrders({ bid: true, limit: 20 });
    const asks = await contract.getBookOrders({ bid: false, limit: 20 });

    for (let i = 1; i < bids.length; i++)
      expect(bids[i]!.price).toBeLessThanOrEqual(bids[i - 1]!.price);
    for (let i = 1; i < asks.length; i++)
      expect(asks[i]!.price).toBeGreaterThanOrEqual(asks[i - 1]!.price);
    for (const order of bids)
      expect(order.bid).toBe(true);
    for (const order of asks)
      expect(order.bid).toBe(false);
    if (bids[0] && asks[0])
      expect(bids[0].price).toBeLessThan(asks[0].price);
  });

  test('an account of a resting maker: live state, margin requirements and the SDK formulas', async () => {
    const bids = await contract.getBookOrders({ bid: true, limit: 5 });
    const asks = await contract.getBookOrders({ bid: false, limit: 5 });
    const maker = bids[0] ?? asks[0];
    if (!maker)
      return; // an empty book: nothing to check

    const state = await contract.getAccountState(maker.account);
    expect(decodePerpAccountId(maker.account)).toEqual({ owner: maker.owner, subaccount: maker.subaccount });
    expect(state.openOrders).toBeGreaterThan(0);
    expect(state.equity).toBe(state.collateral + state.unrealized - state.owedCharges);
    expect(state.adm).toBeGreaterThanOrEqual(state.admc);
    expect(state.admc).toBeGreaterThanOrEqual(state.mm);
    expect(Object.values(PerpHealthState)).toContain(state.state);

    // The SDK reproduces ADM/ADMc of the contract. The mark is not exposed by a getter, so look for the price (in ticks)
    // at which the SDK formulas give the on-chain ADM, and check that ADMc and MM agree with the same price.
    const risk = await contract.getRiskInput();
    const referenceTicks = (bids[0] ?? maker).price;
    let best: { ticks: bigint; error: bigint } | undefined;
    for (let ticks = referenceTicks - 10_000n; ticks <= referenceTicks + 10_000n; ticks++) {
      const error = abs(calculateAdm(state.size, state.qBid, state.qAsk, ticks * 10n ** 18n, risk) - state.adm);
      if (!best || error < best.error)
        best = { ticks, error };
    }
    // One tick moves ADM by less than 0.01% at a price of ~300000 ticks, so the mark (a fractional tick count) is within a tick.
    expect(best!.error * 10_000n).toBeLessThanOrEqual(state.adm);
    if (state.qBid + state.qAsk > 0n) {
      const priceX18 = best!.ticks * 10n ** 18n;
      expect(abs(calculateAdmc(state.size, state.qBid, state.qAsk, priceX18, risk) - state.admc) * 10_000n).toBeLessThanOrEqual(state.admc);
      expect(abs(calculateRequirement(state.size, priceX18, risk.mmrBps, 1n) - state.mm) * 10_000n).toBeLessThanOrEqual(state.mm);
    }
  });

  test('the calldata the SDK builds is accepted by the contract (eth_call simulation, nothing is sent)', async () => {
    const bids = await contract.getBookOrders({ bid: true, limit: 50 });
    const asks = await contract.getBookOrders({ bid: false, limit: 50 });
    const maker = bids[0] ?? asks[0];
    if (!maker || bids.length === 0)
      return;

    const from = maker.owner;
    const account = encodePerpAccountId(maker.owner, maker.subaccount);
    const simulate = async (call: Parameters<typeof contract.encodeCall>[0]) => provider.call({ from, to: marketAddress, data: contract.encodeCall(call) });

    // A reduce-only bid far below the market: always acceptable, even at a stale oracle. The handle is returned.
    const price = bids[bids.length - 1]!.price - 1000n;
    const unhinted = await contract.buildCalls([{ type: 'placeOrder', params: { account, side: 'buy', price, size: 1n, reduceOnly: true } }]);
    expect(BigInt(await simulate(unhinted[0]!))).toBeGreaterThan(0n);

    // the hint computed from the walked book is valid for the live contract
    const hinted = await contract.buildCalls([{ type: 'placeOrder', params: { account, side: 'buy', price, size: 1n, reduceOnly: true, autoHint: true } }]);
    expect(hinted[0]!.args[6]).toBe(true);
    expect(BigInt(await simulate(hinted[0]!))).toBeGreaterThan(0n);

    // a wrong hint is rejected by the contract (InvalidHint)
    const wrong = { ...unhinted[0]!, args: [...unhinted[0]!.args.slice(0, 5), 0n, true, ...unhinted[0]!.args.slice(7)] };
    await expect(simulate(wrong)).rejects.toThrow();

    // flags other than reduce-only are rejected
    const badFlags = { ...unhinted[0]!, args: [...unhinted[0]!.args.slice(0, 7), 2] };
    await expect(simulate(badFlags)).rejects.toThrow();

    // multicall of refreshPrice and a reduce-only place
    const batched = contract.encodeMulticall([{ name: 'refreshPrice', args: [] }, unhinted[0]!]);
    const result = await provider.call({ from, to: marketAddress, data: batched });
    expect(result.length).toBeGreaterThan(2);
  });
});
