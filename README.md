# Onchain LOB TypeScript SDK

The Onchain LOB TypeScript SDK is a library that simplifies the interaction with the Onchain LOB API, allowing developers to easily access and manipulate data related to the Onchain LOB platform.

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

## Example

You can find example usage in the `example` folder.

### Run web example

```sh
npm i
npm run build && npm run build:types
cd example
npm i
npm run dev
```

### Run node example

```sh
npm i
npm run build && npm run build:types
cd node_example
npm i
echo "ACCOUNT_PRIVATE_KEY=<YOUR_TESTNET_PRIVATE_KEY>" > .env
npm run timetx
```

## Contributing

First, install all necessary dependencies:

```sh
npm ci
```

### Building

To build the project, run the following command:

```sh
npm run build
```

This command will generate all necessary files to publish.

Also, you can use the `npm run watch` command to watch for changes and build automatically.

```sh
npm run watch
```

### Testing

Currently, the SDK has only integration tests.
To run them, use the following command:

```sh
npm run test:integration
```

If you need to run the specific test, use the jest command. Don't forget to pass the Jest CLI options:

```sh
npm run jest -- <options>
```
