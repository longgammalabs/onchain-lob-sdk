import BigNumber from 'bignumber.js';
import { CalculateDepositDetailsSyncParams, DepositDetails } from './params';
import { getFeeBasisPoints } from './feeCalculation';
import { binarySearch } from '../utils/binarySearch';

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
}: CalculateDepositDetailsSyncParams): DepositDetails => {
  const { tokenInput, lpInput } = inputs;

  const calculateFeeAmount = (amountUSD: BigNumber) => {
    const dinamicFeeBps = getFeeBasisPoints({
      totalValue,
      initialTokenValue: tokenValue,
      nextTokenValue: tokenValue.plus(amountUSD),
      targetTokenWeight,
      totalWeight,
      feeBasisPoints: fee.feeBps,
      taxBasisPoints: fee.taxBps,
      dynamicFeesEnabled: fee.dynamicFeesEnabled,
    });
    const feeBps = dinamicFeeBps.plus(fee.adminMintLPFeeBps);
    const feeAmount = amountUSD.times(feeBps);
    return feeAmount;
  };

  if (isLpTokenInput) {
    const lpAmount = BigNumber(lpInput);
    const tokenAmountUSDWithoutFee = lpAmount.times(totalValue).div(totalSupply);
    const tokenAmountUSD = binarySearch(
      (x: number) => {
        const amountUSD = BigNumber(x);
        const feeAmount = calculateFeeAmount(amountUSD);
        return amountUSD.minus(feeAmount).minus(tokenAmountUSDWithoutFee).toNumber();
      },
      0,
      Number(tokenAmountUSDWithoutFee),
      tokenAmountUSDWithoutFee.times(100).toNumber()
    );

    const tokenSpend = BigNumber(tokenAmountUSD).div(tokenPriceUSD);
    const fee = BigNumber(tokenAmountUSD).minus(tokenAmountUSDWithoutFee);

    return { tokenSpend, minLpReceive: lpAmount, fee };
  }
  else {
    const amount = BigNumber(tokenInput);
    const amountUSD = amount.times(tokenPriceUSD);
    const feeAmount = calculateFeeAmount(amountUSD);
    const lpAmount = amountUSD.minus(feeAmount).times(totalSupply).div(totalValue);

    return { tokenSpend: amount, minLpReceive: lpAmount, fee: feeAmount };
  }
};
