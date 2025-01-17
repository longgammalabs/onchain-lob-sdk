import { Contract, type Signer, ContractTransactionResponse } from 'ethers';
import type { AddLiquidityVaultParams, ApproveVaultParams, RemoveLiquidityVaultParams } from './params';
import type { VaultConfig } from '../models';
export interface OnchainLobVaultContractOptions {
    vault: VaultConfig;
    signer: Signer;
    autoWaitTransaction?: boolean;
    fastWaitTransaction?: boolean;
    fastWaitTransactionInterval?: number;
    fastWaitTransactionTimeout?: number;
}
export declare class OnchainLobVaultContract {
    static readonly defaultAutoWaitTransaction = true;
    static readonly defaultFastWaitTransaction = false;
    static readonly defaultFastWaitTransactionInterval = 100;
    readonly vault: VaultConfig;
    autoWaitTransaction: boolean;
    fastWaitTransaction: boolean;
    fastWaitTransactionInterval: number;
    fastWaitTransactionTimeout?: number;
    protected readonly signer: Signer;
    protected readonly vaultContract: Contract;
    private _chainId;
    protected get chainId(): Promise<bigint>;
    constructor(options: Readonly<OnchainLobVaultContractOptions>);
    approveTokens(params: ApproveVaultParams): Promise<ContractTransactionResponse>;
    addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse>;
    removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse>;
    protected processContractMethodCall(contract: Contract, methodCall: Promise<ContractTransactionResponse>): Promise<ContractTransactionResponse>;
    private convertTokensAmountToRawAmountIfNeeded;
}
