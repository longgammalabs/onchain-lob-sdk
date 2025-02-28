import { RemoteService } from '../remoteService';
import { VaultConfigDto, VaultDepositActionDto, VaultDepositorDto, VaultHistoryDto, VaultTotalValuesDto } from './dtos';
import { GetVaultConfigParams, GetVaultDepositActionsParams, GetVaultDepositorsParams, GetVaultHistoryParams, GetVaultTotalValuesParams } from './params';
/**
 * OnchainLobVaultService provides methods to interact with the Onchain LOB vault API.
 * It extends the RemoteService class to leverage common remote service functionalities.
 */
export declare class OnchainLobVaultService extends RemoteService {
    /**
     * Retrieves the vault config.
     * @param params - The parameters for the vault config request.
     * @returns The vault config data.
     */
    getVaultConfig(params: GetVaultConfigParams): Promise<VaultConfigDto[]>;
    /**
     * Retrieves the vault total values.
     * @param params - The parameters for the vault total values request.
     * @returns The vault total values data.
     */
    getVaultTotalValues(params: GetVaultTotalValuesParams): Promise<VaultTotalValuesDto[]>;
    /**
     * Retrieves the vault deposit actions.
     * @param params - The parameters for the vault deposit actions request.
     * @returns The vault deposit actions data.
     */
    getVaultDepositActions(params: GetVaultDepositActionsParams): Promise<VaultDepositActionDto[]>;
    /**
     * Retrieves the vault top depositors.
     * @param params - The parameters for the vault top depositors request.
     * @returns The vault top depositors data.
     */
    getVaultDepositors(params: GetVaultDepositorsParams): Promise<VaultDepositorDto[]>;
    /**
     * Retrieves the vault history.
     * @param params - The parameters for the vault history request.
     * @returns The vault history data.
     */
    getVaultHistory(params: GetVaultHistoryParams): Promise<VaultHistoryDto[]>;
}
