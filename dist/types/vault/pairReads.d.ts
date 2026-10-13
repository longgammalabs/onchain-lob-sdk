import type { PreviewAddLiquidityPairParams, PreviewAddLiquidityPairResult, PreviewRemoveLiquidityPairParams, PreviewRemoveLiquidityPairResult, GetPairReservesParams, PairReserves, GetPairConfigParams, PairConfig } from './params';
export declare function previewAddLiquidityPair({ vault, provider, tokenId, amount }: PreviewAddLiquidityPairParams): Promise<PreviewAddLiquidityPairResult>;
export declare function previewRemoveLiquidityPair({ vault, provider, burnLP }: PreviewRemoveLiquidityPairParams): Promise<PreviewRemoveLiquidityPairResult>;
export declare function getPairReserves({ vault, provider }: GetPairReservesParams): Promise<PairReserves>;
export declare function getPairConfig({ vault, provider }: GetPairConfigParams): Promise<PairConfig>;
