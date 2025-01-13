"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  OnchainLobClient: () => OnchainLobClient,
  OnchainLobError: () => OnchainLobError,
  OnchainLobSpot: () => OnchainLobSpot,
  OnchainLobSpotService: () => OnchainLobSpotService,
  OnchainLobSpotWebSocketService: () => OnchainLobSpotWebSocketService,
  OnchainLobVault: () => OnchainLobVault,
  TimeoutScheduler: () => TimeoutScheduler
});
module.exports = __toCommonJS(src_exports);

// src/common/eventEmitter.ts
var EventEmitter = class {
  constructor() {
    __publicField(this, "listeners", /* @__PURE__ */ new Set());
  }
  addListener(listener) {
    this.listeners.add(listener);
    return this;
  }
  removeListener(listener) {
    if (this.listeners.has(listener))
      this.listeners.delete(listener);
    return this;
  }
  removeAllListeners() {
    this.listeners = /* @__PURE__ */ new Set();
    return this;
  }
  emit(...args) {
    if (!this.listeners.size)
      return;
    if (this.listeners.size === 1) {
      try {
        this.listeners.values().next().value(...args);
      } catch (error) {
        console.error(error);
      }
    } else {
      [...this.listeners].forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(error);
        }
      });
    }
  }
};

// src/common/webSocketClient/index.node.ts
var import_ws = require("ws");
var WebSocketClient = class {
  constructor(url) {
    this.url = url;
    __publicField(this, "events", {
      messageReceived: new EventEmitter(),
      opened: new EventEmitter(),
      closed: new EventEmitter()
    });
    __publicField(this, "_socket");
    __publicField(this, "onMessageReceived", (event) => {
      try {
        const data = JSON.parse(event.data);
        this.events.messageReceived.emit(data);
      } catch (error) {
        console.error(error);
      }
    });
    __publicField(this, "onError", (event) => {
      throw new Error(`Websocket received error: ${event.message}`);
    });
    __publicField(this, "onOpened", (event) => {
      this.events.opened.emit(this, event);
    });
    __publicField(this, "onClosed", (event) => {
      this.events.closed.emit(this, event);
    });
  }
  get readyState() {
    return this.socket.readyState;
  }
  get socket() {
    if (!this._socket)
      throw new Error("Internal websocket is not created. Use the connect method first");
    return this._socket;
  }
  async connect() {
    this.disconnect();
    return new Promise((resolve, reject) => {
      this._socket = new import_ws.WebSocket(this.url);
      this.socket.once("open", () => resolve());
      this.socket.once("error", (error) => reject(error));
      this.socket.addEventListener("open", this.onOpened);
      this.socket.addEventListener("message", this.onMessageReceived);
      this.socket.addEventListener("error", this.onError);
      this.socket.addEventListener("close", this.onClosed);
    });
  }
  disconnect() {
    if (!this._socket)
      return;
    this.socket.off("open", this.onOpened);
    this.socket.off("message", this.onMessageReceived);
    this.socket.off("error", this.onError);
    this.socket.off("close", this.onClosed);
    this.socket.close();
  }
  send(message) {
    this.socket.send(JSON.stringify(message));
  }
};

// src/utils/guards.ts
var guards_exports = {};
__export(guards_exports, {
  isArray: () => isArray,
  isReadonlyArray: () => isReadonlyArray
});
var isArray = (arg) => {
  return Array.isArray(arg);
};
var isReadonlyArray = (arg) => {
  return Array.isArray(arg);
};

// src/utils/textUtils.ts
var textUtils_exports = {};
__export(textUtils_exports, {
  trimSlashes: () => trimSlashes
});
var trimSlashes = (value) => {
  const hasFirst = value.startsWith("/");
  const hasLast = value.endsWith("/");
  return hasFirst && hasLast ? value.slice(1, -1) : hasFirst ? value.slice(1) : hasLast ? value.slice(0, -1) : value;
};

// src/utils/tokenUtils.ts
var tokenUtils_exports = {};
__export(tokenUtils_exports, {
  convertTokensAmountToRawAmount: () => convertTokensAmountToRawAmount,
  convertTokensRawAmountToAmount: () => convertTokensRawAmountToAmount
});
var import_bignumber = __toESM(require("bignumber.js"));
var import_ethers = require("ethers");
var convertTokensRawAmountToAmount = (amount, decimals) => {
  return new import_bignumber.default((0, import_ethers.formatUnits)(amount, decimals));
};
var convertTokensAmountToRawAmount = (amount, decimals) => {
  const preparedAmount = amount.toFixed(decimals, import_bignumber.default.ROUND_DOWN);
  return (0, import_ethers.parseUnits)(preparedAmount, decimals);
};

// src/utils/delay.ts
var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// src/common/timeoutScheduler.ts
var TimeoutScheduler = class {
  constructor(timeouts, counterExpirationMs) {
    this.timeouts = timeouts;
    this.counterExpirationMs = counterExpirationMs;
    __publicField(this, "counterExpirationWatcherId");
    __publicField(this, "actionWatchers", /* @__PURE__ */ new Set());
    __publicField(this, "_counter", 0);
  }
  get counter() {
    return this._counter;
  }
  set counter(value) {
    this._counter = value;
  }
  [Symbol.dispose]() {
    if (this.counterExpirationWatcherId)
      clearTimeout(this.counterExpirationWatcherId);
    this.actionWatchers.forEach((watcher) => clearTimeout(watcher));
  }
  setTimeout(action) {
    return new Promise((resolve) => {
      if (this.counterExpirationMs)
        this.resetCounterExpiration();
      const timeoutIndex = Math.min(this.counter, this.timeouts.length - 1);
      const timeout = this.timeouts[timeoutIndex];
      const watcherId = setTimeout(async () => {
        this.actionWatchers.delete(watcherId);
        clearTimeout(watcherId);
        await action();
        resolve();
      }, timeout);
      this.actionWatchers.add(watcherId);
      this.counter++;
    });
  }
  resetCounter() {
    this.counter = 0;
  }
  resetCounterExpiration() {
    if (this.counterExpirationWatcherId)
      clearTimeout(this.counterExpirationWatcherId);
    this.counterExpirationWatcherId = setTimeout(() => {
      this.resetCounter();
      this.counterExpirationWatcherId = void 0;
    }, this.counterExpirationMs);
  }
};

// src/common/onchainLobWebSocketClient/onchainLobWebSocketClient.ts
var OnchainLobWebSocketClient = class {
  constructor(baseUrl) {
    __publicField(this, "baseUrl");
    __publicField(this, "events", {
      messageReceived: new EventEmitter()
    });
    __publicField(this, "socket");
    __publicField(this, "subscriptions", /* @__PURE__ */ new Map());
    __publicField(this, "subscriptionIdCounter", 0);
    __publicField(this, "reconnectScheduler", new TimeoutScheduler([1e3, 5e3, 3e4, 6e4], 12e4));
    __publicField(this, "_isStarted", false);
    __publicField(this, "_isStarting", false);
    __publicField(this, "onSocketClosed", (_socket, event) => {
      console.warn("Onchain LOB websocket is closed. Reason:", event.reason);
      this.reconnectScheduler.setTimeout(() => {
        console.log("Onchain LOB websocket reconnection...");
        this.connect().catch((error) => console.error("Reconnection error:", error));
      }).catch((error) => console.error("Reconnect Scheduler error:", error));
    });
    __publicField(this, "onSocketMessageReceived", (message) => {
      switch (message.channel) {
        case "connection":
          break;
        default:
          this.events.messageReceived.emit(message);
      }
    });
    this.baseUrl = textUtils_exports.trimSlashes(baseUrl);
    this.socket = new WebSocketClient(new URL(this.baseUrl));
  }
  get isStarted() {
    return this._isStarted;
  }
  get isSocketOpen() {
    return this.socket.readyState === 1 /* Open */;
  }
  async start() {
    if (this.isStarted || this._isStarting)
      return;
    this._isStarting = true;
    try {
      this.socket.events.messageReceived.addListener(this.onSocketMessageReceived);
      this.socket.events.closed.addListener(this.onSocketClosed);
      await this.connect();
      this._isStarted = true;
    } catch (error) {
      this._isStarting = false;
      this._isStarted = false;
      throw new Error("Socket error", { cause: error });
    }
  }
  stop() {
    if (!(this.isStarted || this._isStarting))
      return;
    this.socket.events.messageReceived.removeListener(this.onSocketMessageReceived);
    this.socket.events.closed.removeListener(this.onSocketClosed);
    this.disconnect();
    this.reconnectScheduler[Symbol.dispose]();
    this._isStarted = false;
    this._isStarting = false;
  }
  subscribe(subscriptionData) {
    const serializedSubscriptionData = this.serializeSubscriptionData(subscriptionData);
    let subscription = this.subscriptions.get(serializedSubscriptionData);
    if (subscription) {
      subscription.subscribersCount++;
      return subscription.id;
    }
    subscription = {
      id: this.subscriptionIdCounter++,
      data: subscriptionData,
      serializedData: serializedSubscriptionData,
      subscribersCount: 1
    };
    this.subscribeToSubscription(subscription);
    this.subscriptions.set(subscription.serializedData, subscription);
    return subscription.id;
  }
  unsubscribe(subscriptionData) {
    const serializedSubscriptionData = this.serializeSubscriptionData(subscriptionData);
    const subscription = this.subscriptions.get(serializedSubscriptionData);
    if (!subscription)
      return false;
    if (--subscription.subscribersCount > 0)
      return false;
    this.unsubscribeFromSubscription(subscription);
    this.subscriptions.delete(subscription.serializedData);
    return true;
  }
  unsubscribeFromAllSubscriptions() {
    if (!this.subscriptions.size)
      return false;
    for (const subscription of this.subscriptions.values()) {
      this.unsubscribeFromSubscription(subscription);
    }
    this.subscriptions.clear();
    return true;
  }
  [Symbol.dispose]() {
    this.stop();
  }
  async connect() {
    await this.socket.connect();
    this.subscribeToAllSubscriptions();
  }
  subscribeToAllSubscriptions() {
    if (!this.isSocketOpen)
      return;
    for (const subscription of this.subscriptions.values())
      this.subscribeToSubscription(subscription);
  }
  subscribeToSubscription(subscription) {
    if (!this.isSocketOpen)
      return;
    const message = {
      method: "subscribe",
      subscription: subscription.data
    };
    this.socket.send(message);
  }
  unsubscribeFromSubscription(subscription) {
    if (!this.isSocketOpen)
      return;
    const message = {
      method: "unsubscribe",
      subscription: subscription.data
    };
    this.socket.send(message);
  }
  disconnect() {
    this.socket.disconnect();
    this.subscriptions.clear();
  }
  serializeSubscriptionData(data) {
    return JSON.stringify(data, Object.keys(data));
  }
};

// src/common/error.ts
var OnchainLobError = class extends Error {
  /**
   * Creates a new OnchainLobError.
   *
   * @param {string} [message] - The error message.
   * @param {ErrorOptions} [options] - The error options.
   */
  constructor(message, options) {
    super(message, options);
    __publicField(this, "name");
    this.name = this.constructor.name;
  }
};

// src/spot/onchainLobSpotMarketContract.ts
var import_bignumber2 = __toESM(require("bignumber.js"));
var import_ethers2 = require("ethers");

// src/spot/errors.ts
var TransactionFailedError = class extends OnchainLobError {
  constructor(encodedError, error, options) {
    super(`${error ? `${error.name} [${error.selector}]` : `Unknown error: [${encodedError}]`}`, options);
    this.encodedError = encodedError;
    this.error = error;
  }
};

// src/abi/erc20.ts
var erc20Abi = [
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" }
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "spender", type: "address", indexed: true, internalType: "address" },
      { name: "value", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "value", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  }
];

// src/abi/lob.ts
var lobAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view"
  },
  { type: "function", name: "acceptOwnership", inputs: [], outputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "batchChangeOrder",
    inputs: [
      { name: "order_ids", type: "uint64[]", internalType: "uint64[]" },
      { name: "quantities", type: "uint128[]", internalType: "uint128[]" },
      { name: "prices", type: "uint72[]", internalType: "uint72[]" },
      { name: "max_commission_per_order", type: "uint128", internalType: "uint128" },
      { name: "post_only", type: "bool", internalType: "bool" },
      { name: "transfer_tokens", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "new_order_ids", type: "uint64[]", internalType: "uint64[]" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "batchClaim",
    inputs: [
      { name: "addresses", type: "address[]", internalType: "address[]" },
      { name: "order_ids", type: "uint64[]", internalType: "uint64[]" },
      { name: "only_claim", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changeMarketMaker",
    inputs: [
      { name: "_marketmaker", type: "address", internalType: "address" },
      { name: "_should_invoke_on_trade", type: "bool", internalType: "bool" },
      { name: "_admin_commission_rate", type: "uint64", internalType: "uint64" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changeOrder",
    inputs: [
      { name: "old_order_id", type: "uint64", internalType: "uint64" },
      { name: "new_quantity", type: "uint128", internalType: "uint128" },
      { name: "new_price", type: "uint72", internalType: "uint72" },
      { name: "max_commission", type: "uint128", internalType: "uint128" },
      { name: "post_only", type: "bool", internalType: "bool" },
      { name: "transfer_tokens", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "order_id", type: "uint64", internalType: "uint64" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changePauser",
    inputs: [{ name: "pauser_", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "claimOrder",
    inputs: [
      { name: "order_id", type: "uint64", internalType: "uint64" },
      { name: "only_claim", type: "bool", internalType: "bool" },
      { name: "transfer_tokens", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "depositTokens",
    inputs: [
      { name: "token_x_amount", type: "uint128", internalType: "uint128" },
      { name: "token_y_amount", type: "uint128", internalType: "uint128" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "depositTokens",
    inputs: [
      { name: "token_x_amount", type: "uint128", internalType: "uint128" },
      { name: "token_y_amount", type: "uint128", internalType: "uint128" },
      { name: "v_x", type: "uint8", internalType: "uint8" },
      { name: "r_x", type: "bytes32", internalType: "bytes32" },
      { name: "s_x", type: "bytes32", internalType: "bytes32" },
      { name: "v_y", type: "uint8", internalType: "uint8" },
      { name: "r_y", type: "bytes32", internalType: "bytes32" },
      { name: "s_y", type: "bytes32", internalType: "bytes32" },
      { name: "expires", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getAccumulatedFees",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getConfig",
    inputs: [],
    outputs: [
      { name: "_scaling_factor_token_x", type: "uint256", internalType: "uint256" },
      { name: "_scaling_factor_token_y", type: "uint256", internalType: "uint256" },
      { name: "_token_x", type: "address", internalType: "address" },
      { name: "_token_y", type: "address", internalType: "address" },
      { name: "_supports_native_eth", type: "bool", internalType: "bool" },
      { name: "_is_token_x_weth", type: "bool", internalType: "bool" },
      { name: "_ask_trie", type: "address", internalType: "address" },
      { name: "_bid_trie", type: "address", internalType: "address" },
      { name: "_admin_commission_rate", type: "uint64", internalType: "uint64" },
      { name: "_total_aggressive_commission_rate", type: "uint64", internalType: "uint64" },
      { name: "_total_passive_commission_rate", type: "uint64", internalType: "uint64" },
      { name: "_passive_order_payout_rate", type: "uint64", internalType: "uint64" },
      { name: "_should_invoke_on_trade", type: "bool", internalType: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getTraderBalance",
    inputs: [{ name: "address_", type: "address", internalType: "address" }],
    outputs: [
      { name: "", type: "uint128", internalType: "uint128" },
      { name: "", type: "uint128", internalType: "uint128" },
      { name: "", type: "bool", internalType: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      { name: "_trie_factory", type: "address", internalType: "address" },
      { name: "_tokenXAddress", type: "address", internalType: "address" },
      { name: "_tokenYAddress", type: "address", internalType: "address" },
      { name: "_supports_native_eth", type: "bool", internalType: "bool" },
      { name: "_is_token_x_weth", type: "bool", internalType: "bool" },
      { name: "scaling_token_x", type: "uint256", internalType: "uint256" },
      { name: "scaling_token_y", type: "uint256", internalType: "uint256" },
      { name: "_administrator", type: "address", internalType: "address" },
      { name: "_marketmaker", type: "address", internalType: "address" },
      { name: "_pauser", type: "address", internalType: "address" },
      { name: "_should_invoke_on_trade", type: "bool", internalType: "bool" },
      { name: "_admin_commission_rate", type: "uint64", internalType: "uint64" },
      { name: "_total_aggressive_commission_rate", type: "uint64", internalType: "uint64" },
      { name: "_total_passive_commission_rate", type: "uint64", internalType: "uint64" },
      { name: "_passive_order_payout_rate", type: "uint64", internalType: "uint64" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "marketmaker_config",
    inputs: [],
    outputs: [
      { name: "marketmaker", type: "address", internalType: "address" },
      { name: "should_invoke_on_trade", type: "bool", internalType: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "nonce",
    inputs: [],
    outputs: [{ name: "", type: "uint64", internalType: "uint64" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view"
  },
  { type: "function", name: "pause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pauser",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "placeMarketOrderWithTargetValue",
    inputs: [
      { name: "isAsk", type: "bool", internalType: "bool" },
      { name: "target_token_y_value", type: "uint128", internalType: "uint128" },
      { name: "price", type: "uint72", internalType: "uint72" },
      { name: "max_commission", type: "uint128", internalType: "uint128" },
      { name: "amount_to_approve", type: "uint128", internalType: "uint128" },
      { name: "transfer_executed_tokens", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" },
      { name: "v", type: "uint8", internalType: "uint8" },
      { name: "r", type: "bytes32", internalType: "bytes32" },
      { name: "s", type: "bytes32", internalType: "bytes32" }
    ],
    outputs: [
      { name: "executed_shares", type: "uint128", internalType: "uint128" },
      { name: "executed_value", type: "uint128", internalType: "uint128" },
      { name: "aggressive_fee", type: "uint128", internalType: "uint128" }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "placeMarketOrderWithTargetValue",
    inputs: [
      { name: "isAsk", type: "bool", internalType: "bool" },
      { name: "target_token_y_value", type: "uint128", internalType: "uint128" },
      { name: "price", type: "uint72", internalType: "uint72" },
      { name: "max_commission", type: "uint128", internalType: "uint128" },
      { name: "transfer_executed_tokens", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" }
    ],
    outputs: [
      { name: "executed_shares", type: "uint128", internalType: "uint128" },
      { name: "executed_value", type: "uint128", internalType: "uint128" },
      { name: "aggressive_fee", type: "uint128", internalType: "uint128" }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "placeOrder",
    inputs: [
      { name: "isAsk", type: "bool", internalType: "bool" },
      { name: "quantity", type: "uint128", internalType: "uint128" },
      { name: "price", type: "uint72", internalType: "uint72" },
      { name: "max_commission", type: "uint128", internalType: "uint128" },
      { name: "amount_to_approve", type: "uint128", internalType: "uint128" },
      { name: "market_only", type: "bool", internalType: "bool" },
      { name: "post_only", type: "bool", internalType: "bool" },
      { name: "transfer_executed_tokens", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" },
      { name: "v", type: "uint8", internalType: "uint8" },
      { name: "r", type: "bytes32", internalType: "bytes32" },
      { name: "s", type: "bytes32", internalType: "bytes32" }
    ],
    outputs: [
      { name: "order_id", type: "uint64", internalType: "uint64" },
      { name: "executed_shares", type: "uint128", internalType: "uint128" },
      { name: "executed_value", type: "uint128", internalType: "uint128" },
      { name: "aggressive_fee", type: "uint128", internalType: "uint128" }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "placeOrder",
    inputs: [
      { name: "isAsk", type: "bool", internalType: "bool" },
      { name: "quantity", type: "uint128", internalType: "uint128" },
      { name: "price", type: "uint72", internalType: "uint72" },
      { name: "max_commission", type: "uint128", internalType: "uint128" },
      { name: "market_only", type: "bool", internalType: "bool" },
      { name: "post_only", type: "bool", internalType: "bool" },
      { name: "transfer_executed_tokens", type: "bool", internalType: "bool" },
      { name: "expires", type: "uint256", internalType: "uint256" }
    ],
    outputs: [
      { name: "order_id", type: "uint64", internalType: "uint64" },
      { name: "executed_shares", type: "uint128", internalType: "uint128" },
      { name: "executed_value", type: "uint128", internalType: "uint128" },
      { name: "aggressive_fee", type: "uint128", internalType: "uint128" }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view"
  },
  { type: "function", name: "renounceOwnership", inputs: [], outputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "setClaimableStatus",
    inputs: [{ name: "status", type: "bool", internalType: "bool" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  { type: "function", name: "transferFees", inputs: [], outputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  { type: "function", name: "unpause", inputs: [], outputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      { name: "newImplementation", type: "address", internalType: "address" },
      { name: "data", type: "bytes", internalType: "bytes" }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "withdrawTokens",
    inputs: [
      { name: "withdraw_all", type: "bool", internalType: "bool" },
      { name: "token_x_amount", type: "uint128", internalType: "uint128" },
      { name: "token_y_amount", type: "uint128", internalType: "uint128" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "ClaimableStatusChanged",
    inputs: [
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "status", type: "bool", indexed: false, internalType: "bool" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "token_x", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "token_y", type: "uint128", indexed: false, internalType: "uint128" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [{ name: "version", type: "uint64", indexed: false, internalType: "uint64" }],
    anonymous: false
  },
  {
    type: "event",
    name: "MarketMakerChanged",
    inputs: [
      { name: "new_marketmaker", type: "address", indexed: false, internalType: "address" },
      { name: "old_marketmaker", type: "address", indexed: false, internalType: "address" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OrderClaimed",
    inputs: [
      { name: "order_id", type: "uint64", indexed: false, internalType: "uint64" },
      { name: "order_shares_remaining", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "token_x_sent", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "token_y_sent", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "passive_payout", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "only_claim", type: "bool", indexed: false, internalType: "bool" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OrderPlaced",
    inputs: [
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "order_id", type: "uint64", indexed: false, internalType: "uint64" },
      { name: "isAsk", type: "bool", indexed: true, internalType: "bool" },
      { name: "quantity", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "price", type: "uint72", indexed: false, internalType: "uint72" },
      { name: "passive_shares", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "passive_fee", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "aggressive_shares", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "aggressive_value", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "aggressive_fee", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "market_only", type: "bool", indexed: false, internalType: "bool" },
      { name: "post_only", type: "bool", indexed: false, internalType: "bool" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferStarted",
    inputs: [
      { name: "previousOwner", type: "address", indexed: true, internalType: "address" },
      { name: "newOwner", type: "address", indexed: true, internalType: "address" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { name: "previousOwner", type: "address", indexed: true, internalType: "address" },
      { name: "newOwner", type: "address", indexed: true, internalType: "address" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Paused",
    inputs: [{ name: "account", type: "address", indexed: false, internalType: "address" }],
    anonymous: false
  },
  {
    type: "event",
    name: "PauserChanged",
    inputs: [
      { name: "new_pauser", type: "address", indexed: false, internalType: "address" },
      { name: "old_pauser", type: "address", indexed: false, internalType: "address" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [{ name: "account", type: "address", indexed: false, internalType: "address" }],
    anonymous: false
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [{ name: "implementation", type: "address", indexed: true, internalType: "address" }],
    anonymous: false
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "token_x", type: "uint128", indexed: false, internalType: "uint128" },
      { name: "token_y", type: "uint128", indexed: false, internalType: "uint128" }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [{ name: "target", type: "address", internalType: "address" }]
  },
  {
    type: "error",
    name: "AddressInsufficientBalance",
    inputs: [{ name: "account", type: "address", internalType: "address" }]
  },
  { type: "error", name: "AddressIsZero", inputs: [] },
  { type: "error", name: "ArrayLengthMismatch", inputs: [] },
  { type: "error", name: "ClaimNotAllowed", inputs: [] },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [{ name: "implementation", type: "address", internalType: "address" }]
  },
  { type: "error", name: "ERC1967NonPayable", inputs: [] },
  { type: "error", name: "EnforcedPause", inputs: [] },
  { type: "error", name: "ExcessiveSignificantFigures", inputs: [] },
  { type: "error", name: "ExpectedPause", inputs: [] },
  { type: "error", name: "Expired", inputs: [] },
  { type: "error", name: "FailedInnerCall", inputs: [] },
  { type: "error", name: "Forbidden", inputs: [] },
  { type: "error", name: "InsufficientTokenXBalance", inputs: [] },
  { type: "error", name: "InsufficientTokenYBalance", inputs: [] },
  { type: "error", name: "InvalidCommissionRate", inputs: [] },
  { type: "error", name: "InvalidFloatingPointRepresentation", inputs: [] },
  { type: "error", name: "InvalidInitialization", inputs: [] },
  { type: "error", name: "InvalidMarketMaker", inputs: [] },
  { type: "error", name: "InvalidPriceRange", inputs: [] },
  { type: "error", name: "InvalidTransfer", inputs: [] },
  { type: "error", name: "MarketOnlyAndPostOnlyFlagsConflict", inputs: [] },
  { type: "error", name: "MaxCommissionFailure", inputs: [] },
  { type: "error", name: "NativeETHDisabled", inputs: [] },
  { type: "error", name: "NonceExhaustedFailure", inputs: [] },
  { type: "error", name: "NotInitializing", inputs: [] },
  { type: "error", name: "OnlyOwnerCanCancelOrders", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }]
  },
  { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
  {
    type: "error",
    name: "SafeCastOverflowedUintDowncast",
    inputs: [
      { name: "bits", type: "uint8", internalType: "uint8" },
      { name: "value", type: "uint256", internalType: "uint256" }
    ]
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }]
  },
  { type: "error", name: "TransferFailed", inputs: [] },
  { type: "error", name: "UUPSUnauthorizedCallContext", inputs: [] },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }]
  },
  { type: "error", name: "ZeroTokenTransferNotAllowed", inputs: [] }
];

// src/abi/erc20permit.ts
var erc20PermitAbi = [
  {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "eip712Domain",
    inputs: [],
    outputs: [
      {
        name: "fields",
        type: "bytes1",
        internalType: "bytes1"
      },
      {
        name: "name",
        type: "string",
        internalType: "string"
      },
      {
        name: "version",
        type: "string",
        internalType: "string"
      },
      {
        name: "chainId",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "verifyingContract",
        type: "address",
        internalType: "address"
      },
      {
        name: "salt",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "extensions",
        type: "uint256[]",
        internalType: "uint256[]"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "nonces",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "permit",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        internalType: "address"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        internalType: "address"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "EIP712DomainChanged",
    inputs: [],
    anonymous: false
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "ECDSAInvalidSignature",
    inputs: []
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  },
  {
    type: "error",
    name: "ERC20InsufficientAllowance",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address"
      },
      {
        name: "allowance",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "needed",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ERC20InsufficientBalance",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address"
      },
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "needed",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ERC20InvalidApprover",
    inputs: [
      {
        name: "approver",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC20InvalidReceiver",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC20InvalidSender",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC20InvalidSpender",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC2612ExpiredSignature",
    inputs: [
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "ERC2612InvalidSigner",
    inputs: [
      {
        name: "signer",
        type: "address",
        internalType: "address"
      },
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidAccountNonce",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      },
      {
        name: "currentNonce",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidShortString",
    inputs: []
  },
  {
    type: "error",
    name: "StringTooLong",
    inputs: [
      {
        name: "str",
        type: "string",
        internalType: "string"
      }
    ]
  }
];

// src/abi/erc20Weth.ts
var erc20WethAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "wad", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" }
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "spender", type: "address", indexed: true, internalType: "address" },
      { name: "value", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      { name: "value", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  }
];

// src/spot/onchainLobSpotMarketContract.ts
var DEFAULT_MAX_COMMISSION = 340282366920938463463374607431768211455n;
var DEFAULT_ASK_MARKET_PRICE = 1n;
var DEFAULT_BID_MARKET_PRICE = 999999000000000000000n;
var getExpires = () => BigInt(Math.floor(Date.now() / 1e3) + 5 * 60);
var _OnchainLobSpotMarketContract = class _OnchainLobSpotMarketContract {
  constructor(options) {
    __publicField(this, "market");
    __publicField(this, "transferExecutedTokensEnabled");
    __publicField(this, "autoWaitTransaction");
    __publicField(this, "fastWaitTransaction");
    __publicField(this, "fastWaitTransactionInterval");
    __publicField(this, "fastWaitTransactionTimeout");
    __publicField(this, "signer");
    __publicField(this, "marketContract");
    __publicField(this, "baseTokenContract");
    __publicField(this, "quoteTokenContract");
    __publicField(this, "_chainId");
    this.market = options.market;
    this.signer = options.signer;
    this.transferExecutedTokensEnabled = options.transferExecutedTokensEnabled ?? _OnchainLobSpotMarketContract.defaultTransferExecutedTokensEnabled;
    this.autoWaitTransaction = options.autoWaitTransaction ?? _OnchainLobSpotMarketContract.defaultAutoWaitTransaction;
    this.fastWaitTransaction = options.fastWaitTransaction ?? _OnchainLobSpotMarketContract.defaultFastWaitTransaction;
    this.fastWaitTransactionInterval = options.fastWaitTransactionInterval ?? _OnchainLobSpotMarketContract.defaultFastWaitTransactionInterval;
    this.fastWaitTransactionTimeout = options.fastWaitTransactionTimeout;
    this.marketContract = new import_ethers2.Contract(this.market.orderbookAddress, lobAbi, options.signer);
    this.baseTokenContract = new import_ethers2.Contract(
      this.market.baseToken.contractAddress,
      this.market.supportsNativeToken && this.market.isNativeTokenX ? erc20WethAbi : this.market.baseToken.supportsPermit ? erc20PermitAbi : erc20Abi,
      options.signer
    );
    this.quoteTokenContract = new import_ethers2.Contract(
      this.market.quoteToken.contractAddress,
      this.market.supportsNativeToken && !this.market.isNativeTokenX ? erc20WethAbi : this.market.quoteToken.supportsPermit ? erc20PermitAbi : erc20Abi,
      options.signer
    );
  }
  get chainId() {
    if (this._chainId === void 0) {
      return this.signer.provider.getNetwork().then((network) => {
        this._chainId = network.chainId;
        return this._chainId;
      });
    }
    return Promise.resolve(this._chainId);
  }
  async approveTokens(params) {
    let token;
    let tokenContract;
    if (params.isBaseToken) {
      token = this.market.baseToken;
      tokenContract = this.baseTokenContract;
    } else {
      token = this.market.quoteToken;
      tokenContract = this.quoteTokenContract;
    }
    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.approve(
        params.market,
        amount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async depositTokens(params) {
    const baseTokenAmount = this.convertTokensAmountToRawAmountIfNeeded(params.baseTokenAmount, this.market.tokenXScalingFactor);
    const quoteTokenAmount = this.convertTokensAmountToRawAmountIfNeeded(params.quoteTokenAmount, this.market.tokenYScalingFactor);
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.depositTokens(
        baseTokenAmount,
        quoteTokenAmount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async withdrawTokens(params) {
    const withdrawAll = !!params.withdrawAll;
    let baseTokenAmount;
    let quoteTokenAmount;
    if (withdrawAll) {
      baseTokenAmount = 0n;
      quoteTokenAmount = 0n;
    } else {
      baseTokenAmount = this.convertTokensAmountToRawAmountIfNeeded(params.baseTokenAmount, this.market.tokenXScalingFactor);
      quoteTokenAmount = this.convertTokensAmountToRawAmountIfNeeded(params.quoteTokenAmount, this.market.tokenYScalingFactor);
    }
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.withdrawTokens(
        withdrawAll,
        baseTokenAmount,
        quoteTokenAmount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async setClaimableStatus(params) {
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.setClaimableStatus(
        params.status,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async placeOrder(params) {
    if (params.nativeTokenToSend !== void 0 && this.market.supportsNativeToken && !(params.side === "ask" && this.market.isNativeTokenX || params.side !== "ask" && !this.market.isNativeTokenX)) {
      throw Error("Token to send is not native.");
    }
    const sizeAmount = this.convertTokensAmountToRawAmountIfNeeded(params.size, this.market.tokenXScalingFactor);
    let priceAmount;
    if (params.type === "market_execution") {
      priceAmount = params.side === "ask" ? DEFAULT_ASK_MARKET_PRICE : DEFAULT_BID_MARKET_PRICE;
    } else {
      priceAmount = this.convertTokensAmountToRawAmountIfNeeded(params.price, this.market.priceScalingFactor);
    }
    const expires = getExpires();
    const maxCommission = params.maxCommission === void 0 ? DEFAULT_MAX_COMMISSION : this.convertTokensAmountToRawAmountIfNeeded(params.maxCommission, this.market.tokenYScalingFactor);
    const value = params.nativeTokenToSend === void 0 ? 0n : this.convertTokensAmountToRawAmountIfNeeded(
      params.nativeTokenToSend,
      params.side === "ask" ? this.market.baseToken.decimals : this.market.quoteToken.decimals
    );
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.placeOrder(
        params.side === "ask",
        sizeAmount,
        priceAmount,
        maxCommission,
        params.type === "ioc" || params.type === "market_execution",
        params.type === "limit_post_only",
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        {
          value,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async placeOrderWithPermit(params) {
    if (params.side === "ask" && !this.market.baseToken.supportsPermit || params.side === "bid" && !this.market.quoteToken.supportsPermit) {
      throw Error("Token doesn't support permits");
    }
    const sizeAmount = this.convertTokensAmountToRawAmountIfNeeded(params.size, this.market.tokenXScalingFactor);
    let priceAmount;
    if (params.type === "market_execution") {
      priceAmount = params.side === "ask" ? DEFAULT_ASK_MARKET_PRICE : DEFAULT_BID_MARKET_PRICE;
    } else {
      priceAmount = this.convertTokensAmountToRawAmountIfNeeded(params.price, this.market.priceScalingFactor);
    }
    let quantityToPermit, amountToPermit;
    if (params.side === "ask") {
      amountToPermit = this.convertTokensAmountToRawAmountIfNeeded(
        params.permit,
        this.market.tokenXScalingFactor
      );
      quantityToPermit = amountToPermit * 10n ** BigInt(
        this.market.baseToken.decimals - this.market.tokenXScalingFactor
      );
    } else {
      amountToPermit = this.convertTokensAmountToRawAmountIfNeeded(
        params.permit,
        this.market.tokenYScalingFactor
      );
      quantityToPermit = amountToPermit * 10n ** BigInt(
        this.market.quoteToken.decimals - this.market.tokenYScalingFactor
      );
    }
    const expires = getExpires();
    const maxCommission = params.maxCommission === void 0 ? DEFAULT_MAX_COMMISSION : this.convertTokensAmountToRawAmountIfNeeded(params.maxCommission, this.market.tokenYScalingFactor);
    const { v, r, s } = await this.signPermit(params.side === "ask", quantityToPermit, expires);
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.placeOrder(
        params.side === "ask",
        sizeAmount,
        priceAmount,
        maxCommission,
        amountToPermit,
        params.type === "ioc" || params.type === "market_execution",
        params.type === "limit_post_only",
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        v,
        r,
        s,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async placeMarketOrderWithTargetValue(params) {
    if (params.nativeTokenToSend !== void 0 && this.market.supportsNativeToken && !(params.side === "ask" && this.market.isNativeTokenX || params.side !== "ask" && !this.market.isNativeTokenX)) {
      throw Error("Token to send is not native.");
    }
    const targetTokenYValue = this.convertTokensAmountToRawAmountIfNeeded(params.size, this.market.tokenYScalingFactor);
    let priceAmount;
    if (params.type === "market_execution") {
      priceAmount = params.side === "ask" ? DEFAULT_ASK_MARKET_PRICE : DEFAULT_BID_MARKET_PRICE;
    } else {
      priceAmount = this.convertTokensAmountToRawAmountIfNeeded(params.price, this.market.priceScalingFactor);
    }
    const maxCommission = params.maxCommission === void 0 ? DEFAULT_MAX_COMMISSION : this.convertTokensAmountToRawAmountIfNeeded(params.maxCommission, this.market.tokenYScalingFactor);
    const expires = getExpires();
    const value = params.nativeTokenToSend === void 0 ? 0n : this.convertTokensAmountToRawAmountIfNeeded(
      params.nativeTokenToSend,
      params.side === "ask" ? this.market.baseToken.decimals : this.market.quoteToken.decimals
    );
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.placeMarketOrderWithTargetValue(
        params.side === "ask",
        targetTokenYValue,
        priceAmount,
        maxCommission,
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        {
          value,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async placeMarketOrderWithTargetValueWithPermit(params) {
    if (params.side === "ask" && !this.market.baseToken.supportsPermit || params.side === "bid" && !this.market.quoteToken.supportsPermit) {
      throw Error("Token doesn't support permits");
    }
    const targetTokenYValue = this.convertTokensAmountToRawAmountIfNeeded(params.size, this.market.tokenYScalingFactor);
    let priceAmount;
    if (params.type === "market_execution") {
      priceAmount = params.side === "ask" ? DEFAULT_ASK_MARKET_PRICE : DEFAULT_BID_MARKET_PRICE;
    } else {
      priceAmount = this.convertTokensAmountToRawAmountIfNeeded(params.price, this.market.priceScalingFactor);
    }
    let quantityToPermit, amountToPermit;
    if (params.side === "ask") {
      amountToPermit = this.convertTokensAmountToRawAmountIfNeeded(
        params.permit,
        this.market.tokenXScalingFactor
      );
      quantityToPermit = amountToPermit * 10n ** BigInt(
        this.market.baseToken.decimals - this.market.tokenXScalingFactor
      );
    } else {
      amountToPermit = this.convertTokensAmountToRawAmountIfNeeded(
        params.permit,
        this.market.tokenYScalingFactor
      );
      quantityToPermit = amountToPermit * 10n ** BigInt(
        this.market.quoteToken.decimals - this.market.tokenYScalingFactor
      );
    }
    const maxCommission = params.maxCommission === void 0 ? DEFAULT_MAX_COMMISSION : this.convertTokensAmountToRawAmountIfNeeded(params.maxCommission, this.market.tokenYScalingFactor);
    const expires = getExpires();
    const { v, r, s } = await this.signPermit(params.side === "ask", quantityToPermit, expires);
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.placeMarketOrderWithTargetValue(
        params.side === "ask",
        targetTokenYValue,
        priceAmount,
        maxCommission,
        amountToPermit,
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        v,
        r,
        s,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async batchPlaceOrder(params) {
    const idsAsDirections = [];
    const sizeAmounts = [];
    const priceAmounts = [];
    const expires = getExpires();
    for (const orderParams of params.orderParams) {
      idsAsDirections.push(orderParams.side === "ask" ? 1n : 0n);
      sizeAmounts.push(this.convertTokensAmountToRawAmountIfNeeded(orderParams.size, this.market.tokenXScalingFactor));
      priceAmounts.push(this.convertTokensAmountToRawAmountIfNeeded(orderParams.price, this.market.priceScalingFactor));
    }
    const maxCommissionPerOrder = this.calculateMaxCommissionPerOrder(sizeAmounts, priceAmounts);
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.batchChangeOrder(
        idsAsDirections,
        sizeAmounts,
        priceAmounts,
        maxCommissionPerOrder,
        params.type === "limit_post_only",
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async claimOrder(params) {
    const expires = getExpires();
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.claimOrder(
        params.orderId,
        params.onlyClaim,
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async batchClaim(params) {
    const addresses = [];
    const orderIds = [];
    const expires = getExpires();
    for (const claimParams of params.claimParams) {
      addresses.push(claimParams.address);
      orderIds.push(claimParams.orderId);
    }
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.batchClaim(
        addresses,
        orderIds,
        params.onlyClaim,
        expires,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async changeOrder(params) {
    const sizeAmount = this.convertTokensAmountToRawAmountIfNeeded(params.newSize, this.market.tokenXScalingFactor);
    const priceAmount = this.convertTokensAmountToRawAmountIfNeeded(params.newPrice, this.market.priceScalingFactor);
    const maxCommission = this.convertTokensAmountToRawAmountIfNeeded(params.maxCommission, this.market.tokenYScalingFactor);
    const expires = getExpires();
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.changeOrder(
        params.orderId,
        sizeAmount,
        priceAmount,
        maxCommission,
        params.type === "limit_post_only",
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async batchChangeOrder(params) {
    const orderIds = [];
    const newSizes = [];
    const newPrices = [];
    const expires = getExpires();
    for (const orderParams of params.orderParams) {
      orderIds.push(orderParams.orderId);
      newSizes.push(this.convertTokensAmountToRawAmountIfNeeded(orderParams.newSize, this.market.tokenXScalingFactor));
      newPrices.push(this.convertTokensAmountToRawAmountIfNeeded(orderParams.newPrice, this.market.priceScalingFactor));
    }
    const maxCommissionPerOrder = this.calculateMaxCommissionPerOrder(newSizes, newPrices);
    const tx = await this.processContractMethodCall(
      this.marketContract,
      this.marketContract.batchChangeOrder(
        orderIds,
        newSizes,
        newPrices,
        maxCommissionPerOrder,
        params.type === "limit_post_only",
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        expires,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async wrapNativeToken(params) {
    let token;
    let tokenContract;
    if (!this.market.supportsNativeToken) {
      throw Error("Market doesn't support native token");
    }
    if (this.market.isNativeTokenX) {
      token = this.market.baseToken;
      tokenContract = this.baseTokenContract;
    } else {
      token = this.market.quoteToken;
      tokenContract = this.quoteTokenContract;
    }
    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.deposit(
        {
          value: amount,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async unwrapNativeToken(params) {
    let token;
    let tokenContract;
    if (!this.market.supportsNativeToken) {
      throw Error("Market doesn't support native token");
    }
    if (this.market.isNativeTokenX) {
      token = this.market.baseToken;
      tokenContract = this.baseTokenContract;
    } else {
      token = this.market.quoteToken;
      tokenContract = this.quoteTokenContract;
    }
    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.withdraw(
        amount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async processContractMethodCall(contract, methodCall) {
    try {
      const tx = await methodCall;
      if (this.autoWaitTransaction) {
        if (this.fastWaitTransaction) {
          const startingTime = Date.now();
          let receipt = await tx.provider.getTransactionReceipt(tx.hash);
          while (receipt == null) {
            if (this.fastWaitTransactionTimeout && Date.now() - startingTime >= this.fastWaitTransactionTimeout) {
              break;
            }
            await wait(this.fastWaitTransactionInterval);
            receipt = await tx.provider.getTransactionReceipt(tx.hash);
          }
        } else {
          await tx.wait();
        }
      }
      return tx;
    } catch (error) {
      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);
          throw new TransactionFailedError(error.data, decodedError, { cause: error });
        } catch (parseError) {
          console.error("Failed to parse contract error:", parseError);
          throw error;
        }
      }
      throw error;
    }
  }
  convertTokensAmountToRawAmountIfNeeded(amount, decimals) {
    return typeof amount === "bigint" ? amount : tokenUtils_exports.convertTokensAmountToRawAmount(amount, decimals);
  }
  calculateMaxCommission(sizeAmount, priceAmount) {
    return BigInt(
      (0, import_bignumber2.default)(sizeAmount.toString()).times((0, import_bignumber2.default)(priceAmount.toString())).times(35e-5).decimalPlaces(0, import_bignumber2.default.ROUND_CEIL).toString()
    );
  }
  calculateMaxCommissionPerOrder(sizeAmounts, priceAmounts) {
    let maxCommission = 0n;
    for (let i = 0; i < sizeAmounts.length; i++) {
      const commission = this.calculateMaxCommission(sizeAmounts[i] ?? 0n, priceAmounts[i] ?? 0n);
      if (commission > maxCommission) {
        maxCommission = commission;
      }
    }
    return maxCommission;
  }
  async signPermit(isBaseToken, quantityToPermit, deadline) {
    const tokenContract = isBaseToken ? this.baseTokenContract : this.quoteTokenContract;
    const owner = await this.signer.getAddress();
    const spender = this.market.orderbookAddress;
    const domain = {
      name: await tokenContract.name(),
      version: "1",
      chainId: await this.chainId,
      verifyingContract: await tokenContract.getAddress()
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };
    const nonce = await tokenContract.nonces(owner);
    const message = {
      owner,
      spender,
      value: quantityToPermit,
      nonce,
      deadline
    };
    const signature = await this.signer.signTypedData(domain, types, message);
    const splitSig = import_ethers2.Signature.from(signature);
    return {
      v: splitSig.v.toString(),
      r: splitSig.r,
      s: splitSig.s
    };
  }
};
__publicField(_OnchainLobSpotMarketContract, "defaultTransferExecutedTokensEnabled", true);
__publicField(_OnchainLobSpotMarketContract, "defaultAutoWaitTransaction", true);
__publicField(_OnchainLobSpotMarketContract, "defaultFastWaitTransaction", false);
__publicField(_OnchainLobSpotMarketContract, "defaultFastWaitTransactionInterval", 100);
var OnchainLobSpotMarketContract = _OnchainLobSpotMarketContract;

// src/spot/mappers.ts
var mappers_exports = {};
__export(mappers_exports, {
  mapFillDtoToFill: () => mapFillDtoToFill,
  mapFillUpdateDtoToFillUpdate: () => mapFillUpdateDtoToFillUpdate,
  mapMarketDtoToMarket: () => mapMarketDtoToMarket,
  mapMarketUpdateDtoToMarketUpdate: () => mapMarketUpdateDtoToMarketUpdate,
  mapOrderDtoToOrder: () => mapOrderDtoToOrder,
  mapOrderHistoryDtoToOrderHistory: () => mapOrderHistoryDtoToOrderHistory,
  mapOrderHistoryUpdateDtoToOrderHistoryUpdate: () => mapOrderHistoryUpdateDtoToOrderHistoryUpdate,
  mapOrderUpdateDtoToOrderUpdate: () => mapOrderUpdateDtoToOrderUpdate,
  mapOrderbookDtoToOrderbook: () => mapOrderbookDtoToOrderbook,
  mapOrderbookUpdateDtoToOrderbookUpdate: () => mapOrderbookUpdateDtoToOrderbookUpdate,
  mapTokenDtoToToken: () => mapTokenDtoToToken,
  mapTradeDtoToTrade: () => mapTradeDtoToTrade,
  mapTradeUpdateDtoToTradeUpdate: () => mapTradeUpdateDtoToTradeUpdate
});
var import_bignumber3 = __toESM(require("bignumber.js"));
var mapTokenDtoToToken = (dto) => {
  return dto;
};
var mapMarketDtoToMarket = (dto, priceFactor, sizeFactor) => {
  return {
    ...dto,
    rawLastPrice: dto.lastPrice ? BigInt(dto.lastPrice) : null,
    lastPrice: dto.lastPrice ? tokenUtils_exports.convertTokensRawAmountToAmount(dto.lastPrice, priceFactor) : null,
    rawLowPrice24h: dto.lowPrice24h ? BigInt(dto.lowPrice24h) : null,
    lowPrice24h: dto.lowPrice24h ? tokenUtils_exports.convertTokensRawAmountToAmount(dto.lowPrice24h, priceFactor) : null,
    rawHighPrice24h: dto.highPrice24h ? BigInt(dto.highPrice24h) : null,
    highPrice24h: dto.highPrice24h ? tokenUtils_exports.convertTokensRawAmountToAmount(dto.highPrice24h, priceFactor) : null,
    rawPrice24h: dto.price24h ? BigInt(dto.price24h) : null,
    price24h: dto.price24h ? tokenUtils_exports.convertTokensRawAmountToAmount(dto.price24h, priceFactor) : null,
    rawBestAsk: dto.bestAsk ? BigInt(dto.bestAsk) : null,
    bestAsk: dto.bestAsk ? tokenUtils_exports.convertTokensRawAmountToAmount(dto.bestAsk, priceFactor) : null,
    rawBestBid: dto.bestBid ? BigInt(dto.bestBid) : null,
    bestBid: dto.bestBid ? tokenUtils_exports.convertTokensRawAmountToAmount(dto.bestBid, priceFactor) : null,
    rawTradingVolume24h: dto.tradingVolume24h ? BigInt(dto.tradingVolume24h) : null,
    tradingVolume24h: dto.tradingVolume24h ? tokenUtils_exports.convertTokensRawAmountToAmount(dto.tradingVolume24h, sizeFactor) : null,
    totalSupply: dto.totalSupply ? (0, import_bignumber3.default)(dto.totalSupply) : null,
    lastTouched: dto.lastTouched,
    aggressiveFee: Number(dto.aggressiveFee),
    passiveFee: Number(dto.passiveFee),
    passiveOrderPayout: Number(dto.passiveOrderPayout)
  };
};
var mapOrderbookLevelDtoToOrderbookLevel = (dto, priceFactor, sizeFactor) => {
  const price = (0, import_bignumber3.default)(dto.price);
  const size = (0, import_bignumber3.default)(dto.size);
  return {
    rawPrice: tokenUtils_exports.convertTokensAmountToRawAmount(price, priceFactor),
    price,
    rawSize: tokenUtils_exports.convertTokensAmountToRawAmount(size, sizeFactor),
    size
  };
};
var mapOrderbookDtoToOrderbook = (dto, priceFactor, sizeFactor) => {
  const asks = dto.levels.asks.map((ask) => mapOrderbookLevelDtoToOrderbookLevel(ask, priceFactor, sizeFactor));
  const bids = dto.levels.bids.map((bid) => mapOrderbookLevelDtoToOrderbookLevel(bid, priceFactor, sizeFactor));
  return {
    ...dto,
    levels: {
      asks,
      bids
    }
  };
};
var mapTradeDtoToTrade = (dto, priceFactor, sizeFactor) => {
  return {
    ...dto,
    rawPrice: BigInt(dto.price),
    price: tokenUtils_exports.convertTokensRawAmountToAmount(dto.price, priceFactor),
    rawSize: BigInt(dto.size),
    size: tokenUtils_exports.convertTokensRawAmountToAmount(dto.size, sizeFactor)
  };
};
var mapOrderDtoToOrder = (dto, priceFactor, sizeFactor) => {
  return {
    ...dto,
    lastTouched: dto.lastTouched,
    rawPrice: BigInt(dto.price),
    price: tokenUtils_exports.convertTokensRawAmountToAmount(dto.price, priceFactor),
    rawSize: BigInt(dto.size),
    size: tokenUtils_exports.convertTokensRawAmountToAmount(dto.size, sizeFactor),
    rawOrigSize: BigInt(dto.origSize),
    origSize: tokenUtils_exports.convertTokensRawAmountToAmount(dto.origSize, sizeFactor),
    rawClaimed: BigInt(dto.claimed),
    claimed: tokenUtils_exports.convertTokensRawAmountToAmount(dto.claimed, sizeFactor)
  };
};
var mapOrderHistoryDtoToOrderHistory = (dto, priceFactor, tokenXFactor, tokenYFactor) => {
  return {
    ...dto,
    rawPrice: BigInt(dto.price),
    price: tokenUtils_exports.convertTokensRawAmountToAmount(dto.price, priceFactor),
    rawSize: BigInt(dto.size),
    size: tokenUtils_exports.convertTokensRawAmountToAmount(dto.size, tokenXFactor),
    rawOrigSize: BigInt(dto.origSize),
    origSize: tokenUtils_exports.convertTokensRawAmountToAmount(dto.origSize, tokenXFactor),
    rawClaimed: BigInt(dto.claimed),
    claimed: tokenUtils_exports.convertTokensRawAmountToAmount(dto.claimed, tokenXFactor),
    rawFee: BigInt(dto.fee),
    fee: tokenUtils_exports.convertTokensRawAmountToAmount(dto.fee, tokenYFactor)
  };
};
var mapFillDtoToFill = (dto, priceFactor, tokenXFactor, tokenYFactor) => {
  return {
    ...dto,
    rawPrice: BigInt(dto.price),
    price: tokenUtils_exports.convertTokensRawAmountToAmount(dto.price, priceFactor),
    rawSize: BigInt(dto.size),
    size: tokenUtils_exports.convertTokensRawAmountToAmount(dto.size, tokenXFactor),
    rawFee: BigInt(dto.fee),
    fee: tokenUtils_exports.convertTokensRawAmountToAmount(dto.fee, tokenYFactor)
  };
};
var mapMarketUpdateDtoToMarketUpdate = (_marketId, dto, priceFactor, sizeFactor) => mapMarketDtoToMarket(dto, priceFactor, sizeFactor);
var mapOrderbookUpdateDtoToOrderbookUpdate = (_marketId, dto, priceFactor, sizeFactor) => mapOrderbookDtoToOrderbook(dto, priceFactor, sizeFactor);
var mapTradeUpdateDtoToTradeUpdate = (_marketId, dto, priceFactor, sizeFactor) => mapTradeDtoToTrade(dto, priceFactor, sizeFactor);
var mapOrderUpdateDtoToOrderUpdate = (_marketId, dto, priceFactor, sizeFactor) => mapOrderDtoToOrder(dto, priceFactor, sizeFactor);
var mapOrderHistoryUpdateDtoToOrderHistoryUpdate = (_marketId, dto, priceFactor, tokenXFactor, tokenYFactor) => mapOrderHistoryDtoToOrderHistory(dto, priceFactor, tokenXFactor, tokenYFactor);
var mapFillUpdateDtoToFillUpdate = (_marketId, dto, priceFactor, tokenXFactor, tokenYFactor) => mapFillDtoToFill(dto, priceFactor, tokenXFactor, tokenYFactor);

// src/logging/logMessages.ts
var getErrorLogMessage = (error) => {
  if (!error)
    return `[error is ${error === null ? "null" : "undefined"}]`;
  if (typeof error === "string")
    return error;
  else if (typeof error?.message === "string")
    return error.message;
  return "[unknown error type]";
};

// src/services/remoteService.ts
var RemoteServiceResponseError = class _RemoteServiceResponseError extends OnchainLobError {
  constructor(status, content) {
    super(_RemoteServiceResponseError.getMessage(status, content));
  }
  static getMessage(status, content) {
    return `Response Error [Code: ${status}]. Content = ${content}`;
  }
};
var RemoteService = class {
  constructor(baseUrl) {
    __publicField(this, "baseUrl");
    this.baseUrl = textUtils_exports.trimSlashes(baseUrl);
  }
  getUrl(uri) {
    return new URL(this.baseUrl + "/" + textUtils_exports.trimSlashes(uri));
  }
  async getRequestInit(requestInit = {}) {
    const headers = new Headers(requestInit.headers);
    if (!headers.has("Accept"))
      headers.append("Accept", "application/json");
    if (!headers.has("Content-Type"))
      headers.append("Content-Type", "application/json");
    requestInit.headers = headers;
    return requestInit;
  }
  async fetch(uriOrUrl, responseFormat, requestInit, useDefaultRequestInitFields = true) {
    if (useDefaultRequestInitFields)
      requestInit = await this.getRequestInit(requestInit);
    const url = typeof uriOrUrl === "string" ? this.getUrl(uriOrUrl) : uriOrUrl;
    const response = await fetch(url.href, requestInit);
    await this.ensureResponseOk(response);
    return responseFormat === "none" ? void 0 : await (responseFormat === "json" ? response.json() : response.text());
  }
  async ensureResponseOk(response) {
    if (response.ok)
      return;
    let content;
    try {
      content = await response.text();
    } catch {
      content = "[unavailable]";
    }
    throw new RemoteServiceResponseError(response.status, content);
  }
};

// src/services/constants.ts
var ALL_MARKETS_ID = "allMarkets";

// src/services/onchainLobSpotService/onchainLobSpotService.ts
var OnchainLobSpotService = class extends RemoteService {
  /**
   * Retrieves the orderbook for a given market.
   * @param params - The parameters for the orderbook request.
   * @returns The orderbook data.
   */
  async getOrderbook(params) {
    const queryParams = new URLSearchParams({
      market: params.market
    });
    if (params.limit)
      queryParams.append("limit", params.limit.toString());
    if (params.aggregation)
      queryParams.append("aggregation", params.aggregation.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/orderbook?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the orders for a given market.
   * @param params - The parameters for the orders request.
   * @returns The orders data.
   */
  async getOrders(params) {
    const queryParams = new URLSearchParams({
      market: params.market,
      user: params.user
    });
    if (params.limit)
      queryParams.append("limit", params.limit.toString());
    if (params.status) {
      if (guards_exports.isArray(params.status))
        params.status.forEach((status) => queryParams.append("status", status.toString()));
      else
        queryParams.append("status", params.status.toString());
    }
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/orders?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the order history for a given market.
   * @param params - The parameters for the order history request.
   * @returns The order history data.
   */
  async getOrderHistory(params) {
    const queryParams = new URLSearchParams({
      market: params.market,
      user: params.user
    });
    if (params.limit)
      queryParams.append("limit", params.limit.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/order-history?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the trades for a given market.
   * @param params - The parameters for the trades request.
   * @returns The trades data.
   */
  async getTrades(params) {
    const queryParams = new URLSearchParams({
      market: params.market
    });
    if (params.limit)
      queryParams.append("limit", params.limit.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/trades?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the fills for a given market.
   * @param params - The parameters for the fills request.
   * @returns The fills data.
   */
  async getFills(params) {
    const queryParams = new URLSearchParams({
      market: params.market,
      user: params.user
    });
    if (params.limit)
      queryParams.append("limit", params.limit.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/fills?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the tokens for a given market.
   * @param params - The parameters for the tokens request.
   * @returns The tokens data.
   */
  async getTokens(params) {
    const queryParams = new URLSearchParams();
    if (params.token)
      queryParams.append("token", params.token);
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/tokens?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the markets for a given market.
   * @param params - The parameters for the markets request.
   * @returns The markets data.
   */
  async getMarkets(params) {
    const queryParams = new URLSearchParams();
    if (params.market && params.market !== ALL_MARKETS_ID)
      queryParams.append("market", params.market);
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/markets?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the candle data for a given market.
   * @param params - The parameters for the candles request.
   * @returns The candle data.
   */
  async getCandles(params) {
    const queryParams = new URLSearchParams();
    queryParams.append("market", params.market);
    queryParams.append("resolution", params.resolution);
    if (params.fromTime)
      queryParams.append("fromTime", params.fromTime.toString());
    if (params.toTime)
      queryParams.append("toTime", params.toTime.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/candles?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Calculates the market order details for a given token inputs.
   * @param params - The parameters for the market details calculation.
   * @returns The market order details data.
   */
  async calculateMarketDetails(params) {
    const queryParams = new URLSearchParams();
    queryParams.append("market", params.market);
    queryParams.append("direction", params.direction);
    queryParams.append("tokenInput", params.inputToken);
    if (params.inputs.tokenXInput)
      queryParams.append("tokenXInput", params.inputs.tokenXInput);
    if (params.inputs.tokenYInput)
      queryParams.append("tokenYInput", params.inputs.tokenYInput);
    queryParams.append("slippage", params.inputs.slippage.toString());
    if (params.inputs.useAutoSlippage)
      queryParams.append("useAutoSlippage", params.inputs.useAutoSlippage.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`calculate/market-details?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Calculates the limit order details for a given token inputs.
   * @param params - The parameters for the limit details calculation.
   * @returns The limit order details data.
   */
  async calculateLimitDetails(params) {
    const queryParams = new URLSearchParams();
    queryParams.append("market", params.market);
    queryParams.append("direction", params.direction);
    queryParams.append("tokenInput", params.inputToken);
    if (params.inputs.tokenXInput)
      queryParams.append("tokenXInput", params.inputs.tokenXInput);
    if (params.inputs.tokenYInput)
      queryParams.append("tokenYInput", params.inputs.tokenYInput);
    queryParams.append("postOnly", params.inputs.postOnly.toString());
    queryParams.append("priceInput", params.inputs.priceInput);
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`calculate/limit-details?${queryParamsString}`, "json");
    return response;
  }
  async getUserBalances(params) {
    const queryParams = new URLSearchParams();
    queryParams.append("user", params.user);
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`user-balances?${queryParamsString}`, "json");
    return response;
  }
  async getUserDeposits(params) {
    const queryParams = new URLSearchParams();
    queryParams.append("user", params.user);
    if (params.market) queryParams.append("market", params.market);
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`user-deposits?${queryParamsString}`, "json");
    return response;
  }
};

// src/services/onchainLobSpotWebSocketService/onchainLobSpotWebSocketService.ts
var ALL_MARKETS_CHANNEL = "allMarkets";
var OnchainLobSpotWebSocketService = class {
  /**
   * Creates an instance of OnchainLobSpotWebSocketService.
   * @param baseUrl - The base URL for the WebSocket connection.
   * @param startImmediately - Whether to start the WebSocket client immediately.
   */
  constructor(baseUrl, startImmediately = true) {
    this.baseUrl = baseUrl;
    /**
     * Event emitters for various WebSocket events.
     */
    __publicField(this, "events", {
      subscriptionError: new EventEmitter(),
      allMarketsUpdated: new EventEmitter(),
      marketUpdated: new EventEmitter(),
      orderbookUpdated: new EventEmitter(),
      tradesUpdated: new EventEmitter(),
      userOrdersUpdated: new EventEmitter(),
      userOrderHistoryUpdated: new EventEmitter(),
      userFillsUpdated: new EventEmitter(),
      candlesUpdated: new EventEmitter()
    });
    /**
     * The WebSocket client used to communicate with the Onchain LOB spot market.
     */
    __publicField(this, "onchainLobWebSocketClient");
    /**
     * Handles incoming WebSocket messages and emits the appropriate events.
     * @param message - The WebSocket message received.
     */
    __publicField(this, "onSocketMessageReceived", (message) => {
      try {
        if (!message.data)
          return;
        switch (message.channel) {
          case ALL_MARKETS_CHANNEL:
            this.events.allMarketsUpdated.emit(message.isSnapshot, message.data);
            break;
          case "market":
            this.events.marketUpdated.emit(message.id, message.isSnapshot, message.data);
            break;
          case "orderbook":
            this.events.orderbookUpdated.emit(message.id, message.isSnapshot, message.data);
            break;
          case "trades":
            this.events.tradesUpdated.emit(message.id, message.isSnapshot, message.data);
            break;
          case "userOrders":
            this.events.userOrdersUpdated.emit(message.id, message.isSnapshot, message.data);
            break;
          case "userOrderHistory":
            this.events.userOrderHistoryUpdated.emit(message.id, message.isSnapshot, message.data);
            break;
          case "userFills":
            this.events.userFillsUpdated.emit(message.id, message.isSnapshot, message.data);
            break;
          case "candles":
            this.events.candlesUpdated.emit(message.id, message.isSnapshot, message.data);
            break;
          case "error":
            this.events.subscriptionError.emit(message.data);
            break;
          case "subscriptionResponse":
            break;
          default:
            console.warn("Unknown channel in the socket message handler.", message.channel);
        }
      } catch (error) {
        console.error("Unknown error in the socket message handler.", getErrorLogMessage(error));
      }
    });
    this.onchainLobWebSocketClient = new OnchainLobWebSocketClient(baseUrl);
    this.onchainLobWebSocketClient.events.messageReceived.addListener(this.onSocketMessageReceived);
    if (startImmediately)
      this.startOnchainLobWebSocketClientIfNeeded();
  }
  /**
   * Subscribes to market updates for a given market.
   * @param params - The parameters for the market subscription.
   */
  subscribeToMarket(params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "market",
      market: params.market
    });
  }
  /**
   * Unsubscribes from market updates for a given market.
   * @param params - The parameters for the market unsubscription.
   */
  unsubscribeFromMarket(params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "market",
      market: params.market
    });
  }
  /**
   * Subscribes to all markets.
   */
  subscribeToAllMarkets() {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: ALL_MARKETS_CHANNEL
    });
  }
  /**
   * Unsubscribes from all markets.
   */
  unsubscribeFromAllMarkets() {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: ALL_MARKETS_CHANNEL
    });
  }
  /**
   * Subscribes to orderbook updates for a given market.
   * @param params - The parameters for the orderbook subscription.
   */
  subscribeToOrderbook(params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "orderbook",
      market: params.market,
      aggregation: params.aggregation
    });
  }
  /**
   * Unsubscribes from orderbook updates for a given market.
   * @param params - The parameters for the orderbook unsubscription.
   */
  unsubscribeFromOrderbook(params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "orderbook",
      market: params.market,
      aggregation: params.aggregation
    });
  }
  /**
   * Subscribes to trade updates for a given market.
   * @param params - The parameters for the trade subscription.
   */
  subscribeToTrades(params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "trades",
      market: params.market
    });
  }
  /**
   * Unsubscribes from trade updates for a given market.
   * @param params - The parameters for the trade unsubscription.
   */
  unsubscribeFromTrades(params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "trades",
      market: params.market
    });
  }
  /**
   * Subscribes to user order updates for a given market and user.
   * @param params - The parameters for the user order subscription.
   */
  subscribeToUserOrders(params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "userOrders",
      user: params.user,
      market: params.market || ALL_MARKETS_ID
    });
  }
  /**
   * Unsubscribes from user order updates for a given market and user.
   * @param params - The parameters for the user order unsubscription.
   */
  unsubscribeFromUserOrders(params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "userOrders",
      user: params.user,
      market: params.market || ALL_MARKETS_ID
    });
  }
  /**
   * Subscribes to user order history updates for a given market and user.
   * @param params - The parameters for the user order history subscription.
   */
  subscribeToUserOrderHistory(params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "userOrderHistory",
      user: params.user,
      market: params.market || ALL_MARKETS_ID
    });
  }
  /**
   * Unsubscribes from user order history updates for a given market and user.
   * @param params - The parameters for the user order history unsubscription.
   */
  unsubscribeFromUserOrderHistory(params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "userOrderHistory",
      user: params.user,
      market: params.market || ALL_MARKETS_ID
    });
  }
  /**
   * Subscribes to user fill updates for a given market and user.
   * @param params - The parameters for the user fill subscription.
   */
  subscribeToUserFills(params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "userFills",
      user: params.user,
      market: params.market || ALL_MARKETS_ID
    });
  }
  /**
   * Unsubscribes from user fill updates for a given market and user.
   * @param params - The parameters for the user fill unsubscription.
   */
  unsubscribeFromUserFills(params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "userFills",
      user: params.user,
      market: params.market || ALL_MARKETS_ID
    });
  }
  /**
   * Subscribes to candle updates for a given market and resolution.
   * @param params - The parameters for the candle subscription.
   */
  subscribeToCandles(params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "candles",
      resolution: params.resolution,
      market: params.market
    });
  }
  /**
   * Unsubscribes from candle updates for a given market and resolution.
   * @param params - The parameters for the candle unsubscription.
   */
  unsubscribeFromCandles(params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "candles",
      resolution: params.resolution,
      market: params.market
    });
  }
  /**
   * Disposes the WebSocket client and removes the message listener.
   */
  [Symbol.dispose]() {
    this.onchainLobWebSocketClient.events.messageReceived.removeListener(this.onSocketMessageReceived);
    this.onchainLobWebSocketClient.stop();
  }
  /**
   * Starts the WebSocket client if it is not already started.
   */
  startOnchainLobWebSocketClientIfNeeded() {
    this.onchainLobWebSocketClient.start().catch((error) => console.error(`Onchain LOB Web Socket has not been started. Error = ${getErrorLogMessage(error)}`));
  }
};

// src/spot/limitDetails.ts
var import_bignumber4 = __toESM(require("bignumber.js"));
var import_lodash = require("lodash");
var defaultBuyLimitDetails = {
  maxFee: 0,
  price: 0,
  tokenXReceive: 0,
  maxTokenYPay: 0,
  minTokenYPay: 0
};
var defaultSellLimitDetails = {
  maxFee: 0,
  price: 0,
  tokenXPay: 0,
  maxTokenYReceive: 0,
  minTokenYReceive: 0
};
var getLimitDetails = ({ market, direction, inputToken, inputs }) => {
  const { tokenXInput, tokenYInput, priceInput } = inputs;
  const details = { buy: defaultBuyLimitDetails, sell: defaultSellLimitDetails };
  if (!Number(priceInput) || !Number(inputToken === "base" ? tokenXInput : tokenYInput)) {
    return details;
  }
  const maxFeeRate = (0, import_lodash.max)([
    market.aggressiveFee + market.passiveOrderPayout,
    market.passiveFee
  ]) || 0;
  if (direction === "buy") {
    if (inputToken === "base") {
      details.buy = calculateBuyLimitDetailsTokenXInput(
        Number(priceInput),
        Number(tokenXInput),
        market.priceScalingFactor,
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        maxFeeRate
      );
    } else {
      details.buy = calculateBuyLimitDetailsTokenYInput(
        Number(priceInput),
        Number(tokenYInput),
        market.priceScalingFactor,
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        maxFeeRate
      );
    }
  } else {
    if (inputToken === "base") {
      details.sell = calculateSellLimitDetailsTokenXInput(
        Number(priceInput),
        Number(tokenXInput),
        market.priceScalingFactor,
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        maxFeeRate
      );
    } else {
      details.sell = calculateSellLimitDetailsTokenYInput(
        Number(priceInput),
        Number(tokenYInput),
        market.priceScalingFactor,
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        maxFeeRate
      );
    }
  }
  return details;
};
var calculateBuyLimitDetailsTokenXInput = (priceInput, tokenXInput, priceScalingFactor, tokenXScalingFactor, tokenYScalingFactor, maxFeeRate) => {
  const price = new import_bignumber4.default(priceInput).dp(priceScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const tokenXReceive = new import_bignumber4.default(tokenXInput).dp(tokenXScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const minTokenYPay = price.times(tokenXReceive).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_CEIL);
  const maxFee = minTokenYPay.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, import_bignumber4.default.ROUND_CEIL);
  const maxTokenYPay = minTokenYPay.plus(maxFee).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_CEIL);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXReceive: tokenXReceive.toNumber(),
    maxTokenYPay: maxTokenYPay.toNumber(),
    minTokenYPay: minTokenYPay.toNumber()
  };
};
var calculateBuyLimitDetailsTokenYInput = (priceInput, tokenYInput, priceScalingFactor, tokenXScalingFactor, tokenYScalingFactor, maxFeeRate) => {
  const price = new import_bignumber4.default(priceInput).dp(priceScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const maxTokenYPay = new import_bignumber4.default(tokenYInput).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_FLOOR);
  const minTokenYPay = maxTokenYPay.div(new import_bignumber4.default(1).plus(maxFeeRate)).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_CEIL);
  const tokenXReceive = minTokenYPay.div(price).dp(tokenXScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const maxFee = minTokenYPay.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, import_bignumber4.default.ROUND_CEIL);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXReceive: tokenXReceive.toNumber(),
    maxTokenYPay: maxTokenYPay.toNumber(),
    minTokenYPay: minTokenYPay.toNumber()
  };
};
var calculateSellLimitDetailsTokenXInput = (priceInput, tokenXInput, priceScalingFactor, tokenXScalingFactor, tokenYScalingFactor, maxFeeRate) => {
  const price = new import_bignumber4.default(priceInput).dp(priceScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const tokenXPay = new import_bignumber4.default(tokenXInput).dp(tokenXScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const maxTokenYReceive = price.times(tokenXPay).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_FLOOR);
  const maxFee = maxTokenYReceive.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, import_bignumber4.default.ROUND_CEIL);
  const minTokenYReceive = maxTokenYReceive.minus(maxFee).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_FLOOR);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXPay: tokenXPay.toNumber(),
    maxTokenYReceive: maxTokenYReceive.toNumber(),
    minTokenYReceive: minTokenYReceive.toNumber()
  };
};
var calculateSellLimitDetailsTokenYInput = (priceInput, tokenYInput, priceScalingFactor, tokenXScalingFactor, tokenYScalingFactor, maxFeeRate) => {
  const price = new import_bignumber4.default(priceInput).dp(priceScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const minTokenYReceive = new import_bignumber4.default(tokenYInput).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_DOWN);
  const maxTokenYReceive = minTokenYReceive.div(new import_bignumber4.default(1).minus(maxFeeRate)).dp(tokenYScalingFactor, import_bignumber4.default.ROUND_FLOOR);
  const tokenXPay = maxTokenYReceive.div(price).dp(tokenXScalingFactor, import_bignumber4.default.ROUND_UP);
  const maxFee = maxTokenYReceive.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, import_bignumber4.default.ROUND_CEIL);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXPay: tokenXPay.toNumber(),
    maxTokenYReceive: maxTokenYReceive.toNumber(),
    minTokenYReceive: minTokenYReceive.toNumber()
  };
};

// src/spot/marketDetails.ts
var import_bignumber5 = __toESM(require("bignumber.js"));
var import_lodash2 = require("lodash");
var defaultBuyMarketDetails = {
  fee: 0,
  estFee: 0,
  worstPrice: 0,
  estPrice: 0,
  estWorstPrice: 0,
  estSlippage: 0,
  autoSlippage: 0,
  tokenXReceive: 0,
  estTokenXReceive: 0,
  tokenYPay: 0,
  estTokenYPay: 0
};
var defaultSellMarketDetails = {
  fee: 0,
  estFee: 0,
  worstPrice: 0,
  estPrice: 0,
  estWorstPrice: 0,
  estSlippage: 0,
  autoSlippage: 0,
  tokenXPay: 0,
  estTokenXPay: 0,
  tokenYReceive: 0,
  estTokenYReceive: 0
};
var AUTO_SLIPPAGE_INCREASE_PERCENT = 10;
var AUTO_SLIPPAGE_DECIMAL = 1;
var AUTO_SLIPPAGE_MAX_PERCENT = 5;
var getMarketDetails = ({ market, orderbook, inputToken, inputs, direction }) => {
  const { tokenXInput, tokenYInput, slippage, useAutoSlippage = false } = inputs;
  const details = { buy: defaultBuyMarketDetails, sell: defaultSellMarketDetails };
  if (!market.bestAsk || !market.bestBid) {
    return details;
  }
  if (!Number(inputToken === "base" ? tokenXInput : tokenYInput)) {
    return details;
  }
  const feeRate = market.aggressiveFee + market.passiveOrderPayout;
  if (direction === "buy") {
    if (inputToken === "base") {
      details.buy = calculateBuyMarketDetailsTokenXInput(
        Number(tokenXInput),
        slippage,
        market.bestAsk.toNumber(),
        orderbook.asks.sort((a, b) => Number(a.rawPrice - b.rawPrice)),
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        market.priceScalingFactor,
        feeRate,
        useAutoSlippage
      );
    } else {
      details.buy = calculateBuyMarketDetailsTokenYInput(
        Number(tokenYInput),
        slippage,
        market.bestAsk.toNumber(),
        orderbook.asks.sort((a, b) => Number(a.rawPrice - b.rawPrice)),
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        market.priceScalingFactor,
        feeRate,
        useAutoSlippage
      );
    }
  } else {
    if (inputToken === "base") {
      details.sell = calculateSellMarketDetailsTokenXInput(
        Number(tokenXInput),
        slippage,
        market.bestBid.toNumber(),
        orderbook.bids.sort((a, b) => Number(b.rawPrice - a.rawPrice)),
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        market.priceScalingFactor,
        feeRate,
        useAutoSlippage
      );
    } else {
      details.sell = calculateSellMarketDetailsTokenYInput(
        Number(tokenYInput),
        slippage,
        market.bestBid.toNumber(),
        orderbook.bids.sort((a, b) => Number(b.rawPrice - a.rawPrice)),
        market.tokenXScalingFactor,
        market.tokenYScalingFactor,
        market.priceScalingFactor,
        feeRate,
        useAutoSlippage
      );
    }
  }
  return details;
};
var calculateBuyMarketDetailsTokenXInput = (tokenXInput, maxSlippage, bestAsk, orderbookSide, tokenXScalingFactor, tokenYScalingFactor, priceScalingFactor, feeRate, useAutoSlippage) => {
  let autoSlippage = 0;
  let slippage = maxSlippage;
  const tokenXReceive = new import_bignumber5.default(tokenXInput).dp(tokenXScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const { estPrice, estTokenYAmount, estWorstPrice, estSlippage } = calculateEstValuesFromTokenX(
    tokenXReceive.toNumber(),
    orderbookSide,
    bestAsk
  );
  if (useAutoSlippage) {
    autoSlippage = calculateAutoSlippage(estSlippage);
    slippage = autoSlippage;
  }
  const worstPrice = new import_bignumber5.default(bestAsk).times(new import_bignumber5.default(1).plus(new import_bignumber5.default(slippage).div(100))).dp(priceScalingFactor, import_bignumber5.default.ROUND_CEIL);
  const tokenYPayWithoutFee = tokenXReceive.times(worstPrice).dp(tokenYScalingFactor, import_bignumber5.default.ROUND_CEIL);
  const [tokenYPay, fee] = calculateValueWithFee(
    tokenYPayWithoutFee,
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  const [estTokenYPay, estFee] = calculateValueWithFee(
    new import_bignumber5.default(estTokenYAmount),
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  return {
    fee: fee.toNumber(),
    estFee: estFee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: (0, import_lodash2.ceil)(estPrice, priceScalingFactor),
    estWorstPrice: (0, import_lodash2.ceil)(estWorstPrice, priceScalingFactor),
    estSlippage,
    autoSlippage,
    tokenXReceive: tokenXReceive.toNumber(),
    estTokenXReceive: tokenXReceive.toNumber(),
    tokenYPay: tokenYPay.toNumber(),
    estTokenYPay: estTokenYPay.toNumber()
  };
};
var calculateBuyMarketDetailsTokenYInput = (tokenYInput, maxSlippage, bestAsk, orderbookSide, tokenXScalingFactor, tokenYScalingFactor, priceScalingFactor, feeRate, useAutoSlippage) => {
  let autoSlippage = 0;
  let slippage = maxSlippage;
  const tokenYPay = new import_bignumber5.default(tokenYInput).dp(tokenYScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const [tokenYWithoutFee, fee] = calculateValueAfterFee(
    tokenYPay,
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  const { estPrice, estSlippage, estTokenXAmount, estWorstPrice } = calculateEstValuesFromTokenY(
    tokenYWithoutFee.toNumber(),
    orderbookSide,
    bestAsk
  );
  if (useAutoSlippage) {
    autoSlippage = calculateAutoSlippage(estSlippage);
    slippage = autoSlippage;
  }
  const worstPrice = new import_bignumber5.default(bestAsk).times(new import_bignumber5.default(1).plus(new import_bignumber5.default(slippage).div(100))).dp(priceScalingFactor, import_bignumber5.default.ROUND_CEIL);
  const tokenXReceive = tokenYWithoutFee.div(worstPrice).dp(tokenXScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const estTokenXReceive = new import_bignumber5.default(estTokenXAmount).dp(tokenXScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  return {
    fee: fee.toNumber(),
    estFee: fee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: (0, import_lodash2.ceil)(estPrice, priceScalingFactor),
    estWorstPrice: (0, import_lodash2.ceil)(estWorstPrice, priceScalingFactor),
    estSlippage,
    autoSlippage,
    tokenXReceive: tokenXReceive.toNumber(),
    estTokenXReceive: estTokenXReceive.toNumber(),
    tokenYPay: tokenYPay.toNumber(),
    estTokenYPay: tokenYPay.toNumber()
  };
};
var calculateSellMarketDetailsTokenXInput = (tokenXInput, maxSlippage, bestBid, orderbookSide, tokenXScalingFactor, tokenYScalingFactor, priceScalingFactor, feeRate, useAutoSlippage) => {
  let autoSlippage = 0;
  let slippage = maxSlippage;
  const tokenXPay = new import_bignumber5.default(tokenXInput).dp(tokenXScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const { estPrice, estSlippage, estTokenYAmount, estWorstPrice } = calculateEstValuesFromTokenX(
    tokenXPay.toNumber(),
    orderbookSide,
    bestBid
  );
  if (useAutoSlippage) {
    autoSlippage = calculateAutoSlippage(estSlippage);
    slippage = autoSlippage;
  }
  const worstPrice = new import_bignumber5.default(bestBid).times(new import_bignumber5.default(1).minus(new import_bignumber5.default(slippage).div(100))).dp(priceScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const tokenYReceive = tokenXPay.times(worstPrice).dp(tokenYScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const [tokenYReceiveWithoutFee, fee] = calculateValueAfterFee(
    tokenYReceive,
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  const [estTokenYReceiveWithoutFee, estFee] = calculateValueAfterFee(
    new import_bignumber5.default(estTokenYAmount),
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  return {
    fee: fee.toNumber(),
    estFee: estFee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: (0, import_lodash2.floor)(estPrice, priceScalingFactor),
    estWorstPrice: (0, import_lodash2.floor)(estWorstPrice, priceScalingFactor),
    estSlippage,
    autoSlippage,
    tokenXPay: tokenXPay.toNumber(),
    estTokenXPay: tokenXPay.toNumber(),
    tokenYReceive: tokenYReceiveWithoutFee.toNumber(),
    estTokenYReceive: estTokenYReceiveWithoutFee.toNumber()
  };
};
var calculateSellMarketDetailsTokenYInput = (tokenYInput, maxSlippage, bestBid, orderbookSide, tokenXScalingFactor, tokenYScalingFactor, priceScalingFactor, feeRate, useAutoSlippage) => {
  let autoSlippage = 0;
  let slippage = maxSlippage;
  const tokenYReceive = new import_bignumber5.default(tokenYInput).dp(tokenYScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const [tokenYReceiveBeforeFee, fee] = calculateValueBeforeFee(
    tokenYReceive,
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  const { estPrice, estTokenXAmount, estSlippage, estWorstPrice } = calculateEstValuesFromTokenY(
    tokenYReceiveBeforeFee.toNumber(),
    orderbookSide,
    bestBid
  );
  if (useAutoSlippage) {
    autoSlippage = calculateAutoSlippage(estSlippage);
    slippage = autoSlippage;
  }
  const worstPrice = new import_bignumber5.default(bestBid).times(new import_bignumber5.default(1).minus(new import_bignumber5.default(slippage).div(100))).dp(priceScalingFactor, import_bignumber5.default.ROUND_FLOOR);
  const tokenXPay = tokenYReceiveBeforeFee.div(worstPrice).dp(tokenXScalingFactor, import_bignumber5.default.ROUND_CEIL);
  const estTokenXPay = new import_bignumber5.default(estTokenXAmount).dp(tokenXScalingFactor, import_bignumber5.default.ROUND_CEIL);
  return {
    fee: fee.toNumber(),
    estFee: fee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: (0, import_lodash2.floor)(estPrice, priceScalingFactor),
    estWorstPrice: (0, import_lodash2.floor)(estWorstPrice, priceScalingFactor),
    estSlippage,
    autoSlippage,
    tokenXPay: tokenXPay.toNumber(),
    estTokenXPay: estTokenXPay.toNumber(),
    tokenYReceive: tokenYReceive.toNumber(),
    estTokenYReceive: tokenYReceive.toNumber()
  };
};
var calculateEstValuesFromTokenX = (tokenX, orderbookSide, initialPrice) => {
  let totalCost = new import_bignumber5.default(0);
  let tokenXLeft = new import_bignumber5.default(tokenX);
  let estWorstPrice = new import_bignumber5.default(0);
  for (const level of orderbookSide) {
    const price = new import_bignumber5.default(level.price);
    const size = new import_bignumber5.default(level.size);
    const tradeQuantity = import_bignumber5.default.min(tokenXLeft, size);
    totalCost = totalCost.plus(tradeQuantity.times(price));
    tokenXLeft = tokenXLeft.minus(tradeQuantity);
    estWorstPrice = price;
    if (tokenXLeft.lte(0)) break;
  }
  const estPrice = totalCost.div(new import_bignumber5.default(tokenX).minus(tokenXLeft));
  const estSlippage = estWorstPrice.minus(initialPrice).div(initialPrice).abs().times(100);
  const estTokenYAmount = totalCost;
  return {
    estPrice: estPrice.toNumber(),
    estSlippage: estSlippage.toNumber(),
    estTokenYAmount: estTokenYAmount.toNumber(),
    estWorstPrice: estWorstPrice.toNumber()
  };
};
var calculateEstValuesFromTokenY = (tokenY, orderbookSide, initialPrice) => {
  let totalQuantity = new import_bignumber5.default(0);
  let tokenYLeft = new import_bignumber5.default(tokenY);
  let estWorstPrice = new import_bignumber5.default(0);
  for (const level of orderbookSide) {
    const price = new import_bignumber5.default(level.price);
    const size = new import_bignumber5.default(level.size);
    const tradeCost = import_bignumber5.default.min(tokenYLeft, size.times(price));
    totalQuantity = totalQuantity.plus(tradeCost.div(price));
    tokenYLeft = tokenYLeft.minus(tradeCost);
    estWorstPrice = price;
    if (tokenYLeft.lte(0)) break;
  }
  const estPrice = new import_bignumber5.default(tokenY).minus(tokenYLeft).div(totalQuantity);
  const estSlippage = estWorstPrice.minus(initialPrice).div(initialPrice).abs().times(100);
  const estTokenXAmount = totalQuantity;
  return {
    estPrice: estPrice.toNumber(),
    estSlippage: estSlippage.toNumber(),
    estTokenXAmount: estTokenXAmount.toNumber(),
    estWorstPrice: estWorstPrice.toNumber()
  };
};
var calculateValueWithFee = (value, feeRate, feeDecimalPlaces, valueDecimalPlaces) => {
  const fee = value.times(feeRate).dp(feeDecimalPlaces, import_bignumber5.default.ROUND_CEIL);
  const valueWithFee = value.plus(fee).dp(valueDecimalPlaces, import_bignumber5.default.ROUND_CEIL);
  return [valueWithFee, fee];
};
var calculateValueAfterFee = (value, feeRate, feeDecimalPlaces, valueDecimalPlaces) => {
  const fee = value.times(feeRate).dp(feeDecimalPlaces, import_bignumber5.default.ROUND_CEIL);
  const valueAfterFee = value.minus(fee).dp(valueDecimalPlaces, import_bignumber5.default.ROUND_FLOOR);
  return [valueAfterFee, fee];
};
var calculateValueBeforeFee = (value, feeRate, feeDecimalPlaces, valueDecimalPlaces) => {
  const valueBeforeFee = value.div(new import_bignumber5.default(1).minus(feeRate)).dp(valueDecimalPlaces, import_bignumber5.default.ROUND_CEIL);
  const fee = valueBeforeFee.minus(value).dp(feeDecimalPlaces, import_bignumber5.default.ROUND_CEIL);
  return [valueBeforeFee, fee];
};
var calculateAutoSlippage = (estSlippage) => {
  const diff = new import_bignumber5.default(estSlippage).times(new import_bignumber5.default(AUTO_SLIPPAGE_INCREASE_PERCENT).div(100));
  const autoSlippage = new import_bignumber5.default(estSlippage).plus(diff).dp(AUTO_SLIPPAGE_DECIMAL, import_bignumber5.default.ROUND_CEIL);
  if (autoSlippage.isZero()) {
    return 0.1;
  }
  return autoSlippage.gt(AUTO_SLIPPAGE_MAX_PERCENT) ? AUTO_SLIPPAGE_MAX_PERCENT : autoSlippage.toNumber();
};

// src/spot/onchainLobSpot.ts
var OnchainLobSpot = class {
  constructor(options) {
    /**
     * The events related to user subscriptions.
     *
     * These events are emitted when data is updated related to subscriptions.
     */
    __publicField(this, "events", {
      subscriptionError: new EventEmitter(),
      marketUpdated: new EventEmitter(),
      orderbookUpdated: new EventEmitter(),
      tradesUpdated: new EventEmitter(),
      userOrdersUpdated: new EventEmitter(),
      userOrderHistoryUpdated: new EventEmitter(),
      userFillsUpdated: new EventEmitter(),
      candlesUpdated: new EventEmitter(),
      allMarketUpdated: new EventEmitter()
    });
    /**
     * Indicates whether executed tokens should be transferred to the wallet or credited to the balance.
     * When true, executed tokens will be transferred to the wallet. When false, executed tokens will be credited to the balance.
     * If not set, the default value will be used.
     * This flag is used by the Onchain LOB Spot contract.
     */
    __publicField(this, "transferExecutedTokensEnabled");
    /**
     * Indicates whether transactions should be automatically waited for by the client.
     * When true, transactions will be automatically waited for by the client until confirmation is received.
     * When false, transactions will not be waited for by the client.
     * If not set, the default value will be used.
     * This flag is used by the Onchain LOB Spot contract.
     *
     * Note: "Wait" means that the client will wait until the transaction confirmation is received.
     */
    __publicField(this, "autoWaitTransaction");
    __publicField(this, "signer");
    __publicField(this, "onchainLobService");
    __publicField(this, "onchainLobWebSocketService");
    __publicField(this, "marketContracts", /* @__PURE__ */ new Map());
    __publicField(this, "cachedMarkets", /* @__PURE__ */ new Map());
    __publicField(this, "mappers");
    __publicField(this, "cachedMarketsPromise");
    __publicField(this, "onMarketUpdated", async (marketId, isSnapshot, data) => {
      try {
        const marketUpdate = this.mappers.mapMarketUpdateDtoToMarketUpdate(marketId, data, data.priceScalingFactor, data.tokenXScalingFactor);
        this.events.marketUpdated.emit(marketId, isSnapshot, marketUpdate);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onAllMarketsUpdated", async (isSnapshot, data) => {
      try {
        const allMarketsUpdate = data.map((marketUpdateDot) => this.mappers.mapMarketUpdateDtoToMarketUpdate(marketUpdateDot.id, marketUpdateDot, marketUpdateDot.priceScalingFactor, marketUpdateDot.tokenXScalingFactor));
        this.events.allMarketUpdated.emit(isSnapshot, allMarketsUpdate);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onOrderbookUpdated", async (marketId, isSnapshot, data) => {
      try {
        const markets = await this.getCachedMarkets();
        const market = markets?.get(marketId);
        if (!market)
          return;
        const orderbookUpdate = this.mappers.mapOrderbookUpdateDtoToOrderbookUpdate(marketId, data, market.priceScalingFactor, market.tokenXScalingFactor);
        this.events.orderbookUpdated.emit(marketId, isSnapshot, orderbookUpdate);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onTradesUpdated", async (marketId, isSnapshot, data) => {
      try {
        const markets = await this.getCachedMarkets();
        if (!markets)
          return;
        const tradeUpdates = data.map((dto) => {
          const market = markets.get(dto.market.id);
          if (!market)
            throw new Error(`Market not found for marketId: ${dto.market.id}`);
          return this.mappers.mapTradeUpdateDtoToTradeUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor);
        });
        this.events.tradesUpdated.emit(marketId, isSnapshot, tradeUpdates);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onUserOrdersUpdated", async (marketId, isSnapshot, data) => {
      try {
        const markets = await this.getCachedMarkets();
        if (!markets)
          return;
        const orderUpdates = data.map((dto) => {
          const market = markets.get(dto.market.id);
          if (!market)
            throw new Error(`Market not found for marketId: ${dto.market.id}`);
          return this.mappers.mapOrderUpdateDtoToOrderUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor);
        });
        this.events.userOrdersUpdated.emit(marketId, isSnapshot, orderUpdates);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onUserOrderHistoryUpdated", async (marketId, isSnapshot, data) => {
      try {
        const markets = await this.getCachedMarkets();
        if (!markets)
          return;
        const orderHistoryUpdates = data.map((dto) => {
          const market = markets.get(dto.market.id);
          if (!market)
            throw new Error(`Market not found for marketId: ${dto.market.id}`);
          return this.mappers.mapOrderHistoryUpdateDtoToOrderHistoryUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor);
        });
        this.events.userOrderHistoryUpdated.emit(marketId, isSnapshot, orderHistoryUpdates);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onUserFillsUpdated", async (marketId, isSnapshot, data) => {
      try {
        const markets = await this.getCachedMarkets();
        if (!markets)
          return;
        const fillUpdates = data.map((dto) => {
          const market = markets.get(dto.market.id);
          if (!market)
            throw new Error(`Market not found for marketId: ${dto.market.id}`);
          return this.mappers.mapFillUpdateDtoToFillUpdate(marketId, dto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor);
        });
        this.events.userFillsUpdated.emit(marketId, isSnapshot, fillUpdates);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onCandlesUpdated", (marketId, isSnapshot, data) => {
      this.events.candlesUpdated.emit(marketId, isSnapshot, data);
    });
    __publicField(this, "onSubscriptionError", (error) => {
      this.events.subscriptionError.emit(error);
    });
    this.signer = options.signer;
    this.transferExecutedTokensEnabled = options.transferExecutedTokensEnabled;
    this.autoWaitTransaction = options.autoWaitTransaction;
    this.onchainLobService = new OnchainLobSpotService(options.apiBaseUrl);
    this.onchainLobWebSocketService = new OnchainLobSpotWebSocketService(options.webSocketApiBaseUrl, options.webSocketConnectImmediately);
    this.mappers = mappers_exports;
    this.attachEvents();
  }
  /**
   * Sets a new signer for the OnchainLobSpot instance.
   *
   * @param {Signer | null} signer - The new signer to be set. For only http/ws operations, you can set this to null.
   * @returns {OnchainLobSpot} Returns the OnchainLobSpot instance for method chaining.
   */
  setSigner(signer) {
    this.signer = signer;
    this.marketContracts = /* @__PURE__ */ new Map();
    return this;
  }
  /**
  * Approves the specified amount of tokens for the corresponding market contract.
  * You need to approve the tokens before you can deposit or place an order.
  *
  * @param {ApproveSpotParams} params - The parameters for approving tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async approveTokens(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.approveTokens(params);
  }
  /**
  * Wraps the specified amount of native tokens.
  * You need to wrap the tokens before you can deposit.
  *
  * @param {WrapNativeTokenSpotParams} params - The parameters for wrapping tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async wrapNativeTokens(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.wrapNativeToken(params);
  }
  /**
  * Unwraps the specified amount of native tokens.
  * You need to unwrap the tokens after withdrawal to get native tokens.
  *
  * @param {UnwrapNativeTokenSpotParams} params - The parameters for unwrapping tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async unwrapNativeTokens(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.unwrapNativeToken(params);
  }
  /**
  * Deposits the specified amount of tokens to the corresponding market contract.
  * You need to approve the tokens before you can deposit them.
  * Use the {@link OnchainLobSpot#approveTokens} method for that.
  *
  * @param {DepositSpotParams} params - The parameters for depositing tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async depositTokens(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.depositTokens(params);
  }
  /**
   * Withdraws the specified amount of tokens from the corresponding market contract.
   * If withdrawAll is true, the entire balance of tokens will be withdrawn.
   *
   * @param {WithdrawSpotParams} params - The parameters for withdrawing tokens.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async withdrawTokens(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.withdrawTokens(params);
  }
  /**
   * Sets the claimable status for corresponding market contract.
   *
   * @param {SetClaimableStatusParams} params - The parameters for setting the claimable status.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async setClaimableStatus(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.setClaimableStatus(params);
  }
  /**
   * Places a new order in the corresponding market contract.
   *
   * @param {PlaceOrderSpotParams} params - The parameters for placing a new order.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeOrder(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.placeOrder(params);
  }
  /**
   * Places a new order with a permit in the corresponding market contract.
   *
   * @param {PlaceOrderWithPermitSpotParams} params - The parameters for placing a new order with a permit.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeOrderWithPermit(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.placeOrderWithPermit(params);
  }
  /**
   * Places a market order with a quote token value in the corresponding market contract.
   *
   * @param {PlaceMarketOrderWithTargetValueParams} params - The parameters for placing a market order with a target value.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeMarketOrderWithTargetValue(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.placeMarketOrderWithTargetValue(params);
  }
  /**
   * Places a market order with a quote token value and a permit in the corresponding market contract.
   *
   * @param {PlaceMarketOrderWithTargetValueWithPermitParams} params - The parameters for placing a market order with a target value and a permit.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async placeMarketOrderWithTargetValueWithPermit(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.placeMarketOrderWithTargetValueWithPermit(params);
  }
  /**
   * Places multiple orders in the corresponding market contract.
   *
   * @param {BatchPlaceOrderSpotParams} params - The parameters for placing multiple orders.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async batchPlaceOrder(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.batchPlaceOrder(params);
  }
  /**
   * Claims an order or fully cancel it in the corresponding market contract.
   *
   * @param {ClaimOrderSpotParams} params - The parameters for claiming an order.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async claimOrder(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.claimOrder(params);
  }
  /**
   * Claims multiple orders or fully cancels them in the corresponding market contract.
   *
   * @param {BatchClaimOrderSpotParams} params - The parameters for claiming multiple orders.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async batchClaim(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.batchClaim(params);
  }
  /**
   * Change an existing order in the corresponding market contract.
   *
   * @param {ChangeOrderSpotParams} params - The parameters for changing an existing order.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async changeOrder(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.changeOrder(params);
  }
  /**
   * Change multiple existing orders in the corresponding market contract.
   *
   * @param {BatchChangeOrderSpotParams} params - The parameters for changing multiple existing orders.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async batchChangeOrder(params) {
    const marketContract = await this.getSpotMarketContract(params);
    return marketContract.batchChangeOrder(params);
  }
  /**
   * Retrieves the markets information from cache.
   *
   * @returns {Promise<Map<string, Market> | undefined>} A Promise that resolves to the markets information or undefined if error when requesting markets.
   */
  async getCachedMarkets() {
    const markets = this.cachedMarkets;
    if (!markets.size) {
      try {
        let getMarketsPromise = this.cachedMarketsPromise;
        if (!getMarketsPromise) {
          getMarketsPromise = this.getMarkets({ market: ALL_MARKETS_ID });
          this.cachedMarketsPromise = getMarketsPromise;
        }
        const marketsRes = await getMarketsPromise;
        this.cachedMarketsPromise = void 0;
        marketsRes.forEach((market) => markets.set(market.id, market));
      } catch (error) {
        console.error(error);
      }
      if (!markets.size) return void 0;
    }
    return markets;
  }
  /**
   * Retrieves the market information for the specified market.
   *
   * @param {GetMarketParams} params - The parameters for retrieving the market information.
   * @returns {Promise<Market | undefined>} A Promise that resolves to the market information or undefined if the market is not found.
   */
  async getMarket(params) {
    const markets = await this.getMarkets(params);
    const market = markets[0];
    return market;
  }
  /**
   * Retrieves the markets.
   *
   * @param {GetMarketsParams} params - The parameters for retrieving the markets.
   * @returns {Promise<Market[]>} A Promise that resolves to an array of markets.
   */
  async getMarkets(params) {
    const marketDtos = await this.onchainLobService.getMarkets(params);
    const markets = marketDtos.map((marketDto) => this.mappers.mapMarketDtoToMarket(
      marketDto,
      marketDto.priceScalingFactor,
      marketDto.tokenXScalingFactor
    ));
    return markets;
  }
  /**
   * Retrieves the tokens.
   *
   * @param {GetTokensParams} params - The parameters for retrieving the tokens.
   * @returns {Promise<Token[]>} A Promise that resolves to an array of tokens.
   */
  async getTokens(params) {
    const tokenDtos = await this.onchainLobService.getTokens(params);
    const tokens = tokenDtos.map(this.mappers.mapTokenDtoToToken);
    return tokens;
  }
  /**
   * Retrieves the orderbook for the specified market.
   *
   * @param {GetOrderbookParams} params - The parameters for retrieving the orderbook.
   * @returns {Promise<Orderbook>} A Promise that resolves to the orderbook.
   */
  async getOrderbook(params) {
    const [market, orderbookDto] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getOrderbook(params)
    ]);
    const orderbook = this.mappers.mapOrderbookDtoToOrderbook(orderbookDto, market.priceScalingFactor, market.tokenXScalingFactor);
    return orderbook;
  }
  /**
   * Retrieves the orders for the specified market.
   *
   * @param {GetOrdersParams} params - The parameters for retrieving the orders.
   * @returns {Promise<Order[]>} A Promise that resolves to an array of orders.
   */
  async getOrders(params) {
    const [market, orderDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getOrders(params)
    ]);
    const orders = orderDtos.map((orderDto) => this.mappers.mapOrderDtoToOrder(orderDto, market.priceScalingFactor, market.tokenXScalingFactor));
    return orders;
  }
  /**
   * Retrieves the order history for the specified market.
   *
   * @param {GetOrderHistoryParams} params - The parameters for retrieving the order history.
   * @returns {Promise<OrderHistory[]>} A Promise that resolves to an array of order history logs.
   */
  async getOrderHistory(params) {
    const [market, orderHistoryDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getOrderHistory(params)
    ]);
    const orderHistory = orderHistoryDtos.map((orderHistoryDto) => this.mappers.mapOrderHistoryDtoToOrderHistory(orderHistoryDto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor));
    return orderHistory;
  }
  /**
   * Retrieves the trades for the specified market.
   *
   * @param {GetTradesParams} params - The parameters for retrieving the trades.
   * @returns {Promise<Trade[]>} A Promise that resolves to an array of trades.
   */
  async getTrades(params) {
    const [market, tradeDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getTrades(params)
    ]);
    const trades = tradeDtos.map((tradeDto) => this.mappers.mapTradeDtoToTrade(tradeDto, market.priceScalingFactor, market.tokenXScalingFactor));
    return trades;
  }
  /**
   * Retrieves the fills for the specified market.
   *
   * @param {GetFillsParams} params - The parameters for retrieving the fills.
   * @returns {Promise<Fill[]>} A Promise that resolves to an array of fills.
   */
  async getFills(params) {
    const [market, fillDtos] = await Promise.all([
      this.ensureMarket(params),
      this.onchainLobService.getFills(params)
    ]);
    const fills = fillDtos.map((fillDto) => this.mappers.mapFillDtoToFill(fillDto, market.priceScalingFactor, market.tokenXScalingFactor, market.tokenYScalingFactor));
    return fills;
  }
  /**
   * Retrieves the candles for the specified market and resolution.
   *
   * @param {GetCandlesParams} params - The parameters for retrieving the candles.
   * @returns {Promise<Candle[]>} A Promise that resolves to an array of candles.
   */
  async getCandles(params) {
    const candles = await this.onchainLobService.getCandles(params);
    return candles;
  }
  /**
   * Calculates the limit order details for a given token inputs.
   *
   * @param {CalculateLimitDetailsParams} params - The parameters for the limit details calculation.
   * @returns {Promise<LimitOrderDetails>} A Promise that resolves to the limit order details data.
   */
  async calculateLimitDetails(params) {
    return this.onchainLobService.calculateLimitDetails(params);
  }
  /**
   * Calculates the limit order details for a given token inputs without API request.
   *
   * @param {CalculateLimitDetailsSyncParams} params - The parameters for the limit details calculation.
   * @returns {LimitOrderDetails} Limit order details data.
   */
  calculateLimitDetailsSync(params) {
    return getLimitDetails(params);
  }
  /**
   * Calculates the market order details for a given token inputs.
   *
   * @param {CalculateMarketDetailsParams} params - The parameters for the market details calculation.
   * @returns {Promise<MarketOrderDetails>} A Promise that resolves to the market order details data.
   */
  async calculateMarketDetails(params) {
    return this.onchainLobService.calculateMarketDetails(params);
  }
  /**
   * Calculates the market order details for a given token inputs without API request.
   *
   * @param {CalculateMarketDetailsSyncParams} params - The parameters for the market details calculation.
   * @returns {MarketOrderDetails} Market order details data.
   */
  calculateMarketDetailsSync(params) {
    return getMarketDetails(params);
  }
  /**
   * Retrieves the user balances for the specified user.
   *
   * @param {GetUserBalancesParams} params - The parameters for retrieving the user balances.
   * @returns {Promise<UserBalances>} A Promise that resolves to the user balances data.
   */
  async getUserBalances(params) {
    return this.onchainLobService.getUserBalances(params);
  }
  /**
   * Retrieves the deposits for the specified user.
   *
   * @param {GetUserDepositsParams} params - The parameters for retrieving the user deposits.
   * @returns {Promise<UserDeposits>} A Promise that resolves to the user deposits data.
   */
  async getUserDeposits(params) {
    return this.onchainLobService.getUserDeposits(params);
  }
  /**
   * Subscribes to the market updates for the specified market.
   *
   * @param {SubscribeToMarketParams} params - The parameters for subscribing to the market updates.
   * @emits OnchainLobSpot#events#marketUpdated
   */
  subscribeToMarket(params) {
    this.onchainLobWebSocketService.subscribeToMarket(params);
  }
  /**
   * Unsubscribes from the market updates for the specified market.
   *
   * @param {UnsubscribeFromMarketParams} params - The parameters for unsubscribing from the market updates.
   */
  unsubscribeFromMarket(params) {
    this.onchainLobWebSocketService.unsubscribeFromMarket(params);
  }
  /**
   * Subscribes to the all markets updates.
   *
   * @emits OnchainLobSpot#events#marketUpdated
   */
  subscribeToAllMarkets() {
    this.onchainLobWebSocketService.subscribeToAllMarkets();
  }
  /**
   * Unsubscribes from the all markets updates.
   */
  unsubscribeFromAllMarkets() {
    this.onchainLobWebSocketService.unsubscribeFromAllMarkets();
  }
  /**
   * Subscribes to the orderbook updates for the specified market and aggregation level.
   *
   * @param {SubscribeToOrderbookParams} params - The parameters for subscribing to the orderbook updates.
   * @emits OnchainLobSpot#events#orderbookUpdated
   */
  subscribeToOrderbook(params) {
    this.onchainLobWebSocketService.subscribeToOrderbook(params);
  }
  /**
   * Unsubscribes from the orderbook updates for the specified market and aggregation level.
   *
   * @param {UnsubscribeFromOrderbookParams} params - The parameters for unsubscribing from the orderbook updates.
   */
  unsubscribeFromOrderbook(params) {
    this.onchainLobWebSocketService.unsubscribeFromOrderbook(params);
  }
  /**
   * Subscribes to the trade updates for the specified market.
   *
   * @param {SubscribeToTradesParams} params - The parameters for subscribing to the trade updates.
   * @emits OnchainLobSpot#events#tradesUpdated
   */
  subscribeToTrades(params) {
    this.onchainLobWebSocketService.subscribeToTrades(params);
  }
  /**
   * Unsubscribes from the trade updates for the specified market.
   *
   * @param {UnsubscribeFromTradesParams} params - The parameters for unsubscribing from the trade updates.
   */
  unsubscribeFromTrades(params) {
    this.onchainLobWebSocketService.unsubscribeFromTrades(params);
  }
  /**
   * Subscribes to the user orders updates for the specified market and user.
   *
   * @param {SubscribeToUserOrdersParams} params - The parameters for subscribing to the user orders updates.
   * @emits OnchainLobSpot#events#ordersUpdated
   */
  subscribeToUserOrders(params) {
    this.onchainLobWebSocketService.subscribeToUserOrders(params);
  }
  /**
   * Unsubscribes from the user orders updates for the specified market and user.
   *
   * @param {UnsubscribeFromUserOrdersParams} params - The parameters for unsubscribing from the user orders updates.
   * @emits OnchainLobSpot#events#ordersUpdated
   */
  unsubscribeFromUserOrders(params) {
    this.onchainLobWebSocketService.unsubscribeFromUserOrders(params);
  }
  /**
   * Subscribes to the user order history updates for the specified market and user.
   *
   * @param {SubscribeToUserOrderHistoryParams} params - The parameters for subscribing to the user order history updates.
   * @emits OnchainLobSpot#events#userOrderHistoryUpdated
   */
  subscribeToUserOrderHistory(params) {
    this.onchainLobWebSocketService.subscribeToUserOrderHistory(params);
  }
  /**
     * Unsubscribes from the user order updates for the specified market and user.
     *
     * @param {UnsubscribeFromUserOrderHistoryParams} params - The parameters for unsubscribing from the user orders updates.
     * @emits OnchainLobSpot#events#userOrderHistoryUpdated
     */
  unsubscribeFromUserOrderHistory(params) {
    this.onchainLobWebSocketService.unsubscribeFromUserOrderHistory(params);
  }
  /**
   * Subscribes to the user fills updates for the specified market and user.
   *
   * @param {SubscribeToUserFillsParams} params - The parameters for subscribing to the user fills updates.
   * @emits OnchainLobSpot#events#userFillsUpdated
   */
  subscribeToUserFills(params) {
    this.onchainLobWebSocketService.subscribeToUserFills(params);
  }
  /**
   * Unsubscribes from the user fills updates for the specified market and user.
   *
   * @param {UnsubscribeFromUserFillsParams} params - The parameters for unsubscribing from the user fills updates.
   * @emits OnchainLobSpot#events#userFillsUpdated
   */
  unsubscribeFromUserFills(params) {
    this.onchainLobWebSocketService.unsubscribeFromUserFills(params);
  }
  /**
   * Subscribes to candle updates for the specified market and resolution.
   *
   * @param {SubscribeToCandlesParams} params - The parameters for subscribing to the candle updates.
   */
  subscribeToCandles(params) {
    this.onchainLobWebSocketService.subscribeToCandles(params);
  }
  /**
   * Unsubscribes from candle updates for the specified market and resolution.
   *
   * @param {UnsubscribeFromCandlesParams} params - The parameters for unsubscribing from the candle updates.
   */
  unsubscribeFromCandles(params) {
    this.onchainLobWebSocketService.unsubscribeFromCandles(params);
  }
  [Symbol.dispose]() {
    this.detachEvents();
    this.onchainLobWebSocketService[Symbol.dispose]();
  }
  async ensureMarket(params) {
    const markets = await this.getCachedMarkets();
    const market = markets?.get(params.market);
    if (!market)
      throw new Error(`Market not found by the ${params.market} address`);
    return market;
  }
  async getSpotMarketContract(params) {
    if (this.signer === null) {
      throw new Error("Signer is not set");
    }
    let marketContract = this.marketContracts.get(params.market);
    if (!marketContract) {
      const market = await this.ensureMarket(params);
      marketContract = new OnchainLobSpotMarketContract({
        market,
        signer: this.signer,
        transferExecutedTokensEnabled: this.transferExecutedTokensEnabled,
        autoWaitTransaction: this.autoWaitTransaction
      });
      this.marketContracts.set(params.market, marketContract);
    }
    return marketContract;
  }
  attachEvents() {
    this.onchainLobWebSocketService.events.marketUpdated.addListener(this.onMarketUpdated);
    this.onchainLobWebSocketService.events.allMarketsUpdated.addListener(this.onAllMarketsUpdated);
    this.onchainLobWebSocketService.events.orderbookUpdated.addListener(this.onOrderbookUpdated);
    this.onchainLobWebSocketService.events.tradesUpdated.addListener(this.onTradesUpdated);
    this.onchainLobWebSocketService.events.userOrdersUpdated.addListener(this.onUserOrdersUpdated);
    this.onchainLobWebSocketService.events.userOrderHistoryUpdated.addListener(this.onUserOrderHistoryUpdated);
    this.onchainLobWebSocketService.events.userFillsUpdated.addListener(this.onUserFillsUpdated);
    this.onchainLobWebSocketService.events.candlesUpdated.addListener(this.onCandlesUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.addListener(this.onSubscriptionError);
  }
  detachEvents() {
    this.onchainLobWebSocketService.events.marketUpdated.removeListener(this.onMarketUpdated);
    this.onchainLobWebSocketService.events.orderbookUpdated.removeListener(this.onOrderbookUpdated);
    this.onchainLobWebSocketService.events.tradesUpdated.removeListener(this.onTradesUpdated);
    this.onchainLobWebSocketService.events.userOrdersUpdated.removeListener(this.onUserOrdersUpdated);
    this.onchainLobWebSocketService.events.userOrderHistoryUpdated.removeListener(this.onUserOrderHistoryUpdated);
    this.onchainLobWebSocketService.events.userFillsUpdated.removeListener(this.onUserFillsUpdated);
    this.onchainLobWebSocketService.events.candlesUpdated.removeListener(this.onCandlesUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.removeListener(this.onSubscriptionError);
  }
};

// src/vault/mock.ts
var import_bignumber6 = __toESM(require("bignumber.js"));
var MockVault = class {
  constructor() {
    __publicField(this, "subscribeParams");
    __publicField(this, "events", {
      vaultUpdated: new EventEmitter(),
      vaultValueHistoryUpdated: new EventEmitter(),
      subscriptionError: new EventEmitter()
    });
    this.subscribeParams = void 0;
    setInterval(() => {
      if (this.subscribeParams) {
        this.emitRandomVault();
      }
    }, 7e3);
    setInterval(() => {
      if (this.subscribeParams) {
        this.emitRandomHistory();
      }
    }, 8340);
  }
  emitRandomVault() {
    this.events.vaultUpdated.emit([{
      totalAmount: BigInt(Math.floor(Math.random() * 1e5)),
      totalUSDValue: Math.random() * 1e5,
      pastWeekReturn: Math.random() * 100,
      userUSDValue: this.subscribeParams?.user ? Math.random() * 1e4 : void 0,
      userAllTimeEarnedUSDValue: this.subscribeParams?.user ? Math.random() * 5e3 : void 0,
      leader: "0x4562393292392393293923",
      vaultPerfomance: {
        pnlPerfomance: Math.random() * 1e4,
        maxDrowdownPercentage: Math.random() * 100,
        volume: Math.random() * 1e6,
        profitShare: Math.random() * 100
      }
    }]);
  }
  emitRandomHistory() {
    this.events.vaultValueHistoryUpdated.emit([{
      pnl: Math.random() * 1e4,
      totalUSDValue: Math.random() * 1e5,
      time: Date.now(),
      lastTouched: Date.now()
    }]);
  }
  emitHistory() {
    const timestamps = [1735765200, 1735851600, 1735938e3, 1736024400, 1736110800];
    const history = timestamps.map((timestamp) => ({
      pnl: Math.random() * 1e4,
      totalUSDValue: Math.random() * 1e5,
      time: timestamp,
      lastTouched: timestamp
    }));
    this.events.vaultValueHistoryUpdated.emit(history);
  }
  subscribeToVaultUpdates(params) {
    this.subscribeParams = params;
  }
  unsubscribeFromVaultUpdates() {
    this.subscribeParams = void 0;
  }
  subscribeToVaultValueHistory(_params) {
    setTimeout(() => {
      this.emitHistory();
    }, 1500);
  }
  unsubscribeFromVaultValueHistory() {
    this.subscribeParams = void 0;
  }
  calculateDepositDetailsSync(params) {
    return {
      estTokenReceive: new import_bignumber6.default(Math.random() * 1e3),
      estFee: new import_bignumber6.default(Math.random() * 10)
    };
  }
  calculateWithdrawDetailsSync(params) {
    return {
      estTokenReceive: new import_bignumber6.default(Math.random() * 1e3),
      estFee: new import_bignumber6.default(Math.random() * 10)
    };
  }
  deposit(params) {
    setTimeout(() => {
      this.emitRandomVault();
      this.emitRandomHistory();
    }, 1e3);
  }
  withdraw(params) {
    setTimeout(() => {
      this.emitRandomVault();
      this.emitRandomHistory();
    }, 1e3);
  }
  async vaultInfo() {
    return {
      vaultAddress: "0x123123123123123123123123",
      tokens: [
        {
          id: "0x50c42deacd8fc9773493ed674b675be577f2634b",
          name: "Ether",
          symbol: "ETH",
          contractAddress: "0x50c42deacd8fc9773493ed674b675be577f2634b",
          decimals: 18,
          roundingDecimals: 6,
          supportsPermit: false,
          iconUrl: null,
          fromOg: false
        },
        {
          id: "0x29219dd400f2bf60e5a23d13be72b486d4038894",
          name: "USD Coin",
          symbol: "USDC",
          contractAddress: "0x29219dd400f2bf60e5a23d13be72b486d4038894",
          decimals: 6,
          roundingDecimals: 6,
          supportsPermit: false,
          iconUrl: null,
          fromOg: false
        },
        {
          id: "s",
          name: "Sonic",
          symbol: "S",
          contractAddress: "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
          decimals: 18,
          roundingDecimals: 6,
          supportsPermit: false,
          iconUrl: null,
          fromOg: false
        }
      ]
    };
  }
};

// src/vault/onchainLobVault.ts
var OnchainLobVault = class {
  constructor(options) {
    /**
     * The events related to user subscriptions.
     *
     * These events are emitted when data is updated related to subscriptions.
     */
    __publicField(this, "events", {
      vaultUpdated: new EventEmitter(),
      vaultValueHistoryUpdated: new EventEmitter(),
      // userVaultHistoryUpdated: new EventEmitter(),
      // depositorsUpdated: new EventEmitter(),
      subscriptionError: new EventEmitter()
    });
    __publicField(this, "onchainLobVaultService");
    __publicField(this, "onchainLobVaultWebSocketService");
    __publicField(this, "mockVault");
    __publicField(this, "onVaultUpdated", (data) => {
      this.events.vaultUpdated.emit(data);
    });
    __publicField(this, "onVaultValueHistoryUpdated", (data) => {
      this.events.vaultValueHistoryUpdated.emit(data);
    });
    __publicField(this, "onSubscriptionError", (error) => {
      this.events.subscriptionError.emit(error);
    });
    this.onchainLobVaultService = new OnchainLobSpotService(options.apiBaseUrl);
    this.onchainLobVaultWebSocketService = new OnchainLobSpotWebSocketService(options.webSocketApiBaseUrl);
    this.mockVault = new MockVault();
    this.attachEvents();
  }
  setSigner(signer) {
  }
  /**
   * Subscribes to the vault updates.
   *
   * @emits OnchainLobVault#events#vaultUpdated
   */
  subscribeToVaultUpdates(params) {
    this.mockVault.subscribeToVaultUpdates(params);
  }
  /**
   * Unsubscribes from the vault updates.
   */
  unsubscribeFromVaultUpdates() {
    this.mockVault.unsubscribeFromVaultUpdates();
  }
  subscribeToVaultValueHistory(params) {
    this.mockVault.subscribeToVaultValueHistory(params);
  }
  unsubscribeFromVaultValueHistory() {
    this.mockVault.unsubscribeFromVaultValueHistory();
  }
  attachEvents() {
    this.mockVault.events.vaultUpdated.addListener(this.onVaultUpdated);
    this.mockVault.events.vaultValueHistoryUpdated.addListener(this.onVaultValueHistoryUpdated);
    this.mockVault.events.subscriptionError.addListener(this.onSubscriptionError);
  }
  calculateDepositDetailsSync(params) {
    return this.mockVault.calculateDepositDetailsSync(params);
  }
  calculateWithdrawDetailsSync(params) {
    return this.mockVault.calculateWithdrawDetailsSync(params);
  }
  async deposit(params) {
    this.mockVault.deposit(params);
  }
  async withdraw(params) {
    this.mockVault.withdraw(params);
  }
  async getVaultInfo() {
    return this.mockVault.vaultInfo();
  }
};

// src/onchainLobClient.ts
var OnchainLobClient = class {
  /**
   * Creates a new OnchainLobClient instance.
   *
   * @param {OnchainLobClientOptions} options - The options for the OnchainLobClient.
   */
  constructor(options) {
    /**
     * The OnchainLobSpot instance that provides the API functions to interact with the Onchain LOB Spot contracts.
     *
     * @type {OnchainLobSpot}
     * @readonly
     */
    __publicField(this, "spot");
    /**
     * The OnchainLobVault instance that provides the API functions to interact with the Onchain LOB Vault contract.
     *
     * @type {OnchainLobVault}
     * @readonly
     */
    __publicField(this, "vault");
    this.spot = new OnchainLobSpot(options);
    this.vault = new OnchainLobVault(options);
  }
  /**
   * Sets the signer for the OnchainLobClient.
   *
   * @param {Signer | null} signer - The signer to set. For only http/ws operations, you can set this to null.
   */
  setSigner(signer) {
    this.spot.setSigner(signer);
    this.vault.setSigner(signer);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OnchainLobClient,
  OnchainLobError,
  OnchainLobSpot,
  OnchainLobSpotService,
  OnchainLobSpotWebSocketService,
  OnchainLobVault,
  TimeoutScheduler
});
//# sourceMappingURL=index.cjs.map
