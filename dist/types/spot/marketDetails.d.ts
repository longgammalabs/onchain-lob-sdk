import BigNumber from 'bignumber.js';
import { MarketOrderDetails, OrderbookLevel } from '../models';
import { CalculateMarketDetailsSyncParams } from './params';
export declare const defaultBuyMarketDetails: MarketOrderDetails['buy'];
export declare const defaultSellMarketDetails: MarketOrderDetails['sell'];
export declare const getMarketDetails: ({ market, orderbook, inputToken, inputs, direction }: CalculateMarketDetailsSyncParams) => MarketOrderDetails;
export declare const calculateBuyMarketDetailsTokenXInput: (tokenXInput: number, maxSlippage: number, bestAsk: number, orderbookSide: OrderbookLevel[], tokenXScalingFactor: number, tokenYScalingFactor: number, priceScalingFactor: number, feeRate: number, useAutoSlippage: boolean) => MarketOrderDetails["buy"];
export declare const calculateBuyMarketDetailsTokenYInput: (tokenYInput: number, maxSlippage: number, bestAsk: number, orderbookSide: OrderbookLevel[], tokenXScalingFactor: number, tokenYScalingFactor: number, priceScalingFactor: number, feeRate: number, useAutoSlippage: boolean) => MarketOrderDetails["buy"];
export declare const calculateSellMarketDetailsTokenXInput: (tokenXInput: number, maxSlippage: number, bestBid: number, orderbookSide: OrderbookLevel[], tokenXScalingFactor: number, tokenYScalingFactor: number, priceScalingFactor: number, feeRate: number, useAutoSlippage: boolean) => MarketOrderDetails["sell"];
export declare const calculateSellMarketDetailsTokenYInput: (tokenYInput: number, maxSlippage: number, bestBid: number, orderbookSide: OrderbookLevel[], tokenXScalingFactor: number, tokenYScalingFactor: number, priceScalingFactor: number, feeRate: number, useAutoSlippage: boolean) => MarketOrderDetails["sell"];
export declare const calculateEstValuesFromTokenX: (tokenX: number, orderbookSide: OrderbookLevel[], initialPrice: number) => {
    estPrice: number;
    estSlippage: number;
    estTokenYAmount: number;
    estWorstPrice: number;
};
export declare const calculateEstValuesFromTokenY: (tokenY: number, orderbookSide: OrderbookLevel[], initialPrice: number) => {
    estPrice: number;
    estSlippage: number;
    estTokenXAmount: number;
    estWorstPrice: number;
};
export declare const calculateValueWithFee: (value: BigNumber, feeRate: number, feeDecimalPlaces: number, valueDecimalPlaces: number) => [BigNumber, BigNumber];
export declare const calculateValueAfterFee: (value: BigNumber, feeRate: number, feeDecimalPlaces: number, valueDecimalPlaces: number) => [BigNumber, BigNumber];
export declare const calculateValueBeforeFee: (value: BigNumber, feeRate: number, feeDecimalPlaces: number, valueDecimalPlaces: number) => [BigNumber, BigNumber];
