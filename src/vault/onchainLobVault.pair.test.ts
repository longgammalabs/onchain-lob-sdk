import { OnchainLobVault } from './onchainLobVault';
import * as pairReads from './pairReads';

describe('OnchainLobVault pair delegation', () => {
  it('previewAddLiquidityPair delegates to the read helper', async () => {
    const spy = jest.spyOn(pairReads, 'previewAddLiquidityPair')
      .mockResolvedValue({ amountTokenX: 1n, amountTokenY: 2n, adminFeeLP: 0n, mintedLP: 3n });
    const sut = Object.create(OnchainLobVault.prototype) as any;
    const provider = {} as any;
    const res = await sut.previewAddLiquidityPair({ vault: '0xV', provider, tokenId: 0, amount: 1n });
    expect(spy).toHaveBeenCalledWith({ vault: '0xV', provider, tokenId: 0, amount: 1n });
    expect(res.mintedLP).toBe(3n);
  });

  it('addLiquidityPair delegates to the contract wrapper', async () => {
    const sut = Object.create(OnchainLobVault.prototype) as any;
    const fakeContract = { addLiquidityPair: jest.fn().mockResolvedValue({ hash: '0xtx' }) };
    sut.getVaultContract = jest.fn().mockResolvedValue(fakeContract);
    const res = await sut.addLiquidityPair({ vault: '0xV', tokenId: 1, amount: 5n, minLpMinted: 4n });
    expect(sut.getVaultContract).toHaveBeenCalledWith({ vault: '0xV' });
    expect(fakeContract.addLiquidityPair).toHaveBeenCalledWith({ vault: '0xV', tokenId: 1, amount: 5n, minLpMinted: 4n });
    expect(res.hash).toBe('0xtx');
  });
});
