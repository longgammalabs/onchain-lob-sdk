/**
 * The flags accepted by `PerpMarket.place`.
 *
 * The node flags layout is `bit0 BID | bit1 MARGIN | bit2 REDUCE_ONLY`. BID is derived from the `bid`
 * argument and MARGIN is always set by the contract, so the only bit a caller may pass is REDUCE_ONLY:
 * any other value reverts `InvalidOrder` (verified against the deployed contract with `eth_call`).
 *
 * `place` is always post-only: an order that would cross the book reverts (`CrossedBook`). To execute
 * immediately use `take`.
 */
export const PerpPlaceFlags = {
  None: 0,
  ReduceOnly: 1 << 2,
} as const;

/**
 * The flags accepted by `PerpMarket.take` (`TakeFlag` in A2 §5). Any other bit reverts.
 */
export const PerpTakeFlags = {
  None: 0,
  /** The fill may only shrink the position and never flips it. A perp has no stale-oracle exit: every fill needs a fresh oracle (D1 §7). */
  ReduceOnly: 1 << 2,
  /** Gate from the first node: a shortfall becomes a STOP instead of an out-of-gas revert. Meant for composers. */
  StrictGate: 1 << 7,
} as const;

/** The operator permission bits (`Perm` in A1 §3). */
export const PerpOperatorPermissions = {
  Trade: 1 << 0,
  Cancel: 1 << 1,
  Withdraw: 1 << 2,
  Transfer: 1 << 3,
  Lend: 1 << 4,
  Liquidate: 1 << 5,
} as const;

/** `MAX_TAKE_STEPS` of the contract: `take` reverts when `maxSteps` is 0 or greater than this. */
export const PERP_MAX_TAKE_STEPS = 512;

/** `maxSteps` of `take` used when the caller does not set it. */
export const PERP_DEFAULT_TAKE_MAX_STEPS = 64;

/** The order lifetime of the `deadline` of `take` used when the caller does not set it, seconds. */
export const PERP_DEFAULT_TAKE_DEADLINE_SECONDS = 5 * 60;

/** `MAX_OPEN_ORDERS` of a perp account (fixture of the contract: `TooManyOpenOrders` above it). */
export const PERP_MAX_OPEN_ORDERS = 64;

/** `CHARGE_SCALE`: the funding charge indices are in quote units multiplied by this. */
export const PERP_CHARGE_SCALE = 1_000_000_000n;

/** Basis points denominator. */
export const BPS = 10_000n;

/** The mark price of the contract is `ticks per lot * 1e18`. */
export const PRICE_X18 = 10n ** 18n;
