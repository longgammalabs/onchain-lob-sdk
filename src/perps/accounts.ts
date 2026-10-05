import { getAddress, isAddress } from 'ethers';

/** The width of the `subaccount` part of an account id. */
export const SUBACCOUNT_BITS = 16n;
export const MAX_SUBACCOUNT = 0xffff;
const MAX_ACCOUNT = (1n << 176n) - 1n;

export interface DecodedPerpAccountId {
  /** The lowercase owner address. */
  owner: string;
  subaccount: number;
}

/**
 * Encodes an account id (`AccountId` of the contract, `uint176`): `owner << 16 | subaccount`.
 * An account of a perp market is isolated: each subaccount holds its own collateral and one position.
 *
 * @param owner - The owner address.
 * @param subaccount - The subaccount number, `0..65535`.
 */
export const encodePerpAccountId = (owner: string, subaccount: number): bigint => {
  if (!isAddress(owner))
    throw new Error(`Invalid owner address: ${String(owner)}`);
  if (!Number.isInteger(subaccount) || subaccount < 0 || subaccount > MAX_SUBACCOUNT)
    throw new Error(`Invalid subaccount: ${subaccount}. It must be an integer in 0..${MAX_SUBACCOUNT}`);

  return (BigInt(getAddress(owner)) << SUBACCOUNT_BITS) | BigInt(subaccount);
};

/**
 * Decodes an account id into the owner address and the subaccount number.
 *
 * @param account - The account id as `bigint` or as a decimal string (the API format).
 */
export const decodePerpAccountId = (account: bigint | string): DecodedPerpAccountId => {
  const id = typeof account === 'bigint' ? account : BigInt(account);
  if (id < 0n || id > MAX_ACCOUNT)
    throw new Error(`Invalid account id: ${id}`);

  const owner = '0x' + (id >> SUBACCOUNT_BITS).toString(16).padStart(40, '0');

  return { owner, subaccount: Number(id & BigInt(MAX_SUBACCOUNT)) };
};
