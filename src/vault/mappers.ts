import type {
  Token,
  VaultTotalValues,
  VaultDepositAction,
  VaultDepositor,
  VaultTotalValuesUpdate,
  VaultDepositActionUpdate,
  VaultDepositorUpdate
} from '../models';
import type { TokenDto } from '../services/onchainLobSpotService';
import { tokenUtils } from '../utils';
import { VaultDepositActionDto, VaultDepositorDto, VaultTotalValuesDto } from '../services/onchainLobVaultService';
import { VaultDepositActionUpdateDto, VaultDepositorUpdateDto, VaultTotalValuesUpdateDto } from '../services/onchainLobVaultWebSocketService/dtos';

export const mapTokenDtoToToken = (dto: TokenDto): Token => {
  return dto;
};

export const mapVaultTotalValuesDtoToVaultTotalValues = (dto: VaultTotalValuesDto, tokens: Token[], lpToken: Token): VaultTotalValues => {
  return {
    ...dto,
    rawTotalSupply: BigInt(dto.totalSupply),
    totalSupply: tokenUtils.convertTokensRawAmountToAmount(dto.totalSupply, lpToken.decimals),
    tokens: dto.tokens.map(dtoToken => ({
      ...dtoToken,
      rawTokenBalance: BigInt(dtoToken.tokenBalance),
      tokenBalance: tokenUtils.convertTokensRawAmountToAmount(
        dtoToken.tokenBalance,
        tokens.find(token => token.contractAddress === dtoToken.address)!.decimals
      ),
      rawTokenReserved: BigInt(dtoToken.tokenReserved),
      tokenReserved: tokenUtils.convertTokensRawAmountToAmount(
        dtoToken.tokenReserved,
        tokens.find(token => token.contractAddress === dtoToken.address)!.decimals
      ),
    })),
  };
};

export const mapVaultDepositActionDtoToVaultDepositAction = (
  dto: VaultDepositActionDto,
  tokenDecimals: number,
  lpDecimals: number
): VaultDepositAction => {
  return {
    ...dto,
    rawTokenAmount: BigInt(dto.tokenAmount),
    tokenAmount: tokenUtils.convertTokensRawAmountToAmount(dto.tokenAmount, tokenDecimals),
    rawLpAmount: BigInt(dto.lpAmount),
    lpAmount: tokenUtils.convertTokensRawAmountToAmount(dto.lpAmount, lpDecimals),
  };
};

export const mapVaultDepositorDtoToVaultDepositor = (
  dto: VaultDepositorDto,
  lpDecimals: number
): VaultDepositor => {
  return {
    ...dto,
    rawLpAmount: BigInt(dto.lpAmount),
    lpAmount: tokenUtils.convertTokensRawAmountToAmount(dto.lpAmount, lpDecimals),
  };
};

export const mapVaultTotalValuesUpdateDtoToVaultTotalValuesUpdate = (
  dto: VaultTotalValuesUpdateDto,
  tokens: Token[],
  lpToken: Token
): VaultTotalValuesUpdate => mapVaultTotalValuesDtoToVaultTotalValues(dto, tokens, lpToken);

export const mapVaultDepositActionUpdateDtoToVaultDepositActionUpdate = (
  dto: VaultDepositActionUpdateDto,
  tokenDecimals: number,
  lpDecimals: number
): VaultDepositActionUpdate => mapVaultDepositActionDtoToVaultDepositAction(dto, tokenDecimals, lpDecimals);

export const mapVaultDepositorUpdateDtoToVaultDepositorUpdate = (
  dto: VaultDepositorUpdateDto,
  lpDecimals: number
): VaultDepositorUpdate => mapVaultDepositorDtoToVaultDepositor(dto, lpDecimals);
