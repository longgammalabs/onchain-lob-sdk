var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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
import { WebSocket } from "ws";
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
      this._socket = new WebSocket(this.url);
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
import BigNumber from "bignumber.js";
import { formatUnits, parseUnits } from "ethers";
var convertTokensRawAmountToAmount = (amount, decimals) => {
  return new BigNumber(formatUnits(amount, decimals));
};
var convertTokensAmountToRawAmount = (amount, decimals) => {
  const preparedAmount = amount.toFixed(decimals, BigNumber.ROUND_DOWN);
  return parseUnits(preparedAmount, decimals);
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
import BigNumber2 from "bignumber.js";
import { Contract, Signature } from "ethers";

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

// src/abi/lpManager.ts
var lpManagerAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_pythAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "_proxyPythAddress",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "receive",
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
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
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "addLiquidity",
    inputs: [
      {
        name: "tokenId",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "minUsdValue",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "minLPMinted",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "expires",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "priceUpdateData",
        type: "bytes[]",
        internalType: "bytes[]"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "approveForLOB",
    inputs: [
      {
        name: "lobId",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "tokenId",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changeLob",
    inputs: [
      {
        name: "lobAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "isActive",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "tokenIdX",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "tokenIdY",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "maxOrderDistanceBps",
        type: "uint16",
        internalType: "uint16"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changeMarketMaker",
    inputs: [
      {
        name: "marketMaker",
        type: "address",
        internalType: "address"
      },
      {
        name: "isActive",
        type: "bool",
        internalType: "bool"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changePauser",
    inputs: [
      {
        name: "pauser_",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changePrimaryMarketMaker",
    inputs: [
      {
        name: "_primaryMarketMaker",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "changeToken",
    inputs: [
      {
        name: "_tokenAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "_isActive",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "_targetWeight",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_lowerBoundWeight",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_upperBoundWeight",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_decimals",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "_oracleConfRel",
        type: "uint24",
        internalType: "uint24"
      },
      {
        name: "_oraclePriceId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "checkCooldown",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "claimOrder",
    inputs: [
      {
        name: "lobId",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "orderId",
        type: "uint64",
        internalType: "uint64"
      },
      {
        name: "onlyClaim",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "expires",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "collectFees",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "disableSlashingStatus",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getConfig",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "uint24",
        internalType: "uint24"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "uint128",
        internalType: "uint128"
      },
      {
        name: "",
        type: "uint128",
        internalType: "uint128"
      },
      {
        name: "",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "",
        type: "address",
        internalType: "address"
      },
      {
        name: "",
        type: "uint24",
        internalType: "uint24"
      },
      {
        name: "",
        type: "uint64",
        internalType: "uint64"
      },
      {
        name: "",
        type: "uint64",
        internalType: "uint64"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getFeeBasisPoints",
    inputs: [
      {
        name: "totalValue",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "initialTokenValue",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "nextTokenValue",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "targetTokenWeight",
        type: "uint16",
        internalType: "uint16"
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
    name: "getPriceOf",
    inputs: [
      {
        name: "tokenId",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "",
        type: "int32",
        internalType: "int32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getTokensCount",
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
    name: "hwmLPPrice",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint96",
        internalType: "uint96"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_owner",
        type: "address",
        internalType: "address"
      },
      {
        name: "_liquidityToken",
        type: "address",
        internalType: "address"
      },
      {
        name: "_adminFeeRecipient",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "lastAddedAt",
    inputs: [
      {
        name: "",
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
    name: "liquidityToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract LPToken"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "lobReservesByTokenId",
    inputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8"
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
    name: "lobs",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "lobAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "tokenIdX",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "tokenIdY",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "isActive",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "maxOrderDistanceBps",
        type: "uint16",
        internalType: "uint16"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "marketMakers",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pauser",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "placeOrder",
    inputs: [
      {
        name: "lobId",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "isAsk",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "quantity",
        type: "uint128",
        internalType: "uint128"
      },
      {
        name: "price",
        type: "uint72",
        internalType: "uint72"
      },
      {
        name: "maxCommission",
        type: "uint128",
        internalType: "uint128"
      },
      {
        name: "marketOnly",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "postOnly",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "expires",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "priceUpdateData",
        type: "bytes[]",
        internalType: "bytes[]"
      }
    ],
    outputs: [
      {
        name: "orderId",
        type: "uint64",
        internalType: "uint64"
      }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "primaryMarketMaker",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "proxiableUUID",
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
    name: "removeLiquidity",
    inputs: [
      {
        name: "tokenId",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "burnLP",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "minUsdValue",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "minTokenGet",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "expires",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "priceUpdateData",
        type: "bytes[]",
        internalType: "bytes[]"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setConfig",
    inputs: [
      {
        name: "_dynamicFeesEnabled",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "_adminMintLPFeeBps",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_adminBurnLPFeeBps",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_feeBasisBps",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_taxBasisBps",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_cooldownDuration",
        type: "uint24",
        internalType: "uint24"
      },
      {
        name: "_maxOracleAge",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_minLiquidityValueUsd",
        type: "uint128",
        internalType: "uint128"
      },
      {
        name: "_maxLiquidityValueUsd",
        type: "uint128",
        internalType: "uint128"
      },
      {
        name: "_marketMakerLPShareEnabled",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "_marketMakerLPShareBps",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_nativeTokenEnabled",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "_nativeTokenTokenId",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "_adminFeeRecipient",
        type: "address",
        internalType: "address"
      },
      {
        name: "_priceValidityPeriod",
        type: "uint24",
        internalType: "uint24"
      },
      {
        name: "_baseMultiplier",
        type: "uint64",
        internalType: "uint64"
      },
      {
        name: "_maxAllowedPriceDeviation",
        type: "uint64",
        internalType: "uint64"
      },
      {
        name: "_perfFeeBps",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "_adminPerfFeeBps",
        type: "uint16",
        internalType: "uint16"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "slashMakersShares",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "tokens",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "tokenAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "isActive",
        type: "bool",
        internalType: "bool"
      },
      {
        name: "targetWeight",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "lowerBoundWeight",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "upperBoundWeight",
        type: "uint16",
        internalType: "uint16"
      },
      {
        name: "decimals",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "oracleConfRel",
        type: "uint24",
        internalType: "uint24"
      },
      {
        name: "oraclePriceId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "totalWeight",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint24",
        internalType: "uint24"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      {
        name: "newImplementation",
        type: "address",
        internalType: "address"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "validateLPPriceAndDistributeFees",
    inputs: [
      {
        name: "priceUpdateData",
        type: "bytes[]",
        internalType: "bytes[]"
      }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "validateMarketMakerLPShare",
    inputs: [],
    outputs: [],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "ConfigSet",
    inputs: [
      {
        name: "dynamicFeesEnabled",
        type: "bool",
        indexed: false,
        internalType: "bool"
      },
      {
        name: "adminMintLPFeeBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "adminBurnLPFeeBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "feeBasisBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "taxBasisPoints",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "cooldownDuration",
        type: "uint24",
        indexed: false,
        internalType: "uint24"
      },
      {
        name: "maxOracleAge",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "minLiquidityValueUsd",
        type: "uint128",
        indexed: false,
        internalType: "uint128"
      },
      {
        name: "maxLiquidityValueUsd",
        type: "uint128",
        indexed: false,
        internalType: "uint128"
      },
      {
        name: "marketMakerLPShareEnabled",
        type: "bool",
        indexed: false,
        internalType: "bool"
      },
      {
        name: "marketMakerLPShareBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "nativeTokenEnabled",
        type: "bool",
        indexed: false,
        internalType: "bool"
      },
      {
        name: "nativeTokenTokenId",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "adminFeeRecipient",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "priceValidityPeriod",
        type: "uint24",
        indexed: false,
        internalType: "uint24"
      },
      {
        name: "baseMultiplier",
        type: "uint64",
        indexed: false,
        internalType: "uint64"
      },
      {
        name: "maxAllowedPriceDeviation",
        type: "uint64",
        indexed: false,
        internalType: "uint64"
      },
      {
        name: "perfFeeBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "adminPerfFeeBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "LiquidityAdded",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "tokenAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "tokenUSDValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "totalUSDValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "protocolFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "mintedLP",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "accountLpShares",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "totalSupply",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "LiquidityRemoved",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "tokenAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "lpUSDValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "totalUSDValue",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "protocolFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "burnedLP",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "accountLpShares",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "totalSupply",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "LobChanged",
    inputs: [
      {
        name: "lobId",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "lobAddress",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "isActive",
        type: "bool",
        indexed: false,
        internalType: "bool"
      },
      {
        name: "tokenIdX",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "tokenIdY",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "maxOrderDistanceBps",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "MakersSharesSlashed",
    inputs: [
      {
        name: "marketMaker",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "totalSupply",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "MarketMakerChanged",
    inputs: [
      {
        name: "marketMaker",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "isActive",
        type: "bool",
        indexed: false,
        internalType: "bool"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferStarted",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Paused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PauserChanged",
    inputs: [
      {
        name: "newPauser",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "oldPauser",
        type: "address",
        indexed: false,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PerformanceFeesDistributed",
    inputs: [
      {
        name: "currentPrice",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "previousHWM",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "adminFeeAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "marketMakerFeeAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "totalSupply",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PrimaryMarketMakerChanged",
    inputs: [
      {
        name: "oldMarketMaker",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "newMarketMaker",
        type: "address",
        indexed: false,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SlashingAvailableStatusChanged",
    inputs: [
      {
        name: "status",
        type: "bool",
        indexed: false,
        internalType: "bool"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Sync",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "tokenBalance",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      },
      {
        name: "tokenReserved",
        type: "uint256",
        indexed: false,
        internalType: "uint256"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "TokenChanged",
    inputs: [
      {
        name: "tokenId",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "tokenAddress",
        type: "address",
        indexed: false,
        internalType: "address"
      },
      {
        name: "isActive",
        type: "bool",
        indexed: false,
        internalType: "bool"
      },
      {
        name: "targetWeight",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "lowerBoundWeight",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "upperBoundWeight",
        type: "uint16",
        indexed: false,
        internalType: "uint16"
      },
      {
        name: "decimals",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "oracleConfRel",
        type: "uint24",
        indexed: false,
        internalType: "uint24"
      },
      {
        name: "oraclePriceId",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Unpaused",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "CooldownDurationNotYetPassed",
    inputs: []
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "EnforcedPause",
    inputs: []
  },
  {
    type: "error",
    name: "ExpectedPause",
    inputs: []
  },
  {
    type: "error",
    name: "Expired",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "FeeBpsExceedsMaximum",
    inputs: []
  },
  {
    type: "error",
    name: "Forbidden",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientFeeForPythUpdate",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientLiquidityValue",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientMarketMakerLPShare",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientMintedLP",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientTokenAmount",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientUSDValue",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidFloatingPointRepresentation",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidOracleConfidenceLevel",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidTokenWeights",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidTrader",
    inputs: []
  },
  {
    type: "error",
    name: "LobDisabled",
    inputs: []
  },
  {
    type: "error",
    name: "MarketMakerLPShareExceedsMaximum",
    inputs: []
  },
  {
    type: "error",
    name: "MaxLiquidityValueExceeded",
    inputs: []
  },
  {
    type: "error",
    name: "MaxOracleAgeExceedsMaximum",
    inputs: []
  },
  {
    type: "error",
    name: "NativeGasTokenDisabled",
    inputs: []
  },
  {
    type: "error",
    name: "NonPositivePrice",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "OracleConfTooHigh",
    inputs: []
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "PriceTooBig",
    inputs: []
  },
  {
    type: "error",
    name: "PriceTooSmall",
    inputs: []
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: []
  },
  {
    type: "error",
    name: "SafeCastOverflowedUintDowncast",
    inputs: [
      {
        name: "bits",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "SlashingUnAvailable",
    inputs: []
  },
  {
    type: "error",
    name: "TokenDisabled",
    inputs: []
  },
  {
    type: "error",
    name: "TokenWeightExceeded",
    inputs: []
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        name: "slot",
        type: "bytes32",
        internalType: "bytes32"
      }
    ]
  },
  {
    type: "error",
    name: "UnknownLob",
    inputs: []
  },
  {
    type: "error",
    name: "WrongNumber",
    inputs: []
  },
  {
    type: "error",
    name: "WrongTokenId",
    inputs: []
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: []
  },
  {
    type: "error",
    name: "ZeroAmount",
    inputs: []
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
    this.marketContract = new Contract(this.market.orderbookAddress, lobAbi, options.signer);
    this.baseTokenContract = new Contract(
      this.market.baseToken.contractAddress,
      this.market.supportsNativeToken && this.market.isNativeTokenX ? erc20WethAbi : this.market.baseToken.supportsPermit ? erc20PermitAbi : erc20Abi,
      options.signer
    );
    this.quoteTokenContract = new Contract(
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
      BigNumber2(sizeAmount.toString()).times(BigNumber2(priceAmount.toString())).times(35e-5).decimalPlaces(0, BigNumber2.ROUND_CEIL).toString()
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
    const splitSig = Signature.from(signature);
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
import BigNumber3 from "bignumber.js";
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
    totalSupply: dto.totalSupply ? BigNumber3(dto.totalSupply) : null,
    lastTouched: dto.lastTouched,
    aggressiveFee: Number(dto.aggressiveFee),
    passiveFee: Number(dto.passiveFee),
    passiveOrderPayout: Number(dto.passiveOrderPayout)
  };
};
var mapOrderbookLevelDtoToOrderbookLevel = (dto, priceFactor, sizeFactor) => {
  const price = BigNumber3(dto.price);
  const size = BigNumber3(dto.size);
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

// src/services/onchainLobVaultService/onchainLobVaultService.ts
var OnchainLobVaultService = class extends RemoteService {
  /**
   * Retrieves the vault config.
   * @param params - The parameters for the vault config request.
   * @returns The vault config data.
   */
  async getVaultConfig(_params) {
    const response = await this.fetch(`/vault-config`, "json");
    return response;
  }
  /**
   * Retrieves the vault total values.
   * @param params - The parameters for the vault total values request.
   * @returns The vault total values data.
   */
  async getVaultTotalValues(_params) {
    const response = await this.fetch(`/vault-total-values`, "json");
    return response;
  }
  /**
   * Retrieves the vault deposit actions.
   * @param params - The parameters for the vault deposit actions request.
   * @returns The vault deposit actions data.
   */
  async getVaultDepositActions(params) {
    const queryParams = new URLSearchParams({});
    if (params.limit)
      queryParams.append("limit", params.limit.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/vault-deposit-actions?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the vault top depositors.
   * @param params - The parameters for the vault top depositors request.
   * @returns The vault top depositors data.
   */
  async getVaultDepositors(params) {
    const queryParams = new URLSearchParams({});
    if (params.limit)
      queryParams.append("limit", params.limit.toString());
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/vault-depositors?${queryParamsString}`, "json");
    return response;
  }
  /**
   * Retrieves the vault history.
   * @param params - The parameters for the vault history request.
   * @returns The vault history data.
   */
  async getVaultHistory(params) {
    const queryParams = new URLSearchParams({
      period: params.period
    });
    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch(`/vault-history?${queryParamsString}`, "json");
    return response;
  }
};

// src/services/onchainLobVaultWebSocketService/onchainLobVaultWebSocketService.ts
var OnchainLobVaultWebSocketService = class {
  /**
   * Creates an instance of OnchainLobVaultWebSocketService.
   * @param baseUrl - The base URL for the WebSocket connection.
   * @param startImmediately - Whether to start the WebSocket client immediately.
   */
  constructor(baseUrl, startImmediately = true) {
    this.baseUrl = baseUrl;
    /**
     * Event emitters for various WebSocket events.
     */
    __publicField(this, "events", {
      vaultTotalValuesUpdated: new EventEmitter(),
      vaultDepositActionsUpdated: new EventEmitter(),
      vaultDepositorsUpdated: new EventEmitter(),
      vaultHistoryUpdated: new EventEmitter(),
      subscriptionError: new EventEmitter()
    });
    /**
     * The WebSocket client used to communicate with the Onchain LOB vault.
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
          case "vaultTotalValues":
            this.events.vaultTotalValuesUpdated.emit(message.isSnapshot, message.data);
            break;
          case "vaultDepositActions":
            this.events.vaultDepositActionsUpdated.emit(message.isSnapshot, message.data);
            break;
          case "vaultDepositors":
            this.events.vaultDepositorsUpdated.emit(message.isSnapshot, message.data);
            break;
          case "vaultHistory":
            this.events.vaultHistoryUpdated.emit(message.isSnapshot, message.data);
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
   * Subscribes to vault total values updates.
   * @param params - The parameters for the vault total values subscription.
   */
  subscribeToVaultTotalValues(_params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "vaultTotalValues"
    });
  }
  /**
   * Unsubscribes from vault total values updates.
   * @param params - The parameters for the vault total values unsubscription.
   */
  unsubscribeFromVaultTotalValues(_params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "vaultTotalValues"
    });
  }
  /**
   * Subscribes to vault deposit actions updates.
   * @param params - The parameters for the vault deposit actions subscription.
   */
  subscribeToVaultDepositActions(_params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "vaultDepositActions"
    });
  }
  /**
   * Unsubscribes from vault deposit actions updates.
   * @param params - The parameters for the vault deposit actions unsubscription.
   */
  unsubscribeFromVaultDepositActions(_params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "vaultDepositActions"
    });
  }
  /**
   * Subscribes to vault depositors updates.
   * @param params - The parameters for the vault depositors subscription.
   */
  subscribeToVaultDepositors(_params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "vaultDepositors"
    });
  }
  /**
   * Unsubscribes from vault depositors updates.
   * @param params - The parameters for the vault depositors unsubscription.
   */
  unsubscribeFromVaultDepositors(_params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "vaultDepositors"
    });
  }
  /**
   * Subscribes to vault history updates.
   * @param params - The parameters for the vault history subscription.
   */
  subscribeToVaultHistory(_params) {
    this.startOnchainLobWebSocketClientIfNeeded();
    this.onchainLobWebSocketClient.subscribe({
      channel: "vaultHistory"
    });
  }
  /**
   * Unsubscribes from vault history updates.
   * @param params - The parameters for the vault history unsubscription.
   */
  unsubscribeFromVaultHistory(_params) {
    this.onchainLobWebSocketClient.unsubscribe({
      channel: "vaultHistory"
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
import BigNumber4 from "bignumber.js";
import { max } from "lodash";
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
  const maxFeeRate = max([
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
  const price = new BigNumber4(priceInput).dp(priceScalingFactor, BigNumber4.ROUND_DOWN);
  const tokenXReceive = new BigNumber4(tokenXInput).dp(tokenXScalingFactor, BigNumber4.ROUND_DOWN);
  const minTokenYPay = price.times(tokenXReceive).dp(tokenYScalingFactor, BigNumber4.ROUND_CEIL);
  const maxFee = minTokenYPay.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, BigNumber4.ROUND_CEIL);
  const maxTokenYPay = minTokenYPay.plus(maxFee).dp(tokenYScalingFactor, BigNumber4.ROUND_CEIL);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXReceive: tokenXReceive.toNumber(),
    maxTokenYPay: maxTokenYPay.toNumber(),
    minTokenYPay: minTokenYPay.toNumber()
  };
};
var calculateBuyLimitDetailsTokenYInput = (priceInput, tokenYInput, priceScalingFactor, tokenXScalingFactor, tokenYScalingFactor, maxFeeRate) => {
  const price = new BigNumber4(priceInput).dp(priceScalingFactor, BigNumber4.ROUND_DOWN);
  const maxTokenYPay = new BigNumber4(tokenYInput).dp(tokenYScalingFactor, BigNumber4.ROUND_FLOOR);
  const minTokenYPay = maxTokenYPay.div(new BigNumber4(1).plus(maxFeeRate)).dp(tokenYScalingFactor, BigNumber4.ROUND_CEIL);
  const tokenXReceive = minTokenYPay.div(price).dp(tokenXScalingFactor, BigNumber4.ROUND_DOWN);
  const maxFee = minTokenYPay.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, BigNumber4.ROUND_CEIL);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXReceive: tokenXReceive.toNumber(),
    maxTokenYPay: maxTokenYPay.toNumber(),
    minTokenYPay: minTokenYPay.toNumber()
  };
};
var calculateSellLimitDetailsTokenXInput = (priceInput, tokenXInput, priceScalingFactor, tokenXScalingFactor, tokenYScalingFactor, maxFeeRate) => {
  const price = new BigNumber4(priceInput).dp(priceScalingFactor, BigNumber4.ROUND_DOWN);
  const tokenXPay = new BigNumber4(tokenXInput).dp(tokenXScalingFactor, BigNumber4.ROUND_DOWN);
  const maxTokenYReceive = price.times(tokenXPay).dp(tokenYScalingFactor, BigNumber4.ROUND_FLOOR);
  const maxFee = maxTokenYReceive.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, BigNumber4.ROUND_CEIL);
  const minTokenYReceive = maxTokenYReceive.minus(maxFee).dp(tokenYScalingFactor, BigNumber4.ROUND_FLOOR);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXPay: tokenXPay.toNumber(),
    maxTokenYReceive: maxTokenYReceive.toNumber(),
    minTokenYReceive: minTokenYReceive.toNumber()
  };
};
var calculateSellLimitDetailsTokenYInput = (priceInput, tokenYInput, priceScalingFactor, tokenXScalingFactor, tokenYScalingFactor, maxFeeRate) => {
  const price = new BigNumber4(priceInput).dp(priceScalingFactor, BigNumber4.ROUND_DOWN);
  const minTokenYReceive = new BigNumber4(tokenYInput).dp(tokenYScalingFactor, BigNumber4.ROUND_DOWN);
  const maxTokenYReceive = minTokenYReceive.div(new BigNumber4(1).minus(maxFeeRate)).dp(tokenYScalingFactor, BigNumber4.ROUND_FLOOR);
  const tokenXPay = maxTokenYReceive.div(price).dp(tokenXScalingFactor, BigNumber4.ROUND_UP);
  const maxFee = maxTokenYReceive.times(maxFeeRate).dp(tokenXScalingFactor + priceScalingFactor, BigNumber4.ROUND_CEIL);
  return {
    price: price.toNumber(),
    maxFee: maxFee.toNumber(),
    tokenXPay: tokenXPay.toNumber(),
    maxTokenYReceive: maxTokenYReceive.toNumber(),
    minTokenYReceive: minTokenYReceive.toNumber()
  };
};

// src/spot/marketDetails.ts
import BigNumber5 from "bignumber.js";
import { ceil, floor } from "lodash";
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
  const tokenXReceive = new BigNumber5(tokenXInput).dp(tokenXScalingFactor, BigNumber5.ROUND_FLOOR);
  const { estPrice, estTokenYAmount, estWorstPrice, estSlippage } = calculateEstValuesFromTokenX(
    tokenXReceive.toNumber(),
    orderbookSide,
    bestAsk
  );
  if (useAutoSlippage) {
    autoSlippage = calculateAutoSlippage(estSlippage);
    slippage = autoSlippage;
  }
  const worstPrice = new BigNumber5(bestAsk).times(new BigNumber5(1).plus(new BigNumber5(slippage).div(100))).dp(priceScalingFactor, BigNumber5.ROUND_CEIL);
  const tokenYPayWithoutFee = tokenXReceive.times(worstPrice).dp(tokenYScalingFactor, BigNumber5.ROUND_CEIL);
  const [tokenYPay, fee] = calculateValueWithFee(
    tokenYPayWithoutFee,
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  const [estTokenYPay, estFee] = calculateValueWithFee(
    new BigNumber5(estTokenYAmount),
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  return {
    fee: fee.toNumber(),
    estFee: estFee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: ceil(estPrice, priceScalingFactor),
    estWorstPrice: ceil(estWorstPrice, priceScalingFactor),
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
  const tokenYPay = new BigNumber5(tokenYInput).dp(tokenYScalingFactor, BigNumber5.ROUND_FLOOR);
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
  const worstPrice = new BigNumber5(bestAsk).times(new BigNumber5(1).plus(new BigNumber5(slippage).div(100))).dp(priceScalingFactor, BigNumber5.ROUND_CEIL);
  const tokenXReceive = tokenYWithoutFee.div(worstPrice).dp(tokenXScalingFactor, BigNumber5.ROUND_FLOOR);
  const estTokenXReceive = new BigNumber5(estTokenXAmount).dp(tokenXScalingFactor, BigNumber5.ROUND_FLOOR);
  return {
    fee: fee.toNumber(),
    estFee: fee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: ceil(estPrice, priceScalingFactor),
    estWorstPrice: ceil(estWorstPrice, priceScalingFactor),
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
  const tokenXPay = new BigNumber5(tokenXInput).dp(tokenXScalingFactor, BigNumber5.ROUND_FLOOR);
  const { estPrice, estSlippage, estTokenYAmount, estWorstPrice } = calculateEstValuesFromTokenX(
    tokenXPay.toNumber(),
    orderbookSide,
    bestBid
  );
  if (useAutoSlippage) {
    autoSlippage = calculateAutoSlippage(estSlippage);
    slippage = autoSlippage;
  }
  const worstPrice = new BigNumber5(bestBid).times(new BigNumber5(1).minus(new BigNumber5(slippage).div(100))).dp(priceScalingFactor, BigNumber5.ROUND_FLOOR);
  const tokenYReceive = tokenXPay.times(worstPrice).dp(tokenYScalingFactor, BigNumber5.ROUND_FLOOR);
  const [tokenYReceiveWithoutFee, fee] = calculateValueAfterFee(
    tokenYReceive,
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  const [estTokenYReceiveWithoutFee, estFee] = calculateValueAfterFee(
    new BigNumber5(estTokenYAmount),
    feeRate,
    tokenXScalingFactor + priceScalingFactor,
    tokenYScalingFactor
  );
  return {
    fee: fee.toNumber(),
    estFee: estFee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: floor(estPrice, priceScalingFactor),
    estWorstPrice: floor(estWorstPrice, priceScalingFactor),
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
  const tokenYReceive = new BigNumber5(tokenYInput).dp(tokenYScalingFactor, BigNumber5.ROUND_FLOOR);
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
  const worstPrice = new BigNumber5(bestBid).times(new BigNumber5(1).minus(new BigNumber5(slippage).div(100))).dp(priceScalingFactor, BigNumber5.ROUND_FLOOR);
  const tokenXPay = tokenYReceiveBeforeFee.div(worstPrice).dp(tokenXScalingFactor, BigNumber5.ROUND_CEIL);
  const estTokenXPay = new BigNumber5(estTokenXAmount).dp(tokenXScalingFactor, BigNumber5.ROUND_CEIL);
  return {
    fee: fee.toNumber(),
    estFee: fee.toNumber(),
    worstPrice: worstPrice.toNumber(),
    estPrice: floor(estPrice, priceScalingFactor),
    estWorstPrice: floor(estWorstPrice, priceScalingFactor),
    estSlippage,
    autoSlippage,
    tokenXPay: tokenXPay.toNumber(),
    estTokenXPay: estTokenXPay.toNumber(),
    tokenYReceive: tokenYReceive.toNumber(),
    estTokenYReceive: tokenYReceive.toNumber()
  };
};
var calculateEstValuesFromTokenX = (tokenX, orderbookSide, initialPrice) => {
  let totalCost = new BigNumber5(0);
  let tokenXLeft = new BigNumber5(tokenX);
  let estWorstPrice = new BigNumber5(0);
  for (const level of orderbookSide) {
    const price = new BigNumber5(level.price);
    const size = new BigNumber5(level.size);
    const tradeQuantity = BigNumber5.min(tokenXLeft, size);
    totalCost = totalCost.plus(tradeQuantity.times(price));
    tokenXLeft = tokenXLeft.minus(tradeQuantity);
    estWorstPrice = price;
    if (tokenXLeft.lte(0)) break;
  }
  const estPrice = totalCost.div(new BigNumber5(tokenX).minus(tokenXLeft));
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
  let totalQuantity = new BigNumber5(0);
  let tokenYLeft = new BigNumber5(tokenY);
  let estWorstPrice = new BigNumber5(0);
  for (const level of orderbookSide) {
    const price = new BigNumber5(level.price);
    const size = new BigNumber5(level.size);
    const tradeCost = BigNumber5.min(tokenYLeft, size.times(price));
    totalQuantity = totalQuantity.plus(tradeCost.div(price));
    tokenYLeft = tokenYLeft.minus(tradeCost);
    estWorstPrice = price;
    if (tokenYLeft.lte(0)) break;
  }
  const estPrice = new BigNumber5(tokenY).minus(tokenYLeft).div(totalQuantity);
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
  const fee = value.times(feeRate).dp(feeDecimalPlaces, BigNumber5.ROUND_CEIL);
  const valueWithFee = value.plus(fee).dp(valueDecimalPlaces, BigNumber5.ROUND_CEIL);
  return [valueWithFee, fee];
};
var calculateValueAfterFee = (value, feeRate, feeDecimalPlaces, valueDecimalPlaces) => {
  const fee = value.times(feeRate).dp(feeDecimalPlaces, BigNumber5.ROUND_CEIL);
  const valueAfterFee = value.minus(fee).dp(valueDecimalPlaces, BigNumber5.ROUND_FLOOR);
  return [valueAfterFee, fee];
};
var calculateValueBeforeFee = (value, feeRate, feeDecimalPlaces, valueDecimalPlaces) => {
  const valueBeforeFee = value.div(new BigNumber5(1).minus(feeRate)).dp(valueDecimalPlaces, BigNumber5.ROUND_CEIL);
  const fee = valueBeforeFee.minus(value).dp(feeDecimalPlaces, BigNumber5.ROUND_CEIL);
  return [valueBeforeFee, fee];
};
var calculateAutoSlippage = (estSlippage) => {
  const diff = new BigNumber5(estSlippage).times(new BigNumber5(AUTO_SLIPPAGE_INCREASE_PERCENT).div(100));
  const autoSlippage = new BigNumber5(estSlippage).plus(diff).dp(AUTO_SLIPPAGE_DECIMAL, BigNumber5.ROUND_CEIL);
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

// src/vault/depositDetails.ts
import BigNumber8 from "bignumber.js";

// src/vault/feeCalculation.ts
import BigNumber6 from "bignumber.js";
function getFeeBasisPoints({
  totalValue,
  initialTokenValue,
  nextTokenValue,
  targetTokenWeight,
  totalWeight,
  feeBasisPoints,
  taxBasisPoints,
  dynamicFeesEnabled
}) {
  if (!dynamicFeesEnabled) {
    return feeBasisPoints;
  }
  const targetTokenValue = totalValue.times(targetTokenWeight).div(totalWeight);
  if (targetTokenValue.isZero()) {
    return feeBasisPoints;
  }
  const initialDiff = initialTokenValue.minus(targetTokenValue).abs();
  const nextDiff = nextTokenValue.minus(targetTokenValue).abs();
  if (nextDiff.lt(initialDiff)) {
    const rebateBps = initialDiff.times(taxBasisPoints).div(targetTokenValue);
    return safeSubtract(feeBasisPoints, rebateBps);
  }
  let averageDiff = initialDiff.plus(nextDiff).div(2);
  if (averageDiff.gt(targetTokenValue)) {
    averageDiff = targetTokenValue;
  }
  const taxBps = averageDiff.times(taxBasisPoints).div(targetTokenValue);
  return feeBasisPoints.plus(taxBps);
}
function safeSubtract(a, b) {
  return a.gt(b) ? a.minus(b) : BigNumber6(0);
}

// src/utils/binarySearch.ts
import BigNumber7 from "bignumber.js";
var binarySearch = (f, target, left, right, precision = 18) => {
  const step = BigNumber7(10).pow(-precision);
  while (left.isLessThanOrEqualTo(right)) {
    const mid = left.plus(right).div(2).dp(precision, BigNumber7.ROUND_FLOOR);
    const res = f(mid);
    if (res.isEqualTo(target)) {
      return mid;
    }
    if (res.isLessThan(target)) {
      left = mid.plus(step);
    } else {
      right = mid.minus(step);
    }
  }
  return null;
};

// src/vault/depositDetails.ts
import { parseUnits as parseUnits2 } from "ethers";

// src/vault/constants.ts
var USD_DECIMALS = 18;

// src/vault/depositDetails.ts
var getDepositDetails = ({
  fee,
  inputs,
  isLpTokenInput,
  tokenPriceUSD,
  totalSupply,
  totalValue,
  targetTokenWeight,
  totalWeight,
  tokenValue,
  tokenDecimals,
  lpTokenDecimals
}) => {
  const { tokenInput, lpInput } = inputs;
  const maxFeeBps = fee.feeBps.plus(fee.taxBps).plus(fee.adminBurnLPFeeBps).plus(fee.adminMintLPFeeBps);
  let details = { tokenSpend: BigNumber8(0), lpReceive: BigNumber8(0), fee: BigNumber8(0), params: { amount: 0n, amountUsd: 0n, minLpMinted: 0n } };
  const calculateFeeAmountUSD = (amountUSD) => {
    const dinamicFeeBps = getFeeBasisPoints({
      totalValue,
      initialTokenValue: tokenValue,
      nextTokenValue: tokenValue.plus(amountUSD),
      targetTokenWeight,
      totalWeight,
      feeBasisPoints: fee.feeBps,
      taxBasisPoints: fee.taxBps,
      dynamicFeesEnabled: fee.dynamicFeesEnabled
    });
    const feeBps = dinamicFeeBps.plus(fee.adminMintLPFeeBps);
    const feeAmountUSD = amountUSD.times(feeBps);
    return feeAmountUSD;
  };
  if (isLpTokenInput) {
    const lpAmount = BigNumber8(lpInput).dp(lpTokenDecimals, BigNumber8.ROUND_FLOOR);
    const tokenAmountUSDWithoutFee = lpAmount.times(totalValue).div(totalSupply).dp(USD_DECIMALS, BigNumber8.ROUND_FLOOR);
    const tokenAmountUSD = binarySearch(
      (x) => {
        const amountUSD = BigNumber8(x);
        const feeAmountUSD2 = calculateFeeAmountUSD(amountUSD).dp(USD_DECIMALS, BigNumber8.ROUND_FLOOR);
        return amountUSD.minus(feeAmountUSD2).minus(tokenAmountUSDWithoutFee);
      },
      BigNumber8(0),
      tokenAmountUSDWithoutFee,
      tokenAmountUSDWithoutFee.times(BigNumber8(1).plus(maxFeeBps))
    );
    if (tokenAmountUSD === null) return details;
    const tokenSpend = tokenAmountUSD.div(tokenPriceUSD).dp(tokenDecimals, BigNumber8.ROUND_FLOOR);
    const feeAmountUSD = BigNumber8(tokenAmountUSD).minus(tokenAmountUSDWithoutFee).dp(USD_DECIMALS, BigNumber8.ROUND_FLOOR);
    const feeAmount = feeAmountUSD.div(tokenPriceUSD).dp(tokenDecimals, BigNumber8.ROUND_FLOOR);
    details = { ...details, tokenSpend, lpReceive: lpAmount, fee: feeAmount };
  } else {
    const amount = BigNumber8(tokenInput).dp(tokenDecimals, BigNumber8.ROUND_FLOOR);
    const amountUSD = amount.times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber8.ROUND_FLOOR);
    const feeAmountUSD = calculateFeeAmountUSD(amountUSD).dp(USD_DECIMALS, BigNumber8.ROUND_FLOOR);
    const feeAmount = feeAmountUSD.div(tokenPriceUSD).dp(tokenDecimals, BigNumber8.ROUND_FLOOR);
    const lpAmount = amountUSD.minus(feeAmountUSD).times(totalSupply).div(totalValue).dp(lpTokenDecimals, BigNumber8.ROUND_FLOOR);
    details = { ...details, tokenSpend: amount, lpReceive: lpAmount, fee: feeAmount };
  }
  details.params = getParams(
    details.tokenSpend,
    details.tokenSpend.times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber8.ROUND_FLOOR),
    details.lpReceive,
    inputs.slippageBps,
    tokenDecimals,
    lpTokenDecimals
  );
  return details;
};
var getParams = (amount, amountUSD, lpAmount, slippage, tokenDecimals, lpTokenDecimals) => {
  const minLpMintedWithSlippage = lpAmount.times(BigNumber8(1).minus(slippage)).dp(lpTokenDecimals, BigNumber8.ROUND_FLOOR);
  return {
    amount: parseUnits2(amount.toString(), tokenDecimals),
    amountUsd: parseUnits2(amountUSD.toString(), USD_DECIMALS),
    minLpMinted: parseUnits2(minLpMintedWithSlippage.toString(), lpTokenDecimals)
  };
};

// src/vault/withdrawDetails.ts
import BigNumber9 from "bignumber.js";
import { parseUnits as parseUnits3 } from "ethers";
var getWithdrawDetails = ({
  fee,
  inputs,
  isLpTokenInput,
  tokenPriceUSD,
  totalSupply,
  totalValue,
  targetTokenWeight,
  totalWeight,
  tokenValue,
  tokenDecimals,
  lpTokenDecimals
}) => {
  const { tokenInput, lpInput } = inputs;
  const maxFeeBps = fee.feeBps.plus(fee.taxBps).plus(fee.adminBurnLPFeeBps).plus(fee.adminMintLPFeeBps);
  let details = { lpSpend: BigNumber9(0), tokenReceive: BigNumber9(0), fee: BigNumber9(0), params: { minTokenGet: 0n, minUsdValue: 0n, burnLP: 0n } };
  const calculateFeeAmountUSD = (amountUSD) => {
    const dinamicFeeBps = getFeeBasisPoints({
      totalValue,
      initialTokenValue: tokenValue,
      nextTokenValue: tokenValue.minus(amountUSD),
      targetTokenWeight,
      totalWeight,
      feeBasisPoints: fee.feeBps,
      taxBasisPoints: fee.taxBps,
      dynamicFeesEnabled: fee.dynamicFeesEnabled
    });
    const feeBps = dinamicFeeBps.plus(fee.adminBurnLPFeeBps);
    const feeAmount = amountUSD.times(feeBps);
    return feeAmount;
  };
  if (isLpTokenInput) {
    const lpAmount = BigNumber9(lpInput).dp(lpTokenDecimals, BigNumber9.ROUND_FLOOR);
    const tokenAmountUSDWithoutFee = lpAmount.times(totalValue).div(totalSupply).dp(tokenDecimals, BigNumber9.ROUND_FLOOR);
    const tokenAmountUSD = binarySearch(
      (x) => {
        const amountUSD = BigNumber9(x);
        const feeAmount2 = calculateFeeAmountUSD(amountUSD).dp(USD_DECIMALS, BigNumber9.ROUND_FLOOR);
        return amountUSD.minus(feeAmount2).minus(tokenAmountUSDWithoutFee);
      },
      BigNumber9(0),
      tokenAmountUSDWithoutFee,
      tokenAmountUSDWithoutFee.times(BigNumber9(1).plus(maxFeeBps))
    );
    if (tokenAmountUSD === null) return details;
    const feeAmount = BigNumber9(tokenAmountUSD).minus(tokenAmountUSDWithoutFee);
    const tokenReceive = tokenAmountUSDWithoutFee.div(tokenPriceUSD).dp(tokenDecimals, BigNumber9.ROUND_FLOOR);
    details = { ...details, lpSpend: lpAmount, tokenReceive, fee: feeAmount };
  } else {
    const amount = BigNumber9(tokenInput);
    const tokenAmountUSDWithoutFee = amount.times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber9.ROUND_FLOOR);
    const tokenAmountUSD = binarySearch(
      (x) => {
        const amountUSD = BigNumber9(x);
        const feeAmount2 = calculateFeeAmountUSD(amountUSD).dp(tokenDecimals, BigNumber9.ROUND_FLOOR);
        ;
        return amountUSD.minus(feeAmount2).minus(tokenAmountUSDWithoutFee);
      },
      BigNumber9(0),
      tokenAmountUSDWithoutFee,
      tokenAmountUSDWithoutFee.times(BigNumber9(1).plus(maxFeeBps))
    );
    if (tokenAmountUSD === null) return details;
    const feeAmount = calculateFeeAmountUSD(BigNumber9(tokenAmountUSD));
    const lpAmount = tokenAmountUSDWithoutFee.times(totalSupply).div(totalValue).dp(lpTokenDecimals, BigNumber9.ROUND_FLOOR);
    details = { ...details, lpSpend: lpAmount, tokenReceive: amount, fee: feeAmount };
  }
  details.params = getParams2(
    details.tokenReceive.plus(details.fee),
    details.tokenReceive.plus(details.fee).times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber9.ROUND_FLOOR),
    details.lpSpend,
    inputs.slippageBps,
    tokenDecimals,
    lpTokenDecimals
  );
  return details;
};
var getParams2 = (amount, amountUSD, lpAmount, slippage, tokenDecimals, lpTokenDecimals) => {
  const minTokenGetWithSlippage = amount.times(BigNumber9(1).minus(slippage)).dp(tokenDecimals, BigNumber9.ROUND_FLOOR);
  const minUsdValueWithSlippage = amountUSD.times(BigNumber9(1).minus(slippage)).dp(USD_DECIMALS, BigNumber9.ROUND_FLOOR);
  return {
    burnLP: parseUnits3(lpAmount.toString(), lpTokenDecimals),
    minTokenGet: parseUnits3(minTokenGetWithSlippage.toString(), tokenDecimals),
    minUsdValue: parseUnits3(minUsdValueWithSlippage.toString(), USD_DECIMALS)
  };
};

// src/vault/onchainLobVaultContract.ts
import { Contract as Contract2 } from "ethers";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
var getExpires2 = () => BigInt(Math.floor(Date.now() / 1e3) + 5 * 60);
var _OnchainLobVaultContract = class _OnchainLobVaultContract {
  constructor(options) {
    __publicField(this, "vault");
    __publicField(this, "autoWaitTransaction");
    __publicField(this, "fastWaitTransaction");
    __publicField(this, "fastWaitTransactionInterval");
    __publicField(this, "fastWaitTransactionTimeout");
    __publicField(this, "signer");
    __publicField(this, "vaultContract");
    __publicField(this, "_chainId");
    __publicField(this, "pythConnection");
    this.vault = options.vault;
    this.signer = options.signer;
    this.autoWaitTransaction = options.autoWaitTransaction ?? _OnchainLobVaultContract.defaultAutoWaitTransaction;
    this.fastWaitTransaction = options.fastWaitTransaction ?? _OnchainLobVaultContract.defaultFastWaitTransaction;
    this.fastWaitTransactionInterval = options.fastWaitTransactionInterval ?? _OnchainLobVaultContract.defaultFastWaitTransactionInterval;
    this.fastWaitTransactionTimeout = options.fastWaitTransactionTimeout;
    this.vaultContract = new Contract2(options.vault.vaultAddress, lpManagerAbi, options.signer);
    this.pythConnection = new EvmPriceServiceConnection("https://hermes.pyth.network");
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
    let token = this.vault.tokens.find((token2) => token2.contractAddress === params.token);
    if (params.token === this.vault.lpToken.contractAddress) {
      token = this.vault.lpToken;
    }
    if (!token) {
      throw Error("Token is not in the pool and not a LP token.");
    }
    const tokenContract = new Contract2(
      token.contractAddress,
      erc20Abi,
      this.signer
    );
    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.approve(
        params.vault,
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
  async wrapNativeToken(params) {
    const tokenContract = new Contract2(
      params.token.contractAddress,
      erc20WethAbi,
      this.signer
    );
    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, params.token.decimals);
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
    const tokenContract = new Contract2(
      params.token.contractAddress,
      erc20WethAbi,
      this.signer
    );
    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, params.token.decimals);
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
  async addLiquidity(params) {
    const token = this.vault.tokens.find((token2) => token2.contractAddress === params.token);
    if (!token) {
      throw Error("Token is not in the pool.");
    }
    const tokenId = this.vault.tokenIds.find((tokenId2) => tokenId2.tokenAddress === token.contractAddress);
    if (!tokenId) {
      throw Error("Token Id not found.");
    }
    const priceUpdateFeedIds = this.vault.tokens.map((t) => t.priceFeed || "");
    const priceUpdateData = await this.getPriceUpdateData(priceUpdateFeedIds);
    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const amountUsd = this.convertTokensAmountToRawAmountIfNeeded(params.amountUsd, 18);
    const minLpMinted = this.convertTokensAmountToRawAmountIfNeeded(params.minLpMinted, this.vault.lpToken.decimals);
    const expires = getExpires2();
    const tx = await this.processContractMethodCall(
      this.vaultContract,
      this.vaultContract.addLiquidity(
        BigInt(tokenId.id),
        amount,
        amountUsd,
        minLpMinted,
        expires,
        priceUpdateData,
        {
          value: priceUpdateFeedIds.length,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas
        }
      )
    );
    return tx;
  }
  async removeLiquidity(params) {
    const token = this.vault.tokens.find((token2) => token2.contractAddress === params.token);
    if (!token) {
      throw Error("Token is not in the pool.");
    }
    const tokenId = this.vault.tokenIds.find((tokenId2) => tokenId2.tokenAddress === token.contractAddress);
    if (!tokenId) {
      throw Error("Token Id not found.");
    }
    const priceUpdateFeedIds = this.vault.tokens.map((t) => t.priceFeed || "");
    const priceUpdateData = await this.getPriceUpdateData(priceUpdateFeedIds);
    const burnLP = this.convertTokensAmountToRawAmountIfNeeded(params.burnLP, this.vault.lpToken.decimals);
    const minUsdValue = this.convertTokensAmountToRawAmountIfNeeded(params.minUsdValue, 18);
    const minTokenGet = this.convertTokensAmountToRawAmountIfNeeded(params.minTokenGet, token.decimals);
    const expires = getExpires2();
    const tx = await this.processContractMethodCall(
      this.vaultContract,
      this.vaultContract.removeLiquidity(
        BigInt(tokenId.id),
        burnLP,
        minUsdValue,
        minTokenGet,
        expires,
        priceUpdateData,
        {
          value: priceUpdateFeedIds.length,
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
          throw new Error(`${decodedError ? `${decodedError.name} [${decodedError.selector}]` : `Unknown error: [${error.data}]`}`);
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
  async getPriceUpdateData(feedPriceIds) {
    try {
      const updateData = await this.pythConnection.getPriceFeedsUpdateData(feedPriceIds);
      return updateData;
    } catch (error) {
      console.error("Failed to get price update data from pyth:", error);
      throw error;
    }
  }
};
__publicField(_OnchainLobVaultContract, "defaultAutoWaitTransaction", true);
__publicField(_OnchainLobVaultContract, "defaultFastWaitTransaction", false);
__publicField(_OnchainLobVaultContract, "defaultFastWaitTransactionInterval", 100);
var OnchainLobVaultContract = _OnchainLobVaultContract;

// src/vault/mappers.ts
var mappers_exports2 = {};
__export(mappers_exports2, {
  mapTokenDtoToToken: () => mapTokenDtoToToken2,
  mapVaultDepositActionDtoToVaultDepositAction: () => mapVaultDepositActionDtoToVaultDepositAction,
  mapVaultDepositActionUpdateDtoToVaultDepositActionUpdate: () => mapVaultDepositActionUpdateDtoToVaultDepositActionUpdate,
  mapVaultDepositorDtoToVaultDepositor: () => mapVaultDepositorDtoToVaultDepositor,
  mapVaultDepositorUpdateDtoToVaultDepositorUpdate: () => mapVaultDepositorUpdateDtoToVaultDepositorUpdate,
  mapVaultTotalValuesDtoToVaultTotalValues: () => mapVaultTotalValuesDtoToVaultTotalValues,
  mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate: () => mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate
});
var mapTokenDtoToToken2 = (dto) => {
  return dto;
};
var mapVaultTotalValuesDtoToVaultTotalValues = (dto, tokens, lpToken) => {
  return {
    ...dto,
    rawTotalSupply: BigInt(dto.totalSupply),
    totalSupply: tokenUtils_exports.convertTokensRawAmountToAmount(dto.totalSupply, lpToken.decimals),
    tokens: dto.tokens.map((dtoToken) => ({
      ...dtoToken,
      rawTokenBalance: BigInt(dtoToken.tokenBalance),
      tokenBalance: tokenUtils_exports.convertTokensRawAmountToAmount(
        dtoToken.tokenBalance,
        tokens.find((token) => token.contractAddress === dtoToken.address).decimals
      ),
      rawTokenReserved: BigInt(dtoToken.tokenReserved),
      tokenReserved: tokenUtils_exports.convertTokensRawAmountToAmount(
        dtoToken.tokenReserved,
        tokens.find((token) => token.contractAddress === dtoToken.address).decimals
      )
    }))
  };
};
var mapVaultDepositActionDtoToVaultDepositAction = (dto, tokenDecimals, lpDecimals) => {
  return {
    ...dto,
    rawTokenAmount: BigInt(dto.tokenAmount),
    tokenAmount: tokenUtils_exports.convertTokensRawAmountToAmount(dto.tokenAmount, tokenDecimals),
    rawLpAmount: BigInt(dto.lpAmount),
    lpAmount: tokenUtils_exports.convertTokensRawAmountToAmount(dto.lpAmount, lpDecimals)
  };
};
var mapVaultDepositorDtoToVaultDepositor = (dto, lpDecimals) => {
  return {
    ...dto,
    rawLpAmount: BigInt(dto.lpAmount),
    lpAmount: tokenUtils_exports.convertTokensRawAmountToAmount(dto.lpAmount, lpDecimals)
  };
};
var mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate = (dto, tokens, lpToken) => mapVaultTotalValuesDtoToVaultTotalValues(dto, tokens, lpToken);
var mapVaultDepositActionUpdateDtoToVaultDepositActionUpdate = (dto, tokenDecimals, lpDecimals) => mapVaultDepositActionDtoToVaultDepositAction(dto, tokenDecimals, lpDecimals);
var mapVaultDepositorUpdateDtoToVaultDepositorUpdate = (dto, lpDecimals) => mapVaultDepositorDtoToVaultDepositor(dto, lpDecimals);

// src/vault/onchainLobVault.ts
var OnchainLobVault = class {
  constructor(options) {
    /**
     * The events related to user subscriptions.
     *
     * These events are emitted when data is updated related to subscriptions.
     */
    __publicField(this, "events", {
      vaultTotalValuesUpdated: new EventEmitter(),
      vaultDepositActionsUpdated: new EventEmitter(),
      vaultDepositorsUpdated: new EventEmitter(),
      vaultHistoryUpdated: new EventEmitter(),
      subscriptionError: new EventEmitter()
    });
    /**
     * Indicates whether transactions should be automatically waited for by the client.
     * When true, transactions will be automatically waited for by the client until confirmation is received.
     * When false, transactions will not be waited for by the client.
     * If not set, the default value will be used.
     * This flag is used by the Onchain LOB Vault contract.
     *
     * Note: "Wait" means that the client will wait until the transaction confirmation is received.
     */
    __publicField(this, "autoWaitTransaction");
    __publicField(this, "signer");
    __publicField(this, "onchainLobService");
    __publicField(this, "onchainLobWebSocketService");
    __publicField(this, "vaultContract");
    __publicField(this, "mappers");
    __publicField(this, "cachedVaultConfig");
    __publicField(this, "cachedVaultConfigPromise");
    __publicField(this, "onVaultTotalValuesUpdated", async (isSnapshot, data) => {
      try {
        const vaultConfig = await this.getCachedVaultConfig();
        if (!vaultConfig)
          return;
        const totalValuesUpdates = this.mappers.mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate(data, vaultConfig.tokens, vaultConfig.lpToken);
        this.events.vaultTotalValuesUpdated.emit(isSnapshot, totalValuesUpdates);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onVaultDepositActionsUpdated", async (isSnapshot, data) => {
      try {
        const vaultConfig = await this.getCachedVaultConfig();
        if (!vaultConfig)
          return;
        const depositActionUpdates = data.map(
          (depositActionDto) => {
            const token = vaultConfig.tokens.find((token2) => token2.symbol === depositActionDto.tokenSymbol);
            return mapVaultDepositActionDtoToVaultDepositAction(depositActionDto, token.decimals, vaultConfig.lpToken.decimals);
          }
        );
        this.events.vaultDepositActionsUpdated.emit(isSnapshot, depositActionUpdates);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onVaultDepositorsUpdated", async (isSnapshot, data) => {
      try {
        const vaultConfig = await this.getCachedVaultConfig();
        if (!vaultConfig)
          return;
        const depositorsUpdates = data.map(
          (depositorDto) => mapVaultDepositorDtoToVaultDepositor(depositorDto, vaultConfig.lpToken.decimals)
        );
        this.events.vaultDepositorsUpdated.emit(isSnapshot, depositorsUpdates);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onVaultHistoryUpdated", (isSnapshot, data) => {
      try {
        this.events.vaultHistoryUpdated.emit(isSnapshot, data);
      } catch (error) {
        console.error(getErrorLogMessage(error));
      }
    });
    __publicField(this, "onSubscriptionError", (error) => {
      this.events.subscriptionError.emit(error);
    });
    this.signer = options.signer;
    this.autoWaitTransaction = options.autoWaitTransaction;
    this.onchainLobService = new OnchainLobVaultService(options.apiBaseUrl);
    this.onchainLobWebSocketService = new OnchainLobVaultWebSocketService(options.webSocketApiBaseUrl);
    this.mappers = mappers_exports2;
    this.attachEvents();
  }
  /**
   * Sets a new signer for the OnchainLobVault instance.
   *
   * @param {Signer | null} signer - The new signer to be set. For only http/ws operations, you can set this to null.
   * @returns {OnchainLobVault} Returns the OnchainLobVault instance for method chaining.
   */
  setSigner(signer) {
    this.signer = signer;
    return this;
  }
  /**
  * Approves the specified amount of tokens for the corresponding vault contract.
  * You need to approve the tokens before you can deposit or withdraw.
  *
  * @param {ApproveVaultParams} params - The parameters for approving tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async approveTokens(params) {
    const vaultContract = await this.getVaultContract();
    return vaultContract.approveTokens(params);
  }
  /**
   * Deposit tokens amount into the vault
   *
   * @param {AddLiquidityVaultParams} params - The parameters for deposit.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async addLiquidity(params) {
    const vaultContract = await this.getVaultContract();
    return vaultContract.addLiquidity(params);
  }
  /**
  * Wraps the specified amount of native tokens.
  * You need to wrap the tokens before you can deposit.
  *
  * @param {WrapNativeTokenVaultParams} params - The parameters for wrapping tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async wrapNativeTokens(params) {
    const vaultContract = await this.getVaultContract();
    return vaultContract.wrapNativeToken(params);
  }
  /**
    * Unwraps the specified amount of native tokens.
    * You need to unwrap the tokens after withdrawal to get native tokens.
    *
    * @param {UnwrapNativeTokenVaultParams} params - The parameters for unwrapping tokens.
    * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
    */
  async unwrapNativeTokens(params) {
    const vaultContract = await this.getVaultContract();
    return vaultContract.unwrapNativeToken(params);
  }
  /**
   * Withdraw LP amount from the vault
   *
   * @param {RemoveLiquidityVaultParams} params - The parameters for withdraw.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async removeLiquidity(params) {
    const vaultContract = await this.getVaultContract();
    return vaultContract.removeLiquidity(params);
  }
  /**
   * Retrieves the vault config information from cache.
   *
   * @returns {Promise<VaultConfig | undefined>} A Promise that resolves to the vault config information or undefined if error when requesting vault config.
   */
  async getCachedVaultConfig() {
    let vaultConfig = this.cachedVaultConfig;
    if (!vaultConfig) {
      try {
        let getVaultConfigPromise = this.cachedVaultConfigPromise;
        if (!getVaultConfigPromise) {
          getVaultConfigPromise = this.getVaultConfig({});
          this.cachedVaultConfigPromise = getVaultConfigPromise;
        }
        const vaultConfigRes = await getVaultConfigPromise;
        this.cachedVaultConfigPromise = void 0;
        vaultConfig = vaultConfigRes;
      } catch (error) {
        console.error(error);
      }
      if (!vaultConfig) return void 0;
    }
    return vaultConfig;
  }
  /**
   * Retrieves the vault config.
   *
   * @param {GetVaultConfigParams} params - The parameters for retrieving the vault config.
   * @returns {Promise<VaultConfig>} A Promise that resolves to vault config.
   */
  async getVaultConfig(params) {
    const vaultConfigDto = await this.onchainLobService.getVaultConfig(params);
    return vaultConfigDto;
  }
  /**
   * Retrieves the vault total values.
   *
   * @param {GetVaultTotalValuesParams} params - The parameters for retrieving the vault total values.
   * @returns {Promise<VaultTotalValues>} A Promise that resolves to vault total values.
   */
  async getVaultTotalValues(params) {
    const [vaultConfig, vaultTotalValuesDto] = await Promise.all([
      this.ensureVaultConfig(),
      this.onchainLobService.getVaultTotalValues(params)
    ]);
    const vaultTotalValues = mapVaultTotalValuesDtoToVaultTotalValues(vaultTotalValuesDto, vaultConfig.tokens, vaultConfig.lpToken);
    return vaultTotalValues;
  }
  /**
   * Retrieves the vault deposit actions.
   *
   * @param {GetVaultDepositActionsParams} params - The parameters for retrieving the vault deposit actions.
   * @returns {Promise<VaultDepositAction[]>} A Promise that resolves to vault deposit actions.
   */
  async getVaultDepositActions(params) {
    const [vaultConfig, vaultDepositActionsDtos] = await Promise.all([
      this.ensureVaultConfig(),
      this.onchainLobService.getVaultDepositActions(params)
    ]);
    const vaultDepositActions = vaultDepositActionsDtos.map(
      (depositActionDto) => {
        const token = vaultConfig.tokens.find((token2) => token2.symbol === depositActionDto.tokenSymbol);
        return mapVaultDepositActionDtoToVaultDepositAction(depositActionDto, token.decimals, vaultConfig.lpToken.decimals);
      }
    );
    return vaultDepositActions;
  }
  /**
   * Retrieves the vault depositors.
   *
   * @param {GetVaultDepositorsParams} params - The parameters for retrieving the vault depositors.
   * @returns {Promise<VaultDepositor[]>} A Promise that resolves to vault depositors.
   */
  async getVaultDepositors(params) {
    const [vaultConfig, vaultDepositorsDtos] = await Promise.all([
      this.ensureVaultConfig(),
      this.onchainLobService.getVaultDepositors(params)
    ]);
    const vaultDepositors = vaultDepositorsDtos.map(
      (depositorDto) => mapVaultDepositorDtoToVaultDepositor(depositorDto, vaultConfig.lpToken.decimals)
    );
    return vaultDepositors;
  }
  /**
   * Retrieves the vault history.
   *
   * @param {GetVaultHistoryParams} params - The parameters for retrieving the vault history.
   * @returns {Promise<VaultDepositor[]>} A Promise that resolves to vault history.
   */
  async getVaultHistory(params) {
    const vaultHistoryDtos = await this.onchainLobService.getVaultHistory(params);
    return vaultHistoryDtos;
  }
  /**
   * Calculates the deposit LP details for a given token inputs without API request.
   *
   * @param {CalculateDepositDetailsSyncParams} params - The parameters for the deposit LP details calculation.
   * @returns {DepositDetails} Deposit LP details data.
   */
  calculateDepositDetailsSync(params) {
    return getDepositDetails(params);
  }
  /**
   * Calculates the withdraw LP details for a given token inputs without API request.
   *
   * @param {CalculateWithdrawDetailsSyncParams} params - The parameters for the withdraw LP details calculation.
   * @returns {WithdrawDetails} Withdraw LP details data.
   */
  calculateWithdrawDetailsSync(params) {
    return getWithdrawDetails(params);
  }
  /**
   * Subscribes to the vault total values updates.
   *
   * @emits OnchainLobVault#events#vaultTotalValuesUpdated
   */
  subscribeToVaultTotalValues(params) {
    this.onchainLobWebSocketService.subscribeToVaultTotalValues(params);
  }
  /**
   * Unsubscribes from the vault total values updates.
   */
  unsubscribeFromVaultTotalValues(params) {
    this.onchainLobWebSocketService.unsubscribeFromVaultTotalValues(params);
  }
  /**
   * Subscribes to the vault deposit actions updates.
   *
   * @emits OnchainLobVault#events#vaultDepositActionsUpdated
   */
  subscribeToVaultDepositActions(params) {
    this.onchainLobWebSocketService.subscribeToVaultDepositActions(params);
  }
  /**
   * Unsubscribes from the vault deposit actions updates.
   */
  unsubscribeFromVaultDepositActions(params) {
    this.onchainLobWebSocketService.unsubscribeFromVaultDepositActions(params);
  }
  /**
   * Subscribes to the vault depositors updates.
   *
   * @emits OnchainLobVault#events#vaultDepositorsUpdated
   */
  subscribeToVaultDepositors(params) {
    this.onchainLobWebSocketService.subscribeToVaultDepositors(params);
  }
  /**
   * Unsubscribes from the vault depositors updates.
   */
  unsubscribeFromVaultDepositors(params) {
    this.onchainLobWebSocketService.unsubscribeFromVaultDepositors(params);
  }
  /**
   * Subscribes to the vault history updates.
   *
   * @param {SubscribeToVaultHistoryParams} params - The parameters for subscribing to the vault history updates.
   * @emits OnchainLobVault#events#vaultHistoryUpdated
   */
  subscribeToVaultHistory(params) {
    this.onchainLobWebSocketService.subscribeToVaultHistory(params);
  }
  /**
   * Unsubscribes from the vault history updates.
   *
   * @param {UnsubscribeFromVaultHistoryParams} params - The parameters for unsubscribing from the vault history updates.
   */
  unsubscribeFromVaultHistory(params) {
    this.onchainLobWebSocketService.unsubscribeFromVaultHistory(params);
  }
  async ensureVaultConfig() {
    const vaultConfig = await this.getCachedVaultConfig();
    if (!vaultConfig)
      throw new Error(`Vault config not found`);
    return vaultConfig;
  }
  async getVaultContract() {
    if (this.signer === null) {
      throw new Error("Signer is not set");
    }
    if (!this.vaultContract) {
      const vault = await this.getVaultConfig({});
      this.vaultContract = new OnchainLobVaultContract({
        vault,
        signer: this.signer,
        autoWaitTransaction: this.autoWaitTransaction
      });
    }
    return this.vaultContract;
  }
  attachEvents() {
    this.onchainLobWebSocketService.events.vaultTotalValuesUpdated.addListener(this.onVaultTotalValuesUpdated);
    this.onchainLobWebSocketService.events.vaultDepositActionsUpdated.addListener(this.onVaultDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultDepositorsUpdated.addListener(this.onVaultDepositorsUpdated);
    this.onchainLobWebSocketService.events.vaultHistoryUpdated.addListener(this.onVaultHistoryUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.addListener(this.onSubscriptionError);
  }
  detachEvents() {
    this.onchainLobWebSocketService.events.vaultTotalValuesUpdated.removeListener(this.onVaultTotalValuesUpdated);
    this.onchainLobWebSocketService.events.vaultDepositActionsUpdated.removeListener(this.onVaultDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultDepositorsUpdated.removeListener(this.onVaultDepositorsUpdated);
    this.onchainLobWebSocketService.events.vaultHistoryUpdated.removeListener(this.onVaultHistoryUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.removeListener(this.onSubscriptionError);
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
export {
  OnchainLobClient,
  OnchainLobError,
  OnchainLobSpot,
  OnchainLobSpotService,
  OnchainLobSpotWebSocketService,
  OnchainLobVault,
  OnchainLobVaultService,
  OnchainLobVaultWebSocketService,
  TimeoutScheduler
};
//# sourceMappingURL=index.mjs.map
