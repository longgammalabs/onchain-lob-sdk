import type { Token, VaultTotalValues, VaultDepositAction, VaultDepositor, VaultTotalValuesUpdate, VaultDepositActionUpdate, VaultDepositorUpdate } from '../models';
import type { TokenDto } from '../services/onchainLobSpotService';
import { VaultDepositActionDto, VaultDepositorDto, VaultTotalValuesDto } from '../services/onchainLobVaultService';
import { VaultDepositActionUpdateDto, VaultDepositorUpdateDto, VaultTotalValuesUpdateDto } from '../services/onchainLobVaultWebSocketService/dtos';
export declare const mapTokenDtoToToken: (dto: TokenDto) => Token;
export declare const mapVaultTotalValuesDtoToVaultTotalValues: (dto: VaultTotalValuesDto, tokens: Token[], lpToken: Token) => VaultTotalValues;
export declare const mapVaultDepositActionDtoToVaultDepositAction: (dto: VaultDepositActionDto, tokenDecimals: number, lpDecimals: number) => VaultDepositAction;
export declare const mapVaultDepositorDtoToVaultDepositor: (dto: VaultDepositorDto, lpDecimals: number) => VaultDepositor;
export declare const mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate: (dto: VaultTotalValuesUpdateDto, tokens: Token[], lpToken: Token) => VaultTotalValuesUpdate;
export declare const mapVaultDepositActionUpdateDtoToVaultDepositActionUpdate: (dto: VaultDepositActionUpdateDto, tokenDecimals: number, lpDecimals: number) => VaultDepositActionUpdate;
export declare const mapVaultDepositorUpdateDtoToVaultDepositorUpdate: (dto: VaultDepositorUpdateDto, lpDecimals: number) => VaultDepositorUpdate;
