import { previewAddLiquidityPair, previewRemoveLiquidityPair, getPairReserves, getPairConfig } from './pairReads';

// A fake ethers Provider is enough: pairReads builds a Contract(addr, abi, provider)
// and calls read methods. We stub the provider's `call`-path by mocking Contract via
// dependency: pairReads exposes an internal factory we override in the test.
const makeContractStub = (returns: Record<string, unknown>) =>
  new Proxy({}, {
    get: (_t, prop: string) => jest.fn(() => Promise.resolve(returns[prop]))
  });

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return { ...actual, Contract: jest.fn() };
});

import { Contract } from 'ethers';

describe('pairReads', () => {
  const provider = {} as any;

  it('previewAddLiquidityPair maps tuple output to named bigints', async () => {
    (Contract as unknown as jest.Mock).mockImplementation(() => makeContractStub({
      previewAddLiquidity: [10n, 20n, 1n, 30n]
    }));
    const res = await previewAddLiquidityPair({ vault: '0xV', provider, tokenId: 0, amount: 10n });
    expect(res).toEqual({ amountTokenX: 10n, amountTokenY: 20n, adminFeeLP: 1n, mintedLP: 30n });
  });

  it('previewRemoveLiquidityPair maps tuple output', async () => {
    (Contract as unknown as jest.Mock).mockImplementation(() => makeContractStub({
      previewRemoveLiquidity: [5n, 6n, 1n]
    }));
    const res = await previewRemoveLiquidityPair({ vault: '0xV', provider, burnLP: 100n });
    expect(res).toEqual({ amountTokenX: 5n, amountTokenY: 6n, adminFeeLP: 1n });
  });

  it('getPairReserves maps tuple output', async () => {
    (Contract as unknown as jest.Mock).mockImplementation(() => makeContractStub({
      getTotalReserves: [1000n, 2000n]
    }));
    expect(await getPairReserves({ vault: '0xV', provider })).toEqual({ totalTokenX: 1000n, totalTokenY: 2000n });
  });

  it('getPairConfig flattens the nested tuples', async () => {
    (Contract as unknown as jest.Mock).mockImplementation(() => makeContractStub({
      getPairConfig: [[10n, 20n, '0xFee'], [3600n, 111n, 222n], [false, 0n], [true, 1n], false]
    }));
    expect(await getPairConfig({ vault: '0xV', provider })).toEqual({
      adminMintLPFeeBps: 10, adminBurnLPFeeBps: 20, cooldownDuration: 3600,
      maxTotalTokenX: 111n, maxTotalTokenY: 222n, nativeEnabled: true, nativeTokenId: 1
    });
  });
});
