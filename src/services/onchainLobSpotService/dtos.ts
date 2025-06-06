import type { Direction, OrderStatus, OrderType, Side } from '../../models';

export interface OrderbookLevelDto {
  price: string;
  size: string;
  lastTouched: number;
}

export interface OrderbookDto {
  timestamp: number;
  aggregation: number;
  levels: {
    asks: OrderbookLevelDto[];
    bids: OrderbookLevelDto[];
  };
}

export interface OrderDto {
  orderId: string;
  market: {
    id: string;
  };
  type: OrderType;
  owner: string;
  side: Side;
  price: string;
  size: string;
  origSize: string;
  claimed: string;
  createdAt: number;
  lastTouched: number;
  txnHash: string;
  status: OrderStatus;
  isPostOnly: boolean;
  logIndex: number;
}

export interface OrderHistoryDto {
  market: {
    id: string;
  };
  timestamp: number;
  owner: string;
  type: OrderType;
  side: Side;
  txnHash: string;
  orderId: string;
  price: string;
  size: string;
  origSize: string;
  status: OrderStatus;
  claimed: string;
  fee: string;
  isPostOnly: boolean;
}

export interface TradeDto {
  market: {
    id: string;
  };
  tradeId: string;
  direction: Direction;
  price: string;
  priceUsd: number | null;
  size: string;
  timestamp: number;
  txnHash: string;
}

export interface FillDto {
  orderId: string;
  tradeId: string;
  market: {
    id: string;
  };
  timestamp: number;
  owner: string;
  dir: Direction;
  type: OrderType;
  side: Side;
  txnHash: string;
  price: string;
  size: string;
  volumeUsd: number;
  fee: string;
  feeUsd: number | null;
}

export interface TokenDto {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: number;
  roundingDecimals: number;
  supportsPermit: boolean;
  iconUrl: string | null;
  isNative: boolean;
  pythAddress: string | null;
  priceFeed: string | null;
  priceFeedDecimals: number | null;
  priceUsd: number | null;
  priority: number;
  source: string;
  description: string;
  lastTouched: number | null;
}

export interface MarketDto {
  id: string;
  name: string;
  symbol: string;
  baseToken: TokenDto;
  quoteToken: TokenDto;
  orderbookAddress: string;
  aggregations: number[];
  tokenXScalingFactor: number;
  tokenYScalingFactor: number;
  priceScalingFactor: number;
  bestAsk: string | null;
  bestBid: string | null;
  tradingVolume: string;
  tradingVolumeUsd: number;
  tradingVolume24h: string;
  tradingVolume24hUsd: number;
  lastPrice: string | null;
  lowPrice24h: string | null;
  highPrice24h: string | null;
  price24h: string | null;
  coinMarketCapId: string;
  totalSupply: string;
  lastTouched: number;
  supportsNativeToken: boolean;
  isNativeTokenX: boolean;
  aggressiveFee: string;
  passiveFee: string;
  passiveOrderPayout: string;
  isUserGenerated: boolean;
}

export interface CandleDto {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  lastTouched: number;
}

export interface MarketDetailsDto {
  buy: {
    fee: number;
    estFee: number;
    worstPrice: number;
    estPrice: number;
    estWorstPrice: number;
    estSlippage: number;
    autoSlippage: number;
    tokenXReceive: number;
    estTokenXReceive: number;
    tokenYPay: number;
    estTokenYPay: number;
  };
  sell: {
    fee: number;
    estFee: number;
    worstPrice: number;
    estPrice: number;
    estWorstPrice: number;
    estSlippage: number;
    autoSlippage: number;
    tokenXPay: number;
    estTokenXPay: number;
    tokenYReceive: number;
    estTokenYReceive: number;
  };
}

export interface LimitDetailsDto {
  buy: {
    maxFee: number;
    price: number;
    tokenXReceive: number;
    maxTokenYPay: number;
    minTokenYPay: number;
  };
  sell: {
    maxFee: number;
    price: number;
    tokenXPay: number;
    maxTokenYReceive: number;
    minTokenYReceive: number;
  };
}

export interface UserBalancesDto {
  balances: {
    tokenSymbol: string;
    tokenAddress: string;
    hold: number;
    available: number;
    deposited: number;
  }[];
}

export interface UserDepositsDto {
  deposits: {
    market: string;
    tokenXAddress: string;
    tokenYAddress: string;
    depositedTokenX: number;
    depositedTokenY: number;
  }[];
}
