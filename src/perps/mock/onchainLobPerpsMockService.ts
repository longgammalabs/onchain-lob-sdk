import { PerpsMockDataSource, type PerpsMockOptions } from './perpsMockDataSource';
import type {
  GetPerpAccountsParams, GetPerpCandlesParams, GetPerpCollateralHistoryParams, GetPerpFillsParams, GetPerpFundingPaymentsParams,
  GetPerpFundingRatesParams, GetPerpLiquidationsParams, GetPerpMarketsParams, GetPerpOrderbookParams, GetPerpOrdersParams,
  GetPerpPositionsParams, GetPerpTradesParams, IOnchainLobPerpsService, PerpAccountDto, PerpCandleDto, PerpCollateralEventDto,
  PerpFillDto, PerpFundingPaymentDto, PerpFundingRateDto, PerpLiquidationDto, PerpMarketDto, PerpOrderbookDto, PerpOrderDto,
  PerpPositionDto, PerpTradeDto
} from '../../services/onchainLobPerpsService';

/**
 * A fixture-backed implementation of the perps REST API. It lets the frontend develop before the backend is live.
 * Use it through `OnchainLobClient` (`perps: { dataSource: 'mock' }`) or standalone.
 */
export class OnchainLobPerpsMockService implements IOnchainLobPerpsService {
  readonly dataSource: PerpsMockDataSource;

  constructor(dataSourceOrOptions: PerpsMockDataSource | PerpsMockOptions = {}) {
    this.dataSource = dataSourceOrOptions instanceof PerpsMockDataSource ? dataSourceOrOptions : new PerpsMockDataSource(dataSourceOrOptions);
  }

  getMarkets(params: GetPerpMarketsParams): Promise<PerpMarketDto[]> {
    return Promise.resolve(this.dataSource.getMarkets(params));
  }

  getOrderbook(params: GetPerpOrderbookParams): Promise<PerpOrderbookDto> {
    return this.run(() => this.dataSource.getOrderbook(params));
  }

  getTrades(params: GetPerpTradesParams): Promise<PerpTradeDto[]> {
    return this.run(() => this.dataSource.getTrades(params));
  }

  getCandles(params: GetPerpCandlesParams): Promise<PerpCandleDto[]> {
    return this.run(() => this.dataSource.getCandles(params));
  }

  getAccounts(params: GetPerpAccountsParams): Promise<PerpAccountDto[]> {
    return this.run(() => this.dataSource.getAccounts(params));
  }

  getPositions(params: GetPerpPositionsParams): Promise<PerpPositionDto[]> {
    return this.run(() => this.dataSource.getPositions(params));
  }

  getOrders(params: GetPerpOrdersParams): Promise<PerpOrderDto[]> {
    return this.run(() => this.dataSource.getOrders(params));
  }

  getFills(params: GetPerpFillsParams): Promise<PerpFillDto[]> {
    return this.run(() => this.dataSource.getFills(params));
  }

  getFundingRates(params: GetPerpFundingRatesParams): Promise<PerpFundingRateDto[]> {
    return this.run(() => this.dataSource.getFundingRates(params));
  }

  getFundingPayments(params: GetPerpFundingPaymentsParams): Promise<PerpFundingPaymentDto[]> {
    return this.run(() => this.dataSource.getFundingPayments(params));
  }

  getLiquidations(params: GetPerpLiquidationsParams): Promise<PerpLiquidationDto[]> {
    if (!params.user && !params.market)
      return Promise.reject(new Error('Either user or market must be specified'));

    return this.run(() => this.dataSource.getLiquidations(params));
  }

  getCollateralHistory(params: GetPerpCollateralHistoryParams): Promise<PerpCollateralEventDto[]> {
    return this.run(() => this.dataSource.getCollateralHistory(params));
  }

  /**
   * Like a real request, a failure (for example an unknown market) is a rejected promise, never a sync throw.
   */
  private run<T>(action: () => T): Promise<T> {
    try {
      return Promise.resolve(action());
    }
    catch (error) {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
