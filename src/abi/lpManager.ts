export const lpManagerAbi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UPGRADE_INTERFACE_VERSION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'acceptOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addLiquidity',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minUsdValue',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minLPMinted',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'expires',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      {
        name: 'lob',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'batchChangeOrder',
    inputs: [
      {
        name: 'lobId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'orderIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
      {
        name: 'quantities',
        type: 'uint128[]',
        internalType: 'uint128[]',
      },
      {
        name: 'prices',
        type: 'uint72[]',
        internalType: 'uint72[]',
      },
      {
        name: 'maxCommissionPerOrder',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'postOnly',
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
        name: 'newOrderIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'changeLob',
    inputs: [
      {
        name: 'lobAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'isActive',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'tokenIdX',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'tokenIdY',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'maxOrderDistanceBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'changeMarketMaker',
    inputs: [
      {
        name: 'marketMaker',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'isActive',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'changeOrder',
    inputs: [
      {
        name: 'lobId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'oldOrderId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'newQuantity',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'newPrice',
        type: 'uint72',
        internalType: 'uint72',
      },
      {
        name: 'maxCommission',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: 'postOnly',
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
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'changePrimaryMarketMaker',
    inputs: [
      {
        name: '_primaryMarketMaker',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'changeRfqOrderSigner',
    inputs: [
      {
        name: '_rfqOrderSigner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'changeToken',
    inputs: [
      {
        name: '_tokenAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_isActive',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_targetWeight',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_decimals',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: '_oracleConfRel',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: '_oraclePriceId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'checkCooldown',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimOrder',
    inputs: [
      {
        name: 'lobId',
        type: 'uint8',
        internalType: 'uint8',
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
    name: 'collectFees',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'eip712Domain',
    inputs: [],
    outputs: [
      {
        name: 'fields',
        type: 'bytes1',
        internalType: 'bytes1',
      },
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'version',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'salt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'extensions',
        type: 'uint256[]',
        internalType: 'uint256[]',
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
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: '',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
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
    name: 'getFeeBasisPoints',
    inputs: [
      {
        name: 'totalValue',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'initialTokenValue',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'nextTokenValue',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'targetTokenWeight',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPriceOf',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'int32',
        internalType: 'int32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTokenSharesAndValues',
    inputs: [],
    outputs: [
      {
        name: 'shares',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'usdValues',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalSharesOf',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalValue',
    inputs: [],
    outputs: [
      {
        name: 'totalUSDValue',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_domainName',
        type: 'string',
        internalType: 'string',
      },
      {
        name: '_oracle',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_liquidityToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_rfqOrderSigner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'lastAddedAt',
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
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'liquidityToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract LPToken',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lobReservesByTokenId',
    inputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lobs',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'lobAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tokenIdX',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'tokenIdY',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'isActive',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'maxOrderDistanceBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'marketMakers',
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
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'oracle',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IOracle',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
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
    name: 'pendingOwner',
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
    name: 'placeOrder',
    inputs: [
      {
        name: 'lobId',
        type: 'uint8',
        internalType: 'uint8',
      },
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
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'placeRfqOrder',
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
        name: 'expires',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'rfqOrder',
        type: 'tuple',
        internalType: 'struct RfqOrder',
        components: [
          {
            name: 'lobId',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'qty',
            type: 'uint128',
            internalType: 'uint128',
          },
          {
            name: 'price',
            type: 'uint72',
            internalType: 'uint72',
          },
          {
            name: 'isAsk',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'postOnly',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'expires',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'userAddress',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nonce',
            type: 'uint128',
            internalType: 'uint128',
          },
        ],
      },
      {
        name: 'v',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'r',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'orderId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'primaryMarketMaker',
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
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'removeLiquidity',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'burnLP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minUsdValue',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minTokenGet',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'expires',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rfqOrderSigner',
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
    name: 'setConfig',
    inputs: [
      {
        name: '_dynamicFeesEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_adminMintLPFeeBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_adminBurnLPFeeBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_feeBasisBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_taxBasisBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_cooldownDuration',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_maxOracleAge',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: '_minLiquidityValueUsd',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: '_marketMakerLPShareEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_marketMakerLPShareBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'tokens',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'tokenAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'isActive',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'targetWeight',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'decimals',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'oracleConfRel',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: 'oraclePriceId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalWeight',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint24',
        internalType: 'uint24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'ConfigSet',
    inputs: [
      {
        name: 'adminMintLPFeeBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'adminBurnLPFeeBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'feeBasisBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'taxBasisPoints',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'cooldownDuration',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'maxOracleAge',
        type: 'uint24',
        indexed: false,
        internalType: 'uint24',
      },
      {
        name: 'minLiquidityValueUsd',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'marketMakerLPShareEnabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'marketMakerLPShareBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EIP712DomainChanged',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiquidityAdded',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'tokenUSDValue',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalUSDValue',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lpTotalSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'mintedLP',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiquidityRemoved',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lpUSDValue',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalUSDValue',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lpTotalSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'burnedLP',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LobChanged',
    inputs: [
      {
        name: 'lobId',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'lobAddress',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'isActive',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'tokenIdX',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'tokenIdY',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'maxOrderDistanceBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MarketMakerChanged',
    inputs: [
      {
        name: 'marketMaker',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'isActive',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferStarted',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PrimaryMarketMakerChanged',
    inputs: [
      {
        name: 'oldMarketMaker',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newMarketMaker',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RfqOrderPlaced',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'isAsk',
        type: 'bool',
        indexed: false,
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
        type: 'uint72',
        indexed: false,
        internalType: 'uint72',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RfqOrderSignerChanged',
    inputs: [
      {
        name: 'oldSigner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newSigner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TokenChanged',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'tokenAddress',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'isActive',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'targetWeight',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'decimals',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'oracleConfRel',
        type: 'uint24',
        indexed: false,
        internalType: 'uint24',
      },
      {
        name: 'oraclePriceId',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AddressEmptyCode',
    inputs: [
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'CooldownDurationNotYetPassed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ERC1967InvalidImplementation',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967NonPayable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Expired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FeeBpsExceedsMaximum',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientLiquidityValue',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientMarketMakerLPShare',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientMintedLP',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientTokenAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientUSDValue',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAmountToWithdraw',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidFloatingPointRepresentation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidRfqOrderSide',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidRfqOrderSigner',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTrader',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTransfer',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidUserAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LobDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MarketMakerLPShareExceedsMaximum',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NonPositivePrice',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OracleConfTooHigh',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'PriceTooBig',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PriceTooSmall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RfqOrderAlreadyUsed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'TokenDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnauthorizedCallContext',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnsupportedProxiableUUID',
    inputs: [
      {
        name: 'slot',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'UnknownLob',
    inputs: [],
  },
  {
    type: 'error',
    name: 'WrongNumber',
    inputs: [],
  },
  {
    type: 'error',
    name: 'WrongTokenId',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAmount',
    inputs: [],
  },
] as const;
