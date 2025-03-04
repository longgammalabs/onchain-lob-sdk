import BigNumber from 'bignumber.js';
import { CalculateDepositDetailsSyncParams, DepositDetails } from './params';
import { getFeeBasisPoints } from './feeCalculation';
import { binarySearch } from '../utils/binarySearch';
import { parseUnits } from 'ethers';
import { USD_DECIMALS } from './constants';

export const getDepositDetails = ({
  fee,
  inputs,
  isLpTokenInput,
  tokenPriceUSD,
  totalSupply,
  totalValue,
  targetTokenWeight,
  totalWeight,
  tokenValue,
  tokenDecimals,
  lpTokenDecimals,
}: CalculateDepositDetailsSyncParams): DepositDetails => {
  const { tokenInput, lpInput } = inputs;
  const maxFeeBps = fee.feeBps.plus(fee.taxBps).plus(fee.adminBurnLPFeeBps).plus(fee.adminMintLPFeeBps);
  let details: DepositDetails = { tokenSpend: BigNumber(0), lpReceive: BigNumber(0), fee: BigNumber(0), params: { amount: 0n, amountUsd: 0n, minLpMinted: 0n } };

  const calculateFeeAmountUSD = (amountUSD: BigNumber) => {
    const dynamicFeeBps = getFeeBasisPoints({
      totalValue,
      initialTokenValue: tokenValue,
      nextTokenValue: tokenValue.plus(amountUSD),
      targetTokenWeight,
      totalWeight,
      feeBasisPoints: fee.feeBps,
      taxBasisPoints: fee.taxBps,
      dynamicFeesEnabled: fee.dynamicFeesEnabled,
    });
    const feeBps = dynamicFeeBps.plus(fee.adminMintLPFeeBps);
    const feeAmountUSD = amountUSD.times(feeBps);
    return feeAmountUSD;
  };

  if (isLpTokenInput) {
    const lpAmount = BigNumber(lpInput).dp(lpTokenDecimals, BigNumber.ROUND_FLOOR);
    const tokenAmountUSDWithoutFee = lpAmount.times(totalValue).div(totalSupply).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR);
    const tokenAmountUSD = binarySearch(
      (x: BigNumber) => {
        const amountUSD = BigNumber(x);
        const feeAmountUSD = calculateFeeAmountUSD(amountUSD).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR);
        return amountUSD.minus(feeAmountUSD).minus(tokenAmountUSDWithoutFee);
      },
      BigNumber(0),
      tokenAmountUSDWithoutFee,
      tokenAmountUSDWithoutFee.times(BigNumber(1).plus(maxFeeBps))
    );

    if (tokenAmountUSD === null) return details;

    const tokenSpend = tokenAmountUSD.div(tokenPriceUSD).dp(tokenDecimals, BigNumber.ROUND_FLOOR);
    const feeAmountUSD = BigNumber(tokenAmountUSD).minus(tokenAmountUSDWithoutFee).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR);
    const feeAmount = feeAmountUSD.div(tokenPriceUSD).dp(tokenDecimals, BigNumber.ROUND_FLOOR);

    details = { ...details, tokenSpend, lpReceive: lpAmount, fee: feeAmount };
  }
  else {
    const amount = BigNumber(tokenInput).dp(tokenDecimals, BigNumber.ROUND_FLOOR);
    const amountUSD = amount.times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR);
    const feeAmountUSD = calculateFeeAmountUSD(amountUSD).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR);
    const feeAmount = feeAmountUSD.div(tokenPriceUSD).dp(tokenDecimals, BigNumber.ROUND_FLOOR);
    const lpAmount = amountUSD
      .minus(feeAmountUSD)
      .times(totalSupply)
      .div(totalValue)
      .dp(lpTokenDecimals, BigNumber.ROUND_FLOOR);

    details = { ...details, tokenSpend: amount, lpReceive: lpAmount, fee: feeAmount };
  }

  details.params = getParams(
    details.tokenSpend,
    details.tokenSpend.times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR),
    details.lpReceive,
    inputs.slippageBps,
    tokenDecimals,
    lpTokenDecimals
  );

  return details;
};

const getParams = (
  amount: BigNumber,
  amountUSD: BigNumber,
  lpAmount: BigNumber,
  slippage: number,
  tokenDecimals: number,
  lpTokenDecimals: number
): DepositDetails['params'] => {
  const minLpMintedWithSlippage = lpAmount
    .times(BigNumber(1).minus(slippage))
    .dp(lpTokenDecimals, BigNumber.ROUND_FLOOR);
  return {
    amount: parseUnits(amount.toString(), tokenDecimals),
    amountUsd: parseUnits(amountUSD.toString(), USD_DECIMALS),
    minLpMinted: parseUnits(minLpMintedWithSlippage.toString(), lpTokenDecimals),
  };
};
