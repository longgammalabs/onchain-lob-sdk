import BigNumber from 'bignumber.js';
import type { Market } from '../src';

const testMarkets = {
  btcUsd: {
    id: '0xE81761301eB892b15E1CC8676273E8361e1E77d8'.toLowerCase(),
    name: 'BTCUSDC',
    symbol: 'BTCUSDC',
    baseToken: {
      id: '0xFeF054B1a6290d1E5C74e9E2e06249c1Cfd8B7E8'.toLowerCase(),
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      contractAddress: '0xFeF054B1a6290d1E5C74e9E2e06249c1Cfd8B7E8'.toLowerCase(),
      decimals: 8,
      roundingDecimals: 8,
      supportsPermit: false,
      iconUrl: null,
      fromOg: false,
      isNative: false,
      priceFeed: '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
      priceFeedDecimals: 8,
      isUserGenerated: false,
      description: '',
    },
    quoteToken: {
      id: '0x9e47B13223611871E4b22BA825267667CfCD1559'.toLowerCase(),
      name: 'USD Coin',
      symbol: 'USDC.e',
      contractAddress: '0x9e47B13223611871E4b22BA825267667CfCD1559'.toLowerCase(),
      decimals: 6,
      roundingDecimals: 6,
      supportsPermit: false,
      iconUrl: null,
      fromOg: false,
      isNative: false,
      priceFeed: '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
      priceFeedDecimals: 8,
      isUserGenerated: false,
      description: '',
    },
    orderbookAddress: '0xE81761301eB892b15E1CC8676273E8361e1E77d8'.toLowerCase(),
    aggregations: expect.any(Array),
    rawLastPrice: expect.any(BigInt),
    lastPrice: expect.any(BigNumber),
    rawLowPrice24h: expect.any(BigInt),
    lowPrice24h: expect.any(BigNumber),
    rawHighPrice24h: expect.any(BigInt),
    highPrice24h: expect.any(BigNumber),
    tokenXScalingFactor: 6,
    tokenYScalingFactor: 6,
    priceScalingFactor: 0,
    rawPrice24h: expect.any(BigInt),
    price24h: expect.any(BigNumber),
    rawBestAsk: expect.any(BigInt),
    bestAsk: expect.any(BigNumber),
    rawBestBid: expect.any(BigInt),
    bestBid: expect.any(BigNumber),
    rawTradingVolume24h: expect.any(BigInt),
    tradingVolume24h: expect.any(BigNumber),
    totalSupply: expect.any(BigNumber),
    lastTouched: expect.any(Number),
    supportsNativeToken: false,
    isNativeTokenX: false,
    aggressiveFee: 0.0003,
    passiveFee: 0,
    passiveOrderPayout: 0,
    isUserGenerated: false,
  },
} as const satisfies Record<string, Market>;

export interface TestConfig {
  readonly rpcUrl: string;
  readonly chainId: number;
  readonly accountPrivateKey: string;
  readonly onchainLobApiBaseUrl: string;
  readonly onchainLobWebsocketBaseUrl: string;
  readonly testMarkets: typeof testMarkets;
}

const envInfos = [
  ['RPC_URL', 'the RPC URL for EVM node'],
  ['CHAIN_ID', 'chain ID of the EVM network'],
  ['ACCOUNT_PRIVATE_KEY', 'the private key of the test account'],
  ['API_BASE_URL', 'the base URL for Onchain LOB API'],
  ['WEBSOCKET_BASE_URL', 'the base URL for Onchain LOB Websocket'],
] as const;

const validateRequiredEnvironmentVariables = (): [true, typeof process.env & Record<typeof envInfos[number][0], string>] | [false, string[]] => {
  const errors: string[] = [];
  for (const [name, description] of envInfos) {
    if (!process.env[name])
      errors.push(`Please, specify \x1b[34m${name}\x1b[0m - ${description}`);
  }

  return errors.length ? [false, errors] : [true, process.env as any];
};

const createInvalidEnvironmentVariablesError = (errors: string[]): Error =>
  new Error(errors.reduce(
    (acc, error, index) => `  ${acc}${index + 1}. ${error}\n`,
    '\nSome required environment variables are invalid:\n'
  ));

export const getTestConfig = (): TestConfig => {
  const [isValid, env] = validateRequiredEnvironmentVariables();
  if (!isValid)
    throw createInvalidEnvironmentVariablesError(env);

  return {
    rpcUrl: env.RPC_URL,
    chainId: Number.parseInt(env.CHAIN_ID),
    accountPrivateKey: env.ACCOUNT_PRIVATE_KEY,
    onchainLobApiBaseUrl: env.API_BASE_URL,
    onchainLobWebsocketBaseUrl: env.WEBSOCKET_BASE_URL,
    testMarkets,
  };
};
