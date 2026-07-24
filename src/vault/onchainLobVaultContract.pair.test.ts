import { OnchainLobVaultContract } from './onchainLobVaultContract';

// Minimal vault config + signer stubs. We spy on the pair contract method calls.
const makeSut = () => {
  const calls: Record<string, unknown[]> = {};
  const pairContract: any = {
    getFunction: () => ({}),
    interface: { parseError: () => null },
    addLiquidity: jest.fn((...args: unknown[]) => { calls.addLiquidity = args; return Promise.resolve({ wait: () => Promise.resolve() }); }),
    removeLiquidity: jest.fn((...args: unknown[]) => { calls.removeLiquidity = args; return Promise.resolve({ wait: () => Promise.resolve() }); })
  };
  const sut = Object.create(OnchainLobVaultContract.prototype) as any;
  sut.autoWaitTransaction = false;
  sut.pairContract = pairContract;
  return { sut, pairContract, calls };
};

describe('OnchainLobVaultContract pair writes', () => {
  it('addLiquidityPair calls addLiquidity(tokenId, amount, 0, minLpMinted, expires, []) with no value', async () => {
    const { sut, calls } = makeSut();
    await sut.addLiquidityPair({ vault: '0xV', tokenId: 1, amount: 100n, minLpMinted: 90n });
    const [tokenId, amount, ignored, minLp, , priceData, overrides] = calls.addLiquidity as any[];
    expect(tokenId).toBe(1n);
    expect(amount).toBe(100n);
    expect(ignored).toBe(0n);
    expect(minLp).toBe(90n);
    expect(priceData).toEqual([]);
    expect(overrides.value).toBeUndefined();
  });

  it('removeLiquidityPair calls removeLiquidity(burnLP, minX, minY, expires)', async () => {
    const { sut, calls } = makeSut();
    await sut.removeLiquidityPair({ vault: '0xV', burnLP: 100n, minTokenXGet: 5n, minTokenYGet: 6n });
    const [burnLP, minX, minY] = calls.removeLiquidity as any[];
    expect(burnLP).toBe(100n);
    expect(minX).toBe(5n);
    expect(minY).toBe(6n);
  });
});
