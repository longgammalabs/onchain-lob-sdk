import BigNumber from 'bignumber.js';
import { Interface, JsonRpcProvider, VoidSigner, id } from 'ethers';

import { encodePerpAccountId } from './accounts';
import { OnchainLobPerpMarketContract, type PerpMarketConfig } from './onchainLobPerpMarketContract';
import { perpMarketAbi } from '../abi';
import { PerpHealthState } from '../models';
import { TransactionFailedError } from '../spot/errors';

const iface = new Interface(perpMarketAbi);
const owner = '0x9c72ee4ef78d523da2b604214a7d29b983033234';
const account = encodePerpAccountId(owner, 0);
const noOverrides = { gasLimit: undefined, nonce: undefined, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined };

// WETH-tUSDC-PERP of Monad testnet
const market: PerpMarketConfig = {
  id: '0x96f3f420d7479e21e66460f21a8cb422a8ae865d',
  quoteToken: { address: '0x0ad1630157f175f3813e5da0ebea8003684ebf10', decimals: 6 },
  baseLot: 100000000000000n,
  quoteTick: 1n,
  sizeDecimals: 4,
  priceDecimals: 2,
};

const accountView = (overrides: Partial<Record<string, unknown>> = {}) => ({
  epoch: 0n, openOrders: 0n, collateral: 1_000_000_000n, size: 0n, costBasis: 0n, owedCharges: 0n, unrealized: 0n,
  equity: 1_000_000_000n, adm: 0n, mm: 0n, qBid: 0n, qAsk: 0n, state: BigInt(PerpHealthState.Healthy), oracleFresh: true, admc: 0n,
  ...overrides,
});

/** The words of a book node, the same layout `order(handle)` returns. */
const nodeWords = (price: bigint, lots: bigint, bid: boolean, nodeOwner = owner, sub = 0n, reduceOnly = false): [bigint, bigint] => [
  price | (lots << 64n) | (((bid ? 3n : 2n) | (reduceOnly ? 4n : 0n)) << 192n),
  BigInt(nodeOwner) | (sub << 160n) | (1n << 176n),
];

const makeSut = (options: { signer?: boolean; autoWait?: boolean; realProcess?: boolean } = {}) => {
  const provider = new JsonRpcProvider('http://localhost:1', 10143, { staticNetwork: true });
  const signer = options.signer === false ? null : new VoidSigner(owner, provider);
  const sut = new OnchainLobPerpMarketContract({ market, signer, provider, autoWaitTransaction: options.autoWait ?? false }) as any;

  const stub: any = {
    interface: iface,
    perpAccount: jest.fn(() => Promise.resolve(accountView())),
    maxTradePrice: jest.fn(() => Promise.resolve(3_000_000n)),
    head: jest.fn(),
    next: jest.fn(),
    order: jest.fn(),
    riskParams: jest.fn(() => Promise.resolve({ imrBps: 1000, fmrBps: 1000, mmrBps: 500, cmrBps: 750, collarBps: 300, makerFeeBps: 0, baseLot: market.baseLot, quoteTick: 1n })),
  };
  for (const name of ['openAccount', 'deposit', 'withdraw', 'transfer', 'place', 'take', 'cancel', 'cancelAll', 'replaceBatch', 'liquidate', 'forceCancel', 'refreshPrice', 'refreshFunding', 'setOperator', 'multicall'])
    stub[name] = jest.fn(() => Promise.resolve(`${name} tx`));
  sut.marketContract = stub;

  const token: any = {
    allowance: jest.fn(() => Promise.resolve(0n)),
    approve: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
    balanceOf: jest.fn(() => Promise.resolve(5n)),
  };
  sut.quoteTokenContract = token;
  sut.devnetTokenContract = { faucet: jest.fn(() => Promise.resolve('faucet tx')) };
  const calls: unknown[] = [];
  if (!options.realProcess) {
    sut.processContractMethodCall = jest.fn(async (_contract: unknown, call: Promise<unknown>) => {
      const result = await call;
      calls.push(result);

      return result;
    });
  }

  return { sut, stub, token, calls };
};

/** Decodes the calls of a `multicall` argument. */
const decodeMulticall = (calldata: string[]) => calldata.map(data => {
  const parsed = iface.parseTransaction({ data })!;

  return { name: parsed.name, args: [...parsed.args] };
});

describe('construction', () => {
  test('requires a signer or a provider', () => {
    expect(() => new OnchainLobPerpMarketContract({ market })).toThrow('Either a signer or a provider is required');
  });

  test('a read-only wrapper cannot send transactions', async () => {
    const { sut } = makeSut({ signer: false });
    await expect(sut.placeOrder({ account, side: 'buy', price: 299850n, size: 1n })).rejects.toThrow('Signer is not set');
  });
});

describe('placeOrder', () => {
  test('a limit buy: human price and size are converted to ticks and lots', async () => {
    const { sut, stub } = makeSut();
    const tx = await sut.placeOrder({ account, side: 'buy', price: new BigNumber('2998.5'), size: new BigNumber('0.5') });

    expect(tx).toBe('place tx');
    expect(stub.place).toHaveBeenCalledWith(account, true, 299850n, 5000n, 0, 0n, false, 0, noOverrides);
    expect(stub.multicall).not.toHaveBeenCalled();
  });

  test('prices round to the passive side: a buy down, a sell up; the size rounds down to a lot', async () => {
    const { sut, stub } = makeSut();
    await sut.placeOrder({ account, side: 'buy', price: new BigNumber('2998.519'), size: new BigNumber('0.00019') });
    await sut.placeOrder({ account, side: 'sell', price: new BigNumber('2998.501'), size: new BigNumber('0.00019') });

    expect(stub.place.mock.calls[0]!.slice(1, 4)).toEqual([true, 299851n, 1n]);
    expect(stub.place.mock.calls[1]!.slice(1, 4)).toEqual([false, 299851n, 1n]);
  });

  test('raw values are passed as they are; account may be a reference to the signer subaccount', async () => {
    const { sut, stub } = makeSut();
    await sut.placeOrder({ account: { subaccount: 3 }, side: 'sell', price: 310000n, size: 20n, expiry: 1_800_000_000 });

    expect(stub.place).toHaveBeenCalledWith(encodePerpAccountId(owner, 3), false, 310000n, 20n, 1_800_000_000, 0n, false, 0, noOverrides);
  });

  test('reduce-only sets the flag and never needs a fresh oracle', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.placeOrder({ account, side: 'sell', price: 310000n, size: 20n, reduceOnly: true });

    expect(stub.place).toHaveBeenCalledWith(account, false, 310000n, 20n, 0, 0n, false, 4, noOverrides);
    expect(stub.multicall).not.toHaveBeenCalled();
    expect(stub.perpAccount).not.toHaveBeenCalled();
  });

  test('a stale oracle: refreshPrice and place go in one multicall', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    const tx = await sut.placeOrder({ account, side: 'buy', price: 299850n, size: 5000n, gasLimit: 250000n });

    expect(tx).toBe('multicall tx');
    expect(stub.place).not.toHaveBeenCalled();
    const [calldata, overrides] = stub.multicall!.mock.calls[0]! as [string[], unknown];
    expect(overrides).toEqual({ ...noOverrides, gasLimit: 250000n });
    expect(calldata).toEqual([
      iface.encodeFunctionData('refreshPrice'),
      iface.encodeFunctionData('place', [account, true, 299850n, 5000n, 0, 0n, false, 0]),
    ]);
  });

  test('refreshPrice: true always refreshes, false never', async () => {
    const { sut, stub } = makeSut();
    await sut.placeOrder({ account, side: 'buy', price: 299850n, size: 1n, refreshPrice: true });
    expect(decodeMulticall(stub.multicall!.mock.calls[0]![0]).map(call => call.name)).toEqual(['refreshPrice', 'place']);

    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.placeOrder({ account, side: 'buy', price: 299850n, size: 1n, refreshPrice: false });
    expect(stub.place).toHaveBeenCalledTimes(1);
  });

  test('hinted: prev is passed with hinted = true (also for the head, prev = 0)', async () => {
    const { sut, stub } = makeSut();
    await sut.placeOrder({ account, side: 'buy', price: 299850n, size: 1n, prev: 4294967308n });
    await sut.placeOrder({ account, side: 'buy', price: 299850n, size: 1n, prev: 0n });

    expect(stub.place.mock.calls[0]!.slice(5, 7)).toEqual([4294967308n, true]);
    expect(stub.place.mock.calls[1]!.slice(5, 7)).toEqual([0n, true]);
  });

  test('autoHint walks the book and links after the last order with priority', async () => {
    const { sut, stub } = makeSut();
    // the bids of the deployed book: 299850, 299550, 299550, 299250
    const nodes = new Map<bigint, [bigint, bigint]>([
      [4294967308n, nodeWords(299850n, 1000n, true)],
      [4294967305n, nodeWords(299550n, 500n, true)],
      [4294967309n, nodeWords(299550n, 500n, true)],
      [4294967304n, nodeWords(299250n, 1000n, true)],
    ]);
    const chain = [4294967308n, 4294967305n, 4294967309n, 4294967304n];
    stub.head!.mockResolvedValue(chain[0]);
    stub.order!.mockImplementation((handle: bigint) => Promise.resolve(nodes.get(handle)));
    stub.next!.mockImplementation((handle: bigint) => Promise.resolve(chain[chain.indexOf(handle) + 1] ?? 0n));

    await sut.placeOrder({ account, side: 'buy', price: 299400n, size: 1n, autoHint: true });
    expect(stub.head).toHaveBeenCalledWith(true);
    expect(stub.place.mock.calls[0]!.slice(5, 7)).toEqual([4294967309n, true]);

    await sut.placeOrder({ account, side: 'buy', price: 299900n, size: 1n, autoHint: true });
    expect(stub.place.mock.calls[1]!.slice(5, 7)).toEqual([0n, true]);

    await sut.placeOrder({ account, side: 'buy', price: 100000n, size: 1n, autoHint: true });
    expect(stub.place.mock.calls[2]!.slice(5, 7)).toEqual([4294967304n, true]);
  });

  test('validates the price and the size', async () => {
    const { sut } = makeSut();
    await expect(sut.placeOrder({ account, side: 'buy', price: 0n, size: 1n })).rejects.toThrow('at least one tick');
    await expect(sut.placeOrder({ account, side: 'buy', price: 1n, size: new BigNumber('0.00001') })).rejects.toThrow('at least one lot');
  });
});

describe('takeOrder', () => {
  const deadline = 1_800_000_000;

  test('a market buy: the limit is maxTradePrice', async () => {
    const { sut, stub } = makeSut();
    await sut.takeOrder({ account, side: 'buy', size: new BigNumber('1.5'), deadline });

    expect(stub.take).toHaveBeenCalledWith(account, true, 3_000_000n, 15000n, 0n, 64, BigInt(deadline), 0, noOverrides);
    expect(stub.maxTradePrice).toHaveBeenCalledTimes(1);
  });

  test('a market sell: the limit is one tick', async () => {
    const { sut, stub } = makeSut();
    await sut.takeOrder({ account, side: 'sell', size: 10n, deadline });

    expect(stub.take.mock.calls[0]!.slice(1, 5)).toEqual([false, 1n, 10n, 0n]);
  });

  test('an IOC with a limit price, fill-or-kill, flags and max steps', async () => {
    const { sut, stub } = makeSut();
    await sut.takeOrder({
      account, side: 'buy', size: 10n, limitPrice: new BigNumber('3000.001'), minFill: 'all', maxSteps: 512, deadline, reduceOnly: true, strictGate: true,
    });

    expect(stub.take).toHaveBeenCalledWith(account, true, 300001n, 10n, 10n, 512, BigInt(deadline), 4 | 128, noOverrides);
  });

  test('minFill and limit in raw units; the limit of a sell rounds down', async () => {
    const { sut, stub } = makeSut();
    await sut.takeOrder({ account, side: 'sell', size: new BigNumber(1), limitPrice: new BigNumber('2999.999'), minFill: new BigNumber('0.5'), deadline });

    expect(stub.take.mock.calls[0]!.slice(2, 5)).toEqual([299999n, 10000n, 5000n]);
  });

  test('the default deadline is in the future', async () => {
    const { sut, stub } = makeSut();
    const before = Math.floor(Date.now() / 1000);
    await sut.takeOrder({ account, side: 'buy', size: 1n });

    const sent = Number(stub.take!.mock.calls[0]![6]);
    expect(sent).toBeGreaterThanOrEqual(before + 299);
    expect(sent).toBeLessThanOrEqual(before + 302);
  });

  test('a take always needs a fresh oracle (D1 §7), even when reduce-only', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.takeOrder({ account, side: 'sell', size: 10n, reduceOnly: true, deadline });

    const calls = decodeMulticall(stub.multicall!.mock.calls[0]![0]);
    expect(calls.map(call => call.name)).toEqual(['refreshPrice', 'take']);
    expect(calls[1]!.args[7]).toBe(4n);
  });

  test('validates maxSteps and the size', async () => {
    const { sut } = makeSut();
    await expect(sut.takeOrder({ account, side: 'buy', size: 1n, maxSteps: 0 })).rejects.toThrow('maxSteps must be an integer in 1..512');
    await expect(sut.takeOrder({ account, side: 'buy', size: 1n, maxSteps: 513 })).rejects.toThrow('maxSteps');
    await expect(sut.takeOrder({ account, side: 'buy', size: 0n })).rejects.toThrow('at least one lot');
  });
});

describe('collateral', () => {
  test('openAccount', async () => {
    const { sut, stub } = makeSut();
    await sut.openAccount({ subaccount: 2 });
    expect(stub.openAccount).toHaveBeenCalledWith(2, noOverrides);
  });

  test('deposit approves the missing allowance first (exact amount) and waits for the approval', async () => {
    const { sut, stub, token } = makeSut();
    const wait = jest.fn();
    token.approve!.mockResolvedValue({ wait });
    token.allowance!.mockResolvedValue(10_000_000n);

    await sut.deposit({ account, amount: new BigNumber('100.5') });

    expect(token.allowance).toHaveBeenCalledWith(owner, market.id);
    expect(token.approve).toHaveBeenCalledWith(market.id, 100_500_000n, noOverrides);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(stub.deposit).toHaveBeenCalledWith(account, 100_500_000n, noOverrides);
    expect(token.approve!.mock.invocationCallOrder[0]).toBeLessThan(stub.deposit!.mock.invocationCallOrder[0]);
  });

  test('deposit does not approve when the allowance is enough, or when autoApprove is false', async () => {
    const { sut, stub, token } = makeSut();
    token.allowance!.mockResolvedValue(200_000_000n);
    await sut.deposit({ account, amount: 100_000_000n });
    expect(token.approve).not.toHaveBeenCalled();

    token.allowance!.mockResolvedValue(0n);
    await sut.deposit({ account, amount: 100_000_000n, autoApprove: false });
    expect(token.approve).not.toHaveBeenCalled();
    expect(stub.deposit).toHaveBeenCalledTimes(2);
  });

  test('with a fixed nonce the approval takes it and the deposit the next one', async () => {
    const { sut, stub, token } = makeSut();
    await sut.deposit({ account, amount: 1n, nonce: 7n, gasLimit: 90000n });

    expect(token.approve).toHaveBeenCalledWith(market.id, 1n, { ...noOverrides, nonce: 7n });
    expect(stub.deposit).toHaveBeenCalledWith(account, 1n, { ...noOverrides, nonce: 8n, gasLimit: 90000n });
  });

  test('deposit can approve the unlimited amount', async () => {
    const { sut, token } = makeSut();
    await sut.deposit({ account, amount: 1n, approveMax: true });
    expect(token.approve!.mock.calls[0]![1]).toBe((1n << 256n) - 1n);
  });

  test('approveQuoteToken defaults to the unlimited amount', async () => {
    const { sut, token } = makeSut();
    await sut.approveQuoteToken({});
    await sut.approveQuoteToken({ amount: new BigNumber(5) });
    expect(token.approve!.mock.calls[0]).toEqual([market.id, (1n << 256n) - 1n, noOverrides]);
    expect(token.approve!.mock.calls[1]).toEqual([market.id, 5_000_000n, noOverrides]);
  });

  test('withdraw and transfer', async () => {
    const { sut, stub } = makeSut();
    await sut.withdraw({ account, amount: new BigNumber('10') });
    await sut.transfer({ from: { subaccount: 0 }, to: { subaccount: 1 }, amount: 5_000_000n });

    expect(stub.withdraw).toHaveBeenCalledWith(account, 10_000_000n, noOverrides);
    expect(stub.transfer).toHaveBeenCalledWith(account, encodePerpAccountId(owner, 1), 5_000_000n, noOverrides);
  });

  test('withdrawAll takes the maximal withdrawable amount of the live state', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ collateral: 1_000_000_000n, owedCharges: 1_000_000n, unrealized: 50_000_000n, adm: 300_000_000n }));
    await sut.withdraw({ account, withdrawAll: true });

    // 699_000_000 minus the safety margin of 1% of ADM (3_000_000)
    expect(stub.withdraw).toHaveBeenCalledWith(account, 696_000_000n, noOverrides);
  });

  test('withdrawAll of a flat account takes everything (no requirement, no margin)', async () => {
    const { sut, stub } = makeSut();
    await sut.withdraw({ account, withdrawAll: true });
    expect(stub.withdraw).toHaveBeenCalledWith(account, 1_000_000_000n, noOverrides);
  });

  test('withdraw needs an amount or withdrawAll', async () => {
    const { sut } = makeSut();
    await expect(sut.withdraw({ account })).rejects.toThrow('Either amount or withdrawAll');
  });

  test('withdraw with a stale oracle is batched with refreshPrice', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.withdraw({ account, amount: 1n });

    expect(decodeMulticall(stub.multicall!.mock.calls[0]![0]).map(call => call.name)).toEqual(['refreshPrice', 'withdraw']);
  });

  test('faucet', async () => {
    const { sut } = makeSut();
    expect(await sut.faucetQuoteToken()).toBe('faucet tx');
  });
});

describe('orders management', () => {
  test('cancel without a hint scans the book on chain (hinted = false)', async () => {
    const { sut, stub } = makeSut();
    await sut.cancelOrder({ handle: 4294967308n });
    expect(stub.cancel).toHaveBeenCalledWith(4294967308n, 0n, false, noOverrides);
  });

  test('cancel with a hint', async () => {
    const { sut, stub } = makeSut();
    await sut.cancelOrder({ handle: 4294967309n, prev: 4294967305n });
    expect(stub.cancel).toHaveBeenCalledWith(4294967309n, 4294967305n, true, noOverrides);
  });

  test('cancel with autoHint finds the predecessor', async () => {
    const { sut, stub } = makeSut();
    const chain = [4294967308n, 4294967305n, 4294967309n];
    const nodes = new Map(chain.map((handle, index) => [handle, nodeWords(299850n - BigInt(index) * 100n, 10n, true)] as const));
    stub.head!.mockResolvedValue(chain[0]);
    stub.order!.mockImplementation((handle: bigint) => Promise.resolve(nodes.get(handle)));
    stub.next!.mockImplementation((handle: bigint) => Promise.resolve(chain[chain.indexOf(handle) + 1] ?? 0n));

    await sut.cancelOrder({ handle: 4294967309n, autoHint: true });
    expect(stub.cancel).toHaveBeenCalledWith(4294967309n, 4294967305n, true, noOverrides);
    await sut.cancelOrder({ handle: 4294967308n, autoHint: true });
    expect(stub.cancel).toHaveBeenLastCalledWith(4294967308n, 0n, true, noOverrides);
  });

  test('cancelAll', async () => {
    const { sut, stub } = makeSut();
    await sut.cancelAllOrders({ account: { subaccount: 0 } });
    expect(stub.cancelAll).toHaveBeenCalledWith(account, noOverrides);
  });

  test('replaceBatch encodes two words per update', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: true }));
    await sut.replaceOrders({
      updates: [{ handle: 1n, price: 299900n, lots: 100n }, { handle: 2n, price: 1n, lots: 0n, op: 'cancel' }],
      refreshPrice: false,
    });

    const [words, hinted] = stub.replaceBatch!.mock.calls[0]! as [string[], boolean];
    expect(words).toHaveLength(4);
    expect(hinted).toBe(false);
    expect(BigInt(words[0]!)).toBe(1n | (299900n << 64n) | (100n << 128n));
    expect(BigInt(words[2]!) >> 224n).toBe(1n);
  });

  test('liquidate: the whole uint64 range by default, the oracle is checked on the victim', async () => {
    const { sut, stub } = makeSut();
    const victim = encodePerpAccountId('0x1111111111111111111111111111111111111111', 0);
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.liquidate({ victim, liquidator: { subaccount: 5 } });

    expect(stub.perpAccount).toHaveBeenCalledWith(victim);
    const calls = decodeMulticall(stub.multicall!.mock.calls[0]![0]);
    expect(calls.map(call => call.name)).toEqual(['refreshPrice', 'liquidate']);
    expect(calls[1]!.args).toEqual([victim, encodePerpAccountId(owner, 5), (1n << 64n) - 1n]);
  });

  test('forceCancel, refreshPrice, refreshFunding, setOperator', async () => {
    const { sut, stub } = makeSut();
    await sut.forceCancel({ account, refreshPrice: false });
    await sut.refreshPrice();
    await sut.refreshFunding();
    await sut.setOperator({ operator: '0x2222222222222222222222222222222222222222', permissions: 3, expiry: 1_800_000_000 });

    expect(stub.forceCancel).toHaveBeenCalledWith(account, noOverrides);
    expect(stub.refreshPrice).toHaveBeenCalledWith(noOverrides);
    expect(stub.refreshFunding).toHaveBeenCalledWith(noOverrides);
    expect(stub.setOperator).toHaveBeenCalledWith('0x2222222222222222222222222222222222222222', 3, 1_800_000_000, noOverrides);
  });
});

describe('multicall', () => {
  test('sends the actions in one transaction in the given order', async () => {
    const { sut, stub } = makeSut();
    await sut.multicall({
      calls: [
        { type: 'refreshPrice' },
        { type: 'deposit', params: { account, amount: 50_000_000n } },
        { type: 'placeOrder', params: { account, side: 'buy', price: 299850n, size: 100n } },
        { type: 'cancelAllOrders', params: { account } },
      ],
      gasLimit: 400000n,
    });

    expect(stub.multicall).toHaveBeenCalledTimes(1);
    const [calldata, overrides] = stub.multicall!.mock.calls[0]! as [string[], { gasLimit: bigint }];
    expect(overrides.gasLimit).toBe(400000n);
    expect(calldata).toEqual([
      iface.encodeFunctionData('refreshPrice'),
      iface.encodeFunctionData('deposit', [account, 50_000_000n]),
      iface.encodeFunctionData('place', [account, true, 299850n, 100n, 0, 0n, false, 0]),
      iface.encodeFunctionData('cancelAll', [account]),
    ]);
    expect(stub.perpAccount).not.toHaveBeenCalled(); // an explicit refreshPrice disables the auto check
  });

  test('refreshPrice is not duplicated and a single action is sent directly', async () => {
    const { sut, stub } = makeSut();
    await sut.multicall({ calls: [{ type: 'refreshPrice' }] });
    expect(stub.refreshPrice).toHaveBeenCalledTimes(1);
    expect(stub.multicall).not.toHaveBeenCalled();
  });

  test('an empty batch is rejected', async () => {
    const { sut } = makeSut();
    await expect(sut.multicall({ calls: [] })).rejects.toThrow('There are no calls to send');
  });
});

describe('calldata encoding', () => {
  test('selectors of the contract functions', async () => {
    const { sut } = makeSut();
    const selector = (signature: string) => id(signature).slice(0, 10);

    expect(sut.encodeCall({ name: 'place', args: [account, true, 1n, 2n, 0, 0n, false, 0] }).slice(0, 10))
      .toBe(selector('place(uint176,bool,uint64,uint64,uint32,uint64,bool,uint8)'));
    expect(sut.encodeCall({ name: 'take', args: [account, true, 1n, 2n, 0n, 10, 5n, 0] }).slice(0, 10))
      .toBe(selector('take(uint176,bool,uint64,uint64,uint64,uint32,uint64,uint8)'));
    expect(sut.encodeCall({ name: 'deposit', args: [account, 1n] }).slice(0, 10)).toBe(selector('deposit(uint176,uint128)'));
    expect(sut.encodeCall({ name: 'cancel', args: [1n, 0n, false] }).slice(0, 10)).toBe(selector('cancel(uint64,uint64,bool)'));
    expect(sut.encodeCall({ name: 'refreshPrice', args: [] })).toBe(selector('refreshPrice()'));
  });

  test('a multicall of built calls decodes back to the same calls', async () => {
    const { sut } = makeSut();
    const calls = await sut.buildCalls([
      { type: 'refreshPrice' },
      { type: 'placeOrder', params: { account, side: 'sell', price: new BigNumber('3000'), size: new BigNumber('1'), reduceOnly: true, expiry: 1_800_000_000 } },
    ]);
    const calldata = sut.encodeMulticall(calls);
    const [inner] = iface.decodeFunctionData('multicall', calldata) as unknown as [string[]];

    expect(decodeMulticall(inner)).toEqual([
      { name: 'refreshPrice', args: [] },
      { name: 'place', args: [account, false, 300000n, 10000n, 1_800_000_000n, 0n, false, 4n] },
    ]);
  });
});

describe('reads', () => {
  test('getAccountState maps the on-chain view', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ equity: 5n, qBid: 7n, state: BigInt(PerpHealthState.Liquidatable) }));
    const state = await sut.getAccountState({ subaccount: 0 });

    expect(stub.perpAccount).toHaveBeenCalledWith(account);
    expect(state).toMatchObject({ equity: 5n, qBid: 7n, state: PerpHealthState.Liquidatable, oracleFresh: true });
  });

  test('getAccountOverview derives the prices from the account view', async () => {
    const { sut, stub } = makeSut();
    // a long of 10 lots entered at 300000 ticks (3000 tUSDC), the mark is 310000: unrealized +100000
    stub.perpAccount!.mockResolvedValue(accountView({
      size: 10n, costBasis: 3_000_000n, collateral: 300_000n, unrealized: 100_000n, equity: 400_000n, adm: 310_000n,
    }));
    const overview = await sut.getAccountOverview(account);

    expect(overview.owner).toBe(owner);
    expect(overview.subaccount).toBe(0);
    expect(overview.entryPrice.toString()).toBe('3000');
    expect(overview.markPrice.toString()).toBe('3100');
    expect(overview.liquidationPrice.toFixed(3)).toBe('2842.105'); // (3e6 - 3e5) / (10 * 0.95) / 100
    expect(overview.bankruptcyPrice.toString()).toBe('2700');
    expect(overview.maxWithdrawable).toBe(0n);
  });

  test('getAccountOverview of a flat account has no prices', async () => {
    const { sut } = makeSut();
    const overview = await sut.getAccountOverview(account);

    expect(overview).toMatchObject({ entryPrice: null, markPrice: null, liquidationPrice: null, bankruptcyPrice: null, maxWithdrawable: 1_000_000_000n });
  });

  test('getBookOrders walks head/next/order and respects the limit', async () => {
    const { sut, stub } = makeSut();
    const chain = [11n, 12n, 13n];
    stub.head!.mockResolvedValue(11n);
    stub.order!.mockImplementation((handle: bigint) => Promise.resolve(nodeWords(310000n + handle, 10n, false)));
    stub.next!.mockImplementation((handle: bigint) => Promise.resolve(chain[chain.indexOf(handle) + 1] ?? 0n));

    expect((await sut.getBookOrders({ bid: false })).map((order: any) => order.handle)).toEqual([11n, 12n, 13n]);
    expect(stub.head).toHaveBeenCalledWith(false);
    expect(await sut.getBookOrders({ bid: false, limit: 2 })).toHaveLength(2);
  });

  test('getBookOrder returns null for a free node', async () => {
    const { sut, stub } = makeSut();
    stub.order!.mockResolvedValue([0n, 0n]);
    expect(await sut.getBookOrder(5n)).toBeNull();
  });

  test('risk params are cached', async () => {
    const { sut, stub } = makeSut();
    await sut.getRiskParams();
    expect(await sut.getRiskParams()).toMatchObject({ imrBps: 1000, collarBps: 300, baseLot: 100000000000000n });
    expect(stub.riskParams).toHaveBeenCalledTimes(1);
  });

  test('quote balance and allowance default to the signer', async () => {
    const { sut, token } = makeSut();
    expect(await sut.getQuoteBalance()).toBe(5n);
    expect(token.balanceOf).toHaveBeenCalledWith(owner);
    await sut.getQuoteAllowance();
    expect(token.allowance).toHaveBeenCalledWith(owner, market.id);
  });
});

describe('error decoding', () => {
  test('a revert of the market is thrown as TransactionFailedError with the decoded error', async () => {
    const provider = new JsonRpcProvider('http://localhost:1', 10143, { staticNetwork: true });
    const sut = new OnchainLobPerpMarketContract({ market, signer: new VoidSigner(owner, provider) }) as any;
    // StaleOracle(1790894466, 1791198360) as returned by the deployed market
    const data = iface.encodeErrorResult('StaleOracle', [1790894466, 1791198360]);
    const failing = Promise.reject(Object.assign(new Error('execution reverted'), { data }));

    const error = await sut.processContractMethodCall(sut.marketContract, failing).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TransactionFailedError);
    expect(error.error.name).toBe('StaleOracle');
    expect(error.error.args.map(Number)).toEqual([1790894466, 1791198360]);
  });

  test('an unknown revert is rethrown as it is', async () => {
    const provider = new JsonRpcProvider('http://localhost:1', 10143, { staticNetwork: true });
    const sut = new OnchainLobPerpMarketContract({ market, signer: new VoidSigner(owner, provider) }) as any;
    const original = Object.assign(new Error('boom'), { data: '0xdeadbeef' });

    await expect(sut.processContractMethodCall(sut.marketContract, Promise.reject(original))).rejects.toBe(original);
  });
});

describe('deposit approval flow', () => {
  test('the deposit is not sent when the approval is rejected', async () => {
    const { sut, stub, token } = makeSut();
    token.approve!.mockRejectedValue(new Error('user rejected'));

    await expect(sut.deposit({ account, amount: 1n })).rejects.toThrow('user rejected');
    expect(stub.deposit).not.toHaveBeenCalled();
  });

  test('the deposit is not sent when the approval transaction fails', async () => {
    const { sut, stub, token } = makeSut();
    token.approve!.mockResolvedValue({ wait: jest.fn().mockRejectedValue(new Error('approval reverted')) });

    await expect(sut.deposit({ account, amount: 1n })).rejects.toThrow('approval reverted');
    expect(stub.deposit).not.toHaveBeenCalled();
  });

  test('the nonce is not bumped when no approval is sent', async () => {
    const { sut, stub, token } = makeSut();
    token.allowance!.mockResolvedValue(10n);
    await sut.deposit({ account, amount: 5n, nonce: 7n });
    expect(token.approve).not.toHaveBeenCalled();
    expect(stub.deposit).toHaveBeenLastCalledWith(account, 5n, { ...noOverrides, nonce: 7n });

    token.allowance!.mockResolvedValue(0n);
    await sut.deposit({ account, amount: 5n, nonce: 9n, autoApprove: false });
    expect(token.approve).not.toHaveBeenCalled();
    expect(stub.deposit).toHaveBeenLastCalledWith(account, 5n, { ...noOverrides, nonce: 9n });
  });

  test('the approval is waited for once when autoWaitTransaction is off (by ensureQuoteAllowance)', async () => {
    const { sut, token } = makeSut({ autoWait: false });
    const wait = jest.fn();
    token.approve!.mockResolvedValue({ wait });
    await sut.deposit({ account, amount: 1n });
    expect(wait).toHaveBeenCalledTimes(1);
  });

  test('the approval is waited for once when autoWaitTransaction is on (by the transaction processing)', async () => {
    const { sut, stub, token } = makeSut({ autoWait: true, realProcess: true });
    const approveWait = jest.fn();
    const depositWait = jest.fn();
    token.approve!.mockResolvedValue({ wait: approveWait, hash: '0x1' });
    stub.deposit!.mockResolvedValue({ wait: depositWait, hash: '0x2' });
    await sut.deposit({ account, amount: 1n });

    expect(approveWait).toHaveBeenCalledTimes(1); // not a second time by ensureQuoteAllowance
    expect(depositWait).toHaveBeenCalledTimes(1);
  });
});

describe('replaceOrders and the oracle', () => {
  const update = { handle: 4294967308n, price: 299900n, lots: 100n };

  test('a replacement of a risk-increasing order refreshes a stale oracle (the maker account is read from the book)', async () => {
    const { sut, stub } = makeSut();
    stub.order!.mockResolvedValue(nodeWords(299850n, 1000n, true));
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.replaceOrders({ updates: [update] });

    expect(stub.order).toHaveBeenCalledWith(update.handle);
    expect(stub.perpAccount).toHaveBeenCalledWith(account);
    expect(decodeMulticall(stub.multicall!.mock.calls[0]![0]).map(call => call.name)).toEqual(['refreshPrice', 'replaceBatch']);
  });

  test('a fresh oracle needs no refresh', async () => {
    const { sut, stub } = makeSut();
    stub.order!.mockResolvedValue(nodeWords(299850n, 1000n, true));
    await sut.replaceOrders({ updates: [update] });
    expect(stub.replaceBatch).toHaveBeenCalledTimes(1);
    expect(stub.multicall).not.toHaveBeenCalled();
  });

  test('cancels and reduce-only orders never need a fresh oracle', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    stub.order!.mockResolvedValue(nodeWords(310000n, 10n, false, owner, 0n, true));

    await sut.replaceOrders({ updates: [{ ...update, op: 'cancel' }] });
    await sut.replaceOrders({ updates: [update] });

    expect(stub.replaceBatch).toHaveBeenCalledTimes(2);
    expect(stub.multicall).not.toHaveBeenCalled();
    expect(stub.perpAccount).not.toHaveBeenCalled();
  });

  test('refreshPrice: true batches it without reading the book', async () => {
    const { sut, stub } = makeSut();
    await sut.replaceOrders({ updates: [update], refreshPrice: true });
    expect(stub.order).not.toHaveBeenCalled();
    expect(decodeMulticall(stub.multicall!.mock.calls[0]![0]).map(call => call.name)).toEqual(['refreshPrice', 'replaceBatch']);
  });
});

describe('autoHint fallbacks', () => {
  const linkBook = (stub: any, nodes: Map<bigint, [bigint, bigint]>) => {
    const chain = [...nodes.keys()];
    stub.head.mockResolvedValue(chain[0] ?? 0n);
    stub.order.mockImplementation((handle: bigint) => Promise.resolve(nodes.get(handle) ?? [0n, 0n]));
    stub.next.mockImplementation((handle: bigint) => Promise.resolve(chain[chain.indexOf(handle) + 1] ?? 0n));
  };

  test('place: a book prefix too long to know the hint falls back to hinted = false', async () => {
    const { sut, stub } = makeSut();
    // 300 bids all better than the new order: the walk stops at 256 and the hint is unknown
    linkBook(stub, new Map(Array.from({ length: 300 }, (_, i) => [BigInt(i + 1), nodeWords(400_000n - BigInt(i), 10n, true)] as const)));
    await sut.placeOrder({ account, side: 'buy', price: 100n, size: 1n, autoHint: true });

    expect(stub.place.mock.calls[0]!.slice(5, 7)).toEqual([0n, false]);
    expect(stub.order).toHaveBeenCalledTimes(256);
  });

  test('cancel: an order that is not in the book at all throws', async () => {
    const { sut, stub } = makeSut();
    stub.order!.mockResolvedValue([0n, 0n]);
    await expect(sut.cancelOrder({ handle: 5n, autoHint: true })).rejects.toThrow('Order 5 is not in the book');
    expect(stub.cancel).not.toHaveBeenCalled();
  });

  test('cancel: an order not found while walking its side falls back to hinted = false', async () => {
    const { sut, stub } = makeSut();
    stub.order!.mockImplementation((handle: bigint) => Promise.resolve(handle === 5n ? nodeWords(299000n, 10n, true) : nodeWords(299850n, 10n, true)));
    stub.head!.mockResolvedValue(0n); // the walk sees an empty side (the order was removed meanwhile)
    await sut.cancelOrder({ handle: 5n, autoHint: true });

    expect(stub.cancel).toHaveBeenCalledWith(5n, 0n, false, noOverrides);
  });
});

describe('multicall \'auto\' refresh selection', () => {
  const other = encodePerpAccountId('0x2222222222222222222222222222222222222222', 3);

  test('actions that never need a fresh oracle do not read the account', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.multicall({ calls: [{ type: 'deposit', params: { account, amount: 1n } }, { type: 'transfer', params: { from: account, to: other, amount: 1n } }] });

    expect(stub.perpAccount).not.toHaveBeenCalled();
    expect(decodeMulticall(stub.multicall!.mock.calls[0]![0]).map(call => call.name)).toEqual(['deposit', 'transfer']);
  });

  test('the first action that needs a fresh oracle decides, a reduce-only order is skipped', async () => {
    const { sut, stub } = makeSut();
    stub.perpAccount!.mockResolvedValue(accountView({ oracleFresh: false }));
    await sut.multicall({
      calls: [
        { type: 'placeOrder', params: { account, side: 'sell', price: 310000n, size: 1n, reduceOnly: true } },
        { type: 'takeOrder', params: { account: other, side: 'buy', size: 1n, deadline: 1_800_000_000 } },
      ],
    });

    expect(stub.perpAccount).toHaveBeenCalledTimes(1);
    expect(stub.perpAccount).toHaveBeenCalledWith(other);
    expect(decodeMulticall(stub.multicall!.mock.calls[0]![0]).map(call => call.name)).toEqual(['refreshPrice', 'place', 'take']);
  });

  test('a fresh oracle adds nothing', async () => {
    const { sut, stub } = makeSut();
    await sut.multicall({ calls: [{ type: 'withdraw', params: { account, amount: 1n } }, { type: 'cancelAllOrders', params: { account } }] });
    expect(decodeMulticall(stub.multicall!.mock.calls[0]![0]).map(call => call.name)).toEqual(['withdraw', 'cancelAll']);
  });
});

describe('fromChain', () => {
  const erc20 = new Interface(['function decimals() view returns (uint8)']);
  const stubRunner = (risk: { baseLot: bigint; quoteTick: bigint }) => ({
    provider: null,
    call: jest.fn(async (tx: { data: string }) => {
      const selector = tx.data.slice(0, 10);
      if (selector === id('riskParams()').slice(0, 10))
        return iface.encodeFunctionResult('riskParams', [[1000, 1000, 500, 750, 300, 0, risk.baseLot, risk.quoteTick]]);
      if (selector === id('quoteToken()').slice(0, 10))
        return iface.encodeFunctionResult('quoteToken', [market.quoteToken.address]);
      if (selector === id('decimals()').slice(0, 10))
        return erc20.encodeFunctionResult('decimals', [6]);
      throw new Error(`unexpected call ${selector}`);
    }),
  });

  test('derives the display scaling from the lot and the tick', async () => {
    const contract = await OnchainLobPerpMarketContract.fromChain({ marketAddress: market.id, provider: stubRunner({ baseLot: 10n ** 14n, quoteTick: 1n }) as any });
    expect(contract.market).toMatchObject({ baseLot: 10n ** 14n, quoteTick: 1n, sizeDecimals: 4, priceDecimals: 2, quoteToken: { address: market.quoteToken.address, decimals: 6 } });
  });

  test('a quote tick of 100 shifts the price scale', async () => {
    const contract = await OnchainLobPerpMarketContract.fromChain({ marketAddress: market.id, provider: stubRunner({ baseLot: 10n ** 14n, quoteTick: 100n }) as any });
    expect(contract.market).toMatchObject({ sizeDecimals: 4, priceDecimals: 0 });
  });

  test('base decimals are configurable', async () => {
    const contract = await OnchainLobPerpMarketContract.fromChain({ marketAddress: market.id, provider: stubRunner({ baseLot: 10n ** 4n, quoteTick: 1n }) as any, baseDecimals: 8 });
    expect(contract.market).toMatchObject({ sizeDecimals: 4, priceDecimals: 2 });
  });

  test('a lot or a tick that is not a power of ten is rejected', async () => {
    await expect(OnchainLobPerpMarketContract.fromChain({ marketAddress: market.id, provider: stubRunner({ baseLot: 3n * 10n ** 14n, quoteTick: 1n }) as any }))
      .rejects.toThrow('baseLot (300000000000000) is not a power of ten');
    await expect(OnchainLobPerpMarketContract.fromChain({ marketAddress: market.id, provider: stubRunner({ baseLot: 10n ** 14n, quoteTick: 25n }) as any }))
      .rejects.toThrow('quoteTick (25) is not a power of ten');
  });

  test('requires a signer or a provider', async () => {
    await expect(OnchainLobPerpMarketContract.fromChain({ marketAddress: market.id })).rejects.toThrow('Either a signer or a provider is required');
  });
});
