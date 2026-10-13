import { mapMarketDtoToMarket } from './mappers';
import type { MarketDto } from '../services/onchainLobSpotService/dtos';

const dto = { id: 'market', lastPrice: null } as unknown as MarketDto;

describe('mapMarketDtoToMarket', () => {
  test('a market from an API that predates PageBook is a Hanji one', () => {
    expect(mapMarketDtoToMarket(dto, 6, 0).engine).toBe('hanji_clob');
  });

  test('the engine the API gives is kept', () => {
    expect(mapMarketDtoToMarket({ ...dto, engine: 'hanji_pagebook' }, 6, 0).engine).toBe('hanji_pagebook');
  });
});
