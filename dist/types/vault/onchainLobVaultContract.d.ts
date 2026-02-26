import { Contract, type Signer, ContractTransactionResponse } from 'ethers';
import type { CustomSignTransaction } from '../onchainLobClient';
import type { AddLiquidityVaultParams, ApproveVaultParams, RemoveLiquidityVaultParams, UnwrapNativeTokenVaultParams, WrapNativeTokenVaultParams } from './params';
import type { VaultConfig } from '../models';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
export interface OnchainLobVaultContractOptions {
    vault: VaultConfig;
    signer: Signer;
    autoWaitTransaction?: boolean;
    fastWaitTransaction?: boolean;
    fastWaitTransactionInterval?: number;
    fastWaitTransactionTimeout?: number;
    syncSendRawTransaction?: boolean;
    customSignTransaction?: CustomSignTransaction;
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
    syncSendRawTransaction: boolean;
    customSignTransaction?: CustomSignTransaction;
    protected readonly signer: Signer;
    protected readonly vaultContract: Contract;
    private _chainId;
    protected get chainId(): Promise<bigint>;
    protected pythConnection: EvmPriceServiceConnection;
    constructor(options: Readonly<OnchainLobVaultContractOptions>);
    approveTokens(params: ApproveVaultParams): Promise<ContractTransactionResponse>;
    wrapNativeToken(params: WrapNativeTokenVaultParams): Promise<ContractTransactionResponse>;
    unwrapNativeToken(params: UnwrapNativeTokenVaultParams): Promise<ContractTransactionResponse>;
    addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse>;
    removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse>;
    protected processContractMethodCall(contract: Contract, method: any, args: any[]): Promise<ContractTransactionResponse>;
    protected processContractMethodCallSync(contract: Contract, method: any, args: any[]): Promise<ContractTransactionResponse>;
    private convertTokensAmountToRawAmountIfNeeded;
    protected getPriceUpdateData(feedPriceIds: string[]): Promise<string[]>;
}
