import BigNumber from 'bignumber.js';
export declare const convertTokensRawAmountToAmount: (amount: string | bigint, decimals: number) => BigNumber;
export declare const convertTokensAmountToRawAmount: (amount: BigNumber, decimals: number) => bigint;
