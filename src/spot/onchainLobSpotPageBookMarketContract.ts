import type { ContractTransactionResponse } from 'ethers';

import { UnsupportedMarketMethodError } from './errors';
import { getExpires, OnchainLobSpotMarketContract } from './onchainLobSpotMarketContract';
import type {
  BatchChangeOrderSpotParams,
  BatchClaimOrderSpotParams,
  BatchPlaceOrderSpotParams,
  ChangeOrderSpotParams,
  ClaimOrderSpotParams,
  DepositSpotParams,
  PlaceMarketOrderWithTargetValueWithPermitParams,
  PlaceOrderSpotParams,
  PlaceOrderWithPermitSpotParams,
  SetClaimableStatusParams,
  SetProxyTraderPermissionsSpotParams,
  TransactionParams,
  WithdrawSpotParams
} from './params';

// The latest time a PageBook order can rest until: the contract keeps `expires` as uint32.
const MAX_ORDER_EXPIRES = 2n ** 32n - 1n;

const nextNonce = (nonce: TransactionParams['nonce']): TransactionParams['nonce'] => {
  if (nonce === undefined) return undefined;
  return typeof nonce === 'bigint' ? nonce + 1n : nonce.plus(1);
};

/**
 * A spot market on a PageBook (MIP-8 order book).
 *
 * `placeOrder`, `placeMarketOrderWithTargetValue` and `approveTokens` are the Hanji calls. The rest differ:
 * - `expires` of an order is also its lifetime, so limit orders default to resting until cancelled;
 * - `claimOrder` names the owner of the order;
 * - deposits, withdrawals and the trader config address the trader by its id (`traderId`);
 * - `batchClaim` is a `batchExecute` of `claimOrder` calls, which reverts as a whole if one claim fails;
 * - there are no permits, no fast quoter proxy and no order changes.
 */
export class OnchainLobSpotPageBookMarketContract extends OnchainLobSpotMarketContract {
  override async depositTokens(params: DepositSpotParams): Promise<ContractTransactionResponse> {
    const baseTokenAmount = this.convertTokensAmountToRawAmountIfNeeded(params.baseTokenAmount, this.market.tokenXScalingFactor);
    const quoteTokenAmount = this.convertTokensAmountToRawAmountIfNeeded(params.quoteTokenAmount, this.market.tokenYScalingFactor);
    const { id, txParams } = await this.ensureTraderId(params);

    return this.processContractMethodCall(
      this.marketContract,
      this.marketContract.depositTokens!(id, baseTokenAmount, quoteTokenAmount, txParams)
    );
  }

  override async withdrawTokens(params: WithdrawSpotParams): Promise<ContractTransactionResponse> {
    const withdrawAll = !!params.withdrawAll;
    const baseTokenAmount = withdrawAll ? 0n : this.convertTokensAmountToRawAmountIfNeeded(params.baseTokenAmount, this.market.tokenXScalingFactor);
    const quoteTokenAmount = withdrawAll ? 0n : this.convertTokensAmountToRawAmountIfNeeded(params.quoteTokenAmount, this.market.tokenYScalingFactor);
    const id = await this.getTraderId();
    if (id === 0n) {
      throw new Error('The signer has no trader on this market, so there is nothing to withdraw');
    }

    return this.processContractMethodCall(
      this.marketContract,
      this.marketContract.withdrawTokens!(id, withdrawAll, baseTokenAmount, quoteTokenAmount, this.getTxParams(params))
    );
  }

  /**
   * Sets whether others may claim the signer's orders; the other two flags of the trader config are kept.
   */
  override async setClaimableStatus(params: SetClaimableStatusParams): Promise<ContractTransactionResponse> {
    const { id, txParams } = await this.ensureTraderId(params);
    const [, , transferTokens, withdrawAsNativeEth] = await this.marketContract.getTraderConfig!(id);

    return this.processContractMethodCall(
      this.marketContract,
      this.marketContract.setTraderConfig!(id, params.status, transferTokens, withdrawAsNativeEth, txParams)
    );
  }

  override async claimOrder(params: ClaimOrderSpotParams): Promise<ContractTransactionResponse> {
    const owner = await this.signer.getAddress();

    return this.processContractMethodCall(
      this.marketContract,
      this.marketContract.claimOrder!(
        owner,
        params.orderId,
        params.onlyClaim,
        params.transferExecutedTokens ?? this.transferExecutedTokensEnabled,
        false,
        getExpires(),
        this.getTxParams(params)
      )
    );
  }

  override async batchClaim(params: BatchClaimOrderSpotParams): Promise<ContractTransactionResponse> {
    const expires = getExpires();
    const calls = params.claimParams.map(claim => this.marketContract.interface.encodeFunctionData(
      'claimOrder',
      [claim.address, claim.orderId, params.onlyClaim, this.transferExecutedTokensEnabled, false, expires]
    ));

    return this.processContractMethodCall(
      this.marketContract,
      this.marketContract.batchExecute!(calls, this.getTxParams(params))
    );
  }

  override placeOrderWithPermit(_params: PlaceOrderWithPermitSpotParams): Promise<ContractTransactionResponse> {
    throw new UnsupportedMarketMethodError('placeOrderWithPermit', this.market.id);
  }

  override placeMarketOrderWithTargetValueWithPermit(_params: PlaceMarketOrderWithTargetValueWithPermitParams): Promise<ContractTransactionResponse> {
    throw new UnsupportedMarketMethodError('placeMarketOrderWithTargetValueWithPermit', this.market.id);
  }

  override setProxyTraderPermissions(_params: SetProxyTraderPermissionsSpotParams): Promise<ContractTransactionResponse> {
    throw new UnsupportedMarketMethodError('setProxyTraderPermissions', this.market.id);
  }

  override batchPlaceOrder(_params: BatchPlaceOrderSpotParams): Promise<ContractTransactionResponse> {
    throw new UnsupportedMarketMethodError('batchPlaceOrder', this.market.id);
  }

  override changeOrder(_params: ChangeOrderSpotParams): Promise<ContractTransactionResponse> {
    throw new UnsupportedMarketMethodError('changeOrder', this.market.id);
  }

  override batchChangeOrder(_params: BatchChangeOrderSpotParams): Promise<ContractTransactionResponse> {
    throw new UnsupportedMarketMethodError('batchChangeOrder', this.market.id);
  }

  protected override getOrderExpires(type: PlaceOrderSpotParams['type']): bigint {
    switch (type) {
      case 'limit':
      case 'limit_post_only':
        return MAX_ORDER_EXPIRES;
      default:
        return getExpires();
    }
  }

  private async getTraderId(): Promise<bigint> {
    return this.marketContract.traderId!(await this.signer.getAddress());
  }

  /**
   * The trader id of the signer. A signer that has not traded yet has none, so it is registered
   * first; a given nonce then goes to the registration and the next one to the call itself.
   */
  private async ensureTraderId(params: TransactionParams): Promise<{ id: bigint; txParams: TransactionParams }> {
    const id = await this.getTraderId();
    if (id !== 0n) {
      return { id, txParams: this.getTxParams(params) };
    }

    const registration = await this.marketContract.registerTrader!(this.getTxParams(params));
    await registration.wait();

    return {
      id: await this.getTraderId(),
      txParams: this.getTxParams({ ...params, nonce: nextNonce(params.nonce) }),
    };
  }

  private getTxParams(params: TransactionParams): TransactionParams {
    return {
      gasLimit: params.gasLimit,
      nonce: params.nonce,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
    };
  }
}
