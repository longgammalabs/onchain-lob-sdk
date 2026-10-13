import BigNumber from 'bignumber.js';
import { Interface } from 'ethers';

import { TransactionFailedError, UnsupportedMarketMethodError } from './errors';
import { OnchainLobSpotPageBookMarketContract } from './onchainLobSpotPageBookMarketContract';
import { pageBookAbi } from '../abi';
import { testMarket, testSigner } from '../helpers.test';
import type { Market } from '../models';

const market = { ...testMarket, engine: 'hanji_pagebook', fastQuoterProxyAddress: null } as unknown as Market;
const pageBook = new Interface(pageBookAbi);
const MAX_UINT32 = 2n ** 32n - 1n;
const noTxParams = { gasLimit: undefined, nonce: undefined, maxFeePerGas: undefined, maxPriorityFeePerGas: undefined };
const registeredLog = (traderId: bigint) => {
  const event = pageBook.getEvent('TraderRegistered')!;
  return { ...pageBook.encodeEventLog(event, [traderId, '0x000000000000000000000000000000000000dEaD']), address: market.orderbookAddress };
};

describe('PageBook market contract', () => {
  let marketContract: OnchainLobSpotPageBookMarketContract;
  let book: Record<string, jest.Mock | Interface>;
  let owner: string;

  beforeEach(async () => {
    marketContract = new OnchainLobSpotPageBookMarketContract({ market, signer: testSigner });
    book = {
      interface: pageBook,
      placeOrder: jest.fn(),
      claimOrder: jest.fn(),
      batchExecute: jest.fn(),
      setTraderConfig: jest.fn(),
      getTraderConfig: jest.fn(async () => [owner, false, true, true]),
      traderId: jest.fn(async () => 7n),
      registerTrader: jest.fn(async () => ({ hash: '0xregistration', wait: async () => ({ logs: [registeredLog(9n)] }) })),
    };
    (marketContract as any)['processContractMethodCall'] = jest.fn((_contract, call) => call ?? 'transaction hash');
    (marketContract as any)['marketContract'] = book;
    owner = await testSigner.getAddress();
  });

  test('talks to the market through the PageBook ABI', () => {
    const contract = new OnchainLobSpotPageBookMarketContract({ market, signer: testSigner });
    expect((contract as any)['marketContract'].interface.getFunction('claimOrder').inputs).toHaveLength(6);
  });

  test('a limit order rests until it is cancelled', async () => {
    await marketContract.placeOrder({
      market: market.id, side: 'bid', type: 'limit', size: BigNumber(25), price: BigNumber(0.732),
    });
    expect((book.placeOrder as jest.Mock).mock.calls[0][7]).toBe(MAX_UINT32);
  });

  test('an immediate order keeps the 5 minute deadline', async () => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    await marketContract.placeOrder({
      market: market.id, side: 'ask', type: 'ioc', size: BigNumber(25), price: BigNumber(0.732),
    });
    const expires = (book.placeOrder as jest.Mock).mock.calls[0][7] as bigint;
    expect(expires - now).toBeGreaterThanOrEqual(299n);
    expect(expires - now).toBeLessThanOrEqual(301n);
  });

  test('a given expires is passed as is', async () => {
    await marketContract.placeOrder({
      market: market.id, side: 'bid', type: 'limit_post_only', size: BigNumber(25), price: BigNumber(0.732), expires: 1_900_000_000,
    });
    expect((book.placeOrder as jest.Mock).mock.calls[0][7]).toBe(1_900_000_000n);
  });

  test('claimOrder names the signer as the owner and pays native as its config says', async () => {
    await marketContract.claimOrder({ market: market.id, orderId: '30064771073', onlyClaim: false });
    expect((book.claimOrder as jest.Mock).mock.calls).toEqual([
      [owner, '30064771073', false, true, true, expect.any(BigInt), noTxParams],
    ]);
  });

  test('a signer with no trader claims without native payout', async () => {
    (book.traderId as jest.Mock).mockResolvedValueOnce(0n);
    await marketContract.claimOrder({ market: market.id, orderId: '1', onlyClaim: false });
    expect((book.claimOrder as jest.Mock).mock.calls[0][4]).toBe(false);
  });

  test('batchClaim is a batchExecute of claimOrder calls', async () => {
    const other = '0x000000000000000000000000000000000000dEaD';
    await marketContract.batchClaim({
      market: market.id,
      onlyClaim: true,
      claimParams: [{ address: owner, orderId: '1' }, { address: other, orderId: '2' }],
    });
    const [calls, txParams] = (book.batchExecute as jest.Mock).mock.calls[0];
    expect(txParams).toEqual(noTxParams);
    expect(calls.map((data: string) => {
      const call = pageBook.parseTransaction({ data })!;
      return [call.name, ...call.args.slice(0, 5)];
    })).toEqual([
      ['claimOrder', owner, 1n, true, true, true],
      ['claimOrder', other, 2n, true, true, true],
    ]);
  });

  test('a new trader is registered before setClaimableStatus, which takes the next nonce', async () => {
    (book.traderId as jest.Mock).mockResolvedValueOnce(0n);
    await marketContract.setClaimableStatus({ market: market.id, status: false, nonce: 4n });
    expect((book.registerTrader as jest.Mock).mock.calls).toEqual([[{ ...noTxParams, nonce: 4n }]]);
    expect((book.getTraderConfig as jest.Mock).mock.calls).toEqual([[9n]]);
    expect((book.setTraderConfig as jest.Mock).mock.calls).toEqual([[9n, false, true, true, { ...noTxParams, nonce: 5n }]]);
  });

  test('setClaimableStatus keeps the other flags of the trader config', async () => {
    await marketContract.setClaimableStatus({ market: market.id, status: true });
    expect((book.setTraderConfig as jest.Mock).mock.calls).toEqual([[7n, true, true, true, noTxParams]]);
  });

  test.each([
    'placeOrderWithPermit',
    'placeMarketOrderWithTargetValueWithPermit',
    'setProxyTraderPermissions',
    'batchPlaceOrder',
    'changeOrder',
    'batchChangeOrder',
  ] as const)('%s is not supported', async method => {
    await expect((marketContract[method] as (params: unknown) => Promise<unknown>)({})).rejects.toThrow(UnsupportedMarketMethodError);
  });

  test('a fractional expires is rounded down', async () => {
    await marketContract.placeOrder({
      market: market.id, side: 'bid', type: 'limit', size: BigNumber(25), price: BigNumber(0.732), expires: 1_900_000_000.7,
    });
    expect((book.placeOrder as jest.Mock).mock.calls[0][7]).toBe(1_900_000_000n);
  });
});

describe('contract errors', () => {
  test('a revert the ABI knows is thrown decoded', async () => {
    const marketContract = new OnchainLobSpotPageBookMarketContract({ market, signer: testSigner });
    const data = pageBook.encodeErrorResult('ClaimNotAllowed', []);
    const call = Promise.reject(Object.assign(new Error('execution reverted'), { data }));
    const error = await (marketContract as any)['processContractMethodCall']((marketContract as any)['marketContract'], call).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TransactionFailedError);
    expect(error.error.name).toBe('ClaimNotAllowed');
  });
});
