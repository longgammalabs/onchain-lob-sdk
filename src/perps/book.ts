import { toBeHex, zeroPadValue } from 'ethers';

import { PerpPlaceFlags } from './constants';
import type { PerpBookOrder } from '../models';
import type { ReplaceOrderPerpUpdate } from './params';

/**
 * The on-chain book of a perp market (A2 §2-4)
 * --------------------------------------------
 * Each side is a singly linked list kept sorted by price priority: bids by descending price, asks by ascending
 * price, orders of one price in time priority. `head(bid)` is the best order and `next(handle)` the following one.
 * `order(handle)` returns the two storage words of the node:
 *
 * ```
 * w0: price u64 [0..63] | lots u64 [64..127] | expiry u32 [128..159] | next u32 [160..191] | flags u8 [192..199]
 * w1: owner u160 [0..159] | sub u16 [160..175] | generation u32 [176..207] | epoch u32 [208..239]
 * flags: bit0 BID | bit1 MARGIN (always set on a perp) | bit2 REDUCE_ONLY
 * ```
 * A handle is `generation << 32 | id`. `lots == 0` marks a free node.
 *
 * Hints. `place`/`cancel`/`replaceBatch` take `(prev, hinted)`. With `hinted = false` the contract scans the list from the head
 * (self-paid gas that grows with the number of orders ahead). With `hinted = true` it validates `prev` in O(1):
 * `prev` is the last order that has priority over the new order (for `place`) or the direct predecessor (for `cancel`),
 * and `0` means the head. A wrong hint reverts `InvalidHint`.
 */

const MASK_64 = (1n << 64n) - 1n;
const MASK_32 = (1n << 32n) - 1n;
const MASK_160 = (1n << 160n) - 1n;

/**
 * Decodes the words returned by `order(handle)`.
 */
export const decodeBookOrder = (handle: bigint, w0: bigint, w1: bigint): PerpBookOrder => {
  const flags = Number((w0 >> 192n) & 0xffn);
  const owner = '0x' + (w1 & MASK_160).toString(16).padStart(40, '0');
  const subaccount = Number((w1 >> 160n) & 0xffffn);

  return {
    handle,
    bid: (flags & 1) !== 0,
    price: w0 & MASK_64,
    lots: (w0 >> 64n) & MASK_64,
    expiry: Number((w0 >> 128n) & MASK_32),
    reduceOnly: (flags & PerpPlaceFlags.ReduceOnly) !== 0,
    owner,
    subaccount,
    account: (BigInt(owner) << 16n) | BigInt(subaccount),
    generation: Number((w1 >> 176n) & MASK_32),
    epoch: Number((w1 >> 208n) & MASK_32),
  };
};

/**
 * Whether `order` has priority over a new order of the same side at `price`, i.e. the new order has to be linked after it:
 * a bid with price >= the new price, an ask with price <= the new price. Equal prices keep time priority.
 */
const hasPriorityOver = (order: Pick<PerpBookOrder, 'price'>, bid: boolean, price: bigint): boolean =>
  bid ? order.price >= price : order.price <= price;

/**
 * The `prev` hint for placing an order at `price`: the handle of the last order of `orders` (one side of the book
 * in book order) that has priority over the new order, or `0n` when the new order becomes the head.
 * `orders` must be the book prefix from the head covering all the orders that have priority; use `complete`
 * to say whether the whole side was read: when the prefix ends with an order that still has priority and the side is not
 * complete the hint is unknown and `null` is returned.
 */
export const calculatePlaceHint = (orders: readonly PerpBookOrder[], bid: boolean, price: bigint, complete: boolean): bigint | null => {
  let prev = 0n;
  for (const order of orders) {
    if (!hasPriorityOver(order, bid, price))
      return prev;
    prev = order.handle;
  }

  return complete ? prev : null;
};

/**
 * The `prev` hint for cancelling `handle`: the handle of its predecessor in book order, `0n` for the head,
 * or `null` when the handle is not found in `orders`.
 */
export const calculateCancelHint = (orders: readonly PerpBookOrder[], handle: bigint): bigint | null => {
  let prev = 0n;
  for (const order of orders) {
    if (order.handle === handle)
      return prev;
    prev = order.handle;
  }

  return null;
};

/**
 * Encodes the updates of `replaceBatch`: two `bytes32` words per update (A2 §4.2).
 *
 * ```
 * w0: handle u64 [0..63] | price u64 [64..127] | lots u64 [128..191] | expiry u32 [192..223] | op u8 [224..231]
 * w1: oldPrev u64 [0..63] | newPrev u64 [64..127] | expectedLots u64 [128..191]
 * ```
 */
export const encodeReplaceBatchUpdates = (updates: readonly ReplaceOrderPerpUpdate[]): string[] => {
  const words: string[] = [];
  for (const update of updates) {
    const op = update.op === 'cancel' ? 1n : 0n;
    const w0 = checkU64(update.handle, 'handle')
      | (checkU64(update.price, 'price') << 64n)
      | (checkU64(update.lots, 'lots') << 128n)
      | (BigInt(update.expiry ?? 0) << 192n)
      | (op << 224n);
    const w1 = checkU64(update.oldPrev ?? 0n, 'oldPrev')
      | (checkU64(update.newPrev ?? 0n, 'newPrev') << 64n)
      | (checkU64(update.expectedLots ?? 0n, 'expectedLots') << 128n);
    words.push(toBytes32(w0), toBytes32(w1));
  }

  return words;
};

const checkU64 = (value: bigint, name: string): bigint => {
  if (value < 0n || value > MASK_64)
    throw new Error(`${name} must fit in uint64: ${value}`);

  return value;
};

const toBytes32 = (value: bigint): string => zeroPadValue(toBeHex(value), 32);
