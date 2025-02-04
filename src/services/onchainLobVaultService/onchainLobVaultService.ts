import { RemoteService } from '../remoteService';
import { VaultConfigDto, VaultDepositActionDto, VaultDepositorDto, VaultHistoryDto, VaultTotalValuesDto } from './dtos';
import { GetVaultConfigParams, GetVaultDepositActionsParams, GetVaultDepositorsParams, GetVaultHistoryParams, GetVaultTotalValuesParams } from './params';

/**
 * OnchainLobVaultService provides methods to interact with the Onchain LOB vault API.
 * It extends the RemoteService class to leverage common remote service functionalities.
 */
export class OnchainLobVaultService extends RemoteService {
  /**
   * Retrieves the vault config.
   * @param params - The parameters for the vault config request.
   * @returns The vault config data.
   */
  async getVaultConfig(_params: GetVaultConfigParams): Promise<VaultConfigDto> {
    const response = await this.fetch<VaultConfigDto>(`/vault-config`, 'json');

    return response;
  }

  /**
   * Retrieves the vault total values.
   * @param params - The parameters for the vault total values request.
   * @returns The vault total values data.
   */
  async getVaultTotalValues(_params: GetVaultTotalValuesParams): Promise<VaultTotalValuesDto> {
    const response = await this.fetch<VaultTotalValuesDto>(`/vault-total-values`, 'json');

    return response;
  }

  /**
   * Retrieves the vault deposit actions.
   * @param params - The parameters for the vault deposit actions request.
   * @returns The vault deposit actions data.
   */
  async getVaultDepositActions(params: GetVaultDepositActionsParams): Promise<VaultDepositActionDto[]> {
    const queryParams = new URLSearchParams({});
    if (params.limit)
      queryParams.append('limit', params.limit.toString());

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<VaultDepositActionDto[]>(`/vault-deposit-actions?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the vault top depositors.
   * @param params - The parameters for the vault top depositors request.
   * @returns The vault top depositors data.
   */
  async getVaultDepositors(params: GetVaultDepositorsParams): Promise<VaultDepositorDto[]> {
    const queryParams = new URLSearchParams({});
    if (params.limit)
      queryParams.append('limit', params.limit.toString());

    if (params.address)
      queryParams.append('address', params.address);

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<VaultDepositorDto[]>(`/vault-depositors?${queryParamsString}`, 'json');

    return response;
  }

  /**
   * Retrieves the vault history.
   * @param params - The parameters for the vault history request.
   * @returns The vault history data.
   */
  async getVaultHistory(params: GetVaultHistoryParams): Promise<VaultHistoryDto[]> {
    const queryParams = new URLSearchParams({
      period: params.period,
    });

    const queryParamsString = decodeURIComponent(queryParams.toString());
    const response = await this.fetch<VaultHistoryDto[]>(`/vault-history?${queryParamsString}`, 'json');

    return response;
  }
}
