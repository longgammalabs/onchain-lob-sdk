import BigNumber from 'bignumber.js';
import { Contract, type Signer, ContractTransactionResponse } from 'ethers';

import type {
  AddLiquidityVaultParams,
  ApproveVaultParams,
  RemoveLiquidityVaultParams,
  UnwrapNativeTokenVaultParams,
  WrapNativeTokenVaultParams
} from './params';
import { erc20Abi, erc20WethAbi, lpManagerAbi } from '../abi';
import type { VaultConfig } from '../models';
import { tokenUtils } from '../utils';
import { wait } from '../utils/delay';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

export interface OnchainLobVaultContractOptions {
  vault: VaultConfig;
  signer: Signer;
  autoWaitTransaction?: boolean;
  fastWaitTransaction?: boolean;
  fastWaitTransactionInterval?: number;
  fastWaitTransactionTimeout?: number;
}

const getExpires = () => BigInt(Math.floor(Date.now() / 1000) + 5 * 60);

export class OnchainLobVaultContract {
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
  private _chainId: bigint | undefined;
  protected get chainId(): Promise<bigint> {
    if (this._chainId === undefined) {
      return this.signer.provider!.getNetwork().then(network => {
        this._chainId = network.chainId;
        return this._chainId;
      });
    }
    return Promise.resolve(this._chainId);
  }

  protected pythConnection: EvmPriceServiceConnection;

  constructor(options: Readonly<OnchainLobVaultContractOptions>) {
    this.vault = options.vault;
    this.signer = options.signer;
    this.autoWaitTransaction = options.autoWaitTransaction ?? OnchainLobVaultContract.defaultAutoWaitTransaction;
    this.fastWaitTransaction = options.fastWaitTransaction ?? OnchainLobVaultContract.defaultFastWaitTransaction;
    this.fastWaitTransactionInterval = options.fastWaitTransactionInterval ?? OnchainLobVaultContract.defaultFastWaitTransactionInterval;
    this.fastWaitTransactionTimeout = options.fastWaitTransactionTimeout;

    this.vaultContract = new Contract(options.vault.vaultAddress, lpManagerAbi, options.signer);
    this.pythConnection = new EvmPriceServiceConnection('https://hermes.pyth.network');
  }

  async approveTokens(params: ApproveVaultParams): Promise<ContractTransactionResponse> {
    const token = this.vault.tokens.find(token => token.contractAddress === params.token);

    if (!token) {
      throw Error('Token is not in the pool.');
    }
    const tokenContract = new Contract(
      token.contractAddress,
      erc20Abi,
      this.signer
    );

    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.approve!(
        params.vault,
        amount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ));

    return tx;
  }

  async wrapNativeToken(params: WrapNativeTokenVaultParams): Promise<ContractTransactionResponse> {
    const tokenContract = new Contract(
      params.token.contractAddress,
      erc20WethAbi,
      this.signer
    );

    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, params.token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.deposit!(
        {
          value: amount,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ));

    return tx;
  }

  async unwrapNativeToken(params: UnwrapNativeTokenVaultParams): Promise<ContractTransactionResponse> {
    const tokenContract = new Contract(
      params.token.contractAddress,
      erc20WethAbi,
      this.signer
    );

    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, params.token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.withdraw!(
        amount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ));

    return tx;
  }

  async addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse> {
    const token = this.vault.tokens.find(token => token.contractAddress === params.token);

    if (!token) {
      throw Error('Token is not in the pool.');
    }

    const tokenId = this.vault.tokenIds.find(tokenId => tokenId.tokenAddress === token.contractAddress);

    if (!tokenId) {
      throw Error('Token Id not found.');
    }

    const priceUpdateFeedIds = this.vault.tokens.map(t => t.priceFeed || '');
    const priceUpdateData = await this.getPriceUpdateData(priceUpdateFeedIds);

    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const amountUsd = this.convertTokensAmountToRawAmountIfNeeded(params.amountUsd, 18);
    const minLpMinted = this.convertTokensAmountToRawAmountIfNeeded(params.minLpMinted, this.vault.lpToken.decimals);
    const expires = getExpires();

    console.log(`tokenId: ${BigInt(tokenId.id)}`);
    console.log(`amount: ${amount}`);
    console.log(`amountUsd: ${amountUsd}`);
    console.log(`minLpMinted: ${minLpMinted}`);
    console.log(`expires: ${expires}`);
    console.log(`priceUpdateData`);
    console.log(priceUpdateData);

    const tx = await this.processContractMethodCall(
      this.vaultContract,
      this.vaultContract.addLiquidity!(
        BigInt(tokenId.id),
        amount,
        amountUsd,
        minLpMinted,
        expires,
        priceUpdateData,
        {
          value: priceUpdateFeedIds.length,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ));

    return tx;
  }

  async removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse> {
    const token = this.vault.tokens.find(token => token.contractAddress === params.token);

    if (!token) {
      throw Error('Token is not in the pool.');
    }

    const tokenId = this.vault.tokenIds.find(tokenId => tokenId.tokenAddress === token.contractAddress);

    if (!tokenId) {
      throw Error('Token Id not found.');
    }

    const priceUpdateFeedIds = this.vault.tokens.map(t => t.priceFeed || '');
    const priceUpdateData = await this.getPriceUpdateData(priceUpdateFeedIds);

    const burnLP = this.convertTokensAmountToRawAmountIfNeeded(params.burnLP, this.vault.lpToken.decimals);
    const minUsdValue = this.convertTokensAmountToRawAmountIfNeeded(params.minUsdValue, 18);
    const minTokenGet = this.convertTokensAmountToRawAmountIfNeeded(params.minTokenGet, token.decimals);
    const expires = getExpires();

    const tx = await this.processContractMethodCall(
      this.vaultContract,
      this.vaultContract.removeLiquidity!(
        BigInt(tokenId.id),
        burnLP,
        minUsdValue,
        minTokenGet,
        expires,
        priceUpdateData,
        {
          value: priceUpdateFeedIds.length,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ));

    return tx;
  }

  protected async processContractMethodCall(contract: Contract, methodCall: Promise<ContractTransactionResponse>): Promise<ContractTransactionResponse> {
    try {
      const tx = await methodCall;

      if (this.autoWaitTransaction) {
        if (this.fastWaitTransaction) {
          const startingTime = Date.now();
          let receipt = await tx.provider.getTransactionReceipt(tx.hash);

          while (receipt == null) {
            if (this.fastWaitTransactionTimeout && Date.now() - startingTime >= this.fastWaitTransactionTimeout) {
              break; // timeout reached
            }

            await wait(this.fastWaitTransactionInterval);
            receipt = await tx.provider.getTransactionReceipt(tx.hash);
          }
        }
        else {
          await tx.wait();
        }
      }

      return tx;
    }
    catch (error) {
      if ((error as any).data) {
        try {
          const decodedError = contract.interface.parseError((error as any).data);
          throw new Error(`${decodedError ? `${decodedError.name} [${decodedError.selector}]` : `Unknown error: [${(error as any).data}]`}`);
        }
        catch (parseError) {
          // If error parsing fails, throw the original error
          console.error('Failed to parse contract error:', parseError);
          throw error;
        }
      }

      throw error;
    }
  }

  private convertTokensAmountToRawAmountIfNeeded(amount: BigNumber | bigint, decimals: number): bigint {
    return typeof amount === 'bigint'
      ? amount
      : tokenUtils.convertTokensAmountToRawAmount(amount, decimals);
  }

  protected async getPriceUpdateData(feedPriceIds: string[]): Promise<string[]> {
    try {
      const updateData = await this.pythConnection.getPriceFeedsUpdateData(feedPriceIds);
      return updateData;
    }
    catch (error) {
      console.error('Failed to get price update data from pyth:', error);
      throw error;
    }
  }
}
