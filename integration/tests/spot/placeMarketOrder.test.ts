import BigNumber from 'bignumber.js';
import { ethers, type ContractTransactionResponse, type Provider, type Wallet } from 'ethers';

import { OnchainLobClient } from '../../../src';
import { getTestConfig, type TestConfig } from '../../testConfig';
import { transactionRegex } from '../../testHelpers';
import { erc20Abi } from '../../../src/abi';

describe('Onchain LOB Spot Client Contract API', () => {
  let testConfig: TestConfig;
  let provider: Provider;
  let wallet: Wallet;
  let onchainLobClient: OnchainLobClient;

  beforeAll(async () => {
    testConfig = getTestConfig();
    provider = new ethers.JsonRpcProvider(testConfig.rpcUrl);
    wallet = new ethers.Wallet(testConfig.accountPrivateKey, provider);
    // check if user has 1 unit of each token for interacting
    let contract = new ethers.Contract(testConfig.testMarkets.btcUsd.baseToken.contractAddress, erc20Abi, provider);
    let balance = await contract.balanceOf!(wallet.address);
    if (balance < 1n * (10n ** BigInt(testConfig.testMarkets.btcUsd.baseToken.decimals))) {
      throw new Error('User does not have 1 unit of base token');
    }
    contract = new ethers.Contract(testConfig.testMarkets.btcUsd.quoteToken.contractAddress, erc20Abi, provider);
    balance = await contract.balanceOf!(wallet.address);
    if (balance < 1n * (10n ** BigInt(testConfig.testMarkets.btcUsd.quoteToken.decimals))) {
      throw new Error('User does not have 1 unit of quote token');
    }
    onchainLobClient = new OnchainLobClient({
      apiBaseUrl: testConfig.onchainLobApiBaseUrl,
      webSocketApiBaseUrl: testConfig.onchainLobWebsocketBaseUrl,
      signer: wallet,
      webSocketConnectImmediately: false,
    });
  }, 15_000);

  test('Send ioc buy and sell orders', async () => {
    const market = testConfig.testMarkets.btcUsd.id;
    let tx: ContractTransactionResponse;

    const info = await onchainLobClient.spot.getMarket({ market });
    expect(info).toBeDefined();
    expect(info?.bestBid).not.toBeNull();
    tx = await onchainLobClient.spot.placeMarketOrderWithTargetValue({
      market,
      type: 'ioc',
      side: 'ask',
      price: info!.bestBid as BigNumber,
      maxCommission: BigNumber(1),
      size: BigNumber(0.1),
      nativeTokenToSend: BigNumber(1),
      transferExecutedTokens: true,
    });
    expect(tx.hash).toMatch(transactionRegex);

    expect(info?.bestAsk).not.toBeNull();
    tx = await onchainLobClient.spot.approveTokens({
      market,
      amount: BigNumber(0.1),
      isBaseToken: false,
    });
    expect(tx.hash).toMatch(transactionRegex);
    tx = await onchainLobClient.spot.placeMarketOrderWithTargetValue({
      market,
      type: 'ioc',
      side: 'bid',
      price: info!.bestAsk as BigNumber,
      maxCommission: BigNumber(1),
      size: BigNumber(0.1),
      transferExecutedTokens: true,
    });
    expect(tx.hash).toMatch(transactionRegex);
  }, 30_000);

  test('Send market execution buy and sell orders', async () => {
    const market = testConfig.testMarkets.btcUsd.id;
    let tx: ContractTransactionResponse;

    tx = await onchainLobClient.spot.placeMarketOrderWithTargetValue({
      market,
      type: 'market_execution',
      side: 'ask',
      maxCommission: BigNumber(1),
      size: BigNumber(0.1),
      nativeTokenToSend: BigNumber(1),
      transferExecutedTokens: true,
    });
    expect(tx.hash).toMatch(transactionRegex);

    tx = await onchainLobClient.spot.approveTokens({
      market,
      amount: BigNumber(0.1),
      isBaseToken: false,
    });
    expect(tx.hash).toMatch(transactionRegex);
    tx = await onchainLobClient.spot.placeMarketOrderWithTargetValue({
      market,
      type: 'market_execution',
      side: 'bid',
      maxCommission: BigNumber(1),
      size: BigNumber(0.1),
      transferExecutedTokens: true,
    });
    expect(tx.hash).toMatch(transactionRegex);
  }, 30_000);
});
