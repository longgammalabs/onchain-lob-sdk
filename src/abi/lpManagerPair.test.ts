import { describe, it, expect } from 'vitest';
import { Interface } from 'ethers';
import { lpManagerPairAbi } from './lpManagerPair';

describe('lpManagerPairAbi', () => {
  it('exposes the pair view and write methods', () => {
    const iface = new Interface(lpManagerPairAbi);
    expect(iface.getFunction('previewAddLiquidity')).toBeTruthy();
    expect(iface.getFunction('previewRemoveLiquidity')).toBeTruthy();
    expect(iface.getFunction('getTotalReserves')).toBeTruthy();
    expect(iface.getFunction('getPairConfig')).toBeTruthy();
    // native two-token withdraw selector must resolve unambiguously
    expect(iface.getFunction('removeLiquidity(uint256,uint256,uint256,uint256)')).toBeTruthy();
    // anchored deposit selector must resolve unambiguously
    expect(iface.getFunction('addLiquidity(uint8,uint256,uint256,uint256,uint256,bytes[])')).toBeTruthy();
  });
});
