import { LimitOrderDetails } from '../models';
import { CalculateLimitDetailsSyncParams } from './params';
export declare const defaultBuyLimitDetails: LimitOrderDetails['buy'];
export declare const defaultSellLimitDetails: LimitOrderDetails['sell'];
export declare const getLimitDetails: ({ market, direction, inputToken, inputs }: CalculateLimitDetailsSyncParams) => LimitOrderDetails;
export declare const calculateBuyLimitDetailsTokenXInput: (priceInput: number, tokenXInput: number, priceScalingFactor: number, tokenXScalingFactor: number, tokenYScalingFactor: number, maxFeeRate: number) => LimitOrderDetails["buy"];
export declare const calculateBuyLimitDetailsTokenYInput: (priceInput: number, tokenYInput: number, priceScalingFactor: number, tokenXScalingFactor: number, tokenYScalingFactor: number, maxFeeRate: number) => LimitOrderDetails["buy"];
export declare const calculateSellLimitDetailsTokenXInput: (priceInput: number, tokenXInput: number, priceScalingFactor: number, tokenXScalingFactor: number, tokenYScalingFactor: number, maxFeeRate: number) => LimitOrderDetails["sell"];
export declare const calculateSellLimitDetailsTokenYInput: (priceInput: number, tokenYInput: number, priceScalingFactor: number, tokenXScalingFactor: number, tokenYScalingFactor: number, maxFeeRate: number) => LimitOrderDetails["sell"];
