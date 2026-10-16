import BigNumber from 'bignumber.js';

import * as mappers from './mappers';
import { PerpsMockDataSource } from './mock';
import { Interface } from 'ethers';
import { perpMarketAbi } from '../abi/perpMarket';
import { PerpHealthState } from '../models/perps';
import type { PerpAccountDto, PerpFillDto, PerpMarketDto, PerpOrderDto, PerpTradeDto } from '../services/onchainLobPerpsService';

const user = '0x9c72ee4ef78d523da2b604214a7d29b983033234';
const mock = new PerpsMockDataSource({ now: 1_791_198_360, seed: 7 });

const marketDto = (): PerpMarketDto => mock.getMarkets()[0]!;

describe('perps mappers', () => {
  test('market: raw fields are bigint, human fields are BigNumber, the rest is kept', () => {
    const dto = marketDto();
    const market = mappers.mapPerpMarketDtoToPerpMarket(dto);

    expect(market.id).toBe('0x96f3f420d7479e21e66460f21a8cb422a8ae865d');
    expect(market.name).toBe('WETH-tUSDC-PERP');
    expect(market.baseLot).toBe(100000000000000n);
    expect(market.quoteTick).toBe(1n);
    expect(market.quoteToken).toEqual(dto.quoteToken);
    expect(market.params).toMatchObject({ imrBps: 1000, maxLeverage: 10, oiCap: 1000000n, maxPositionLots: 100000n, maxTradePrice: 3000000n });
    expect(market.indexPrice).toEqual(new BigNumber(3000));
    expect(market.rawIndexPrice).toBe(300000n);
    expect(market.fundingRateE15).toBe(27777778n);
    expect(market.fundingRate.toFixed(18)).toBe('0.000000027777778000');
    expect(market.cShort).toBe(-29438250230n);
    expect(market.openInterest).toEqual(new BigNumber('85.3'));
    expect(market.rawOpenInterest).toBe(853000n);
    expect(market.unresolvedDeficit).toEqual(new BigNumber(0));
    expect(market.aggregations).toEqual([1, 5, 10, 50, 100]);
    expect(market.rawInsurance).toBe(1996508656n);
    expect(market.rawUnresolvedDeficit).toBe(0n);
    expect(market.insurance).toEqual(new BigNumber('1996.508656'));
    expect(market.fundingSaturated).toBe(false);
  });

  test('market: nullable fields stay null', () => {
    const market = mappers.mapPerpMarketDtoToPerpMarket({
      ...marketDto(),
      indexPrice: null, rawIndexPrice: null, indexPriceTime: null, lastPrice: null, rawLastPrice: null,
      bestBid: null, bestAsk: null, price24h: null, change24h: null, fundingRateTime: null,
    });

    expect(market).toMatchObject({
      indexPrice: null, rawIndexPrice: null, indexPriceTime: null, lastPrice: null, rawLastPrice: null,
      bestBid: null, bestAsk: null, price24h: null, change24h: null, fundingRateTime: null,
    });
  });

  test('orderbook levels', () => {
    const orderbook = mappers.mapPerpOrderbookDtoToPerpOrderbook({
      marketId: 'm', timestamp: 1, aggregation: 1,
      levels: {
        asks: [{ price: '3001.5', rawPrice: '300150', size: '0.25', rawSize: '2500' }],
        bids: [{ price: '2998.5', rawPrice: '299850', size: '1', rawSize: '10000' }],
      },
    });

    expect(orderbook.levels.asks[0]).toEqual({ price: new BigNumber(3001.5), rawPrice: 300150n, size: new BigNumber(0.25), rawSize: 2500n });
    expect(orderbook.levels.bids[0]!.rawSize).toBe(10000n);
    expect(orderbook).toMatchObject({ marketId: 'm', timestamp: 1, aggregation: 1 });
  });

  test('trade', () => {
    const dto: PerpTradeDto = {
      id: '0xabc-3', marketId: 'm', makerHandle: '4294967297', side: 'buy',
      price: '3000', rawPrice: '300000', size: '0.1', rawSize: '1000',
      notional: '300', rawNotional: '300000000', fee: '0.15', rawFee: '150000',
      timestamp: 10, txnHash: '0xabc', blockNumber: 5,
    };
    const trade = mappers.mapPerpTradeDtoToPerpTrade(dto);

    expect(trade).toMatchObject({ id: '0xabc-3', side: 'buy', makerHandle: '4294967297', blockNumber: 5, timestamp: 10 });
    expect(trade.price).toEqual(new BigNumber(3000));
    expect(trade.rawNotional).toBe(300000000n);
    expect(trade.fee).toEqual(new BigNumber('0.15'));
    expect(trade.rawFee).toBe(150000n);
  });

  test('account and position: signed values, null entry price', () => {
    const [open, closed] = mock.getAccounts({ user }) as [PerpAccountDto, PerpAccountDto];
    const account = mappers.mapPerpAccountDtoToPerpAccount(open);

    expect(account.account).toBe('58534501075929067188859517216662100592579158931144704');
    expect(account.owner).toBe(user);
    expect(account.side).toBe('long');
    expect(account.size).toEqual(new BigNumber('1.2'));
    expect(account.rawSize).toBe(12000n);
    expect(account.rawCostBasis).toBe(3_540_000_000n);
    expect(account.entryPrice).toEqual(new BigNumber(2950));
    expect(account.rawCollateral).toBe(1_485_000_000n);
    expect(account.chargeSnap).toBe(29438250244n);

    const closedAccount = mappers.mapPerpAccountDtoToPerpAccount(closed);
    expect(closedAccount.entryPrice).toBeNull();
    expect(closedAccount.side).toBeNull();
    expect(closedAccount.rawRealizedPnl).toBe(-8_750_000n);
    expect(closedAccount.realizedPnl).toEqual(new BigNumber('-8.75'));

    const position = mappers.mapPerpPositionDtoToPerpPosition({ ...open, status: 'open' });
    expect(position.status).toBe('open');
    expect(position.rawSize).toBe(12000n);
  });

  test('order', () => {
    const dto: PerpOrderDto = mock.getOrders({ user, status: 'open' })[1]!;
    const order = mappers.mapPerpOrderDtoToPerpOrder(dto);

    expect(order.side).toBe('sell');
    expect(order.reduceOnly).toBe(true);
    expect(order.flags).toBe(2 | 4);
    expect(order.rawPrice).toBe(310000n);
    expect(order.price).toEqual(new BigNumber(3100));
    expect(order.rawOrigSize).toBe(3000n);
    expect(order.rawFilledSize).toBe(1000n);
    expect(order.rawRemainingSize).toBe(2000n);
    expect(order.remainingSize).toEqual(new BigNumber('0.2'));
    expect(order.expiry).toBe(1_791_198_360 + 86400);
    expect(order.handle).toBe('4294967311');
    expect(order.removeReason).toBeNull();
  });

  test('fill', () => {
    const dto: PerpFillDto = mock.getFills({ user })[0]!;
    const fill = mappers.mapPerpFillDtoToPerpFill(dto);

    expect(fill.role).toBe('taker');
    expect(fill.orderHandle).toBeNull();
    expect(fill.rawPrice).toBe(300050n);
    expect(fill.rawSize).toBe(2000n);
    expect(fill.notional).toEqual(new BigNumber('600.1'));
    expect(fill.rawFee).toBe(300050n);
    expect(fill.rawNotional).toBe(600_100_000n);
    expect(fill.realizedPnl).toEqual(new BigNumber(0));
    expect(mappers.mapPerpFillDtoToPerpFill(mock.getFills({ user })[2]!).rawRealizedPnl).toBe(54_000_000n);
    expect(fill.isLiquidation).toBe(false);
  });

  test('funding rate, funding payment, liquidation, collateral event', () => {
    const rate = mappers.mapPerpFundingRateDtoToPerpFundingRate({
      marketId: 'm', rate: '0.0001', rateE15: '-27777778', cLong: '5', cShort: null, timestamp: 1, txnHash: '0x1',
    });
    expect(rate.rate).toEqual(new BigNumber('0.0001'));
    expect(rate.rateE15).toBe(-27777778n);
    expect(rate.cLong).toBe(5n);
    expect(rate.cShort).toBeNull();

    const payment = mappers.mapPerpFundingPaymentDtoToPerpFundingPayment(mock.getFundingPayments({ user })[4]!);
    expect(payment.rawAmount).toBe(-210000n);
    expect(payment.amount).toEqual(new BigNumber('-0.21'));
    expect(payment.positionSize).toEqual(new BigNumber('1.2'));

    const liquidation = mappers.mapPerpLiquidationDtoToPerpLiquidation(mock.getLiquidations({ market: marketDto().id })[1]!);
    expect(liquidation.lots).toBe(-5000n);
    expect(liquidation.size).toEqual(new BigNumber('-0.5'));
    expect(liquidation.penalty.gt(0)).toBe(true);
    expect(liquidation.deficitCovered).toBeNull();
    expect(liquidation.outcome).toBe(1);

    const events = mock.getCollateralHistory({ user });
    const deposit = mappers.mapPerpCollateralEventDtoToPerpCollateralEvent(events[0]!);
    expect(deposit).toMatchObject({ type: 'deposit', rawAmount: 500_000_000n, counterparty: null, recipient: null });
    expect(deposit.amount).toEqual(new BigNumber(500));
    const transferIn = mappers.mapPerpCollateralEventDtoToPerpCollateralEvent(events[2]!);
    expect(transferIn.type).toBe('transfer_in');
    expect(transferIn.counterparty).not.toBeNull();
  });

  test('every mock fixture maps without throwing', () => {
    const market = marketDto().id;
    expect(mock.getTrades({ market }).map(mappers.mapPerpTradeDtoToPerpTrade).length).toBeGreaterThan(0);
    expect(mock.getPositions({ user, status: 'all' }).map(mappers.mapPerpPositionDtoToPerpPosition)).toHaveLength(2);
    expect(mock.getOrders({ user, status: 'all' }).map(mappers.mapPerpOrderDtoToPerpOrder)).toHaveLength(4);
    expect(mock.getFundingRates({ market }).map(mappers.mapPerpFundingRateDtoToPerpFundingRate).length).toBeGreaterThan(0);
    expect(mappers.mapPerpOrderbookDtoToPerpOrderbook(mock.getOrderbook({ market }))).toBeDefined();
  });

  test('candle: raw ticks and lots, time in ms, converted with the market scaling', () => {
    const candle = mappers.mapPerpCandleDtoToPerpCandle({ time: 1_791_198_000_000, open: '299850', high: '300500', low: '299000', close: '300150', volume: '12500', resolution: '15' });
    expect(candle.time).toBe(1_791_198_000_000);
    expect(candle.open).toBe('299850');

    const decimal = mappers.convertPerpCandle(candle, { priceDecimals: 2, sizeDecimals: 4 });
    expect(decimal.open).toEqual(new BigNumber('2998.5'));
    expect(decimal.high).toEqual(new BigNumber(3005));
    expect(decimal.volume).toEqual(new BigNumber('1.25'));
    expect(decimal.resolution).toBe('15');
  });
});

describe('on-chain struct mappers', () => {
  const iface = new Interface(perpMarketAbi);

  test('perpAccount() result', () => {
    // The values read from the deployed market for a funded account with 12 open orders.
    const data = iface.encodeFunctionResult('perpAccount', [[
      0, 12, 20015341311n, 0n, 0n, 0n, 0n, 20015341311n, 195000000n, 0n, 5000n, 5000n, 0, false, 157500000n,
    ]]);
    const state = mappers.mapPerpAccountStateFromContract(iface.decodeFunctionResult('perpAccount', data)[0]);

    expect(state).toEqual({
      epoch: 0, openOrders: 12, collateral: 20015341311n, size: 0n, costBasis: 0n, owedCharges: 0n, unrealized: 0n,
      equity: 20015341311n, adm: 195000000n, mm: 0n, qBid: 5000n, qAsk: 5000n, state: PerpHealthState.Healthy,
      oracleFresh: false, admc: 157500000n,
    });
  });

  test('market() result, with negative values', () => {
    const data = iface.encodeFunctionResult('market', [[
      29438250244n, -29438250230n, 27777778, 1790894493, 0n, 22041249986n, 1996508656n, 0n, 7000000000n, 0n, false, false,
    ]]);
    const state = mappers.mapPerpMarketStateFromContract(iface.decodeFunctionResult('market', data)[0]);

    expect(state).toMatchObject({
      cLong: 29438250244n, cShort: -29438250230n, fundingRateE15: 27777778n, lastChargeUpdate: 1790894493,
      openInterest: 0n, custody: 22041249986n, insurance: 1996508656n, dustScaled: 7000000000n,
      reduceOnly: false, fundingSaturated: false,
    });
  });

  test('riskParams() result', () => {
    const data = iface.encodeFunctionResult('riskParams', [[1000, 1000, 500, 750, 300, 0, 100000000000000n, 1n]]);
    const params = mappers.mapPerpRiskParamsFromContract(iface.decodeFunctionResult('riskParams', data)[0]);

    expect(params).toEqual({ imrBps: 1000, fmrBps: 1000, mmrBps: 500, cmrBps: 750, collarBps: 300, makerFeeBps: 0, baseLot: 100000000000000n, quoteTick: 1n });
  });
});
