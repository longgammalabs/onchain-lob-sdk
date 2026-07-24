// Minimal LPManagerPair ABI: only the methods the SDK calls. Full contract ABI
// lives in the contracts repo. Selectors here are chosen to be unambiguous.
export const lpManagerPairAbi = [
  {
    type: 'function', stateMutability: 'view', name: 'previewAddLiquidity',
    inputs: [{ name: 'tokenId', type: 'uint8' }, { name: 'amount', type: 'uint256' }],
    outputs: [
      { name: 'amountTokenX', type: 'uint256' },
      { name: 'amountTokenY', type: 'uint256' },
      { name: 'adminFeeLP', type: 'uint256' },
      { name: 'mintedLP', type: 'uint256' }
    ]
  },
  {
    type: 'function', stateMutability: 'view', name: 'previewRemoveLiquidity',
    inputs: [{ name: 'burnLP', type: 'uint256' }],
    outputs: [
      { name: 'amountTokenX', type: 'uint256' },
      { name: 'amountTokenY', type: 'uint256' },
      { name: 'adminFeeLP', type: 'uint256' }
    ]
  },
  {
    type: 'function', stateMutability: 'view', name: 'getTotalReserves', inputs: [],
    outputs: [{ name: 'totalTokenX', type: 'uint256' }, { name: 'totalTokenY', type: 'uint256' }]
  },
  {
    type: 'function', stateMutability: 'view', name: 'getPairConfig', inputs: [],
    outputs: [
      { name: 'feeConfig', type: 'tuple', components: [
        { name: 'adminMintLPFeeBps', type: 'uint16' },
        { name: 'adminBurnLPFeeBps', type: 'uint16' },
        { name: 'adminFeeRecipient', type: 'address' }
      ] },
      { name: 'liquidityConfig', type: 'tuple', components: [
        { name: 'cooldownDuration', type: 'uint24' },
        { name: 'maxTotalTokenX', type: 'uint128' },
        { name: 'maxTotalTokenY', type: 'uint128' }
      ] },
      { name: 'mmConfig', type: 'tuple', components: [
        { name: 'marketMakerLPShareEnabled', type: 'bool' },
        { name: 'marketMakerLPShareBps', type: 'uint16' }
      ] },
      { name: 'nativeConfig', type: 'tuple', components: [
        { name: 'enabled', type: 'bool' },
        { name: 'tokenId', type: 'uint8' }
      ] },
      { name: 'slashingStatus', type: 'bool' }
    ]
  },
  { type: 'function', stateMutability: 'view', name: 'tokenX', inputs: [], outputs: [{ name: '', type: 'address' }] },
  { type: 'function', stateMutability: 'view', name: 'tokenY', inputs: [], outputs: [{ name: '', type: 'address' }] },
  {
    type: 'function', stateMutability: 'payable', name: 'addLiquidity',
    inputs: [
      { name: 'tokenId', type: 'uint8' },
      { name: 'amount', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: 'minLPMinted', type: 'uint256' },
      { name: 'expires', type: 'uint256' },
      { name: '', type: 'bytes[]' }
    ],
    outputs: [{ name: 'mintedLP', type: 'uint256' }]
  },
  {
    type: 'function', stateMutability: 'nonpayable', name: 'removeLiquidity',
    inputs: [
      { name: 'burnLP', type: 'uint256' },
      { name: 'minTokenXGet', type: 'uint256' },
      { name: 'minTokenYGet', type: 'uint256' },
      { name: 'expires', type: 'uint256' }
    ],
    outputs: [{ name: 'amountTokenX', type: 'uint256' }, { name: 'amountTokenY', type: 'uint256' }]
  }
] as const;
