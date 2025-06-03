import { Signer } from 'ethers/providers';
import { EventEmitter, type PublicEventEmitter, type ToEventEmitter } from '../common';
import type { VaultConfig, VaultTotalValuesUpdate,
  VaultHistoryUpdate,
  VaultDepositActionUpdate,
  VaultDepositorUpdate,
  VaultTotalValues,
  VaultDepositAction,
  VaultDepositor,
  VaultHistory,
  VaultListItem
} from '../models';
import { OnchainLobVaultService, OnchainLobVaultWebSocketService } from '../services';
import { AddLiquidityVaultParams,
  ApproveVaultParams,
  CalculateDepositDetailsSyncParams,
  CalculateWithdrawDetailsSyncParams,
  DepositDetails,
  GetVaultConfigParams,
  GetVaultConfigsParams,
  GetVaultDepositActionsParams,
  GetVaultDepositorsParams,
  GetVaultHistoryParams,
  GetVaultsListParams,
  GetVaultTotalValuesParams,
  RemoveLiquidityVaultParams,
  SubscribeToVaultDepositActionsParams,
  SubscribeToVaultDepositorsParams,
  SubscribeToVaultHistoryParams,
  SubscribeToVaultTotalValuesParams,
  SubscribeToVaultUserDepositActionsParams,
  UnsubscribeFromVaultDepositActionsParams,
  UnsubscribeFromVaultDepositorsParams,
  UnsubscribeFromVaultHistoryParams,
  UnsubscribeFromVaultTotalValuesParams,
  UnsubscribeFromVaultUserDepositActionsParams,
  UnwrapNativeTokenVaultParams,
  WithdrawDetails,
  WrapNativeTokenVaultParams
} from './params';
import { getDepositDetails } from './depositDetails';
import { getWithdrawDetails } from './withdrawDetails';
import { OnchainLobVaultContract } from './onchainLobVaultContract';
import { ContractTransactionResponse } from 'ethers';
import * as mappers from './mappers';
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
  vaultTotalValuesUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultTotalValuesUpdate]>;

  /**
   * Emitted when a vault history changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultHistoryUpdate[]]>};
   */
  vaultHistoryUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultHistoryUpdate[]]>;

  /**
   * Emitted when a vault deposit actions changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultDepositActionUpdate[]]>;}
   */
  vaultDepositActionsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositActionUpdate[]]>;

  /**
   * Emitted when a user's vault deposit actions changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultUserDepositActionUpdate[]]>;}
   */
  vaultUserDepositActionsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositActionUpdate[]]>;

  /**
   * Emitted when a vault depositors changes.
   * @event
   * @type {PublicEventEmitter<readonly [data: VaultDepositorUpdate[]]>;}
   */
  vaultDepositorsUpdated: PublicEventEmitter<readonly [vaultId: string, isSnapshot: boolean, data: VaultDepositorUpdate[]]>;

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
    vaultUserDepositActionsUpdated: new EventEmitter(),
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
  private vaultContracts: Map<string, OnchainLobVaultContract> = new Map();
  protected readonly mappers: typeof mappers;
  protected readonly cachedVaultConfigs: Map<string, VaultConfig> = new Map();
  private cachedVaultConfigsPromise: Promise<VaultConfig[]> | undefined = undefined;

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
  * Approves the specified amount of tokens for the corresponding vault contract.
  * You need to approve the tokens before you can deposit or withdraw.
  *
  * @param {ApproveVaultParams} params - The parameters for approving tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async approveTokens(params: ApproveVaultParams): Promise<ContractTransactionResponse> {
    const vaultContract = await this.getVaultContract({ vault: params.vault });

    return vaultContract.approveTokens(params);
  }

  /**
   * Deposit tokens amount into the vault
   *
   * @param {AddLiquidityVaultParams} params - The parameters for deposit.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async addLiquidity(params: AddLiquidityVaultParams): Promise<ContractTransactionResponse> {
    const vaultContract = await this.getVaultContract({ vault: params.vault });

    return vaultContract.addLiquidity(params);
  }

  /**
  * Wraps the specified amount of native tokens.
  * You need to wrap the tokens before you can deposit.
  *
  * @param {WrapNativeTokenVaultParams} params - The parameters for wrapping tokens.
  * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
  */
  async wrapNativeTokens(params: WrapNativeTokenVaultParams): Promise<ContractTransactionResponse> {
    const vaultContract = await this.getVaultContract({ vault: params.vault });

    return vaultContract.wrapNativeToken(params);
  }

  /**
    * Unwraps the specified amount of native tokens.
    * You need to unwrap the tokens after withdrawal to get native tokens.
    *
    * @param {UnwrapNativeTokenVaultParams} params - The parameters for unwrapping tokens.
    * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
    */
  async unwrapNativeTokens(params: UnwrapNativeTokenVaultParams): Promise<ContractTransactionResponse> {
    const vaultContract = await this.getVaultContract({ vault: params.vault });

    return vaultContract.unwrapNativeToken(params);
  }

  /**
   * Withdraw LP amount from the vault
   *
   * @param {RemoveLiquidityVaultParams} params - The parameters for withdraw.
   * @return {Promise<ContractTransactionResponse>} A Promise that resolves to the transaction response.
   */
  async removeLiquidity(params: RemoveLiquidityVaultParams): Promise<ContractTransactionResponse> {
    const vaultContract = await this.getVaultContract({ vault: params.vault });

    return vaultContract.removeLiquidity(params);
  }

  /**
   * Retrieves the vault configs information from cache.
   *
   * @returns {Promise<Map<string, VaultConfig> | undefined>} A Promise that resolves to the vault configs information or undefined if error when requesting vault configs.
   */
  async getCachedVaultConfigs(): Promise<Map<string, VaultConfig> | undefined> {
    const vaultConfigs = this.cachedVaultConfigs;

    if (!vaultConfigs.size) {
      try {
        let getVaultConfigsPromise = this.cachedVaultConfigsPromise;
        if (!getVaultConfigsPromise) {
          getVaultConfigsPromise = this.getVaultConfigs({});
          this.cachedVaultConfigsPromise = getVaultConfigsPromise;
        }

        const vaultConfigRes = await getVaultConfigsPromise;
        this.cachedVaultConfigsPromise = undefined;
        vaultConfigRes.forEach(vault => vaultConfigs.set(vault.vaultAddress, vault));
      }
      catch (error) {
        console.error(error);
      }

      if (!vaultConfigs.size) return undefined;
    }

    return vaultConfigs;
  }

  /**
   * Retrieves the vault config for the specified vault.
   *
   * @param {GetVaultConfigParams} params - The parameters for retrieving the vault config.
   * @returns {Promise<VaultConfig | undefined>} A Promise that resolves to vault config or undefined if vault is not found.
   */
  async getVaultConfig(params: GetVaultConfigParams): Promise<VaultConfig | undefined> {
    const vaultConfigs = await this.getVaultConfigs(params);
    return vaultConfigs[0];
  }

  /**
   * Retrieves the vaults configs.
   *
   * @param {GetVaultConfigsParams} params - The parameters for retrieving the vault config.
   * @returns {Promise<VaultConfig[]>} A Promise that resolves to vault config.
   */
  async getVaultConfigs(params: GetVaultConfigsParams): Promise<VaultConfig[]> {
    const vaultConfigDtos = await this.onchainLobService.getVaultConfig(params);
    const vaultConfigs = vaultConfigDtos.map((vaultConfigDto) => mappers.mapVaultConfigDtoToVaultConfig(vaultConfigDto))
    return vaultConfigs;
  }

  /**
   * Retrieves the vaults list.
   *
   * @param {GetVaultsListParams} params - The parameters for retrieving the vault config.
   * @returns {Promise<VaultConfig[]>} A Promise that resolves to vault config.
   */
  async getVaultsList(params: GetVaultsListParams): Promise<VaultListItem[]> {
    const vaultListItemDtos = await this.onchainLobService.getVaultsList(params);
    return vaultListItemDtos;
  }

  /**
   * Retrieves the vault total values.
   *
   * @param {GetVaultTotalValuesParams} params - The parameters for retrieving the vault total values.
   * @returns {Promise<VaultTotalValues | undefined>} A Promise that resolves to vault total values.
   */
  async getVaultTotalValues(params: GetVaultTotalValuesParams): Promise<VaultTotalValues | undefined> {
    const [vaultConfig, vaultTotalValuesDto] = await Promise.all([
      this.ensureVaultConfig({ vault: params.vault }),
      this.onchainLobService.getVaultTotalValues(params),
    ]);

    if (!vaultTotalValuesDto[0]) return undefined;

    const vaultTotalValues = mappers.mapVaultTotalValuesDtoToVaultTotalValues(vaultTotalValuesDto[0], vaultConfig.tokens, vaultConfig.lpToken);
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
      this.ensureVaultConfig({ vault: params.vault }),
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
      this.ensureVaultConfig({ vault: params.vault }),
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
   * Calculates the deposit LP details for a given token inputs without API request.
   *
   * @param {CalculateDepositDetailsSyncParams} params - The parameters for the deposit LP details calculation.
   * @returns {DepositDetails} Deposit LP details data.
   * @deprecated This method is not ready for use yet and may produce incorrect results.
   * @todo Implement proper calculation logic for withdraw details.
   */
  calculateDepositDetailsSync(params: CalculateDepositDetailsSyncParams): DepositDetails {
    return getDepositDetails(params);
  }

  /**
   * Calculates the withdraw LP details for a given token inputs without API request.
   *
   * @param {CalculateWithdrawDetailsSyncParams} params - The parameters for the withdraw LP details calculation.
   * @returns {WithdrawDetails} Withdraw LP details data.
   * @deprecated This method is not ready for use yet and may produce incorrect results.
   * @todo Implement proper calculation logic for withdraw details.
   */
  calculateWithdrawDetailsSync(params: CalculateWithdrawDetailsSyncParams): WithdrawDetails {
    return getWithdrawDetails(params);
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
  unsubscribeFromVaultTotalValues(params: UnsubscribeFromVaultTotalValuesParams): void {
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
   * Subscribes to the user's vault deposit actions updates.
   *
   * @emits OnchainLobVault#events#vaultUserDepositActionsUpdated
   */
  subscribeToVaultUserDepositActions(params: SubscribeToVaultUserDepositActionsParams): void {
    this.onchainLobWebSocketService.subscribeToVaultUserDepositActions(params);
  }

  /**
   * Unsubscribes from the user's vault deposit actions updates.
   */
  unsubscribeFromVaultUserDepositActions(params: UnsubscribeFromVaultUserDepositActionsParams): void {
    this.onchainLobWebSocketService.unsubscribeFromVaultUserDepositActions(params);
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

  protected async ensureVaultConfig(params: { vault: string }): Promise<VaultConfig> {
    const vaultConfigs = await this.getCachedVaultConfigs();
    const vaultConfig = vaultConfigs?.get(params.vault);
    if (!vaultConfig)
      throw new Error(`Vault config not found`);

    return vaultConfig;
  }

  protected async getVaultContract(params: { vault: string }): Promise<OnchainLobVaultContract> {
    if (this.signer === null) {
      throw new Error('Signer is not set');
    }

    let vaultContract = this.vaultContracts.get(params.vault);

    if (!vaultContract) {
      const vaultConfig = await this.ensureVaultConfig({ vault: params.vault });

      vaultContract = new OnchainLobVaultContract({
        vault: vaultConfig,
        signer: this.signer,
        autoWaitTransaction: this.autoWaitTransaction,
      });
      this.vaultContracts.set(params.vault, vaultContract);
    }

    return vaultContract;
  }

  protected attachEvents(): void {
    this.onchainLobWebSocketService.events.vaultTotalValuesUpdated.addListener(this.onVaultTotalValuesUpdated);
    this.onchainLobWebSocketService.events.vaultDepositActionsUpdated.addListener(this.onVaultDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultUserDepositActionsUpdated.addListener(this.onVaultUserDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultDepositorsUpdated.addListener(this.onVaultDepositorsUpdated);
    this.onchainLobWebSocketService.events.vaultHistoryUpdated.addListener(this.onVaultHistoryUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.addListener(this.onSubscriptionError);
  }

  protected detachEvents(): void {
    this.onchainLobWebSocketService.events.vaultTotalValuesUpdated.removeListener(this.onVaultTotalValuesUpdated);
    this.onchainLobWebSocketService.events.vaultDepositActionsUpdated.removeListener(this.onVaultDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultUserDepositActionsUpdated.removeListener(this.onVaultUserDepositActionsUpdated);
    this.onchainLobWebSocketService.events.vaultDepositorsUpdated.removeListener(this.onVaultDepositorsUpdated);
    this.onchainLobWebSocketService.events.vaultHistoryUpdated.removeListener(this.onVaultHistoryUpdated);
    this.onchainLobWebSocketService.events.subscriptionError.removeListener(this.onSubscriptionError);
  }

  protected onVaultTotalValuesUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultTotalValuesUpdated['addListener']>[0] = async (vaultId, isSnapshot, data) => {
    try {
      const vaultConfigs = await this.getCachedVaultConfigs();
      const vaultConfig = vaultConfigs?.get(vaultId);
      if (!vaultConfig)
        return;
      const totalValuesUpdates = this.mappers.mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate(data, vaultConfig.tokens, vaultConfig.lpToken);
      (this.events.vaultTotalValuesUpdated as ToEventEmitter<typeof this.events.vaultTotalValuesUpdated>).emit(vaultId, isSnapshot, totalValuesUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onVaultDepositActionsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultDepositActionsUpdated['addListener']>[0] = async (vaultId, isSnapshot, data) => {
    try {
      const vaultConfigs = await this.getCachedVaultConfigs();
      const vaultConfig = vaultConfigs?.get(vaultId);
      if (!vaultConfig)
        return;
      const depositActionUpdates = data.map(
        depositActionDto => {
          const token = vaultConfig.tokens.find(token => token.symbol === depositActionDto.tokenSymbol)!;
          return mappers.mapVaultDepositActionDtoToVaultDepositAction(depositActionDto, token.decimals, vaultConfig.lpToken.decimals);
        }
      );
      (this.events.vaultDepositActionsUpdated as ToEventEmitter<typeof this.events.vaultDepositActionsUpdated>).emit(vaultId, isSnapshot, depositActionUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onVaultUserDepositActionsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultUserDepositActionsUpdated['addListener']>[0] = async (vaultId, isSnapshot, data) => {
    try {
      const vaultConfigs = await this.getCachedVaultConfigs();
      const vaultConfig = vaultConfigs?.get(vaultId);
      if (!vaultConfig)
        return;
      const depositActionUpdates = data.map(
        depositActionDto => {
          const token = vaultConfig.tokens.find(token => token.symbol === depositActionDto.tokenSymbol)!;
          return mappers.mapVaultDepositActionDtoToVaultDepositAction(depositActionDto, token.decimals, vaultConfig.lpToken.decimals);
        }
      );
      (this.events.vaultUserDepositActionsUpdated as ToEventEmitter<typeof this.events.vaultUserDepositActionsUpdated>).emit(vaultId, isSnapshot, depositActionUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onVaultDepositorsUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultDepositorsUpdated['addListener']>[0] = async (vaultId, isSnapshot, data) => {
    try {
      const vaultConfigs = await this.getCachedVaultConfigs();
      const vaultConfig = vaultConfigs?.get(vaultId);
      if (!vaultConfig)
        return;
      const depositorsUpdates = data.map(
        depositorDto => mappers.mapVaultDepositorDtoToVaultDepositor(depositorDto, vaultConfig.lpToken.decimals)
      );
      (this.events.vaultDepositorsUpdated as ToEventEmitter<typeof this.events.vaultDepositorsUpdated>).emit(vaultId, isSnapshot, depositorsUpdates);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onVaultHistoryUpdated: Parameters<typeof this.onchainLobWebSocketService.events.vaultHistoryUpdated['addListener']>[0] = (vaultId, isSnapshot, data) => {
    try {
      (this.events.vaultHistoryUpdated as ToEventEmitter<typeof this.events.vaultHistoryUpdated>).emit(vaultId, isSnapshot, data);
    }
    catch (error) {
      console.error(getErrorLogMessage(error));
    }
  };

  protected onSubscriptionError: Parameters<typeof this.onchainLobWebSocketService.events.subscriptionError['addListener']>[0] = error => {
    (this.events.subscriptionError as ToEventEmitter<typeof this.events.subscriptionError>).emit(error);
  };
}
