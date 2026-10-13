import type { ContractTransactionResponse } from 'ethers';
import { OnchainLobSpotMarketContract } from './onchainLobSpotMarketContract';
import type { BatchChangeOrderSpotParams, BatchClaimOrderSpotParams, BatchPlaceOrderSpotParams, ChangeOrderSpotParams, ClaimOrderSpotParams, PlaceMarketOrderWithTargetValueWithPermitParams, PlaceOrderSpotParams, PlaceOrderWithPermitSpotParams, SetClaimableStatusParams, SetProxyTraderPermissionsSpotParams } from './params';
/**
 * A spot market on a PageBook (MIP-8 order book).
 *
 * `placeOrder`, `placeMarketOrderWithTargetValue`, `depositTokens`, `withdrawTokens` and `approveTokens` are the
 * Hanji calls. The rest differ:
 * - `expires` of an order is also its lifetime, so limit orders default to resting until cancelled;
 * - `claimOrder` names the owner of the order;
 * - the trader config addresses the trader by its id (`traderId`);
 * - `batchClaim` is a `batchExecute` of `claimOrder` calls, which reverts as a whole if one claim fails;
 * - there are no permits, no fast quoter proxy and no order changes.
 */
export declare class OnchainLobSpotPageBookMarketContract extends OnchainLobSpotMarketContract {
    /**
     * Sets whether others may claim the signer's orders; the other two flags of the trader config are kept.
     */
    setClaimableStatus(params: SetClaimableStatusParams): Promise<ContractTransactionResponse>;
    claimOrder(params: ClaimOrderSpotParams): Promise<ContractTransactionResponse>;
    batchClaim(params: BatchClaimOrderSpotParams): Promise<ContractTransactionResponse>;
    placeOrderWithPermit(_params: PlaceOrderWithPermitSpotParams): Promise<ContractTransactionResponse>;
    placeMarketOrderWithTargetValueWithPermit(_params: PlaceMarketOrderWithTargetValueWithPermitParams): Promise<ContractTransactionResponse>;
    setProxyTraderPermissions(_params: SetProxyTraderPermissionsSpotParams): Promise<ContractTransactionResponse>;
    batchPlaceOrder(_params: BatchPlaceOrderSpotParams): Promise<ContractTransactionResponse>;
    changeOrder(_params: ChangeOrderSpotParams): Promise<ContractTransactionResponse>;
    batchChangeOrder(_params: BatchChangeOrderSpotParams): Promise<ContractTransactionResponse>;
    protected getOrderExpires(type: PlaceOrderSpotParams['type']): bigint;
    private getTraderId;
    /**
     * Whether a claim pays the wrapped native token out as native, as the signer's trader config
     * says: the same way the book pays the fills of the signer's orders.
     */
    private getWithdrawAsNativeToken;
    /**
     * The trader id of the signer. A signer that has not traded yet has none, so it is registered
     * first; a given nonce then goes to the registration and the next one to the call itself, so a
     * retry after a failed call needs a fresh nonce.
     */
    private ensureTraderId;
    private getTxParams;
}
