export declare const lpManagerPairAbi: readonly [{
    readonly type: "function";
    readonly stateMutability: "view";
    readonly name: "previewAddLiquidity";
    readonly inputs: readonly [{
        readonly name: "tokenId";
        readonly type: "uint8";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "amountTokenX";
        readonly type: "uint256";
    }, {
        readonly name: "amountTokenY";
        readonly type: "uint256";
    }, {
        readonly name: "adminFeeLP";
        readonly type: "uint256";
    }, {
        readonly name: "mintedLP";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly stateMutability: "view";
    readonly name: "previewRemoveLiquidity";
    readonly inputs: readonly [{
        readonly name: "burnLP";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "amountTokenX";
        readonly type: "uint256";
    }, {
        readonly name: "amountTokenY";
        readonly type: "uint256";
    }, {
        readonly name: "adminFeeLP";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly stateMutability: "view";
    readonly name: "getTotalReserves";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "totalTokenX";
        readonly type: "uint256";
    }, {
        readonly name: "totalTokenY";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly stateMutability: "view";
    readonly name: "getPairConfig";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "feeConfig";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "adminMintLPFeeBps";
            readonly type: "uint16";
        }, {
            readonly name: "adminBurnLPFeeBps";
            readonly type: "uint16";
        }, {
            readonly name: "adminFeeRecipient";
            readonly type: "address";
        }];
    }, {
        readonly name: "liquidityConfig";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "cooldownDuration";
            readonly type: "uint24";
        }, {
            readonly name: "maxTotalTokenX";
            readonly type: "uint128";
        }, {
            readonly name: "maxTotalTokenY";
            readonly type: "uint128";
        }];
    }, {
        readonly name: "mmConfig";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "marketMakerLPShareEnabled";
            readonly type: "bool";
        }, {
            readonly name: "marketMakerLPShareBps";
            readonly type: "uint16";
        }];
    }, {
        readonly name: "nativeConfig";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "enabled";
            readonly type: "bool";
        }, {
            readonly name: "tokenId";
            readonly type: "uint8";
        }];
    }, {
        readonly name: "slashingStatus";
        readonly type: "bool";
    }];
}, {
    readonly type: "function";
    readonly stateMutability: "view";
    readonly name: "tokenX";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
}, {
    readonly type: "function";
    readonly stateMutability: "view";
    readonly name: "tokenY";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
}, {
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly name: "addLiquidity";
    readonly inputs: readonly [{
        readonly name: "tokenId";
        readonly type: "uint8";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly name: "minLPMinted";
        readonly type: "uint256";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
    }, {
        readonly name: "";
        readonly type: "bytes[]";
    }];
    readonly outputs: readonly [{
        readonly name: "mintedLP";
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly name: "removeLiquidity";
    readonly inputs: readonly [{
        readonly name: "burnLP";
        readonly type: "uint256";
    }, {
        readonly name: "minTokenXGet";
        readonly type: "uint256";
    }, {
        readonly name: "minTokenYGet";
        readonly type: "uint256";
    }, {
        readonly name: "expires";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "amountTokenX";
        readonly type: "uint256";
    }, {
        readonly name: "amountTokenY";
        readonly type: "uint256";
    }];
}];
