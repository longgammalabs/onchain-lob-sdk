import BigNumber from 'bignumber.js';

import type {
  PerpAccount, PerpAccountState, PerpCandle, PerpCandleDecimal, PerpCollateralEvent, PerpFill, PerpFundingPayment, PerpFundingRate, PerpHealthState,
  PerpLevel, PerpLiquidation, PerpMarket, PerpMarketParams, PerpMarketState, PerpOrder, PerpOrderbook, PerpPosition,
  PerpRiskParams, PerpTrade
} from '../models';
import type {
  PerpAccountDto, PerpCandleDto, PerpCollateralEventDto, PerpFillDto, PerpFundingPaymentDto, PerpFundingRateDto, PerpLevelDto,
  PerpLiquidationDto, PerpMarketDto, PerpMarketParamsDto, PerpOrderbookDto, PerpOrderDto, PerpPositionDto, PerpTradeDto
} from '../services/onchainLobPerpsService';

const toBigNumber = (value: string): BigNumber => new BigNumber(value);
const toBigNumberOrNull = (value: string | null | undefined): BigNumber | null => value === null || value === undefined ? null : new BigNumber(value);
const toBigInt = (value: string): bigint => BigInt(value);
const toBigIntOrNull = (value: string | null | undefined): bigint | null => value === null || value === undefined ? null : BigInt(value);

export const mapPerpMarketParamsDtoToPerpMarketParams = (dto: PerpMarketParamsDto): PerpMarketParams => ({
  ...dto,
  oiCap: toBigInt(dto.oiCap),
  maxPositionLots: toBigInt(dto.maxPositionLots),
  smallPositionLots: toBigInt(dto.smallPositionLots),
  maxTradePrice: toBigInt(dto.maxTradePrice),
});

export const mapPerpMarketDtoToPerpMarket = (dto: PerpMarketDto): PerpMarket => ({
  ...dto,
  baseLot: toBigInt(dto.baseLot),
  quoteTick: toBigInt(dto.quoteTick),
  params: mapPerpMarketParamsDtoToPerpMarketParams(dto.params),
  indexPrice: toBigNumberOrNull(dto.indexPrice),
  rawIndexPrice: toBigIntOrNull(dto.rawIndexPrice),
  lastPrice: toBigNumberOrNull(dto.lastPrice),
  rawLastPrice: toBigIntOrNull(dto.rawLastPrice),
  bestBid: toBigNumberOrNull(dto.bestBid),
  bestAsk: toBigNumberOrNull(dto.bestAsk),
  price24h: toBigNumberOrNull(dto.price24h),
  change24h: toBigNumberOrNull(dto.change24h),
  volume24h: toBigNumber(dto.volume24h),
  quoteVolume24h: toBigNumber(dto.quoteVolume24h),
  openInterest: toBigNumber(dto.openInterest),
  rawOpenInterest: toBigInt(dto.rawOpenInterest),
  fundingRate: toBigNumber(dto.fundingRate),
  fundingRateE15: toBigInt(dto.fundingRateE15),
  cLong: toBigInt(dto.cLong),
  cShort: toBigInt(dto.cShort),
  insurance: toBigNumber(dto.insurance),
  rawInsurance: toBigInt(dto.rawInsurance),
  unresolvedDeficit: toBigNumber(dto.unresolvedDeficit),
  rawUnresolvedDeficit: toBigInt(dto.rawUnresolvedDeficit),
});

const mapPerpLevelDtoToPerpLevel = (dto: PerpLevelDto): PerpLevel => ({
  price: toBigNumber(dto.price),
  rawPrice: toBigInt(dto.rawPrice),
  size: toBigNumber(dto.size),
  rawSize: toBigInt(dto.rawSize),
});

export const mapPerpOrderbookDtoToPerpOrderbook = (dto: PerpOrderbookDto): PerpOrderbook => ({
  ...dto,
  levels: {
    asks: dto.levels.asks.map(mapPerpLevelDtoToPerpLevel),
    bids: dto.levels.bids.map(mapPerpLevelDtoToPerpLevel),
  },
});

export const mapPerpTradeDtoToPerpTrade = (dto: PerpTradeDto): PerpTrade => ({
  ...dto,
  price: toBigNumber(dto.price),
  rawPrice: toBigInt(dto.rawPrice),
  size: toBigNumber(dto.size),
  rawSize: toBigInt(dto.rawSize),
  notional: toBigNumber(dto.notional),
  rawNotional: toBigInt(dto.rawNotional),
  fee: toBigNumber(dto.fee),
  rawFee: toBigInt(dto.rawFee),
});

export const mapPerpCandleDtoToPerpCandle = (dto: PerpCandleDto): PerpCandle => dto;

export const mapPerpAccountDtoToPerpAccount = (dto: PerpAccountDto): PerpAccount => ({
  ...dto,
  size: toBigNumber(dto.size),
  rawSize: toBigInt(dto.rawSize),
  costBasis: toBigNumber(dto.costBasis),
  rawCostBasis: toBigInt(dto.rawCostBasis),
  entryPrice: toBigNumberOrNull(dto.entryPrice),
  collateral: toBigNumber(dto.collateral),
  rawCollateral: toBigInt(dto.rawCollateral),
  realizedPnl: toBigNumber(dto.realizedPnl),
  rawRealizedPnl: toBigInt(dto.rawRealizedPnl),
  chargesSettled: toBigNumber(dto.chargesSettled),
  rawChargesSettled: toBigInt(dto.rawChargesSettled),
  chargeSnap: toBigInt(dto.chargeSnap),
  totalDeposited: toBigNumber(dto.totalDeposited),
  totalWithdrawn: toBigNumber(dto.totalWithdrawn),
  feesPaid: toBigNumber(dto.feesPaid),
});

export const mapPerpPositionDtoToPerpPosition = (dto: PerpPositionDto): PerpPosition => ({
  ...mapPerpAccountDtoToPerpAccount(dto),
  status: dto.status,
});

export const mapPerpOrderDtoToPerpOrder = (dto: PerpOrderDto): PerpOrder => ({
  ...dto,
  price: toBigNumber(dto.price),
  rawPrice: toBigInt(dto.rawPrice),
  origSize: toBigNumber(dto.origSize),
  rawOrigSize: toBigInt(dto.rawOrigSize),
  filledSize: toBigNumber(dto.filledSize),
  rawFilledSize: toBigInt(dto.rawFilledSize),
  remainingSize: toBigNumber(dto.remainingSize),
  rawRemainingSize: toBigInt(dto.rawRemainingSize),
});

export const mapPerpFillDtoToPerpFill = (dto: PerpFillDto): PerpFill => ({
  ...dto,
  price: toBigNumber(dto.price),
  rawPrice: toBigInt(dto.rawPrice),
  size: toBigNumber(dto.size),
  rawSize: toBigInt(dto.rawSize),
  notional: toBigNumber(dto.notional),
  rawNotional: toBigInt(dto.rawNotional),
  fee: toBigNumber(dto.fee),
  rawFee: toBigInt(dto.rawFee),
  realizedPnl: toBigNumber(dto.realizedPnl),
  rawRealizedPnl: toBigInt(dto.rawRealizedPnl),
});

export const mapPerpFundingRateDtoToPerpFundingRate = (dto: PerpFundingRateDto): PerpFundingRate => ({
  ...dto,
  rate: toBigNumber(dto.rate),
  rateE15: toBigInt(dto.rateE15),
  cLong: toBigIntOrNull(dto.cLong),
  cShort: toBigIntOrNull(dto.cShort),
});

export const mapPerpFundingPaymentDtoToPerpFundingPayment = (dto: PerpFundingPaymentDto): PerpFundingPayment => ({
  ...dto,
  amount: toBigNumber(dto.amount),
  rawAmount: toBigInt(dto.rawAmount),
  positionSize: toBigNumber(dto.positionSize),
});

export const mapPerpLiquidationDtoToPerpLiquidation = (dto: PerpLiquidationDto): PerpLiquidation => ({
  ...dto,
  lots: toBigInt(dto.lots),
  size: toBigNumber(dto.size),
  transferNotional: toBigNumber(dto.transferNotional),
  penalty: toBigNumber(dto.penalty),
  deficitCovered: toBigNumberOrNull(dto.deficitCovered),
});

export const mapPerpCollateralEventDtoToPerpCollateralEvent = (dto: PerpCollateralEventDto): PerpCollateralEvent => ({
  ...dto,
  amount: toBigNumber(dto.amount),
  rawAmount: toBigInt(dto.rawAmount),
});

/**
 * Converts a candle (raw ticks and lots) to human-readable values with the market scaling.
 */
export const convertPerpCandle = (candle: PerpCandle, scaling: { priceDecimals: number; sizeDecimals: number }): PerpCandleDecimal => ({
  time: candle.time,
  open: new BigNumber(candle.open).shiftedBy(-scaling.priceDecimals),
  high: new BigNumber(candle.high).shiftedBy(-scaling.priceDecimals),
  low: new BigNumber(candle.low).shiftedBy(-scaling.priceDecimals),
  close: new BigNumber(candle.close).shiftedBy(-scaling.priceDecimals),
  volume: new BigNumber(candle.volume).shiftedBy(-scaling.sizeDecimals),
  resolution: candle.resolution,
});

// On-chain structs. The ethers `Result` of a tuple is indexable by field name.

export const mapPerpAccountStateFromContract = (view: any): PerpAccountState => ({
  epoch: Number(view.epoch),
  openOrders: Number(view.openOrders),
  collateral: BigInt(view.collateral),
  size: BigInt(view.size),
  costBasis: BigInt(view.costBasis),
  owedCharges: BigInt(view.owedCharges),
  unrealized: BigInt(view.unrealized),
  equity: BigInt(view.equity),
  adm: BigInt(view.adm),
  mm: BigInt(view.mm),
  qBid: BigInt(view.qBid),
  qAsk: BigInt(view.qAsk),
  state: Number(view.state) as PerpHealthState,
  oracleFresh: Boolean(view.oracleFresh),
  admc: BigInt(view.admc),
});

export const mapPerpMarketStateFromContract = (view: any): PerpMarketState => ({
  cLong: BigInt(view.cLong),
  cShort: BigInt(view.cShort),
  fundingRateE15: BigInt(view.fundingRateE15),
  lastChargeUpdate: Number(view.lastChargeUpdate),
  openInterest: BigInt(view.openInterest),
  custody: BigInt(view.custody),
  insurance: BigInt(view.insurance),
  fees: BigInt(view.fees),
  dustScaled: BigInt(view.dustScaled),
  unresolvedDeficit: BigInt(view.unresolvedDeficit),
  reduceOnly: Boolean(view.reduceOnly),
  fundingSaturated: Boolean(view.fundingSaturated),
});

export const mapPerpRiskParamsFromContract = (view: any): PerpRiskParams => ({
  imrBps: Number(view.imrBps),
  fmrBps: Number(view.fmrBps),
  mmrBps: Number(view.mmrBps),
  cmrBps: Number(view.cmrBps),
  collarBps: Number(view.collarBps),
  makerFeeBps: Number(view.makerFeeBps),
  baseLot: BigInt(view.baseLot),
  quoteTick: BigInt(view.quoteTick),
});
