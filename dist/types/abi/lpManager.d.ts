export declare const lpManagerAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_pythAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_proxyPythAddress";
        readonly type: "address";
        readonly internalType: "address";
    }];
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
    readonly name: "addLiquidity";
    readonly inputs: readonly [{
        readonly name: "tokenId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "minUsdValue";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "minLPMinted";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "priceUpdateData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "approveForLOB";
    readonly inputs: readonly [{
        readonly name: "lobId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "tokenId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "value";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "changeLob";
    readonly inputs: readonly [{
        readonly name: "lobAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "isActive";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "tokenIdX";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "tokenIdY";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "maxOrderDistanceBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "changeMarketMaker";
    readonly inputs: readonly [{
        readonly name: "marketMaker";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "isActive";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [];
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
    readonly name: "changePrimaryMarketMaker";
    readonly inputs: readonly [{
        readonly name: "_primaryMarketMaker";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "changeToken";
    readonly inputs: readonly [{
        readonly name: "_tokenAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_isActive";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_targetWeight";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_lowerBoundWeight";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_upperBoundWeight";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_decimals";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "_oracleConfRel";
        readonly type: "uint24";
        readonly internalType: "uint24";
    }, {
        readonly name: "_oraclePriceId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "checkCooldown";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "claimOrder";
    readonly inputs: readonly [{
        readonly name: "lobId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "orderId";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "onlyClaim";
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
    readonly name: "collectFees";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "disableSlashingStatus";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "getConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "";
        readonly type: "uint24";
        readonly internalType: "uint24";
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
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
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "";
        readonly type: "uint24";
        readonly internalType: "uint24";
    }, {
        readonly name: "";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getFeeBasisPoints";
    readonly inputs: readonly [{
        readonly name: "totalValue";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "initialTokenValue";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "nextTokenValue";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "targetTokenWeight";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getPriceOf";
    readonly inputs: readonly [{
        readonly name: "tokenId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "int32";
        readonly internalType: "int32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTokensCount";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "hwmLPPrice";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint96";
        readonly internalType: "uint96";
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
        readonly name: "_liquidityToken";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_adminFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "lastAddedAt";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "liquidityToken";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract LPToken";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lobReservesByTokenId";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "lobs";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "lobAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "tokenIdX";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "tokenIdY";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "isActive";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "maxOrderDistanceBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "marketMakers";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
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
    readonly name: "placeOrder";
    readonly inputs: readonly [{
        readonly name: "lobId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
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
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "priceUpdateData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [{
        readonly name: "orderId";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "primaryMarketMaker";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
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
    readonly name: "removeLiquidity";
    readonly inputs: readonly [{
        readonly name: "tokenId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "burnLP";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "minUsdValue";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "minTokenGet";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "priceUpdateData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "renounceOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setConfig";
    readonly inputs: readonly [{
        readonly name: "_dynamicFeesEnabled";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_adminMintLPFeeBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_adminBurnLPFeeBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_feeBasisBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_taxBasisBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_cooldownDuration";
        readonly type: "uint24";
        readonly internalType: "uint24";
    }, {
        readonly name: "_maxOracleAge";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_minLiquidityValueUsd";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "_maxLiquidityValueUsd";
        readonly type: "uint128";
        readonly internalType: "uint128";
    }, {
        readonly name: "_marketMakerLPShareEnabled";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_marketMakerLPShareBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_nativeTokenEnabled";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "_nativeTokenTokenId";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "_adminFeeRecipient";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_priceValidityPeriod";
        readonly type: "uint24";
        readonly internalType: "uint24";
    }, {
        readonly name: "_baseMultiplier";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_maxAllowedPriceDeviation";
        readonly type: "uint64";
        readonly internalType: "uint64";
    }, {
        readonly name: "_perfFeeBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "_adminPerfFeeBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "slashMakersShares";
    readonly inputs: readonly [{
        readonly name: "amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "tokens";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "tokenAddress";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "isActive";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "targetWeight";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "lowerBoundWeight";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "upperBoundWeight";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "decimals";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "oracleConfRel";
        readonly type: "uint24";
        readonly internalType: "uint24";
    }, {
        readonly name: "oraclePriceId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalWeight";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint24";
        readonly internalType: "uint24";
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
    readonly name: "validateLPPriceAndDistributeFees";
    readonly inputs: readonly [{
        readonly name: "priceUpdateData";
        readonly type: "bytes[]";
        readonly internalType: "bytes[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "validateMarketMakerLPShare";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "ConfigSet";
    readonly inputs: readonly [{
        readonly name: "dynamicFeesEnabled";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "adminMintLPFeeBps";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "adminBurnLPFeeBps";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "feeBasisBps";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "taxBasisPoints";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "cooldownDuration";
        readonly type: "uint24";
        readonly indexed: false;
        readonly internalType: "uint24";
    }, {
        readonly name: "maxOracleAge";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "minLiquidityValueUsd";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "maxLiquidityValueUsd";
        readonly type: "uint128";
        readonly indexed: false;
        readonly internalType: "uint128";
    }, {
        readonly name: "marketMakerLPShareEnabled";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "marketMakerLPShareBps";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "nativeTokenEnabled";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "nativeTokenTokenId";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "adminFeeRecipient";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "priceValidityPeriod";
        readonly type: "uint24";
        readonly indexed: false;
        readonly internalType: "uint24";
    }, {
        readonly name: "baseMultiplier";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }, {
        readonly name: "maxAllowedPriceDeviation";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }, {
        readonly name: "perfFeeBps";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "adminPerfFeeBps";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
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
    readonly name: "LiquidityAdded";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "tokenAmount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "tokenUSDValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "totalUSDValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "protocolFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "mintedLP";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "accountLpShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "totalSupply";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "LiquidityRemoved";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "tokenAmount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "lpUSDValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "totalUSDValue";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "protocolFee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "burnedLP";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "accountLpShares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "totalSupply";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "LobChanged";
    readonly inputs: readonly [{
        readonly name: "lobId";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "lobAddress";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "isActive";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "tokenIdX";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "tokenIdY";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "maxOrderDistanceBps";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "MakersSharesSlashed";
    readonly inputs: readonly [{
        readonly name: "marketMaker";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "totalSupply";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "MarketMakerChanged";
    readonly inputs: readonly [{
        readonly name: "marketMaker";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "isActive";
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
        readonly name: "newPauser";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "oldPauser";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PerformanceFeesDistributed";
    readonly inputs: readonly [{
        readonly name: "currentPrice";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "previousHWM";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "adminFeeAmount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "marketMakerFeeAmount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "totalSupply";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PrimaryMarketMakerChanged";
    readonly inputs: readonly [{
        readonly name: "oldMarketMaker";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "newMarketMaker";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SlashingAvailableStatusChanged";
    readonly inputs: readonly [{
        readonly name: "status";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Sync";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "tokenBalance";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "tokenReserved";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TokenChanged";
    readonly inputs: readonly [{
        readonly name: "tokenId";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "tokenAddress";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "isActive";
        readonly type: "bool";
        readonly indexed: false;
        readonly internalType: "bool";
    }, {
        readonly name: "targetWeight";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "lowerBoundWeight";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "upperBoundWeight";
        readonly type: "uint16";
        readonly indexed: false;
        readonly internalType: "uint16";
    }, {
        readonly name: "decimals";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "oracleConfRel";
        readonly type: "uint24";
        readonly indexed: false;
        readonly internalType: "uint24";
    }, {
        readonly name: "oraclePriceId";
        readonly type: "bytes32";
        readonly indexed: false;
        readonly internalType: "bytes32";
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
    readonly name: "CooldownDurationNotYetPassed";
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
    readonly name: "FeeBpsExceedsMaximum";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "Forbidden";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientBalance";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientFeeForPythUpdate";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientLiquidityValue";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientMarketMakerLPShare";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientMintedLP";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientTokenAmount";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InsufficientUSDValue";
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
    readonly name: "InvalidOracleConfidenceLevel";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidTokenWeights";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidTrader";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "LobDisabled";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MarketMakerLPShareExceedsMaximum";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MaxLiquidityValueExceeded";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "MaxOracleAgeExceedsMaximum";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NativeGasTokenDisabled";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NonPositivePrice";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotInitializing";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OracleConfTooHigh";
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
    readonly name: "PriceTooBig";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "PriceTooSmall";
    readonly inputs: readonly [];
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
    readonly name: "SlashingUnAvailable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TokenDisabled";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TokenWeightExceeded";
    readonly inputs: readonly [];
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
    readonly name: "UnknownLob";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "WrongNumber";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "WrongTokenId";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ZeroAddress";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ZeroAmount";
    readonly inputs: readonly [];
}];
