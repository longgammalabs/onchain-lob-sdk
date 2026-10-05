import type {
  PerpAccountDto, PerpCandleDto, PerpCollateralEventDto, PerpFillDto, PerpMarketDto, PerpOrderbookDto, PerpOrderDto, PerpTradeDto
} from '../onchainLobPerpsService/dtos';

/**
 * The WebSocket payloads of the perps channels are identical to the REST DTOs
 * (perps-api-contract.md, "WebSocket"). The aliases keep the spot naming convention.
 */
export type PerpMarketUpdateDto = PerpMarketDto;
export type PerpOrderbookUpdateDto = PerpOrderbookDto;
export type PerpTradeUpdateDto = PerpTradeDto;
export type PerpCandleUpdateDto = PerpCandleDto;
export type PerpAccountUpdateDto = PerpAccountDto;
export type PerpOrderUpdateDto = PerpOrderDto;
export type PerpFillUpdateDto = PerpFillDto;
export type PerpCollateralEventUpdateDto = PerpCollateralEventDto;
