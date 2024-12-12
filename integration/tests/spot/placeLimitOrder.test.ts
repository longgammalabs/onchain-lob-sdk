import BigNumber from 'bignumber.js';
import { ethers, type ContractTransactionResponse, type Provider, type Wallet } from 'ethers';

import { OnchainLobClient, PlaceOrderSpotParams, type Order, PlaceOrderWithPermitSpotParams } from '../../../src';
import { getTestConfig, type TestConfig } from '../../testConfig';
import { expectOrder, transactionRegex, waitForOrder } from '../../testHelpers';
import { erc20Abi } from '../../../src/abi';

describe('Onchain LOB Spot Place Limit Order API', () => {
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
  }, 15_000);

  beforeEach(async () => {
    onchainLobClient = new OnchainLobClient({
      apiBaseUrl: testConfig.onchainLobApiBaseUrl,
      webSocketApiBaseUrl: testConfig.onchainLobWebsocketBaseUrl,
      signer: wallet,
      webSocketConnectImmediately: false,
    });
  });

  test.each(
    [
      (testConfig, wallet) => ({
        market: testConfig.testMarkets.btcUsd.id,
        approveAmount: new BigNumber(0.5),
        newOrderParams: {
          market: testConfig.testMarkets.btcUsd.id,
          type: 'limit',
          side: 'ask',
          price: new BigNumber(117),
          size: new BigNumber(0.5),
          useNativeToken: false,
          maxCommission: new BigNumber(1),
        },
        expectedNewOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'ask',
          rawPrice: 1170000n,
          price: new BigNumber(117),
          rawSize: 50n,
          size: new BigNumber(0.5),
          rawOrigSize: 50n,
          origSize: new BigNumber(0.5),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
        expectedCancelOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'ask',
          rawPrice: 1170000n,
          price: new BigNumber(117),
          rawSize: 50n,
          size: new BigNumber(0.5),
          rawOrigSize: 50n,
          origSize: new BigNumber(0.5),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
      }),
      (testConfig, wallet) => ({
        market: testConfig.testMarkets.btcUsd.id,
        approveAmount: new BigNumber(0.03),
        newOrderParams: {
          market: testConfig.testMarkets.btcUsd.id,
          type: 'limit',
          side: 'bid',
          price: new BigNumber(0.01),
          size: new BigNumber(0.03),
          useNativeToken: false,
          maxCommission: new BigNumber(1),
        },
        expectedNewOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          status: 'open',
          rawPrice: 100n,
          price: new BigNumber(0.01),
          rawSize: 3n,
          size: new BigNumber(0.03),
          rawOrigSize: 3n,
          origSize: new BigNumber(0.03),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
        expectedCancelOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          status: 'cancelled',
          rawPrice: 100n,
          price: new BigNumber(0.01),
          rawSize: 3n,
          size: new BigNumber(0.03),
          rawOrigSize: 3n,
          origSize: new BigNumber(0.03),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
      }),
      (testConfig, wallet) => ({
        market: testConfig.testMarkets.btcUsd.id,
        approveAmount: 770n * (10n ** 15n),
        newOrderParams: {
          market: testConfig.testMarkets.btcUsd.id,
          type: 'limit',
          side: 'ask',
          price: 3170000n,
          size: 77n,
          maxCommission: new BigNumber(1),
        },
        expectedNewOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'ask',
          rawPrice: 3170000n,
          price: new BigNumber(317),
          rawSize: 77n,
          size: new BigNumber(0.77),
          rawOrigSize: 77n,
          origSize: new BigNumber(0.77),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
        expectedCancelOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'ask',
          rawPrice: 3170000n,
          price: new BigNumber(317),
          rawSize: 77n,
          size: new BigNumber(0.77),
          rawOrigSize: 77n,
          origSize: new BigNumber(0.77),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
      }),
      (testConfig, wallet) => ({
        market: testConfig.testMarkets.btcUsd.id,
        approveAmount: 1n * (10n ** 16n),
        newOrderParams: {
          market: testConfig.testMarkets.btcUsd.id,
          type: 'limit',
          side: 'bid',
          price: 1n,
          size: 1n,
          maxCommission: new BigNumber(1),
        },
        expectedNewOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          status: 'open',
          rawPrice: 1n,
          price: new BigNumber(0.0001),
          rawSize: 1n,
          size: new BigNumber(0.01),
          rawOrigSize: 1n,
          origSize: new BigNumber(0.01),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
        expectedCancelOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          status: 'cancelled',
          rawPrice: 1n,
          price: new BigNumber(0.0001),
          rawSize: 1n,
          size: new BigNumber(0.01),
          rawOrigSize: 1n,
          origSize: new BigNumber(0.01),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
      }),
    ] as Array<(testConfig: TestConfig, wallet: Wallet) => {
      market: string;
      approveAmount: BigNumber | bigint;
      newOrderParams: PlaceOrderSpotParams;
      expectedNewOrder: Partial<Order>;
      expectedCancelOrder: Partial<Order>;
    }>
  )('Post a new limit order and cancel it', async getTestCase => {
    const { market, approveAmount, newOrderParams, expectedNewOrder, expectedCancelOrder } = getTestCase(testConfig, wallet);
    let tx: ContractTransactionResponse;

    tx = await onchainLobClient.spot.approveTokens({
      market,
      amount: approveAmount,
      isBaseToken: newOrderParams.side === 'ask',
    });
    expect(tx.hash).toMatch(transactionRegex);

    tx = await onchainLobClient.spot.placeOrder(newOrderParams);
    expect(tx.hash).toMatch(transactionRegex);

    const newOrder = await waitForOrder(
      () => onchainLobClient.spot.getOrders({ market, user: wallet.address }),
      o => o.txnHash === tx.hash
    );
    expectOrder(newOrder, expectedNewOrder);

    tx = await onchainLobClient.spot.claimOrder({
      market,
      orderId: newOrder!.orderId,
      onlyClaim: false,
    });
    expect(tx.hash).toMatch(transactionRegex);

    const canceledOrder = await waitForOrder(
      () => onchainLobClient.spot.getOrders({ market, user: wallet.address }),
      o => o.orderId === newOrder!.orderId && o.status === 'cancelled'
    );
    expectOrder(canceledOrder, expectedCancelOrder);
  }, 45_000);

  // no token with permit
  test.skip.each(
    [
      (testConfig, wallet) => ({
        market: testConfig.testMarkets.btcUsd.id,
        newOrderParams: {
          market: testConfig.testMarkets.btcUsd.id,
          type: 'limit',
          side: 'bid',
          price: new BigNumber(0.01),
          size: new BigNumber(1),
          maxCommission: new BigNumber(0),
          permit: new BigNumber(0.01),
        },
        expectedNewOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          rawPrice: 100n,
          price: new BigNumber(0.01),
          rawSize: 1000n,
          size: new BigNumber(1),
          rawOrigSize: 1000n,
          origSize: new BigNumber(1),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
        expectedCancelOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          rawPrice: 100n,
          price: new BigNumber(0.01),
          rawSize: 0n,
          size: new BigNumber(0),
          rawOrigSize: 1000n,
          origSize: new BigNumber(1),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
      }),
      (testConfig, wallet) => ({
        market: testConfig.testMarkets.btcUsd.id,
        newOrderParams: {
          market: testConfig.testMarkets.btcUsd.id,
          type: 'limit',
          side: 'bid',
          price: 1n,
          size: 1n,
          maxCommission: 0n,
          permit: 1n * (10n ** 13n),
        },
        expectedNewOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          status: 'open',
          rawPrice: 1n,
          price: new BigNumber(0.0001),
          rawSize: 1n,
          size: new BigNumber(0.001),
          rawOrigSize: 1n,
          origSize: new BigNumber(0.001),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
        expectedCancelOrder: {
          market: {
            id: testConfig.testMarkets.btcUsd.id,
          },
          type: 'limit',
          side: 'bid',
          status: 'cancelled',
          rawPrice: 1n,
          price: new BigNumber(0.0001),
          rawSize: 0n,
          size: new BigNumber(0),
          rawOrigSize: 1n,
          origSize: new BigNumber(0.001),
          rawClaimed: 0n,
          claimed: new BigNumber(0),
          owner: wallet.address.toLowerCase(),
        },
      }),
    ] as Array<(testConfig: TestConfig, wallet: Wallet) => {
      market: string;
      newOrderParams: PlaceOrderWithPermitSpotParams;
      expectedNewOrder: Partial<Order>;
      expectedCancelOrder: Partial<Order>;
    }>
  )('Post a new limit order with permit and cancel it', async getTestCase => {
    const { market, newOrderParams, expectedNewOrder, expectedCancelOrder } = getTestCase(testConfig, wallet);
    let tx: ContractTransactionResponse;
    tx = await onchainLobClient.spot.placeOrderWithPermit(newOrderParams);

    const newOrder = await waitForOrder(
      () => onchainLobClient.spot.getOrders({ market, user: wallet.address }),
      o => o.txnHash === tx.hash
    );
    expectOrder(newOrder, expectedNewOrder);

    tx = await onchainLobClient.spot.claimOrder({
      market,
      orderId: newOrder!.orderId,
      onlyClaim: false,
    });
    expect(tx.hash).toMatch(transactionRegex);

    const canceledOrder = await waitForOrder(
      () => onchainLobClient.spot.getOrders({ market, user: wallet.address }),
      o => o.orderId === newOrder!.orderId && o.status === 'cancelled'
    );
    expectOrder(canceledOrder, expectedCancelOrder);
  }, 60_000);
});
