import BigNumber from 'bignumber.js';
import { Contract, type Signer, ContractTransactionResponse, Transaction, TransactionResponse } from 'ethers';

import type { CustomSignTransaction } from '../onchainLobClient';
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
  syncSendRawTransaction?: boolean;
  customSignTransaction?: CustomSignTransaction;
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
  syncSendRawTransaction: boolean;
  customSignTransaction?: CustomSignTransaction;

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
    this.syncSendRawTransaction = options.syncSendRawTransaction ?? false;
    this.customSignTransaction = options.customSignTransaction;

    this.vaultContract = new Contract(options.vault.vaultAddress, lpManagerAbi, options.signer);
    this.pythConnection = new EvmPriceServiceConnection('https://hermes.pyth.network');
  }

  async approveTokens(params: ApproveVaultParams): Promise<ContractTransactionResponse> {
    let token = this.vault.tokens.find(token => token.contractAddress === params.token);

    if (params.token === this.vault.lpToken.contractAddress) {
      token = this.vault.lpToken;
    }

    if (!token) {
      throw Error('Token is not in the pool and not a LP token.');
    }
    const tokenContract = new Contract(
      token.contractAddress,
      erc20Abi,
      this.signer
    );

    const amount = this.convertTokensAmountToRawAmountIfNeeded(params.amount, token.decimals);
    const tx = await this.processContractMethodCall(
      tokenContract,
      tokenContract.approve!,
      [
        params.vault,
        amount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ]);

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
      tokenContract.deposit!,
      [
        {
          value: amount,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ]);

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
      tokenContract.withdraw!,
      [
        amount,
        {
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ]);

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

    const perFeedFeeRaw = this.convertTokensAmountToRawAmountIfNeeded(
      params.perFeedFee ?? 1n,
      18
    );
    const totalFee = perFeedFeeRaw * BigInt(priceUpdateFeedIds.length);

    const tx = await this.processContractMethodCall(
      this.vaultContract,
      this.vaultContract.addLiquidity!,
      [
        BigInt(tokenId.id),
        amount,
        amountUsd,
        minLpMinted,
        expires,
        priceUpdateData,
        {
          value: totalFee,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ]);

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

    const perFeedFeeRaw = this.convertTokensAmountToRawAmountIfNeeded(
      params.perFeedFee ?? 1n,
      18
    );
    const totalFee = perFeedFeeRaw * BigInt(priceUpdateFeedIds.length);

    const tx = await this.processContractMethodCall(
      this.vaultContract,
      this.vaultContract.removeLiquidity!,
      [
        BigInt(tokenId.id),
        burnLP,
        minUsdValue,
        minTokenGet,
        expires,
        priceUpdateData,
        {
          value: totalFee,
          gasLimit: params.gasLimit,
          nonce: params.nonce,
          maxFeePerGas: params.maxFeePerGas,
          maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        }
      ]);

    return tx;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async processContractMethodCall(contract: Contract, method: any, args: any[]): Promise<ContractTransactionResponse> {
    const methodName = method.fragment?.name ?? method.name ?? 'unknown';
    if (this.syncSendRawTransaction) {
      try {
        console.log(`[onchain-lob-sdk] Sending tx via syncSendRawTransaction: ${methodName}`);
        return await this.processContractMethodCallSync(contract, method, args);
      }
      catch (error: any) {
        if (error.code === 'UNSUPPORTED_OPERATION'
          || error.message?.includes('eth_signTransaction')
          || error.error?.message?.includes('Method not supported')
        ) {
          console.log(`[onchain-lob-sdk] syncSendRawTransaction not supported, falling back to normal flow: ${methodName}`, error.message);
          // signTransaction not supported (e.g. browser wallet) — fall through to normal flow
        }
        else {
          if (error.data) {
            try {
              const decodedError = contract.interface.parseError(error.data);
              throw new Error(`${decodedError ? `${decodedError.name} [${decodedError.selector}]` : `Unknown error: [${error.data}]`}`);
            }
            catch (parseError) {
              if (parseError instanceof Error && parseError.message.includes('[')) throw parseError;
              console.error('Failed to parse contract error:', parseError);
              throw error;
            }
          }
          throw error;
        }
      }
    }

    console.log(`[onchain-lob-sdk] Sending tx via normal flow (eth_sendTransaction): ${methodName}`);
    const normalStart = Date.now();
    try {
      const tx = await method(...args);
      console.log(`[onchain-lob-sdk] Tx sent: ${methodName}, hash: ${tx.hash}, took ${Date.now() - normalStart}ms`);

      if (this.autoWaitTransaction) {
        if (this.fastWaitTransaction) {
          console.log(`[onchain-lob-sdk] Waiting for tx (fast): ${methodName}`);
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
          console.log(`[onchain-lob-sdk] Waiting for tx (wait): ${methodName}`);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async processContractMethodCallSync(contract: Contract, method: any, args: any[]): Promise<ContractTransactionResponse> {
    const methodName = method.fragment?.name ?? method.name ?? 'unknown';
    const totalStart = Date.now();
    let stepStart = totalStart;

    const contractTx = await method.populateTransaction(...args);
    console.log(`[onchain-lob-sdk] syncSend [${methodName}] populateTransaction: ${Date.now() - stepStart}ms`);

    stepStart = Date.now();
    const populatedTx = await this.signer.populateTransaction(contractTx);
    console.log(`[onchain-lob-sdk] syncSend [${methodName}] signer.populateTransaction: ${Date.now() - stepStart}ms`);

    const provider = this.signer.provider!;

    if (!populatedTx.gasLimit) {
      stepStart = Date.now();
      populatedTx.gasLimit = await provider.estimateGas(populatedTx);
      console.log(`[onchain-lob-sdk] syncSend [${methodName}] estimateGas: ${Date.now() - stepStart}ms`);
    }
    if (!populatedTx.maxFeePerGas) {
      stepStart = Date.now();
      const feeData = await provider.getFeeData();
      populatedTx.maxFeePerGas = feeData.maxFeePerGas;
      populatedTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      console.log(`[onchain-lob-sdk] syncSend [${methodName}] getFeeData: ${Date.now() - stepStart}ms`);
    }
    if (populatedTx.nonce === undefined || populatedTx.nonce === null || populatedTx.nonce === 0) {
      stepStart = Date.now();
      const address = await this.signer.getAddress();
      populatedTx.nonce = await provider.getTransactionCount(address, 'pending');
      console.log(`[onchain-lob-sdk] syncSend [${methodName}] getTransactionCount: ${Date.now() - stepStart}ms`);
    }

    stepStart = Date.now();
    const signedTx = this.customSignTransaction
      ? await this.customSignTransaction(populatedTx)
      : await this.signer.signTransaction(populatedTx);
    console.log(`[onchain-lob-sdk] syncSend [${methodName}] sign (${this.customSignTransaction ? 'custom' : 'signer'}): ${Date.now() - stepStart}ms`);

    const txObj = Transaction.from(signedTx);

    stepStart = Date.now();
    const result = await (provider as any).send('eth_sendRawTransactionSync', [signedTx, 'pending']);
    const hash: string = typeof result === 'string' ? result : result.transactionHash;
    console.log(`[onchain-lob-sdk] syncSend [${methodName}] eth_sendRawTransactionSync: ${Date.now() - stepStart}ms`);
    console.log(`[onchain-lob-sdk] syncSend [${methodName}] TOTAL: ${Date.now() - totalStart}ms, hash: ${hash}`);

    const baseTxResponse = new TransactionResponse({
      blockNumber: null,
      blockHash: null,
      hash: hash ?? txObj.hash!,
      index: 0,
      type: txObj.type ?? 2,
      to: txObj.to,
      from: txObj.from!,
      nonce: txObj.nonce,
      gasLimit: txObj.gasLimit,
      gasPrice: txObj.gasPrice ?? 0n,
      maxPriorityFeePerGas: txObj.maxPriorityFeePerGas ?? 0n,
      maxFeePerGas: txObj.maxFeePerGas,
      data: txObj.data,
      value: txObj.value,
      chainId: txObj.chainId,
      signature: txObj.signature!,
      accessList: txObj.accessList,
    }, provider);
    return new ContractTransactionResponse(contract.interface, provider, baseTxResponse);
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
