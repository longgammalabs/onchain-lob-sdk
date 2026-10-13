export declare const pageBookAbi: readonly [{
    readonly type: "receive";
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "EVENTS_VERSION";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "assembleOrderbookFromOrders";
    readonly inputs: readonly [{
        readonly name: "isAsk";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "maxPriceLevels";
        readonly type: "uint24";
        readonly internalType: "uint24";
    }];
    readonly outputs: readonly [{
        readonly name: "prices";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }, {
        readonly name: "shares";
        readonly type: "uint128[]";
        readonly internalType: "uint128[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "batchExecute";
    readonly inputs: readonly [{
        readonly name: "data";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [{
        readonly name: "results";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "claimOrder";
    readonly inputs: readonly [{
        readonly name: "orderOwner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "orderId";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "onlyClaim";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transferTokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "withdrawAsNativeToken";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "decimalsTokenX";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "decimalsTokenY";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "depositTokens";
    readonly inputs: readonly [{
        readonly name: "tokenXAmount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "tokenYAmount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "feesReceiver";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "generateOrderId";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "traderNonce";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "function";
    readonly name: "getAccumulatedFees";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "tokenAmount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "rawFees";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getCommissionRates";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "aggressiveRate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "config";
        readonly type: "tuple";
        readonly internalType: "struct PageBookImplementation.MarketConfig";
        readonly components: readonly [{
            readonly name: "tokenX";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "tokenY";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "decimalsTokenX";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "decimalsTokenY";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "tokenXScaleExponent";
            readonly type: "int8";
            readonly internalType: "int8";
        }, {
            readonly name: "tokenYScaleExponent";
            readonly type: "int8";
            readonly internalType: "int8";
        }, {
            readonly name: "supportsNativeToken";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "isTokenXWrappedNative";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "pauser";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "feesReceiver";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "isPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "minPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "maxPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "maxSignificantDigits";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "aggressiveCommissionRate";
            readonly type: "uint64";
            readonly internalType: "uint64";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getPriceLimits";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "minimumPrice";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "maximumPrice";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "significantDigits";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTraderBalances";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [{
        readonly name: "availableTokenX";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "reservedTokenX";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "availableTokenY";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "reservedTokenY";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTraderConfig";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [{
        readonly name: "traderOwner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "claimable";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transferTokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "withdrawAsNativeEth";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTraderNonce";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "initialTokenX";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "initialTokenXScaleExponent";
        readonly type: "int8";
        readonly internalType: "int8";
    }, {
        readonly name: "initialTokenY";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "initialTokenYScaleExponent";
        readonly type: "int8";
        readonly internalType: "int8";
    }, {
        readonly name: "initialSupportsNativeToken";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "initialIsTokenXWrappedNative";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "initialPauser";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "warmUpCount";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "isPaused";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isTokenXWrappedNative";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "openOrderCount";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "pauser";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "placeMarketOrderWithTargetValue";
    readonly inputs: readonly [{
        readonly name: "isAsk";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "targetTokenYValue";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "price";
        readonly type: "uint72";
        readonly internalType: "uint72";
    }, {
        readonly name: "maxCommission";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "transferExecutedTokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "executedShares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "executedValue";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressiveFee";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "placeOrder";
    readonly inputs: readonly [{
        readonly name: "isAsk";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "quantity";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "price";
        readonly type: "uint72";
        readonly internalType: "uint72";
    }, {
        readonly name: "maxCommission";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "marketOnly";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "postOnly";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transferExecutedTokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "orderId";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "executedShares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "executedValue";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressiveFee";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "registerTrader";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "id";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "replaceBatch";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "bids";
        readonly type: "tuple[]";
        readonly internalType: "struct PageBookImplementation.OrderChange[]";
        readonly components: readonly [{
            readonly name: "price";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "quantity";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "expiry";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "asks";
        readonly type: "tuple[]";
        readonly internalType: "struct PageBookImplementation.OrderChange[]";
        readonly components: readonly [{
            readonly name: "price";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "quantity";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "expiry";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setCommissionRates";
    readonly inputs: readonly [{
        readonly name: "aggressiveRate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setFeesReceiver";
    readonly inputs: readonly [{
        readonly name: "newFeesReceiver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setPauser";
    readonly inputs: readonly [{
        readonly name: "newPauser";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setPriceLimits";
    readonly inputs: readonly [{
        readonly name: "newMinPrice";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "newMaxPrice";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "newMaxSignificantDigits";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setTraderConfig";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "claimable";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transferTokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "withdrawAsNativeEth";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "supportsNativeToken";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "tokenX";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "tokenXScaleExponent";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "int8";
        readonly internalType: "int8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "tokenY";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "tokenYScaleExponent";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "int8";
        readonly internalType: "int8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "traderBalances";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "availableTokenX";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "reservedTokenX";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "availableTokenY";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "reservedTokenY";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "traderId";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "transferFees";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "tryPermitEIP2612";
    readonly inputs: readonly [{
        readonly name: "is_token_x";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "v";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "r";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "s";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "unpause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "warmUpMemory";
    readonly inputs: readonly [{
        readonly name: "n";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdrawTokens";
    readonly inputs: readonly [{
        readonly name: "withdrawAll";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "tokenXAmount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "tokenYAmount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "CommissionRatesUpdated";
    readonly inputs: readonly [{
        readonly name: "aggressiveRate";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ConfigChanged";
    readonly inputs: readonly [{
        readonly name: "config";
        readonly type: "tuple";
        readonly indexed: false;
        readonly internalType: "struct PageBookImplementation.MarketConfig";
        readonly components: readonly [{
            readonly name: "tokenX";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "tokenY";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "decimalsTokenX";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "decimalsTokenY";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "tokenXScaleExponent";
            readonly type: "int8";
            readonly internalType: "int8";
        }, {
            readonly name: "tokenYScaleExponent";
            readonly type: "int8";
            readonly internalType: "int8";
        }, {
            readonly name: "supportsNativeToken";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "isTokenXWrappedNative";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "pauser";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "feesReceiver";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "isPaused";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "minPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "maxPrice";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "maxSignificantDigits";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "aggressiveCommissionRate";
            readonly type: "uint64";
            readonly internalType: "uint64";
        }];
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "DepositedV2";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "tokenX";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "tokenY";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "FeesReceiverChanged";
    readonly inputs: readonly [{
        readonly name: "previousReceiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newReceiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "FeesTransferredV2";
    readonly inputs: readonly [{
        readonly name: "receiver";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "tokenX";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "tokenY";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Initialized";
    readonly inputs: readonly [];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "LegacyOrderSettledV2";
    readonly inputs: readonly [{
        readonly name: "orderId";
        readonly type: "uint64";
        readonly indexed: true;
        readonly internalType: "uint64";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "tokenX";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "tokenY";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "MemoryWarmedUp";
    readonly inputs: readonly [{
        readonly name: "slotsCount";
        readonly type: "uint32";
        readonly indexed: false;
        readonly internalType: "uint32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OrderCancelled";
    readonly inputs: readonly [{
        readonly name: "orderId";
        readonly type: "uint64";
        readonly indexed: true;
        readonly internalType: "uint64";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "sharesRemoved";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OrderExpiredV2";
    readonly inputs: readonly [{
        readonly name: "orderId";
        readonly type: "uint64";
        readonly indexed: true;
        readonly internalType: "uint64";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "sharesRemoved";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OrderFilledV2";
    readonly inputs: readonly [{
        readonly name: "makerOrderId";
        readonly type: "uint64";
        readonly indexed: true;
        readonly internalType: "uint64";
    }, {
        readonly name: "takerOrderId";
        readonly type: "uint64";
        readonly indexed: true;
        readonly internalType: "uint64";
    }, {
        readonly name: "maker";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "taker";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "takerIsAsk";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "price";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "shares";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "value";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "makerFee";
        readonly type: "int128";
        readonly indexed: false;
        readonly internalType: "int128";
    }, {
        readonly name: "takerFee";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "makerRemaining";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OrderPlacedV2";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "initiator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "orderId";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }, {
        readonly name: "isAsk";
        readonly type: "bool";
        readonly indexed: true;
        readonly internalType: "bool";
    }, {
        readonly name: "quantity";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "price";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "passiveShares";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "passiveFee";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressiveShares";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressiveValue";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressiveFee";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "marketOnly";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "postOnly";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "expiry";
        readonly type: "uint32";
        readonly indexed: false;
        readonly internalType: "uint32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OrdersReplaced";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "placed";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }, {
        readonly name: "cancelled";
        readonly type: "bytes";
        readonly indexed: false;
        readonly internalType: "bytes";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PauseStateChanged";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "isPaused";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PauserChanged";
    readonly inputs: readonly [{
        readonly name: "previousPauser";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newPauser";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PriceLimitsUpdated";
    readonly inputs: readonly [{
        readonly name: "minPrice";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "maxPrice";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "maxSignificantDigits";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TraderConfigChanged";
    readonly inputs: readonly [{
        readonly name: "traderId";
        readonly type: "uint32";
        readonly indexed: true;
        readonly internalType: "uint32";
    }, {
        readonly name: "claimable";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "transferTokens";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "withdrawAsNativeEth";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TraderRegistered";
    readonly inputs: readonly [{
        readonly name: "traderId";
        readonly type: "uint32";
        readonly indexed: true;
        readonly internalType: "uint32";
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "WithdrawnV2";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "tokenX";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "tokenY";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "AlreadyInitialized";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ArenaExhausted";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "BatchExecutionFailed";
    readonly inputs: readonly [{
        readonly name: "callIndex";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "reason";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
}, {
    readonly type: "error";
    readonly name: "ClaimNotAllowed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "CrossedOrderbook";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "Expired";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "Forbidden";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientTokenXBalance";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientTokenYBalance";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidBatchSize";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidCommissionRate";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidExpiry";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidFeesReceiver";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidImplementation";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidOrderId";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidPauser";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidPointer";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidPrice";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidPriceLimits";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidSignificantDigits";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidSlotType";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidToken";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidTokenAmount";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidTraderId";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidTransfer";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MarketOnlyAndPostOnlyFlagsConflict";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MaxCommissionFailure";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NativeTokenDisabled";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotInitialized";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NullPointer";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OnlyPrivilegedSenderCanCancelOrders";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OwnableUnauthorizedAccount";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "Paused";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PointerAlreadyFreed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "Reentrant";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ReservedSlot";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TraderIdsExhausted";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TraderNonceExhausted";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TransferFailed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "UnauthorizedPauser";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "UnauthorizedTrader";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "UnsortedOrders";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ZeroTokenTransferNotAllowed";
    readonly inputs: readonly [];
}];
