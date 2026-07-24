import { Contract } from 'ethers';
import { lpManagerPairAbi } from '../abi';
import type {
  PreviewAddLiquidityPairParams, PreviewAddLiquidityPairResult,
  PreviewRemoveLiquidityPairParams, PreviewRemoveLiquidityPairResult,
  GetPairReservesParams, PairReserves,
  GetPairConfigParams, PairConfig
} from './params';

const contract = (vault: string, provider: PreviewAddLiquidityPairParams['provider']) =>
  new Contract(vault, lpManagerPairAbi, provider);

export async function previewAddLiquidityPair(
  { vault, provider, tokenId, amount }: PreviewAddLiquidityPairParams
): Promise<PreviewAddLiquidityPairResult> {
  const r = await contract(vault, provider).previewAddLiquidity!(BigInt(tokenId), amount);
  return { amountTokenX: r[0], amountTokenY: r[1], adminFeeLP: r[2], mintedLP: r[3] };
}

export async function previewRemoveLiquidityPair(
  { vault, provider, burnLP }: PreviewRemoveLiquidityPairParams
): Promise<PreviewRemoveLiquidityPairResult> {
  const r = await contract(vault, provider).previewRemoveLiquidity!(burnLP);
  return { amountTokenX: r[0], amountTokenY: r[1], adminFeeLP: r[2] };
}

export async function getPairReserves(
  { vault, provider }: GetPairReservesParams
): Promise<PairReserves> {
  const r = await contract(vault, provider).getTotalReserves!();
  return { totalTokenX: r[0], totalTokenY: r[1] };
}

export async function getPairConfig(
  { vault, provider }: GetPairConfigParams
): Promise<PairConfig> {
  const r = await contract(vault, provider).getPairConfig!();
  const [feeConfig, liquidityConfig, , nativeConfig] = r;
  return {
    adminMintLPFeeBps: Number(feeConfig[0]),
    adminBurnLPFeeBps: Number(feeConfig[1]),
    cooldownDuration: Number(liquidityConfig[0]),
    maxTotalTokenX: liquidityConfig[1],
    maxTotalTokenY: liquidityConfig[2],
    nativeEnabled: Boolean(nativeConfig[0]),
    nativeTokenId: Number(nativeConfig[1])
  };
}
