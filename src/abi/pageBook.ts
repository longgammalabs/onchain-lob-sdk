// PageBook (MIP-8 order book), longgammalabs/mip8-clob feat/pagebook,
// deployments/monad-testnet/PageBookImplementation.abi.json.
export const pageBookAbi = [
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'EVENTS_VERSION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'assembleOrderbookFromOrders',
    inputs: [
      {
        name: 'isAsk',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'maxPriceLevels',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    outputs: [
      {
        name: 'prices',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'shares',
        type: 'uint128[]',
        internalType: 'uint128[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'batchExecute',
    inputs: [
      {
        name: 'data',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        name: 'results',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimOrder',
    inputs: [
      {
        name: 'orderOwner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'orderId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'onlyClaim',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'transferTokens',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'withdrawAsNativeToken',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'expires',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'decimalsTokenX',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimalsTokenY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'depositTokens',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'tokenXAmount',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'tokenYAmount',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'feesReceiver',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'generateOrderId',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'traderNonce',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'getAccumulatedFees',
    inputs: [],
    outputs: [
      {
        name: 'tokenAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'rawFees',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCommissionRates',
    inputs: [],
    outputs: [
      {
        name: 'aggressiveRate',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getConfig',
    inputs: [],
    outputs: [
      {
        name: 'config',
        type: 'tuple',
        internalType: 'struct PageBookImplementation.MarketConfig',
        components: [
          {
            name: 'tokenX',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'tokenY',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'decimalsTokenX',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'decimalsTokenY',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'tokenXScaleExponent',
            type: 'int8',
            internalType: 'int8',
          },
          {
            name: 'tokenYScaleExponent',
            type: 'int8',
            internalType: 'int8',
          },
          {
            name: 'supportsNativeToken',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'isTokenXWrappedNative',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'pauser',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'feesReceiver',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'isPaused',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'minPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxSignificantDigits',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'aggressiveCommissionRate',
            type: 'uint64',
            internalType: 'uint64',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPriceLimits',
    inputs: [],
    outputs: [
      {
        name: 'minimumPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maximumPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'significantDigits',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTraderBalances',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [
      {
        name: 'availableTokenX',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'reservedTokenX',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'availableTokenY',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'reservedTokenY',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTraderConfig',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [
      {
        name: 'traderOwner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'claimable',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'transferTokens',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'withdrawAsNativeEth',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTraderNonce',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'initialTokenX',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'initialTokenXScaleExponent',
        type: 'int8',
        internalType: 'int8',
      },
      {
        name: 'initialTokenY',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'initialTokenYScaleExponent',
        type: 'int8',
        internalType: 'int8',
      },
      {
        name: 'initialSupportsNativeToken',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'initialIsTokenXWrappedNative',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'initialPauser',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'warmUpCount',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isPaused',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isTokenXWrappedNative',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'openOrderCount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pauser',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'placeMarketOrderWithTargetValue',
    inputs: [
      {
        name: 'isAsk',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'targetTokenYValue',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'price',
        type: 'uint72',
        internalType: 'uint72',
      },
      {
        name: 'maxCommission',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'transferExecutedTokens',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'expires',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'executedShares',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'executedValue',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'aggressiveFee',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'placeOrder',
    inputs: [
      {
        name: 'isAsk',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'quantity',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'price',
        type: 'uint72',
        internalType: 'uint72',
      },
      {
        name: 'maxCommission',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'marketOnly',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'postOnly',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'transferExecutedTokens',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'expires',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'orderId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'executedShares',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'executedValue',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'aggressiveFee',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'registerTrader',
    inputs: [],
    outputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'replaceBatch',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'bids',
        type: 'tuple[]',
        internalType: 'struct PageBookImplementation.OrderChange[]',
        components: [
          {
            name: 'price',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'quantity',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'expiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'asks',
        type: 'tuple[]',
        internalType: 'struct PageBookImplementation.OrderChange[]',
        components: [
          {
            name: 'price',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'quantity',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'expiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setCommissionRates',
    inputs: [
      {
        name: 'aggressiveRate',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setFeesReceiver',
    inputs: [
      {
        name: 'newFeesReceiver',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPauser',
    inputs: [
      {
        name: 'newPauser',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPriceLimits',
    inputs: [
      {
        name: 'newMinPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'newMaxPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'newMaxSignificantDigits',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTraderConfig',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'claimable',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'transferTokens',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'withdrawAsNativeEth',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsNativeToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenX',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenXScaleExponent',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'int8',
        internalType: 'int8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenYScaleExponent',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'int8',
        internalType: 'int8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'traderBalances',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'availableTokenX',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'reservedTokenX',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'availableTokenY',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'reservedTokenY',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'traderId',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferFees',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'warmUpMemory',
    inputs: [
      {
        name: 'n',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawTokens',
    inputs: [
      {
        name: 'id',
        type: 'uint32',
        internalType: 'uint32',
      },
      {
        name: 'withdrawAll',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'tokenXAmount',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'tokenYAmount',
        type: 'uint128',
        internalType: 'uint128',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'CommissionRatesUpdated',
    inputs: [
      {
        name: 'aggressiveRate',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ConfigChanged',
    inputs: [
      {
        name: 'config',
        type: 'tuple',
        indexed: false,
        internalType: 'struct PageBookImplementation.MarketConfig',
        components: [
          {
            name: 'tokenX',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'tokenY',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'decimalsTokenX',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'decimalsTokenY',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'tokenXScaleExponent',
            type: 'int8',
            internalType: 'int8',
          },
          {
            name: 'tokenYScaleExponent',
            type: 'int8',
            internalType: 'int8',
          },
          {
            name: 'supportsNativeToken',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'isTokenXWrappedNative',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'pauser',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'feesReceiver',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'isPaused',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'minPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxSignificantDigits',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'aggressiveCommissionRate',
            type: 'uint64',
            internalType: 'uint64',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DepositedV2',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenX',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'tokenY',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeesReceiverChanged',
    inputs: [
      {
        name: 'previousReceiver',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newReceiver',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeesTransferredV2',
    inputs: [
      {
        name: 'receiver',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenX',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'tokenY',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LegacyOrderSettledV2',
    inputs: [
      {
        name: 'orderId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenX',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'tokenY',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MemoryWarmedUp',
    inputs: [
      {
        name: 'slotsCount',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OrderCancelled',
    inputs: [
      {
        name: 'orderId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sharesRemoved',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OrderExpiredV2',
    inputs: [
      {
        name: 'orderId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sharesRemoved',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OrderFilledV2',
    inputs: [
      {
        name: 'makerOrderId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'takerOrderId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'maker',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'taker',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'takerIsAsk',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'price',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'shares',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'value',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'makerFee',
        type: 'int128',
        indexed: false,
        internalType: 'int128',
      },
      {
        name: 'takerFee',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'makerRemaining',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OrderPlacedV2',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'initiator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'orderId',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
      {
        name: 'isAsk',
        type: 'bool',
        indexed: true,
        internalType: 'bool',
      },
      {
        name: 'quantity',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'price',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'passiveShares',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'passiveFee',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'aggressiveShares',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'aggressiveValue',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'aggressiveFee',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'marketOnly',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'postOnly',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'expiry',
        type: 'uint32',
        indexed: false,
        internalType: 'uint32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PauseStateChanged',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'isPaused',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PauserChanged',
    inputs: [
      {
        name: 'previousPauser',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newPauser',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PriceLimitsUpdated',
    inputs: [
      {
        name: 'minPrice',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'maxPrice',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'maxSignificantDigits',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TraderConfigChanged',
    inputs: [
      {
        name: 'traderId',
        type: 'uint32',
        indexed: true,
        internalType: 'uint32',
      },
      {
        name: 'claimable',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'transferTokens',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'withdrawAsNativeEth',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TraderRegistered',
    inputs: [
      {
        name: 'traderId',
        type: 'uint32',
        indexed: true,
        internalType: 'uint32',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WithdrawnV2',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenX',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'tokenY',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ArenaExhausted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BatchExecutionFailed',
    inputs: [
      {
        name: 'callIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'reason',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
  },
  {
    type: 'error',
    name: 'ClaimNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Expired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Forbidden',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientTokenXBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientTokenYBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBatchSize',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidCommissionRate',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidExpiry',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidFeesReceiver',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidImplementation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOrderId',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidPauser',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidPointer',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidPrice',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidPriceLimits',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSignificantDigits',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSlotType',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTokenAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTraderId',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTransfer',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MarketOnlyAndPostOnlyFlagsConflict',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MaxCommissionFailure',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NativeTokenDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NullPointer',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OnlyPrivilegedSenderCanCancelOrders',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'Paused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PointerAlreadyFreed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Reentrant',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReservedSlot',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TraderIdsExhausted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TraderNonceExhausted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TransferFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnauthorizedPauser',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'UnauthorizedTrader',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'UnsortedOrders',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroTokenTransferNotAllowed',
    inputs: [],
  },
] as const;
