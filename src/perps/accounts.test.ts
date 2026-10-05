import { getAddress } from 'ethers';

import { decodePerpAccountId, encodePerpAccountId, MAX_SUBACCOUNT } from './accounts';

const owner = '0x9c72ee4ef78d523da2b604214a7d29b983033234';

describe('perp account id', () => {
  test('encodes owner << 16 | subaccount (value read from the deployed market)', () => {
    expect(encodePerpAccountId(owner, 0)).toBe(58534501075929067188859517216662100592579158931144704n);
    expect(encodePerpAccountId(owner, 1)).toBe(58534501075929067188859517216662100592579158931144705n);
    expect(encodePerpAccountId(owner, 1)).toBe((BigInt(owner) << 16n) | 1n);
  });

  test('accepts checksummed and lowercase addresses', () => {
    const checksummed = getAddress(owner);
    expect(checksummed).not.toBe(owner);
    expect(encodePerpAccountId(checksummed, 7)).toBe(encodePerpAccountId(owner, 7));
  });

  test('decodes to a lowercase owner and the subaccount', () => {
    expect(decodePerpAccountId(encodePerpAccountId(owner, 42))).toEqual({ owner, subaccount: 42 });
    expect(decodePerpAccountId('58534501075929067188859517216662100592579158931144705')).toEqual({ owner, subaccount: 1 });
  });

  test('keeps leading zeros of the owner address', () => {
    const lowOwner = '0x0000000000000000000000000000000000000abc';
    expect(decodePerpAccountId(encodePerpAccountId(lowOwner, MAX_SUBACCOUNT))).toEqual({ owner: lowOwner, subaccount: MAX_SUBACCOUNT });
  });

  test('rejects invalid input', () => {
    expect(() => encodePerpAccountId('0x123', 0)).toThrow('Invalid owner address');
    expect(() => encodePerpAccountId(owner, -1)).toThrow('Invalid subaccount');
    expect(() => encodePerpAccountId(owner, 65536)).toThrow('Invalid subaccount');
    expect(() => encodePerpAccountId(owner, 1.5)).toThrow('Invalid subaccount');
    expect(() => decodePerpAccountId(1n << 176n)).toThrow('Invalid account id');
  });
});
