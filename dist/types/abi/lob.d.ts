export declare const lobAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "receive";
    readonly stateMutability: "payable";
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
    readonly name: "batchChangeOrder";
    readonly inputs: readonly [{
        readonly name: "order_ids";
        readonly type: "uint64[]";
        readonly internalType: "uint64[]";
    }, {
        readonly name: "quantities";
        readonly type: "uint128[]";
        readonly internalType: "uint128[]";
    }, {
        readonly name: "prices";
        readonly type: "uint72[]";
        readonly internalType: "uint72[]";
    }, {
        readonly name: "max_commission_per_order";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "post_only";
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
    readonly outputs: readonly [{
        readonly name: "new_order_ids";
        readonly type: "uint64[]";
        readonly internalType: "uint64[]";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "batchClaim";
    readonly inputs: readonly [{
        readonly name: "addresses";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }, {
        readonly name: "order_ids";
        readonly type: "uint64[]";
        readonly internalType: "uint64[]";
    }, {
        readonly name: "only_claim";
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
    readonly name: "changeMarketMaker";
    readonly inputs: readonly [{
        readonly name: "_marketmaker";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_should_invoke_on_trade";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_admin_commission_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "changeOrder";
    readonly inputs: readonly [{
        readonly name: "old_order_id";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "new_quantity";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "new_price";
        readonly type: "uint72";
        readonly internalType: "uint72";
    }, {
        readonly name: "max_commission";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "post_only";
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
    readonly outputs: readonly [{
        readonly name: "order_id";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "changePauser";
    readonly inputs: readonly [{
        readonly name: "pauser_";
        readonly type: "address";
        readonly internalType: "address";
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
    readonly name: "depositTokens";
    readonly inputs: readonly [{
        readonly name: "token_x_amount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "token_y_amount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "depositTokens";
    readonly inputs: readonly [{
        readonly name: "token_x_amount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "token_y_amount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "v_x";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "r_x";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "s_x";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "v_y";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "r_y";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "s_y";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "getAccumulatedFees";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "_scaling_factor_token_x";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_scaling_factor_token_y";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_token_x";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_token_y";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_supports_native_eth";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_is_token_x_weth";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_ask_trie";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_bid_trie";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_admin_commission_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_total_aggressive_commission_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_total_passive_commission_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_passive_order_payout_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_should_invoke_on_trade";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTraderBalance";
    readonly inputs: readonly [{
        readonly name: "address_";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "_trie_factory";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_tokenXAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_tokenYAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_supports_native_eth";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_is_token_x_weth";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "scaling_token_x";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "scaling_token_y";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_administrator";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_marketmaker";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_pauser";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_should_invoke_on_trade";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_admin_commission_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_total_aggressive_commission_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_total_passive_commission_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_passive_order_payout_rate";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "marketmaker_config";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "marketmaker";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "should_invoke_on_trade";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "nonce";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
        readonly internalType: "uint64";
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
    readonly name: "pause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
        readonly name: "amount_to_approve";
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
        readonly name: "amount_to_approve";
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
    readonly name: "setClaimableStatus";
    readonly inputs: readonly [{
        readonly name: "status";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "transferFees";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
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
    readonly name: "unpause";
    readonly inputs: readonly [];
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
    readonly name: "withdrawTokens";
    readonly inputs: readonly [{
        readonly name: "withdraw_all";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "token_x_amount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "token_y_amount";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "ClaimableStatusChanged";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "status";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Deposited";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "token_x";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "token_y";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
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
    readonly name: "MarketMakerChanged";
    readonly inputs: readonly [{
        readonly name: "new_marketmaker";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "old_marketmaker";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OrderClaimed";
    readonly inputs: readonly [{
        readonly name: "order_id";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }, {
        readonly name: "order_shares_remaining";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "token_x_sent";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "token_y_sent";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "passive_payout";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "only_claim";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OrderPlaced";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "order_id";
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
        readonly type: "uint72";
        readonly indexed: false;
        readonly internalType: "uint72";
    }, {
        readonly name: "passive_shares";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "passive_fee";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressive_shares";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressive_value";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "aggressive_fee";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "market_only";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "post_only";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
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
    readonly name: "PauserChanged";
    readonly inputs: readonly [{
        readonly name: "new_pauser";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "old_pauser";
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
    readonly type: "event";
    readonly name: "Withdrawn";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "token_x";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "token_y";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
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
    readonly name: "AddressInsufficientBalance";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "AddressIsZero";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ArrayLengthMismatch";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ClaimNotAllowed";
    readonly inputs: readonly [];
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
    readonly name: "ExcessiveSignificantFigures";
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
    readonly name: "FailedInnerCall";
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
    readonly name: "InvalidCommissionRate";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidFloatingPointRepresentation";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidInitialization";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidMarketMaker";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidPriceRange";
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
    readonly name: "NativeETHDisabled";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NonceExhaustedFailure";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotInitializing";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OnlyOwnerCanCancelOrders";
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
    readonly name: "SafeCastOverflowedUintDowncast";
    readonly inputs: readonly [{
        readonly name: "bits";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
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
    readonly name: "ZeroTokenTransferNotAllowed";
    readonly inputs: readonly [];
}];
