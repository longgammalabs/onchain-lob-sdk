import { expect } from '@jest/globals';
import { WithdrawDetails } from './params';
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
  test.skip('Lp input low precision', () => {
    const result = getWithdrawDetails({
      isLpTokenInput: true,
      tokenPriceUSD: BigNumber(0.8),
      totalSupply: BigNumber(9_999_000),
      totalValue: BigNumber(10_000_000),
      tokenValue: BigNumber(2_000_000),
      targetTokenWeight: BigNumber(60),
      totalWeight: BigNumber(120),
      tokenDecimals: 18,
      lpTokenDecimals: 18,
      fee,
      inputs: {
        tokenInput: '0',
        lpInput: '10000',
        slippageBps: 0.1,
      },
    });
    expect(result).toEqual({
      lpSpend: BigNumber(10000),
      tokenReceive: BigNumber(0),
      fee: BigNumber(0),
      params: {
        minTokenGet: 0n,
        minUsdValue: 0n,
        burnLP: 0n,
      },
    } as WithdrawDetails);
  });

  test.skip('Token input low precision', () => {
    const result = getWithdrawDetails({
      isLpTokenInput: false,
      tokenPriceUSD: BigNumber(0.8),
      totalSupply: BigNumber(9_999_000),
      totalValue: BigNumber(10_000_000),
      tokenValue: BigNumber(2_000_000),
      targetTokenWeight: BigNumber(60),
      totalWeight: BigNumber(120),
      tokenDecimals: 18,
      lpTokenDecimals: 18,
      fee,
      inputs: {
        tokenInput: '10000',
        lpInput: '',
        slippageBps: 0.1,
      },
    });
    expect(result).toEqual({
      lpSpend: BigNumber(0),
      tokenReceive: BigNumber(0),
      fee: BigNumber(0),
      params: {
        minTokenGet: 0n,
        minUsdValue: 0n,
        burnLP: 0n,
      },
    } as WithdrawDetails);
  });
});
