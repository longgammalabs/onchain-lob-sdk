import { Contract, type Signer, ContractTransactionResponse } from 'ethers';
import type { AddLiquidityVaultParams, ApproveVaultParams, RemoveLiquidityVaultParams, UnwrapNativeTokenVaultParams, WrapNativeTokenVaultParams, AddLiquidityPairParams, RemoveLiquidityPairParams } from './params';
import type { VaultConfig } from '../models';
import { HermesClient } from '@pythnetwork/hermes-client';
export interface OnchainLobVaultContractOptions {
    vault: VaultConfig;
    signer: Signer;
    autoWaitTransaction?: boolean;
    fastWaitTransaction?: boolean;
    fastWaitTransactionInterval?: number;
    fastWaitTransactionTimeout?: number;
    pythApiKey?: string;
    pythHermesUrl?: string;
}
export declare class OnchainLobVaultContract {
    static readonly defaultAutoWaitTransaction = true;
    static readonly defaultFastWaitTransaction = false;
    static readonly defaultFastWaitTransactionInterval = 100;
    static readonly defaultPythHermesUrl = "https://hermes.pyth.network";
    readonly vault: VaultConfig;
    autoWaitTransaction: boolean;
    fastWaitTransaction: boolean;
    fastWaitTransactionInterval: number;
    fastWaitTransactionTimeout?: number;
    protected readonly signer: Signer;
    protected readonly vaultContract: Contract;
    protected readonly pairContract: Contract;
    private _chainId;
    protected get chainId(): Promise<bigint>;
    protected pythConnection: HermesClient;
    constructor(options: Readonly<OnchainLobVaultContractOptions>);
    approveTokens(params: ApproveVaultParams): Promise<ContractTransactionResponse>;
    wrapNativeToken(params: WrapNativeTokenVaultParams): Promise<ContractTransactionResponse>;
    unwrapNativeToken(params: UnwrapNativeTokenVaultParams): Promise<ContractTransactionResponse>;
    addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse>;
    removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse>;
    addLiquidityPair(params: AddLiquidityPairParams): Promise<ContractTransactionResponse>;
    removeLiquidityPair(params: RemoveLiquidityPairParams): Promise<ContractTransactionResponse>;
    protected processContractMethodCall(contract: Contract, methodCall: Promise<ContractTransactionResponse>): Promise<ContractTransactionResponse>;
    private convertTokensAmountToRawAmountIfNeeded;
    protected getPriceUpdateData(feedPriceIds: string[]): Promise<string[]>;
}
