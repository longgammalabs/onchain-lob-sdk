import { expect } from '@jest/globals';
import { DepositDetails } from './params';
import BigNumber from 'bignumber.js';
import { getWithdrawDetails } from './withdrawDetails';

/**
  USD - 60
  BTC - 30
  ETH - 15
  S - 15
  totalWeight - 120
 */

const fee = {
  dynamicFeesEnabled: true,
  adminMintLPFeeBps: BigNumber(0.003),
  adminBurnLPFeeBps: BigNumber(0.002),
  feeBps: BigNumber(0.0025),
  taxBps: BigNumber(0.0015),
};

describe('Calculate withdraw details', () => {
  test('Lp input low precision', () => {
    const result = getWithdrawDetails({
      isLpTokenInput: false,
      tokenPriceUSD: BigNumber(0.8),
      totalSupply: BigNumber(9_999_000),
      totalValue: BigNumber(10_000_000),
      tokenValue: BigNumber(2_000_000),
      targetTokenWeight: BigNumber(60),
      totalWeight: BigNumber(120),
      fee,
      inputs: {
        tokenInput: '0',
        lpInput: '10000',
      },
    });
    expect(result).toEqual({ minLpReceive: BigNumber(7962.40368), tokenSpend: BigNumber(10000), fee: BigNumber(36.8) } as DepositDetails);
  });

  test('Token input low precision', () => {
    const result = getWithdrawDetails({
      isLpTokenInput: true,
      tokenPriceUSD: BigNumber(0.8),
      totalSupply: BigNumber(9_999_000),
      totalValue: BigNumber(10_000_000),
      tokenValue: BigNumber(2_000_000),
      targetTokenWeight: BigNumber(60),
      totalWeight: BigNumber(120),
      fee,
      inputs: {
        tokenInput: '0',
        lpInput: '7962.40368',
      },
    });
    expect(result).toEqual({ minLpReceive: BigNumber(7962.40368), tokenSpend: BigNumber(10000), fee: BigNumber(36.8) } as DepositDetails);
  });
});
