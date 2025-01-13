import { Contract, type Signer, ContractTransactionResponse } from 'ethers';
import type { ApproveSpotParams, BatchChangeOrderSpotParams, BatchClaimOrderSpotParams, BatchPlaceOrderSpotParams, ChangeOrderSpotParams, ClaimOrderSpotParams, DepositSpotParams, PlaceMarketOrderWithTargetValueParams, PlaceMarketOrderWithTargetValueWithPermitParams, PlaceOrderSpotParams, PlaceOrderWithPermitSpotParams, SetClaimableStatusParams, WithdrawSpotParams } from './params';
import type { Market, Token } from '../models';
export interface HanjiSpotMarketContractOptions {
    market: Market;
    signer: Signer;
    transferExecutedTokensEnabled?: boolean;
    autoWaitTransaction?: boolean;
    fastWaitTransaction?: boolean;
    fastWaitTransactionInterval?: number;
    fastWaitTransactionTimeout?: number;
}
type ReadonlyMarket = Readonly<Omit<Market, 'baseToken' | 'quoteToken'>> & Readonly<{
    baseToken: Readonly<Token>;
    quoteToken: Readonly<Token>;
}>;
export declare class HanjiSpotMarketContract {
    static readonly defaultTransferExecutedTokensEnabled = true;
    static readonly defaultAutoWaitTransaction = true;
    static readonly defaultFastWaitTransaction = false;
    static readonly defaultFastWaitTransactionInterval = 100;
    readonly market: ReadonlyMarket;
    transferExecutedTokensEnabled: boolean;
    autoWaitTransaction: boolean;
    fastWaitTransaction: boolean;
    fastWaitTransactionInterval: number;
    fastWaitTransactionTimeout?: number;
    protected readonly signer: Signer;
    protected readonly marketContract: Contract;
    protected readonly baseTokenContract: Contract;
    protected readonly quoteTokenContract: Contract;
    private _chainId;
    protected get chainId(): Promise<bigint>;
    constructor(options: Readonly<HanjiSpotMarketContractOptions>);
    approveTokens(params: ApproveSpotParams): Promise<ContractTransactionResponse>;
    depositTokens(params: DepositSpotParams): Promise<ContractTransactionResponse>;
    withdrawTokens(params: WithdrawSpotParams): Promise<ContractTransactionResponse>;
    setClaimableStatus(params: SetClaimableStatusParams): Promise<ContractTransactionResponse>;
    placeOrder(params: PlaceOrderSpotParams): Promise<ContractTransactionResponse>;
    placeOrderWithPermit(params: PlaceOrderWithPermitSpotParams): Promise<ContractTransactionResponse>;
    placeMarketOrderWithTargetValue(params: PlaceMarketOrderWithTargetValueParams): Promise<ContractTransactionResponse>;
    placeMarketOrderWithTargetValueWithPermit(params: PlaceMarketOrderWithTargetValueWithPermitParams): Promise<ContractTransactionResponse>;
    batchPlaceOrder(params: BatchPlaceOrderSpotParams): Promise<ContractTransactionResponse>;
    claimOrder(params: ClaimOrderSpotParams): Promise<ContractTransactionResponse>;
    batchClaim(params: BatchClaimOrderSpotParams): Promise<ContractTransactionResponse>;
    changeOrder(params: ChangeOrderSpotParams): Promise<ContractTransactionResponse>;
    batchChangeOrder(params: BatchChangeOrderSpotParams): Promise<ContractTransactionResponse>;
    protected processContractMethodCall(contract: Contract, methodCall: Promise<ContractTransactionResponse>): Promise<ContractTransactionResponse>;
    private convertTokensAmountToRawAmountIfNeeded;
    private calculateMaxCommission;
    private calculateMaxCommissionPerOrder;
    private signPermit;
}
export {};
