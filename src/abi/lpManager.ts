export const lpManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_pythAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_proxyPythAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'receive',
    stateMutability: 'payable',
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
      {
        name: 'priceUpdateData',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'approveForLOB',
    inputs: [
      {
        name: 'lobId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'tokenId',
        type: 'uint8',
        internalType: 'uint8',
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
    name: 'changePauser',
    inputs: [
      {
        name: 'pauser_',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
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
        name: '_lowerBoundWeight',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_upperBoundWeight',
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
    name: 'disableSlashingStatus',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
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
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '',
        type: 'uint128',
        internalType: 'uint128',
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
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
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
        type: 'bool',
        internalType: 'bool',
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
    name: 'getTokensCount',
    inputs: [],
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
    name: 'hwmLPPrice',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint96',
        internalType: 'uint96',
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
        name: '_liquidityToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_adminFeeRecipient',
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
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'paused',
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
      {
        name: 'priceUpdateData',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        name: 'orderId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'payable',
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
      {
        name: 'priceUpdateData',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
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
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: '_maxOracleAge',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_minLiquidityValueUsd',
        type: 'uint128',
        internalType: 'uint128',
      },
      {
        name: '_maxLiquidityValueUsd',
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
      {
        name: '_nativeTokenEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_nativeTokenTokenId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: '_adminFeeRecipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_priceValidityPeriod',
        type: 'uint24',
        internalType: 'uint24',
      },
      {
        name: '_baseMultiplier',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '_maxAllowedPriceDeviation',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '_perfFeeBps',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: '_adminPerfFeeBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'slashMakersShares',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
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
        name: 'lowerBoundWeight',
        type: 'uint16',
        internalType: 'uint16',
      },
      {
        name: 'upperBoundWeight',
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
    name: 'unpause',
    inputs: [],
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
    type: 'function',
    name: 'validateLPPriceAndDistributeFees',
    inputs: [
      {
        name: 'priceUpdateData',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'validateMarketMakerLPShare',
    inputs: [],
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'ConfigSet',
    inputs: [
      {
        name: 'dynamicFeesEnabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
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
        type: 'uint24',
        indexed: false,
        internalType: 'uint24',
      },
      {
        name: 'maxOracleAge',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'minLiquidityValueUsd',
        type: 'uint128',
        indexed: false,
        internalType: 'uint128',
      },
      {
        name: 'maxLiquidityValueUsd',
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
      {
        name: 'nativeTokenEnabled',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'nativeTokenTokenId',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'adminFeeRecipient',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'priceValidityPeriod',
        type: 'uint24',
        indexed: false,
        internalType: 'uint24',
      },
      {
        name: 'baseMultiplier',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
      {
        name: 'maxAllowedPriceDeviation',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
      {
        name: 'perfFeeBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'adminPerfFeeBps',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
    ],
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
        name: 'protocolFee',
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
      {
        name: 'accountLpShares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalSupply',
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
        name: 'protocolFee',
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
      {
        name: 'accountLpShares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalSupply',
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
    name: 'MakersSharesSlashed',
    inputs: [
      {
        name: 'marketMaker',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
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
    name: 'Paused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PauserChanged',
    inputs: [
      {
        name: 'newPauser',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'oldPauser',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PerformanceFeesDistributed',
    inputs: [
      {
        name: 'currentPrice',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'previousHWM',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'adminFeeAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'marketMakerFeeAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalSupply',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
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
    name: 'SlashingAvailableStatusChanged',
    inputs: [
      {
        name: 'status',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Sync',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenBalance',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'tokenReserved',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
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
        name: 'lowerBoundWeight',
        type: 'uint16',
        indexed: false,
        internalType: 'uint16',
      },
      {
        name: 'upperBoundWeight',
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
    name: 'Unpaused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
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
    name: 'EnforcedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExpectedPause',
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
    name: 'Forbidden',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientFeeForPythUpdate',
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
    name: 'InvalidOracleConfidenceLevel',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTokenWeights',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTrader',
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
    name: 'MaxLiquidityValueExceeded',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MaxOracleAgeExceedsMaximum',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NativeGasTokenDisabled',
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
    name: 'SafeCastOverflowedUintDowncast',
    inputs: [
      {
        name: 'bits',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'SlashingUnAvailable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TokenDisabled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TokenWeightExceeded',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TransferFailed',
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
