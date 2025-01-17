import { expect } from '@jest/globals';
import { DepositDetails } from './params';
import BigNumber from 'bignumber.js';
import { getDepositDetails } from './depositDetails';

/**
  Weights:

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

describe('Calculate deposit details', () => {
  test('Token input low precision', () => {
    const result = getDepositDetails({
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
        lpInput: '0',
        slippageBps: 0.1,
      },
    });
    expect(result).toEqual({
      lpReceive: BigNumber(7962.40368),
      tokenSpend: BigNumber(10000),
      fee: BigNumber(46),
      params: {
        amount: 10000000000000000000000n,
        amountUsd: 8000000000000000000000n,
        minLpMinted: 7166163312000000000000n,
      },
    } as DepositDetails);
  });

  test('Lp input low precision', () => {
    const result = getDepositDetails({
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
        lpInput: '7962.40368',
        slippageBps: 0.1,
      },
    });
    expect(result).toEqual({
      lpReceive: BigNumber(7962.40368),
      tokenSpend: BigNumber(10000),
      fee: BigNumber(46),
      params: {
        amount: 10000000000000000000000n,
        amountUsd: 8000000000000000000000n,
        minLpMinted: 7166163312000000000000n,
      },
    } as DepositDetails);
  });

  test.skip('Token input high precision', () => {
    const result = getDepositDetails({
      isLpTokenInput: false,
      tokenPriceUSD: BigNumber(0.8765),
      totalSupply: BigNumber(9_998_000.123),
      totalValue: BigNumber(10_001_000.312),
      tokenValue: BigNumber(1_888_987.876),
      targetTokenWeight: BigNumber(60),
      totalWeight: BigNumber(120),
      tokenDecimals: 18,
      lpTokenDecimals: 18,
      fee,
      inputs: {
        tokenInput: '5678.1234',
        lpInput: '0',
        slippageBps: 0.1,
      },
    });
    expect(result).toEqual({
      lpReceive: BigNumber('4952.661375268296167083'),
      tokenSpend: BigNumber('5678.1234'),
      fee: BigNumber('25.929943632921836335'),
      params: {
        amount: 5678123400000000000000n,
        amountUsd: 4976875160100000000000n,
        minLpMinted: 4457395237741466550374n,
      },
    } as DepositDetails);
  });

  test.skip('Lp input high precision', () => {
    const result = getDepositDetails({
      isLpTokenInput: true,
      tokenPriceUSD: BigNumber(0.8765),
      totalSupply: BigNumber(9_998_000.123),
      totalValue: BigNumber(10_001_000.312),
      tokenValue: BigNumber(1_888_987.876),
      targetTokenWeight: BigNumber(60),
      totalWeight: BigNumber(120),
      tokenDecimals: 18,
      lpTokenDecimals: 18,
      fee,
      inputs: {
        tokenInput: '0',
        lpInput: '4952.661375268296167083',
        slippageBps: 0.1,
      },
    });
    expect(result).toEqual({
      lpReceive: BigNumber('4952.661375268296167083'),
      tokenSpend: BigNumber('5678.1234'),
      fee: BigNumber('25.929943632921836335'),
      params: {
        amount: 5678123400000000000000n,
        amountUsd: 4976875160100000000000n,
        minLpMinted: 4457395237741466550374n,
      },
    } as DepositDetails);
  });
});
