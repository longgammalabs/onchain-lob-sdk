# OnchainLobPerps

## Overview

The `OnchainLobPerps` class (`client.perps`) is the module for the perpetual futures of Onchain LOB. It has the same structure as [`OnchainLobSpot`](./OnchainLobSpot.md):

- REST getters that return mapped models (`BigNumber` for human-readable values, `bigint` for raw on-chain values);
- WebSocket subscriptions with mapped events;
- transactions to the `PerpMarket` contracts through an ethers signer;
- reads of the live on-chain state (`perpAccount`, `market`, `riskParams`, the order book).

Beside the class the SDK exports pure helpers (account ids, unit conversions, margin and liquidation math) so the frontend can compute
previews without a request.

```typescript
import { OnchainLobClient } from 'onchain-lob-sdk';

const client = new OnchainLobClient({
  apiBaseUrl: 'https://api.example.com',
  webSocketApiBaseUrl: 'wss://sockets.example.com',
  signer,
  perps: { dataSource: 'api' }, // or 'mock', see "Mock data source"
});

const [market] = await client.perps.getMarkets();
```

## Model of a perp market

One quote-settled linear perpetual lives in one `PerpMarket` contract. The collateral is the quote token (tUSDC on testnet).

| Concept | Meaning |
|---|---|
| lot | The size unit. One lot is `baseLot` base-token units (WETH-tUSDC-PERP: `1e14` = 0.0001 WETH). |
| tick | The price unit. A price of `p` ticks is `p * quoteTick` quote units **per lot** (`quoteTick = 1`, so 1 tick = 0.000001 tUSDC per 0.0001 WETH). |
| size | `lots / 10^market.sizeDecimals` in base (4 for WETH-tUSDC-PERP) |
| price | `ticks / 10^market.priceDecimals` in quote per base (2: `299850` ticks = 2998.50 tUSDC per WETH) |
| notional | `lots * ticks * quoteTick`, an exact integer in quote units |
| account | `uint176 = owner << 16 \| subaccount` (string in the API, `bigint` in the SDK) |
| isolated margin | an account holds its own collateral and one signed position; use one subaccount per position |

`PerpMarket.sizeDecimals` and `priceDecimals` are the scale of the human values; the raw `baseLot` and `quoteTick` are the contract units.

Positive position size is long, negative is short. A positive funding rate means longs pay shorts.

### Order semantics

- `placeOrder` (`place`) rests in the book. It is **post-only**: an order that would cross the book reverts (`CrossedBook`).
  Flags: only `reduceOnly` can be set (the contract accepts the flags `0` and `4`; anything else reverts `InvalidOrder`).
  An order that increases risk needs a fresh oracle price; a reduce-only order does not.
- `takeOrder` (`take`) executes immediately against the book (IOC). Without `limitPrice` it is a market order bounded only by the oracle collar.
  `minFill: 'all'` makes it fill-or-kill. `maxSteps` bounds the number of matched makers (`1..512`, default 64).
  A take always needs a fresh oracle price, `reduceOnly` included.
- Every fill must be within the collar (`params.collarBps`, 3%) of the oracle mark.
- An account has at most 64 open orders.

### Oracle freshness and `multicall`

The contract caches the oracle price and rejects risk-increasing actions with `StaleOracle` when the cache is older than `params.maxOracleAge`.
`refreshPrice()` is permissionless, so the SDK can batch it in front of an action with `multicall` in one transaction.
Actions that need a fresh oracle (`placeOrder` without `reduceOnly`, `takeOrder`, `withdraw`, `liquidate`, `forceCancel`) accept
`refreshPrice`:

- `'auto'` (default): one `eth_call` to `perpAccount` reads `oracleFresh`; when it is false the transaction becomes `multicall([refreshPrice, action])`;
- `true`: always batch `refreshPrice`;
- `false`: never.

`refreshPrice` is a no-op when the price source has no newer report, so a stale source still fails the action itself.

### Hints and gas

`place`, `cancel` and `replaceBatch` take `(prev, hinted)`:

- **No hint (default)**: `hinted = false`, the contract scans the book from the head. It is always correct, but the scan is paid by the sender and grows with
  the number of orders ahead of the new one (every touched node is a storage read).
- **Hint**: `prev` is the handle of the order after which the new one is linked (`0n` for the head); for `cancel` it is the direct predecessor. The contract
  validates it in O(1) and reverts `InvalidHint` when it is wrong.
  Pass `prev` yourself, or set `autoHint: true` and the SDK walks the book with `eth_call` first (two calls per order). A hint goes stale when the book changes between the
  walk and the transaction, so prefer it for deep books and keep the unhinted path as the fallback.

Monad charges the whole gas limit, not the gas used. The SDK follows spot: `gasLimit` is passed through when given, otherwise the node's `eth_estimateGas` is used
(and that estimate includes the scan). Do not set a large limit "just in case".

## Common contract transaction parameters

All transactions accept `gasLimit`, `maxFeePerGas`, `maxPriorityFeePerGas` and `nonce` exactly like the spot methods
(see [OnchainLobSpot](./OnchainLobSpot.md#common-contract-transaction-parameters)), and the `market` (contract address).

Account parameters are `PerpAccountRef`: a `bigint` account id, `{ subaccount }` (an account of the signer) or `{ owner, subaccount }`.
Quote amounts are `BigNumber` (human, scaled with the token decimals) or `bigint` (raw units). Sizes are `BigNumber` (base) or `bigint` (lots).
Prices are `BigNumber` (quote per base) or `bigint` (ticks). Human prices round to the passive side (a buy down, a sell up), human sizes round down.

## Transactions

| Method | Contract call | Notes |
|---|---|---|
| `approveQuoteToken({ market, amount? })` | `ERC20.approve` | Unlimited by default. Not needed before `deposit`. |
| `faucetQuoteToken({ market })` | `DevnetToken.faucet` | Test tokens only. |
| `openAccount({ market, subaccount })` | `openAccount(sub)` | Opens a subaccount of the signer. |
| `deposit({ market, account, amount, autoApprove?, approveMax? })` | `deposit` | Checks the allowance and approves the missing amount first (the approval is waited for). |
| `withdraw({ market, account, amount \| withdrawAll, refreshPrice? })` | `withdraw` | `withdrawAll` takes the live maximum (`collateral - owed funding + min(0, unrealized) - ADM`). |
| `transfer({ market, from, to, amount })` | `transfer` | Between accounts of the same owner. |
| `placeOrder({ market, account, side, price, size, reduceOnly?, expiry?, prev?, autoHint?, refreshPrice? })` | `place` | `expiry` is unix seconds, none is good-till-cancelled. |
| `takeOrder({ market, account, side, size, limitPrice?, minFill?, maxSteps?, deadline?, reduceOnly?, strictGate?, refreshPrice? })` | `take` | `deadline` defaults to now + 5 minutes. |
| `cancelOrder({ market, handle, prev?, autoHint? })` | `cancel` | |
| `cancelAllOrders({ market, account })` | `cancelAll` | O(1): bumps the account epoch. |
| `replaceOrders({ market, updates, hinted?, refreshPrice? })` | `replaceBatch` | Replace or cancel several orders; `expectedLots` guards against partial fills. |
| `liquidate({ market, victim, liquidator, maxLots?, refreshPrice? })` | `liquidate` | Needs a fresh oracle; `refreshPrice` is checked on the victim. |
| `forceCancel({ market, account, refreshPrice? })` | `forceCancel` | Cancels the orders of an account in the forced-cancel (or worse) state. |
| `refreshPrice({ market })`, `refreshFunding({ market })` | same | Permissionless. |
| `setOperator({ market, operator, permissions, expiry })` | `setOperator` | See `PerpOperatorPermissions`. |
| `multicall({ market, calls, refreshPrice? })` | `multicall` | Several actions in one transaction, see below. |

All methods return the `ContractTransactionResponse` and wait for it when `autoWaitTransaction` is set (the default of the contract wrapper).
A revert of the market is thrown as `TransactionFailedError` with the decoded custom error (`StaleOracle`, `InvalidHint`, `CrossedBook`, `MinimumFill`, ...).

```typescript
// deposit 1000 tUSDC, then open a long with a market order, in separate transactions
await client.perps.deposit({ market, account: { subaccount: 0 }, amount: new BigNumber(1000) });
await client.perps.takeOrder({
  market, account: { subaccount: 0 }, side: 'buy', size: new BigNumber('0.5'),
  limitPrice: new BigNumber('3030'), // worst price, an IOC limit
});

// a post-only reduce-only exit at 3100 that expires in a day
await client.perps.placeOrder({
  market, account: { subaccount: 0 }, side: 'sell', price: new BigNumber(3100), size: new BigNumber('0.5'),
  reduceOnly: true, expiry: Math.floor(Date.now() / 1000) + 86400,
});

// several actions in one transaction
await client.perps.multicall({
  market,
  calls: [
    { type: 'refreshPrice' },
    { type: 'cancelAllOrders', params: { account: { subaccount: 0 } } },
    { type: 'placeOrder', params: { account: { subaccount: 0 }, side: 'buy', price: 2990n, size: 1000n } },
  ],
});
```

To build the raw calls without sending anything use the contract wrapper: `(await client.perps.getMarketContract({ market })).buildCalls(items)`,
`encodeCall(call)` and `encodeMulticall(calls)`.

## On-chain reads

| Method | Returns |
|---|---|
| `getAccountState({ market, account })` | `PerpAccountState`: collateral, size, costBasis, owed funding, unrealized PnL, equity, ADM/ADMc/MM, open order lots, health state, `oracleFresh` (raw `bigint` values, the numbers the contract uses for its checks) |
| `getAccountOverview({ market, account })` | the state plus entry, mark, liquidation and bankruptcy prices and the maximal withdrawal |
| `getMarketState({ market })` | `PerpMarketState`: funding indices, open interest, custody, insurance, flags |
| `getRiskParams({ market })` | `PerpRiskParams` (cached, immutable) |
| `getBookOrders({ market, bid, limit? })` | one side of the book in price priority (walks `head`/`next`/`order`) |
| `getOperator({ market, owner?, operator })` | `{ permissions, expiry }` |
| `getQuoteBalance({ market, owner? })`, `getQuoteAllowance({ market, owner? })` | raw token units |
| `getOraclePrice({ market })` | the price of the oracle adapter in WAD; throws if the adapter reverts |

These reads need the signer (its provider); use `OnchainLobPerpMarketContract.fromChain({ marketAddress, provider })` for a read-only wrapper.

## REST methods

All of them return mapped models. Pagination is `limit`/`offset`.

| Method | Endpoint | Returns |
|---|---|---|
| `getMarkets({ market? })`, `getMarket({ market })` | `GET /perps/markets` | `PerpMarket[]` |
| `getOrderbook({ market, aggregation?, limit? })` | `GET /perps/orderbook` | `PerpOrderbook` |
| `getTrades({ market, limit?, offset? })` | `GET /perps/trades` | `PerpTrade[]` |
| `getCandles({ market, resolution, fromTime, toTime })` | `GET /perps/candles` | `PerpCandle[]` |
| `getAccounts({ user, market? })` | `GET /perps/accounts` | `PerpAccount[]`, one per subaccount |
| `getPositions({ user, market?, status? })` | `GET /perps/positions` | `PerpPosition[]` (`open`, `closed`, `all`) |
| `getOrders({ user, market?, status?, limit?, offset? })` | `GET /perps/orders` | `PerpOrder[]` (`open`, `filled`, `cancelled`, `all`) |
| `getFills({ user, market?, limit?, offset? })` | `GET /perps/fills` | `PerpFill[]` |
| `getFundingRates({ market, fromTime?, toTime?, limit? })` | `GET /perps/funding-rates` | `PerpFundingRate[]` |
| `getFundingPayments({ user, market?, limit?, offset? })` | `GET /perps/funding-payments` | `PerpFundingPayment[]` |
| `getLiquidations({ user? \| market?, limit?, offset? })` | `GET /perps/liquidations` | `PerpLiquidation[]` |
| `getCollateralHistory({ user, market?, limit?, offset? })` | `GET /perps/collateral-history` | `PerpCollateralEvent[]` |

## Subscriptions and events

| Subscribe / unsubscribe | Channel | Event (`client.perps.events.*`) |
|---|---|---|
| `subscribeToPerpMarket({ market })` | `perpMarket` | `perpMarketUpdated(marketId, isSnapshot, PerpMarket)` |
| `subscribeToAllPerpMarkets()` | `allPerpMarkets` | `allPerpMarketsUpdated(isSnapshot, PerpMarket[])` |
| `subscribeToPerpOrderbook({ market, aggregation? })` | `perpOrderbook` | `perpOrderbookUpdated(marketId, isSnapshot, PerpOrderbook)` |
| `subscribeToPerpTrades({ market })` | `perpTrades` | `perpTradesUpdated(marketId, isSnapshot, PerpTrade[])` |
| `subscribeToPerpCandles({ market, resolution })` | `perpCandles` | `perpCandlesUpdated(id, isSnapshot, PerpCandle[])`, the id is `${market}-${resolution}` (`parsePerpCandlesChannelId`) |
| `subscribeToUserPerpAccounts({ user, market? })` | `userPerpAccounts` | `userPerpAccountsUpdated(marketId, isSnapshot, PerpAccount[])` |
| `subscribeToUserPerpOrders({ user, market? })` | `userPerpOrders` | `userPerpOrdersUpdated(marketId, isSnapshot, PerpOrder[])` |
| `subscribeToUserPerpFills({ user, market? })` | `userPerpFills` | `userPerpFillsUpdated(marketId, isSnapshot, PerpFill[])` |
| `subscribeToUserPerpCollateral({ user, market? })` | `userPerpCollateral` | `userPerpCollateralUpdated(marketId, isSnapshot, PerpCollateralEvent[])` |
| | `error` | `subscriptionError(error)` |

User channels use `allMarkets` as the market when `market` is omitted, like spot. The perps socket connects on the first subscription by default
(`perps.webSocketConnectImmediately` in the client options changes that). `client.perps.reconnect()` and `isConnected` work like on spot.

## Mock data source

For frontend development before the backend is live:

```typescript
const client = new OnchainLobClient({
  apiBaseUrl: 'https://unused.example.com',
  webSocketApiBaseUrl: 'wss://unused.example.com',
  signer,
  perps: {
    dataSource: 'mock',
    mock: { updateIntervalMs: 2000 }, // optional: emit simulated updates
  },
});
```

The mock serves fixtures of WETH-tUSDC-PERP (0x96f3...865d, ~3000 tUSDC per WETH): a book with 12 levels per side, 30 trades, candles for every resolution,
funding history, and for any `user` two accounts: subaccount 0 holds a 1.2 WETH long (entry 2950, collateral 1485 tUSDC) with two open orders, subaccount 1 is closed.
Every REST method and every subscription works; a subscription is answered with a snapshot. With `updateIntervalMs` the market, orderbook and trades channels also emit updates
(the same data the REST mock returns afterwards).
The transactions are not mocked: they still go through the signer to the real market address, so for the UI without a wallet only the data is available.
The mock classes (`PerpsMockDataSource`, `OnchainLobPerpsMockService`, `OnchainLobPerpsMockWebSocketService`) are exported for standalone use and tests.

## Pure helpers

```typescript
import {
  encodePerpAccountId, decodePerpAccountId, lotsToSize, sizeToLots, priceToTicks, ticksToPrice,
  calculateAccountMetrics, calculateAdm, calculateLiquidationPrice, simulateFill, getHealthState
} from 'onchain-lob-sdk';
```

| Group | Functions |
|---|---|
| Accounts | `encodePerpAccountId(owner, subaccount)`, `decodePerpAccountId(account)` |
| Units | `lotsToSize`, `sizeToLots`, `ticksToPrice`, `priceToTicks`, `quoteUnitsToAmount`, `quoteAmountToUnits`, `calculateNotional`, `calculateFee`, `calculateLimitPriceWithSlippage`, `fundingRatePerHour`, `fundingRateAnnualized`, `calculateOwedCharges`, `oraclePriceWadToTicks` |
| Margin | `markValue`, `calculateUnrealizedPnl`, `calculateEquity`, `calculateRequirement` (IM/MM/CM of a position), `calculateAdm`, `calculateAdmc`, `getHealthState`, `calculateAccountMetrics`, `calculateMaxWithdrawable`, `calculateRequiredMargin`, `calculateMaxLeverage`, `isWithinCollar` |
| Previews | `simulateFill(position, lots, priceTicks, quoteTick, feeBps)` (the position after a fill: size, cost basis, realized PnL, fee), `calculateLiquidationPrice`, `calculateBankruptcyPrice`, `calculateEntryPrice`, `calculateImpliedMarkPrice` |
| Book | `decodeBookOrder`, `calculatePlaceHint`, `calculateCancelHint`, `encodeReplaceBatchUpdates` |

Formulas (all roundings are against the account, exactly like the contract; `P` is the mark in ticks per lot):

```
markValue(size)  = size >= 0 ? floor(size * P * quoteTick) : -ceil(|size| * P * quoteTick)
unrealized       = markValue(size) - costBasis
owed funding     = |size| * (cSide - chargeSnap) / 1e9   (payers round up, receivers down)
equity           = collateral + unrealized - owed funding
IM / MM          = ceil(ceil(|size| * P * quoteTick) * imrBps / 1e4)  (mmrBps for MM)
ADM              = max(bidScenario, askScenario) + makerFee term, with the open order lots Qbid/Qask (C1 §4)
health ladder    = HEALTHY (E >= ADM) > NO_NEW_RISK (E >= ADMc) > FORCED_CANCEL (E >= MM) > LIQUIDATABLE (E >= 0) > BANKRUPT
liq. price long  = (costBasis - collateral + owed) / (size * quoteTick * (1 - mmr))
liq. price short = (collateral - owed + |costBasis|) / (|size| * quoteTick * (1 + mmr))
```

The mark is not exposed by a contract getter. `getAccountOverview` derives it from the account view (`(unrealized + costBasis) / (size * quoteTick)`);
the API provides the oracle price as `PerpMarket.indexPrice`.

## Testing

Unit tests (`npm run test:unit`) cover the mappers, the math, the account encoding and the calldata of the contract wrapper.
`integration/tests/perps/onchainReads.test.ts` is a read-only check against the deployed testnet market (no key, no API, no transactions):

```sh
JEST_TIMEOUT=120000 npx jest ./integration/tests/perps --config ./integration/jest.config.mjs --runInBand
```
