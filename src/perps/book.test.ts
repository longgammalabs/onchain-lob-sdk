import { calculateCancelHint, calculatePlaceHint, decodeBookOrder, encodeReplaceBatchUpdates } from './book';
import type { PerpBookOrder } from '../models';

const order = (handle: bigint, price: bigint, bid = true): PerpBookOrder => ({
  handle, bid, price, lots: 10n, expiry: 0, reduceOnly: false, account: 0n, owner: '0x', subaccount: 0, generation: 1, epoch: 0,
});

describe('decodeBookOrder', () => {
  test('decodes the words read from the deployed market', () => {
    // order(4294967308) on Monad testnet: a bid for 1000 lots at 299850, maker 0x9c72... subaccount 0
    const w0 = BigInt('0x0000000000000003000000090000000000000000000003e8000000000004934a');
    const w1 = BigInt('0x0000000000000000000100009c72ee4ef78d523da2b604214a7d29b983033234');

    expect(decodeBookOrder(4294967308n, w0, w1)).toEqual({
      handle: 4294967308n,
      bid: true,
      price: 299850n,
      lots: 1000n,
      expiry: 0,
      reduceOnly: false,
      owner: '0x9c72ee4ef78d523da2b604214a7d29b983033234',
      subaccount: 0,
      account: 58534501075929067188859517216662100592579158931144704n,
      generation: 1,
      epoch: 0,
    });
  });

  test('decodes an ask with the reduce-only flag, a subaccount and an expiry', () => {
    // the last ask of the deployed book: flags 6 (MARGIN | REDUCE_ONLY), 50 lots at 310,000 (0x4baf0), sub 1, generation 2
    const w0 = BigInt('0x000000000000000600000000000000000000000000000032000000000004baf0');
    const w1 = BigInt('0x000000000000000000020001a1d23f45cd2e3d866a0d00b7b20bf70f3fcd6ac8');
    const decoded = decodeBookOrder(8589934602n, w0, w1);

    expect(decoded).toMatchObject({ bid: false, reduceOnly: true, price: 310_000n, lots: 50n, subaccount: 1, generation: 2 });

    const withExpiry = decodeBookOrder(1n, w0 | (1_791_198_360n << 128n), w1);
    expect(withExpiry.expiry).toBe(1_791_198_360);
  });
});

describe('book hints', () => {
  const bids = [order(1n, 300n), order(2n, 290n), order(3n, 290n), order(4n, 280n)];
  const asks = [order(11n, 310n, false), order(12n, 320n, false), order(13n, 320n, false)];

  test('place: after the last order with priority (equal prices keep time priority)', () => {
    expect(calculatePlaceHint(bids, true, 305n, true)).toBe(0n);
    expect(calculatePlaceHint(bids, true, 300n, true)).toBe(1n);
    expect(calculatePlaceHint(bids, true, 295n, true)).toBe(1n);
    expect(calculatePlaceHint(bids, true, 290n, true)).toBe(3n);
    expect(calculatePlaceHint(bids, true, 285n, true)).toBe(3n);
    expect(calculatePlaceHint(bids, true, 100n, true)).toBe(4n);
    expect(calculatePlaceHint(asks, false, 300n, true)).toBe(0n);
    expect(calculatePlaceHint(asks, false, 320n, true)).toBe(13n);
    expect(calculatePlaceHint(asks, false, 315n, true)).toBe(11n);
  });

  test('place: an empty side gives the head', () => {
    expect(calculatePlaceHint([], true, 100n, true)).toBe(0n);
  });

  test('place: an incomplete prefix that still has priority gives no hint', () => {
    expect(calculatePlaceHint(bids, true, 100n, false)).toBeNull();
    expect(calculatePlaceHint(bids, true, 295n, false)).toBe(1n);
  });

  test('cancel: the direct predecessor, 0 for the head', () => {
    expect(calculateCancelHint(bids, 1n)).toBe(0n);
    expect(calculateCancelHint(bids, 3n)).toBe(2n);
    expect(calculateCancelHint(bids, 99n)).toBeNull();
  });
});

describe('encodeReplaceBatchUpdates', () => {
  test('two words per update with the A2 §4.2 bit layout', () => {
    const [w0, w1] = encodeReplaceBatchUpdates([{ handle: 4294967308n, price: 299900n, lots: 750n, expiry: 1_800_000_000, expectedLots: 1000n, oldPrev: 5n, newPrev: 6n }]);

    expect(BigInt(w0!)).toBe(4294967308n | (299900n << 64n) | (750n << 128n) | (1_800_000_000n << 192n));
    expect(BigInt(w1!)).toBe(5n | (6n << 64n) | (1000n << 128n));
    expect(w0).toMatch(/^0x[0-9a-f]{64}$/);
  });

  test('cancel op sets bit 224', () => {
    const [w0] = encodeReplaceBatchUpdates([{ handle: 1n, price: 1n, lots: 0n, op: 'cancel' }]);
    expect(BigInt(w0!) >> 224n).toBe(1n);
  });

  test('several updates keep their order and values outside uint64 are rejected', () => {
    expect(encodeReplaceBatchUpdates([{ handle: 1n, price: 1n, lots: 1n }, { handle: 2n, price: 2n, lots: 2n }])).toHaveLength(4);
    expect(() => encodeReplaceBatchUpdates([{ handle: 1n << 64n, price: 1n, lots: 1n }])).toThrow('handle must fit in uint64');
  });
});
