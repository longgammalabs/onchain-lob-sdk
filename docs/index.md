# SDK

The [SDK](https://github.com/longgammalabs/onchain-lob-sdk) provides interfaces to communicate with the Onchain LOB API. 
Here is a description of the TypeScript version of the SDK.

The main object to start with is [`OnchainLobClient`](./OnchainLobClient.md).
It holds information about the Onchain LOB API endpoints and the user transaction signing interface.

All methods to interact with the spot market are available in the [`OnchainLobSpot`](./OnchainLobSpot.md) class.

The perpetual futures are available in the [`OnchainLobPerps`](./OnchainLobPerps.md) class (`client.perps`), which can also run on a built-in mock data source.

The SDK also provides type and interface definitions for the objects used.

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org) version 20.10.0 or later  
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [Yarn](https://yarnpkg.com/)

### Installation

1. Install the SDK package

    ```sh
    npm install onchain-lob-sdk
    ```

2. Install the [ws](https://github.com/websockets/ws) package if you going to use it in the Node.js environment

    ```sh
    npm install ws
    ```
