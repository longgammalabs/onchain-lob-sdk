# OnchainLobClient

## Overview

The `OnchainLobClient` class is a central component for interacting with the Onchain LOB API. It manages the connection to the Onchain LOB API and provides methods to interact with the Onchain LOB Spot contracts.

## Constructor

### `constructor(options: Readonly<OnchainLobClientOptions>)`

Creates a new instance of the `OnchainLobClient`.

**Parameters:**

| Parameter                   | Type                          | Description                                                                 |
|-----------------------------|-------------------------------|-----------------------------------------------------------------------------|
| `apiBaseUrl`                | `string`                      | The base URL for the Onchain LOB API.                                             |
| `webSocketApiBaseUrl`       | `string`                      | The base URL for the Onchain LOB WebSocket API.                                   |
| `signer`                    | `Signer \| null`              | The ethers signer used for signing transactions.                            |
| `webSocketConnectImmediately?` | `boolean`                 | Whether to connect to the WebSocket immediately after creating the `OnchainLobClient` (default is true). |
| `autoWaitTransaction?` | `boolean` | Whether to automatically wait for transactions to be confirmed. |
| `fastWaitTransaction?` | `boolean` | Whether to use a fast algorithm for waiting for transactions to be confirmed. |
| `fastWaitTransactionInterval?` | `number` | Interval between requests in milliseconds when using a fast algorithm for waiting for transaction confirmations. |
| `fastWaitTransactionTimeout?` | `number` | Timeout in milliseconds when using a fast algorithm for waiting for transaction confirmations. |

## Properties

### `spot: OnchainLobSpot`

An instance of `OnchainLobSpot` that provides API functions to interact with the Onchain LOB Spot contracts.

## Methods

### `setSigner(signer: Signer | null): void`

Sets or unsets the signer for the `OnchainLobClient`.

**Parameters:**

- `signer` (Signer): The signer to set.

## Example Usage

```typescript
import { OnchainLobClient, OnchainLobClientOptions } from 'onchain-lob-sdk';

const options: OnchainLobClientOptions = {
  apiBaseUrl: 'https://api-dev.xpressprotocol.com',
  webSocketApiBaseUrl: 'wss://sockets-dev.xpressprotocol.com',
  signer: null,
  webSocketConnectImmediately: false,
};

const onchainLobClient = new OnchainLobClient(options);

// If you need to use user-oriented methods, set a signer or provider:
// newSigner = new ethers.Wallet(<yourPrivateKey>, <provider>);
onchainLobClient.setSigner(newSigner);
```
