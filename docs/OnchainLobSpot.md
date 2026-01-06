# OnchainLobSpot

## Overview

The `OnchainLobSpot` class is designed for interacting with the Onchain LOB Spot API. It provides methods for retrieving market information, subscribing to market updates, placing orders, managing user orders and fills, and more.

### Deprecated Methods and Fields

Some methods and fields in this SDK are marked as deprecated and will be removed in a future version:

- **Orderbook methods**: `getOrderbook()`, `subscribeToOrderbook()`, `unsubscribeFromOrderbook()` - Use `getClobDepth()`, `subscribeToClobDepth()`, and `unsubscribeFromClobDepth()` instead.
- **Orderbook event**: `orderbookUpdated` - Use `clobDepthUpdated` instead.
- **Market fields**: `rawBestAsk`, `bestAsk`, `rawBestBid`, `bestBid` - Use `getClobDepth()` or `subscribeToClobDepth()` to get orderbook data instead.

The `ClobDepth` interface provides a more efficient and simpler data structure for orderbook data, using `[string, string][]` tuples for price and size pairs instead of complex objects.

## Common contract transaction parameters

The following parameters are common across contract transaction methods:

- `gasLimit`: (optional) Transaction gas limit. If not provided, the value is estimated via `eth_estimateGas` call.
- `maxFeePerGas`: (optional) The maximum fee per unit of gas willing to be paid for the transaction. Calculated as `baseFeePerGas + maxPriorityFeePerGas`. If not provided, obtained via `eth_maxPriorityFeePerGas` call.
- `maxPriorityFeePerGas`: (optional) The maximum price of the consumed gas to be included as a tip to the validator. If not provided, obtained via `eth_maxPriorityFeePerGas` call.
- `nonce`: (optional) Transaction nonce (counter). If not provided, obtained via `eth_getTransactionCount` call.

## approveTokens

```typescript
async approveTokens({ market, token, amount }: ApproveSpotParams): Promise<ContractTransactionResponse>
```

Approves the specified amount of tokens for the corresponding market contract.

- `market`: The market identifier.
- `token`: The token to be approved.
- `amount`: The amount of tokens to approve. If `bigint` is provided, then the token's contract unit is used. If `BigNumber` is provided, then the scaled unit with the token's decimals is used.
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, tokens will be approved for the fast quoter proxy address instead of the market contract address.

## setProxyTraderPermissions

```typescript
async setProxyTraderPermissions({ market, allowCreate, allowCancel }: SetProxyTraderPermissionsSpotParams): Promise<ContractTransactionResponse>
```

Sets the proxy trader permissions for the corresponding market contract. This method allows you to grant or revoke permissions for the fast quoter proxy to create and cancel orders on your behalf.

- `market`: The market identifier.
- `allowCreate`: Whether the proxy trader is allowed to create orders.
- `allowCancel`: Whether the proxy trader is allowed to cancel orders.

**Note**: This method requires that the market has a fast quoter proxy enabled. If the market doesn't have a fast quoter proxy, this method will throw an error.

## wrapNativeTokens

```typescript
async wrapNativeTokens({ market, amount }: WrapNativeTokenSpotParams): Promise<ContractTransactionResponse>
```

Wraps the specified amount of native tokens.

- `market`: The market identifier.
- `amount`: The amount of tokens to wrap. If `bigint` is provided, then the token's contract unit is used. If `BigNumber` is provided, then the scaled unit with the token's decimals is used.

## unwrapNativeTokens

```typescript
async unwrapNativeTokens({ market, amount }: UnwrapNativeTokenSpotParams): Promise<ContractTransactionResponse>
```

Wraps the specified amount of native tokens.

- `market`: The market identifier.
- `amount`: The amount of tokens to unwrap. If `bigint` is provided, then the token's contract unit is used. If `BigNumber` is provided, then the scaled unit with the token's decimals is used.

## depositTokens

```typescript
async depositTokens({ market, token, amount }: DepositSpotParams): Promise<ContractTransactionResponse>
```

Deposits the specified amount of tokens to the corresponding market contract.

- `market`: The market identifier.
- `token`: The token to be deposited.
- `amount`: The amount of tokens to deposit. The Onchain LOB scaled units are used.

## withdrawTokens

```typescript
async withdrawTokens({ market, aseTokenAmount, quoteTokenAmount, withdrawAll }: WithdrawSpotParams): Promise<ContractTransactionResponse>
```

Withdraws the specified amount of tokens or all tokens from the corresponding market contract.

- `market`: The market identifier.
- `baseTokenAmount`: The amount of base tokens to withdraw. If `bigint` is provided, then the token's contract unit is used. If `BigNumber` is provided, then the scaled unit with the token's decimals is used. Optional if `withdrawAll` is true.
- `quoteTokenAmount`: The amount of quote tokens to withdraw. If `bigint` is provided, then the token's contract unit is used. If `BigNumber` is provided, then the scaled unit with the token's decimals is used. Optional if `withdrawAll` is true.
- `withdrawAll`: A flag indicating whether to withdraw all tokens. If true, `baseTokenAmount` and `quoteTokenAmount` are ignored.

## setClaimableStatus

```typescript
async setClaimableStatus({ market, status }: SetClaimableStatusParams): Promise<ContractTransactionResponse>
```

Sets the claimable status for the corresponding market contract.

- `market`: The market identifier.
- `status`: The claimable status to be set.

## placeOrder

```typescript
async placeOrder({ market, type, side, size, price, transferExecutedTokens, maxCommission, nativeTokenToSend, useNativeToken }: PlaceOrderSpotParams): Promise<ContractTransactionResponse>
```

Places a new order in the corresponding market contract.
It can place limit or market order and use native token if market supports it.

- `market`: The market identifier.
- `type`: The type of the order (limit, limit_post_only, ioc or market_execution).
- `side`: The order side (buy or sell).
- `size`: The size of the order.
- `price`: The price of the order.
- `transferExecutedTokens`: Whether to transfer executed tokens automatically.
- `maxCommission`:  The upper bound of commission to pay.
- `nativeTokenToSend`: The amount of native token to send.
- `useNativeToken`: Use native token for the transaction instead of the wrapped token.
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, the order will be placed through the fast quoter proxy contract instead of the market contract.

### Type parameter value

There are four types of order execution behavior:

- `limit`: place in the order book or execute and place with the specified price,
- `limit_post_only`: place or cancel the order,
- `ioc`: execute order with the indicated price or better, the remainder is cancelled,
- `market_execution`: execute the full order size, price parameter is omitted.

## placeOrderWithPermit

```typescript
async placeOrderWithPermit({ market, type, side, size, price, permit, transferExecutedTokens, maxCommission }: PlaceOrderWithPermitSpotParams): Promise<ContractTransactionResponse>
```

Places a new order with a permit in the corresponding market contract if the token supports ERC20Permit interface.

- `market`: The market identifier.
- `type`: The type of the order (limit, limit_post_only, ioc or market_execution).
- `side`: The order side (buy or sell).
- `size`: The size of the order.
- `price`: The price of the order.
- `permit`: The quantity of tokens to permit for the order. Ussually the same value as the approve value.
- `transferExecutedTokens`: Whether to transfer executed tokens automatically.
- `maxCommission`: The upper bound of commission to pay.

This method allows placing an order with a permit, which is useful for tokens that support permit functionality, enabling gasless approvals.

## placeMarketOrderWithTargetValue

```typescript
async placeMarketOrderWithTargetValue({ market, type, side, price, size, targetValue, maxCommission, nativeTokenToSend }: PlaceMarketOrderWithTargetValueParams): Promise<ContractTransactionResponse>
```

Places a market order with a target value of the quote token in the corresponding market contract.

- `market`: The market identifier.
- `type`: The type of the order (ioc or market_execution).
- `side`: The order side (buy or sell).
- `price`: The price of the order.
- `size`: The quote token value to spend.
- `targetValue`: The quote token value to spend.
- `maxCommission`: The upper bound of commission to pay.
- `nativeTokenToSend`: The amount of native token to send. Use native token for the transaction instead of the wrapped token.
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, the order will be placed through the fast quoter proxy contract instead of the market contract.

This method allows placing a market order by specifying the target value of the quote token, which is useful for executing orders based on a specific value rather than base token quantity.

## placeMarketOrderWithTargetValueWithPermit

````typescript
async placeMarketOrderWithTargetValueWithPermit({ market, type, side, price, size, permit, maxCommission, transferExecutedTokens }: PlaceMarketOrderWithTargetValueWithPermitParams): Promise<ContractTransactionResponse>
````

Places a market order with a target value of the quote token and a permit in the corresponding market contract.

- `market`: The market identifier.
- `type`: The type of the order (ioc or market_execution).
- `side`: The order side (buy or sell).
- `price`: The price of the order.
- `size`: The quote token value to spend.
- `permit`: The quantity of tokens to permit for the order. Usually the same value as the approve value.
- `maxCommission`: The upper bound of commission to pay.
- `transferExecutedTokens`: Whether to transfer executed tokens automatically.

The same action as in `placeMarketOrderWithTargetValue` but it uses a token that supports permit.

## claimOrder

```typescript
async claimOrder({ market, orderId, transferExecutedTokens }: ClaimOrderSpotParams): Promise<ContractTransactionResponse>
```

Claims an order or fully cancels it in the corresponding market contract.

- `market`: The market identifier.
- `orderId`: The unique identifier of the order to be claimed.
- `transferExecutedTokens`: Whether to transfer executed tokens automatically.
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, the claim will be executed through the fast quoter proxy contract instead of the market contract.

## changeOrder

```typescript
async changeOrder({ market, orderId, newSize, newPrice, type, maxCommission, transferExecutedTokens }: ChangeOrderSpotParams): Promise<ContractTransactionResponse>
```

Changes an existing order in the corresponding market contract.

- `market`: The market identifier.
- `orderId`: The unique identifier of the order to be changed.
- `newSize`: The new size of the order.
- `newPrice`: The new price of the order.
- `type`: The type of the order (e.g., limit, limit_post_only).
- `transferExecutedTokens`: Whether to transfer executed tokens automatically.
- `maxCommission`: The upper bound of commission to pay.
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, the order will be placed through the fast quoter proxy contract instead of the market contract.

## batchPlaceOrder

```typescript
async batchPlaceOrder({ market, type, orderParams: Array<{ side, size, price}>, transferExecutedTokens }: ChangeOrderSpotParams): Promise<ContractTransactionResponse>
```

Places multiple orders in the corresponding market contract.

- `market`: The market identifier.
- `type`: The type of the orders (limit, limit_post_only).
- `orderParams`: Orders to place:
  - `side`: the side of the order (ask or bid).
  - `size`: the size of the order.
  - `price`: the price of the order.
- `transferExecutedTokens`: Whether to transfer executed tokens automatically.
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, the order will be placed through the fast quoter proxy contract instead of the market contract.

This method does not support sending native token. Approve the wrapped token that is specified in the market object.

## batchClaim

```typescript
async batchClaim({ market, claimParams: Array<{ orderId, address }>, onlyClaim }: ChangeOrderSpotParams): Promise<ContractTransactionResponse>
```

Claims or cancels specified orders.

- `market`: The market identifier.
- `orderParams`: Orders to place:
  - `orderId`: the id of the order to claim or cancel.
  - `address`: the owner of the order.
- `onlyClaim`: Whether to claim or cancel orders (`true` to claim).
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, the order will be placed through the fast quoter proxy contract instead of the market contract.

## batchChangeOrder

```typescript
async batchChangeOrder({ market, type, orderParams: Array<{ newSize, newPrice}>, transferExecutedTokens }: ChangeOrderSpotParams): Promise<ContractTransactionResponse>
```

Changes multiple orders in the corresponding market contract.

- `market`: The market identifier.
- `type`: The type of the orders (limit, limit_post_only).
- `orderParams`: Orders to change:
  - `orderId`: the id of the order.
  - `newSize`: the new size of the order.
  - `newPrice`: the new price of the order.
- `transferExecutedTokens`: Whether to transfer executed tokens automatically.
- `useFastQuoterProxyIfEnabled`: (optional) Whether to use the fast quoter proxy if it's enabled for the market. Defaults to `true`. If `true` and the market has a fast quoter proxy enabled, the order will be placed through the fast quoter proxy contract instead of the market contract.

This method cancels existing orders and places new ones. The new orders will each have new order ids.

## getMarket

```typescript
async getMarket({ market }: GetMarketParams): Promise<Market | undefined>
```

Retrieves the market information for the specified market.

- `market`: The market identifier.

**Note on deprecated fields**: The `Market` object contains the following deprecated fields that will be removed in a future version:

- `rawBestAsk` / `bestAsk`: Use `getClobDepth()` or `subscribeToClobDepth()` and access `clobDepth.asks[0]?.[0]` for the best ask price.
- `rawBestBid` / `bestBid`: Use `getClobDepth()` or `subscribeToClobDepth()` and access `clobDepth.bids[0]?.[0]` for the best bid price.

These fields are deprecated because orderbook data should be retrieved from the `ClobDepth` object, which provides more accurate and up-to-date information.

## getMarkets

```typescript
async getMarkets({ market }: GetMarketsParams): Promise<Market[]>
```

Retrieves the markets.

- `market`: Optional market identifier to filter results.

## getTokens

```typescript
async getTokens({ token }: GetTokensParams): Promise<Token[]>
```

Retrieves the tokens.

- `token`: Optional token identifier to filter results.

## getOrderbook

```typescript
async getOrderbook({ market, aggregation, limit }: GetOrderbookParams): Promise<Orderbook>
```

**⚠️ Deprecated**: This method is deprecated and will be removed in a future version. Use `getClobDepth` instead for better performance and more detailed depth information.

Retrieves the orderbook for the specified market.

- `market`: The market identifier.
- `aggregation`: Optional level of price aggregation.
- `limit`: Optional limit on the number of orders to retrieve.

## getClobDepth

```typescript
async getClobDepth({ market, depth }: GetClobDepthParams): Promise<ClobDepth>
```

Retrieves the orderbook depth (ClobDepth) for the specified market. This is the recommended method for getting orderbook data as it provides better performance and a simpler data structure.

The `ClobDepth` object contains:

- `timestamp`: The timestamp of the orderbook snapshot.
- `asks`: An array of `[string, string][]` tuples representing ask levels, where each tuple is `[price, size]`.
- `bids`: An array of `[string, string][]` tuples representing bid levels, where each tuple is `[price, size]`.

Unlike the deprecated `Orderbook` interface, `ClobDepth` uses string tuples for price and size, making it more efficient and easier to work with.

- `market`: The market identifier.
- `depth`: Optional limit on the number of levels to retrieve for each side (asks and bids).

**Example:**

```typescript
const clobDepth = await onchainLobClient.spot.getClobDepth({
  market: '<orderbookAddress>',
  depth: 10
});

// Access best ask price
const bestAskPrice = clobDepth.asks[0]?.[0]; // string
const bestAskSize = clobDepth.asks[0]?.[1]; // string

// Access best bid price
const bestBidPrice = clobDepth.bids[0]?.[0]; // string
const bestBidSize = clobDepth.bids[0]?.[1]; // string
```

## getOrders

```typescript
async getOrders({ market, user, limit, status }: GetOrdersParams): Promise<Order[]>
```

Retrieves the orders for the specified market.

- `market`: The market identifier.
- `user`: The user's address.
- `limit`: Optional limit on the number of orders to retrieve.
- `status`: Optional filter for order status.

## getOrderHistory

```typescript
async getOrderHistory({ market, user, limit }: GetOrderHistoryParams): Promise<OrderHistory[]>
```

Retrieves the order history for the specified market.

- `market`: The market identifier.
- `user`: The user's address.
- `limit`: Optional limit on the number of orders to retrieve.

## getTrades

```typescript
async getTrades({ market, limit }: GetTradesParams): Promise<Trade[]>
```

Retrieves the trades for the specified market.

- `market`: The market identifier.
- `limit`: Optional limit on the number of trades to retrieve.

## getFills

```typescript
async getFills({ market, user, limit }: GetFillsParams): Promise<Fill[]>
```

Retrieves the fills for the specified market.

- `market`: The market identifier.
- `user`: The user's address.
- `limit`: Optional limit on the number of fills to retrieve.

## getCandles

```typescript
async getCandles({ market, resolution, fromTime, toTime }: GetCandlesParams): Promise<Candle[]>
```

Retrieves the candles for the specified market and resolution.

- `market`: The market identifier.
- `resolution`: The time resolution for the candles.
- `fromTime`: Optional start time for the candle data.
- `toTime`: Optional end time for the candle data.

## events

The `OnchainLobSpot.events` property defines various events that you can listen to for real-time updates. These events include:

- `marketUpdated`: Triggered when there is an update in the market.
- `orderbookUpdated`: ⚠️ **Deprecated** - This event is deprecated and will be removed in a future version. Use `clobDepthUpdated` instead.
- `clobDepthUpdated`: Triggered when there is an update in the orderbook depth. This is the recommended event for orderbook updates.
- `tradesUpdated`: Triggered when a new trade occurs.
- `userFillUpdated`: Triggered when a fill is updated.
- `userOrderUpdated`: Triggered when an order is updated.
- `userOrderHistoryUpdated`: Triggered when an order history is updated.
- `candleUpdated`: Triggered when new candle data is available.
- `allMarketsUpdated`: Triggered when there is an update across any market.
- `subscriptionError`: Triggered when there is an error related to a subscription.

You can add event listeners to these events to handle real-time data as it comes in. Events start coming after you subscribe to them with certain methods.

## OnchainLobSpot Subscription Methods

The OnchainLobSpot class also includes methods for subscribing to and unsubscribing from various market updates, such as `subscribeToMarket`, `unsubscribeFromMarket`, `subscribeToOrderbook`, `unsubscribeFromOrderbook`, etc. These methods interact with the WebSocket API to provide real-time updates.

## Market Subscriptions

### subscribeToMarket

```typescript
subscribeToMarket({ market }: { market: string }): void
```

Subscribes to updates for a specific market.

### unsubscribeFromMarket

```typescript
unsubscribeFromMarket({ market }: { market: string }): void
```

Unsubscribes from updates for a specific market.

### subscribeToAllMarkets

```typescript
subscribeToAllMarkets(): void
```

Subscribes to updates for all markets.

### unsubscribeFromAllMarkets

```typescript
unsubscribeFromAllMarkets(): void
```

Unsubscribes from updates for all markets.

## Orderbook Subscriptions

### subscribeToOrderbook

```typescript
subscribeToOrderbook({ market, aggregation }: { market: string, aggregation: number }): void
```

**⚠️ Deprecated**: This method is deprecated and will be removed in a future version. Use `subscribeToClobDepth` instead.

Subscribes to orderbook updates for a specific market.

### unsubscribeFromOrderbook

```typescript
unsubscribeFromOrderbook({ market, aggregation }: { market: string, aggregation: number }): void
```

**⚠️ Deprecated**: This method is deprecated and will be removed in a future version. Use `unsubscribeFromClobDepth` instead.

Unsubscribes from orderbook updates for a specific market.

## ClobDepth Subscriptions

### subscribeToClobDepth

```typescript
subscribeToClobDepth({ market, depth }: { market: string, depth?: number }): void
```

Subscribes to orderbook depth updates for a specific market. This is the recommended method for subscribing to orderbook updates.

- `market`: The market identifier.
- `depth`: Optional limit on the number of levels to retrieve for each side.

**Example:**

```typescript
// Subscribe to clob depth updates
onchainLobClient.spot.subscribeToClobDepth({
  market: '<orderbookAddress>',
  depth: 10
});

// Listen to updates
onchainLobClient.spot.events.clobDepthUpdated.addListener((marketId, isSnapshot, clobDepth) => {
  console.log('ClobDepth updated:', {
    marketId,
    isSnapshot,
    bestAsk: clobDepth.asks[0]?.[0],
    bestBid: clobDepth.bids[0]?.[0]
  });
});
```

### unsubscribeFromClobDepth

```typescript
unsubscribeFromClobDepth({ market, depth }: { market: string, depth?: number }): void
```

Unsubscribes from orderbook depth updates for a specific market.

- `market`: The market identifier.
- `depth`: Optional depth parameter (must match the one used in `subscribeToClobDepth`).

## Trade Subscriptions

### subscribeToTrades

```typescript
subscribeToTrades({ market }: { market: string }): void
```

Subscribes to trade updates for a specific market.

### unsubscribeFromTrades

```typescript
unsubscribeFromTrades({ market }: { market: string }): void
```

Unsubscribes from trade updates for a specific market.

## User Order Subscriptions

### subscribeToUserOrders

```typescript
subscribeToUserOrders({ user, market }: { user: string, market?: string }): void
```

Subscribes to user order updates for a specific market and user.

### unsubscribeFromUserOrders

```typescript
unsubscribeFromUserOrders({ user, market }: { user: string, market?: string }): void
```

Unsubscribes from user order updates for a specific market and user.

## User Order History Subscriptions

### subscribeToUserOrderHistory

```typescript
subscribeToUserOrderHistory({ user, market }: { user: string, market?: string }): void
```

Subscribes to user order history updates for a specific market and user.

### unsubscribeFromUserOrderHistory

```typescript
unsubscribeFromUserOrderHistory({ user, market }: { user: string, market?: string }): void
```

Unsubscribes from user order history updates for a specific market and user.

## User Fill Subscriptions

### subscribeToUserFills

```typescript
subscribeToUserFills({ user, market }: { user: string, market?: string }): void
```

Subscribes to user fill updates for a specific market and user.

### unsubscribeFromUserFills

```typescript
unsubscribeFromUserFills({ user, market }: { user: string, market?: string }): void
```

Unsubscribes from user fill updates for a specific market and user.

## Candle Subscriptions

### subscribeToCandles

```typescript
subscribeToCandles({ market, resolution }: { market: string, resolution: CandleResolution }): void
```

Subscribes to candle updates for a specific market and resolution.

### unsubscribeFromCandles

```typescript
unsubscribeFromCandles({ market, resolution }: { market: string, resolution: CandleResolution }): void
```

Unsubscribes from candle updates for a specific market and resolution.

## Examples

### Post a new order (view with HTTP API)

```ts
import { ethers, type ContractTransactionResponse } from 'ethers';
import { OnchainLobClient } from 'onchain-lob-sdk';

// wallet = new ethers.Wallet(<yourPrivateKey>, <provider>);

const onchainLobClient = new OnchainLobClient({
  apiBaseUrl: 'https://api-dev.xpressprotocol.com',
  webSocketApiBaseUrl: 'wss://sockets-dev.xpressprotocol.com',
  signerOrProvider: wallet,
});

const market = '<orderbookAddress>';
let tx: ContractTransactionResponse;

// Approve tokens for the future order
tx = await onchainLobClient.spot.approveTokens({
  market,
  amount: new BigNumber(45.123),
  isBaseToken: true
});
console.log(tx.hash);

// Create a new order
tx = await onchainLobClient.spot.placeOrder({
  market,
  type: 'limit',
  side: 'ask',
  size: new BigNumber(45.123),
  price: new BigNumber(1.17),
  maxCommission: new bigNumber(0.1)
});
console.log(tx.hash);

// Get user orders
const orders = await onchainLobClient.spot.getOrders({ market, user: wallet.address });
console.log(orders);

// Find the new order
const newOrder = orders.find(o => o.txnHash === tx.hash);
console.log(newOrder);
```

### Post a new order (view with WebSockets)

```ts
import { ethers, type ContractTransactionResponse } from 'ethers';
import { OnchainLobClient } from 'onchain-lob-sdk';

// wallet = new ethers.Wallet(<yourPrivateKey>, <provider>);

const onchainLobClient = new OnchainLobClient({
  apiBaseUrl: 'https://api-dev.xpressprotocol.com',
  webSocketApiBaseUrl: 'wss://sockets-dev.xpressprotocol.com',
  signer: wallet,
});

const market = '<orderbookAddress>';
let tx: ContractTransactionResponse | undefined;
const user = wallet.address;

async function waitTx(): Promise<void> {
  while (!tx) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Subscribe to orders
client.spot.events.userOrdersUpdated.addListener(async (_, __, orders) => {
  await waitTx();

  const newOrder = orders.find(o => o.txnHash === tx!.hash);
  if (newOrder) {
    console.log(newOrder);
  }
});
client.spot.subscribeToUserOrders({ market, user });

// Approve tokens for the future order
tx = await onchainLobClient.spot.approveTokens({
  market,
  amount: new BigNumber(45.123),
  isBaseToken: true
});
console.log(tx.hash);

// Create a new order
tx = await onchainLobClient.spot.placeOrder({
  market,
  type: 'limit',
  side: 'ask',
  size: new BigNumber(45.123),
  price: new BigNumber(1.17)
  maxCommission: new bigNumber(0.1)
});
console.log(tx.hash);
```

### getClobDepth

Returns snapshot of the orderbook depth. This is the recommended method for getting orderbook data.

```ts
const clobDepth = await onchainLobClient.spot.getClobDepth({
  market: '<orderbookAddress>', // The address of the orderbook
  depth: 10, // Levels for each side [optional]
});

// Access orderbook data
console.log('Best ask:', clobDepth.asks[0]); // ['price', 'size']
console.log('Best bid:', clobDepth.bids[0]); // ['price', 'size']
```

### getOrderbook

**⚠️ Deprecated**: Use `getClobDepth` instead.

Returns snapshot of the orderbook.

```ts
const orderbook = await onchainLobClient.spot.getOrderbook({
  market: '<orderbookAddress>', // The address of the orderbook
  aggregation: 4, // Number of rounding decimals [optional]
  limit: 10, // Levels for each side [20 by default]
});
```

### getOrders

Returns user's orders.

```ts
const orders = await onchainLobClient.spot.getOrders({
  market: '<orderbookAddress>', // The address of the orderbook
  user: '<userAddress>', // The address of the user
  limit: 10, // Number of orders to retrieve [100 by default]
  status: 'open', // Order statuses to filter by
});
```

### getOrderHistory

Returns user's order history.

```ts
const orderHistory = await onchainLobClient.spot.getOrderHistory({
  market: '<orderbookAddress>', // The address of the orderbook
  user: '<userAddress>', // The address of the user
  limit: 10, // Number of history logs to retrieve [100 by default]
});
```

### getTrades

Returns last trades.

```ts
const trades = await onchainLobClient.spot.getTrades({
  market: '<orderbookAddress>', // The address of the orderbook
  limit: 10, // Number of trades to retrieve [100 by default]
});
```

### getFills

Returns user's fills.

```ts
const fills = await onchainLobClient.spot.getFills({
  market: '<orderbookAddress>', // The address of the orderbook
  user: '<userAddress>', // The address of the user
  limit: 10, // Number of fills to retrieve [100 by default]
});
```

### getMarkets

Returns market data.

```ts
const markets = await onchainLobClient.spot.getMarkets({
  market: '<orderbookAddress>', // The address of the orderbook
});
// If the market is not provided, data for all markets will be returned.
const allMarkets = await onchainLobClient.spot.getMarkets({
});
```
