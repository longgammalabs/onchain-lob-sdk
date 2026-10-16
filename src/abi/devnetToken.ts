// DevnetToken (test ERC20 with a public faucet). Only the members the SDK uses.
export const devnetTokenAbi = [
  {
    type: 'function',
    name: 'dripAmount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'faucet',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const;
