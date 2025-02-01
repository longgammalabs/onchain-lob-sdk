import { Signer } from 'ethers/providers';
import { EventEmitter, type PublicEventEmitter, type ToEventEmitter } from '../common';
import type { VaultConfig, VaultTotalValuesUpdate,
  VaultHistoryUpdate,
  VaultDepositActionUpdate,
  VaultDepositorUpdate,
  VaultTotalValues,
  VaultDepositAction,
  VaultDepositor,
  VaultHistory
} from '../models';
import { OnchainLobVaultService, OnchainLobVaultWebSocketService } from '../services';
import { AddLiquidityVaultParams,
  CalculateDepositDetailsSyncParams,
  CalculateWithdrawDetailsSyncParams,
  DepositDetails,
  RemoveLiquidityVaultParams,
  SubscribeToVaultDepositActionsParams,
  SubscribeToVaultDepositorsParams,
  SubscribeToVaultHistoryParams,
  SubscribeToVaultTotalValuesParams,
  UnsubscribeFromVaultDepositActionsParams,
  UnsubscribeFromVaultDepositorsParams,
  UnsubscribeFromVaultHistoryParams,
  UnsubscribeFromVaultTotalValuesParams,
  WithdrawDetails
} from './params';
import { getDepositDetails } from './depositDetails';
import { getWithdrawDetails } from './withdrawDetails';
import { OnchainLobVaultContract } from './onchainLobVaultContract';
import { ContractTransactionResponse } from 'ethers';
import * as mappers from './mappers';
import { GetVaultConfigParams,
  GetVaultDepositActionsParams,
  GetVaultDepositorsParams,
  GetVaultHistoryParams,
  GetVaultTotalValuesParams } from '../services/onchainLobVaultService/params';
import { getErrorLogMessage } from '../logging';

/**
 * Options for configuring the OnchainLobVault instance.
 *
 * @interface OnchainLobVaultOptions
 */
export interface OnchainLobVaultOptions {
  /**
   * The ethers signer used for signing transactions.
   * For only http/ws operations, you can set this to null.
   *
   * @type {Signer | null}
   */
  signer: Signer | null;

  /**
   * The base URL for the Onchain LOB Vault API.
   *
   * @type {string}
   */
  apiBaseUrl: string;

  /**
   * The base URL for the Onchain LOB WebSocket API.
   *
   * @type {string}
   */
  webSocketApiBaseUrl: string;

  /**
   * Whether to connect to the WebSocket immediately after creating the OnchainLobVault (true)
   * or when the first subscription is called (false).
   * By default, the WebSocket is connected immediately.
   *
   * @type {boolean}
   * @optional
   */
  webSocketConnectImmediately?: boolean;

  /**
   * Whether to automatically wait for transactions to be confirmed.
   *
   * @type {boolean}
   * @optional
   */
  autoWaitTransaction?: boolean;

  /**
   * Whether to use a fast algorithm for waiting for transaction to be confirmed.
   *
   * @type {boolean}
   * @optional
   */
  fastWaitTransaction?: boolean;

  /**
   * Interval between requests in milliseconds when using a fast algorithm for waiting for transaction confirmations.
   *
   * @type {number}
   * @optional
   */
  fastWaitTransactionInterval?: number;

  /**
   * Timeout in milliseconds when using a fast algorithm for waiting for transaction confirmations.
   *
   * @type {number}
   * @optional
   */
  fastWaitTransactionTimeout?: number;
}

/**
 * Events are emitted when data related to subscriptions is updated.
 */
interface OnchainLobVaultEvents {
  /**
   * Emitted when a vault total values changes, e.g. any user deposits in the vault or token prices are updated.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultTotalValuesUpdate]>}
   */
  vaultTotalValuesUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: VaultTotalValuesUpdate]>;

  /**
   * Emitted when a vault history changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultHistoryUpdate[]]>};
   */
  vaultHistoryUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: VaultHistoryUpdate[]]>;

  /**
   * Emitted when a vault deposit actions changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultDepositActionUpdate[]]>;}
   */
  vaultDepositActionsUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: VaultDepositActionUpdate[]]>;

  /**
   * Emitted when a vault depositors changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultDepositorUpdate[]]>;}
   */
  vaultDepositorsUpdated: PublicEventEmitter<readonly [isSnapshot: boolean, data: VaultDepositorUpdate[]]>;

  /**
   * Emitted when there is an error related to a subscription.
   * @event
   * @type {PublicEventEmitter<readonly [error: string]>}
   */
  subscriptionError: PublicEventEmitter<readonly [error: string]>;
}

/**
 * The OnchainLobVault is a class for interacting with the Onchain LOB Vault API.
 * It provides methods for managing user deposits and handling subscription events.
 */
export class OnchainLobVault {
  /**
   * The events related to user subscriptions.
   *
   * These events are emitted when data is updated related to subscriptions.
   */
  readonly events: OnchainLobVaultEvents = {
    vaultTotalValuesUpdated: new EventEmitter(),
    vaultDepositActionsUpdated: new EventEmitter(),
    vaultDepositorsUpdated: new EventEmitter(),
    vaultHistoryUpdated: new EventEmitter(),
    subscriptionError: new EventEmitter(),
  };

  /**
   * Indicates whether transactions should be automatically waited for by the client.
   * When true, transactions will be automatically waited for by the client until confirmation is received.
   * When false, transactions will not be waited for by the client.
   * If not set, the default value will be used.
   * This flag is used by the Onchain LOB Vault contract.
   *
   * Note: "Wait" means that the client will wait until the transaction confirmation is received.
   */
  autoWaitTransaction: boolean | undefined;

  protected signer: Signer | null;

  protected readonly onchainLobService: OnchainLobVaultService;
  protected readonly onchainLobWebSocketService: OnchainLobVaultWebSocketService;
  private vaultContract: OnchainLobVaultContract | undefined = undefined;
  protected readonly mappers: typeof mappers;
  protected readonly cachedVaultConfig: VaultConfig | undefined = undefined;
  private cachedVaultConfigPromise: Promise<VaultConfig> | undefined = undefined;

  constructor(options: Readonly<OnchainLobVaultOptions>) {
    this.signer = options.signer;
    this.autoWaitTransaction = options.autoWaitTransaction;
    this.onchainLobService = new OnchainLobVaultService(options.apiBaseUrl);
    this.onchainLobWebSocketService = new OnchainLobVaultWebSocketService(options.webSocketApiBaseUrl);
    this.mappers = mappers;

    this.attachEvents();
  }

  /**
   * Sets a new signer for the OnchainLobVault instance.
   *
   * @param {Signer | null} signer - The new signer to be set. For only http/ws operations, you can set this to null.
   * @returns {OnchainLobVault} Returns the OnchainLobVault instance for method chaining.
   */
  setSigner(signer: Signer | null): OnchainLobVault {
    this.signer = signer;
    return this;
  }

  /**
   * Retrieves the vault config information from cache.
   *
   * @returns {Promise<VaultConfig | undefined>} A Promise that resolves to the vault config information or undefined if error when requesting vault config.
   */
  async getCachedVaultConfig(): Promise<VaultConfig | undefined> {
    let vaultConfig = this.cachedVaultConfig;

    if (!vaultConfig) {
      try {
        let getVaultConfigPromise = this.cachedVaultConfigPromise;
        if (!getVaultConfigPromise) {
          getVaultConfigPromise = this.getVaultConfig({});
          this.cachedVaultConfigPromise = getVaultConfigPromise;
        }

        const vaultConfigRes = await getVaultConfigPromise;
        this.cachedVaultConfigPromise = undefined;
        vaultConfig = vaultConfigRes;
      }
      catch (error) {
        console.error(error);
      }

      if (!vaultConfig) return undefined;
    }

    return vaultConfig;
  }

  /**
   * Retrieves the vault config.
   *
   * @param {GetVaultConfigParams} params - The parameters for retrieving the vault config.
   * @returns {Promise<VaultConfig>} A Promise that resolves to vault config.
   */
  async getVaultConfig(params: GetVaultConfigParams): Promise<VaultConfig> {
    const vaultConfigDto = await this.onchainLobService.getVaultConfig(params);
    return vaultConfigDto;
  }

  /**
   * Retrieves the vault total values.
   *
   * @param {GetVaultTotalValuesParams} params - The parameters for retrieving the vault total values.
   * @returns {Promise<VaultTotalValues>} A Promise that resolves to vault total values.
   */
  async getVaultTotalValues(params: GetVaultTotalValuesParams): Promise<VaultTotalValues> {
    const [vaultConfig, vaultTotalValuesDto] = await Promise.all([
      this.ensureVaultConfig(),
      this.onchainLobService.getVaultTotalValues(params),
    ]);
    const vaultTotalValues = mappers.mapVaultTotalValuesDtoToVaultTotalValues(vaultTotalValuesDto, vaultConfig.tokens);
    return vaultTotalValues;
  }

  /**
   * Retrieves the vault deposit actions.
   *
   * @param {GetVaultDepositActionsParams} params - The parameters for retrieving the vault deposit actions.
   * @returns {Promise<VaultDepositAction[]>} A Promise that resolves to vault deposit actions.
   */
  async getVaultDepositActions(params: GetVaultDepositActionsParams): Promise<VaultDepositAction[]> {
    const [vaultConfig, vaultDepositActionsDtos] = await Promise.all([
      this.ensureVaultConfig(),
      this.onchainLobService.getVaultDepositActions(params),
    ]);
    const vaultDepositActions = vaultDepositActionsDtos.map(
      depositActionDto => {
        const token = vaultConfig.tokens.find(token => token.symbol === depositActionDto.tokenSymbol)!;
        return mappers.mapVaultDepositActionDtoToVaultDepositAction(depositActionDto, token.decimals, vaultConfig.lpToken.decimals);
      }
    );
    return vaultDepositActions;
  }

  /**
   * Retrieves the vault depositors.
   *
   * @param {GetVaultDepositorsParams} params - The parameters for retrieving the vault depositors.
   * @returns {Promise<VaultDepositor[]>} A Promise that resolves to vault depositors.
   */
  async getVaultDepositors(params: GetVaultDepositorsParams): Promise<VaultDepositor[]> {
    const [vaultConfig, vaultDepositorsDtos] = await Promise.all([
      this.ensureVaultConfig(),
      this.onchainLobService.getVaultDepositors(params),
    ]);
    const vaultDepositors = vaultDepositorsDtos.map(
      depositorDto => mappers.mapVaultDepositorDtoToVaultDepositor(depositorDto, vaultConfig.lpToken.decimals)
    );
    return vaultDepositors;
  }

  /**
   * Retrieves the vault history.
   *
   * @param {GetVaultHistoryParams} params - The parameters for retrieving the vault history.
   * @returns {Promise<VaultDepositor[]>} A Promise that resolves to vault history.
   */
  async getVaultHistory(params: GetVaultHistoryParams): Promise<VaultHistory[]> {
    const vaultHistoryDtos = await this.onchainLobService.getVaultHistory(params);
    return vaultHistoryDtos;
  }

  /**
   * Subscribes to the vault total values updates.
   *
   * @emits OnchainLobVault#events#vaultTotalValuesUpdated
   */
  subscribeToVaultTotalValues(params: SubscribeToVaultTotalValuesParams): void {
    this.onchainLobWebSocketService.subscribeToVaultTotalValues(params);
  }

  /**
   * Unsubscribes from the vault total values updates.
   */
  unsubscribeToVaultTotalValues(params: UnsubscribeFromVaultTotalValuesParams): void {
    this.onchainLobWebSocketService.unsubscribeFromVaultTotalValues(params);
  }

  /**
   * Subscribes to the vault deposit actions updates.
   *
   * @emits OnchainLobVault#events#vaultDepositActionsUpdated
   */
  subscribeToVaultDepositActions(params: SubscribeToVaultDepositActionsParams): void {
    this.onchainLobWebSocketService.subscribeToVaultDepositActions(params);
  }

  /**
   * Unsubscribes from the vault deposit actions updates.
   */
  unsubscribeFromVaultDepositActions(params: UnsubscribeFromVaultDepositActionsParams): void {
    this.onchainLobWebSocketService.unsubscribeFromVaultDepositActions(params);
  }

  /**
   * Subscribes to the vault depositors updates.
   *
   * @emits OnchainLobVault#events#vaultDepositorsUpdated
   */
  subscribeToVaultDepositors(params: SubscribeToVaultDepositorsParams): void {
    this.onchainLobWebSocketService.subscribeToVaultDepositors(params);
  }

  /**
   * Unsubscribes from the vault depositors updates.
   */
  unsubscribeFromVaultDepositors(params: UnsubscribeFromVaultDepositorsParams): void {
    this.onchainLobWebSocketService.unsubscribeFromVaultDepositors(params);
  }

  /**
   * Subscribes to the vault history updates.
   *
   * @param {SubscribeToVaultHistoryParams} params - The parameters for subscribing to the vault history updates.
   * @emits OnchainLobVault#events#vaultHistoryUpdated
   */
  subscribeToVaultHistory(params: SubscribeToVaultHistoryParams): void {
    this.onchainLobWebSocketService.subscribeToVaultHistory(params);
  }

  /**
   * Unsubscribes from the vault history updates.
   *
   * @param {UnsubscribeFromVaultHistoryParams} params - The parameters for unsubscribing from the vault history updates.
   */
  unsubscribeFromVaultHistory(params: UnsubscribeFromVaultHistoryParams): void {
    this.onchainLobWebSocketService.unsubscribeFromVaultHistory(params);
  }

  protected async ensureVaultConfig(): Promise<VaultConfig> {
    const vaultConfig = await this.getCachedVaultConfig();
    if (!vaultConfig)
      throw new Error(`Vault config not found`);

    return vaultConfig;
  }

  protected async getVaultContract(): Promise<OnchainLobVaultContract> {
    if (this.signer === null) {
      throw new Error('Signer is not set');
    }

    if (!this.vaultContract) {
      const vault = await this.getVaultConfig({});

      this.vaultContract = new OnchainLobVaultContract({
        vault: vault,
        signer: this.signer,
        autoWaitTransaction: this.autoWaitTransaction,
      });
    }

    return this.vaultContract;
  }

  protected attachEvents(): void {
    this.onchainLobWebSocketService.events.vaultTotalValuesUpdated.addListener(this.onVaultTotalValuesUpdated);
    this.onchainLobWebSocketService.events.vaultDepositActionsUpdated.addListener(this.onVaultDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultDepositorsUpdated.addListener(this.onVaultDepositorsUpdated);
    this.onchainLobWebSocketService.events.vaultHistoryUpdated.addListener(this.onVaultHistoryUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.addListener(this.onSubscriptionError);
  }

  protected detachEvents(): void {
    this.onchainLobWebSocketService.events.vaultTotalValuesUpdated.removeListener(this.onVaultTotalValuesUpdated);
    this.onchainLobWebSocketService.events.vaultDepositActionsUpdated.removeListener(this.onVaultDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultDepositorsUpdated.removeListener(this.onVaultDepositorsUpdated);
    this.onchainLobWebSocketService.events.vaultHistoryUpdated.removeListener(this.onVaultHistoryUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.removeListener(this.onSubscriptionError);
  }

  protected onVaultTotalValuesUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultTotalValuesUpdated['addListener']>[0] = async (isSnapshot, data) => {
    try {
      const vaultConfig = await this.getCachedVaultConfig();
      if (!vaultConfig)
        return;
      const totalValuesUpdates = this.mappers.mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate(data, vaultConfig.tokens);
      (this.events.vaultTotalValuesUpdated as ToEventEmitter<typeof this.events.vaultTotalValuesUpdated>).emit(isSnapshot, totalValuesUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onVaultDepositActionsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultDepositActionsUpdated['addListener']>[0] = async (isSnapshot, data) => {
    try {
      const vaultConfig = await this.getCachedVaultConfig();
      if (!vaultConfig)
        return;
      const depositActionUpdates = data.map(
        depositActionDto => {
          const token = vaultConfig.tokens.find(token => token.symbol === depositActionDto.tokenSymbol)!;
          return mappers.mapVaultDepositActionDtoToVaultDepositAction(depositActionDto, token.decimals, vaultConfig.lpToken.decimals);
        }
      );
      (this.events.vaultDepositActionsUpdated as ToEventEmitter<typeof this.events.vaultDepositActionsUpdated>).emit(isSnapshot, depositActionUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onVaultDepositorsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultDepositorsUpdated['addListener']>[0] = async (isSnapshot, data) => {
    try {
      const vaultConfig = await this.getCachedVaultConfig();
      if (!vaultConfig)
        return;
      const depositorsUpdates = data.map(
        depositorDto => mappers.mapVaultDepositorDtoToVaultDepositor(depositorDto, vaultConfig.lpToken.decimals)
      );
      (this.events.vaultDepositorsUpdated as ToEventEmitter<typeof this.events.vaultDepositorsUpdated>).emit(isSnapshot, depositorsUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onVaultHistoryUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultHistoryUpdated['addListener']>[0] = (isSnapshot, data) => {
    try {
      (this.events.vaultHistoryUpdated as ToEventEmitter<typeof this.events.vaultHistoryUpdated>).emit(isSnapshot, data);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onSubscriptionError: Parameters<typeof this.onchainLobWebSocketService.events.subscriptionError['addListener']>[0] = error => {
    (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(error);
  };

  /**
   * Calculates the deposit LP details for a given token inputs without API request.
   *
   * @param {CalculateDepositDetailsSyncParams} params - The parameters for the deposit LP details calculation.
   * @returns {DepositDetails} Deposit LP details data.
   */
  calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails {
    return getDepositDetails(params);
  }

  /**
   * Calculates the withdraw LP details for a given token inputs without API request.
   *
   * @param {CalculateWithdrawDetailsSyncParams} params - The parameters for the withdraw LP details calculation.
   * @returns {WithdrawDetails} Withdraw LP details data.
   */
  calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails {
    return getWithdrawDetails(params);
  }

  /**
   * Deposit tokens amount into the vault
   *
   * @param {AddLiquidityVaultParams} params - The parameters for deposit.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse> {
    const vaultContract = await this.getVaultContract();

    return vaultContract.addLiquidity(params);
  }

  /**
   * Withdraw LP amount from the vault
   *
   * @param {RemoveLiquidityVaultParams} params - The parameters for withdraw.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse> {
    const vaultContract = await this.getVaultContract();

    return vaultContract.removeLiquidity(params);
  }
}
