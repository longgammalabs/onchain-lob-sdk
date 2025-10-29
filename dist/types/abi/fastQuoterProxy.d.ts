export declare const fastQuoterProxyAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_lpManagerAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_nativeTokenAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_lobId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "UPGRADE_INTERFACE_VERSION";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "acceptOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "claimOrder";
    readonly inputs: readonly [{
        readonly name: "trader";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "order_id";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "only_claim";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transfer_tokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "withdraw_as_native_eth";
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
    readonly name: "claimOrder";
    readonly inputs: readonly [{
        readonly name: "order_id";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "only_claim";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transfer_tokens";
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
    readonly name: "fastQuoterAddress";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_fastQuoterAddress";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "lobAddress";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lobId";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lpManagerAddress";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "nativeTokenAddress";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "paused";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingOwner";
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
        readonly name: "target_token_y_value";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "price";
        readonly type: "uint72";
        readonly internalType: "uint72";
    }, {
        readonly name: "max_commission";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "transfer_executed_tokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "executed_shares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "executed_value";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressive_fee";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "placeMarketOrderWithTargetValueByProxy";
    readonly inputs: readonly [{
        readonly name: "isAsk";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "target_token_y_value";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "price";
        readonly type: "uint72";
        readonly internalType: "uint72";
    }, {
        readonly name: "max_commission";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "transfer_executed_tokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "withdraw_as_native_eth";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "order_owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "executed_shares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "executed_value";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressive_fee";
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
        readonly name: "max_commission";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "market_only";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "post_only";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transfer_executed_tokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "order_id";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "executed_shares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "executed_value";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressive_fee";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "placeOrderByProxy";
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
        readonly name: "max_commission";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "market_only";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "post_only";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "transfer_executed_tokens";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "withdraw_as_native_eth";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "order_owner";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "order_id";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "executed_shares";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "executed_value";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressive_fee";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "proxiableUUID";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "renounceOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "scalingFactorTokenX";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "scalingFactorTokenY";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "setFastQuoterAddress";
    readonly inputs: readonly [{
        readonly name: "_fastQuoterAddress";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
    readonly name: "transferOwnership";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "upgradeToAndCall";
    readonly inputs: readonly [{
        readonly name: "newImplementation";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "ver";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "pure";
}, {
    readonly type: "event";
    readonly name: "FastQuoterAddressChanged";
    readonly inputs: readonly [{
        readonly name: "oldFastQuoterAddress";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "newFastQuoterAddress";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Initialized";
    readonly inputs: readonly [{
        readonly name: "version";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferStarted";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferred";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Paused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Unpaused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Upgraded";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "AddressEmptyCode";
    readonly inputs: readonly [{
        readonly name: "target";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC1967InvalidImplementation";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC1967NonPayable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "EnforcedPause";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ExpectedPause";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "Expired";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "FailedCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "Forbidden";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidImplementation";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidInitialization";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidLPManager";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotInitializing";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OnlyPrivilegedSenderCanCancelOrders";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OwnableInvalidOwner";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
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
    readonly name: "ReentrancyGuardReentrantCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "SafeERC20FailedOperation";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "TransferFailed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "UUPSUnauthorizedCallContext";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "UUPSUnsupportedProxiableUUID";
    readonly inputs: readonly [{
        readonly name: "slot";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
}, {
    readonly type: "error";
    readonly name: "ZeroAddress";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ZeroTokenTransferNotAllowed";
    readonly inputs: readonly [];
}];
