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

  const calculateFeeAmountUSD = (amountUSD: BigNumber) => {
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
    const feeAmountUSD = amountUSD.times(feeBps);
    return feeAmountUSD;
  };

  if (isLpTokenInput) {
    const lpAmount = BigNumber(lpInput);
    const tokenAmountUSDWithoutFee = lpAmount.times(totalValue).div(totalSupply);
    const tokenAmountUSD = binarySearch(
      (x: number) => {
        const amountUSD = BigNumber(x);
        const feeAmountUSD = calculateFeeAmountUSD(amountUSD);
        return amountUSD.minus(feeAmountUSD).minus(tokenAmountUSDWithoutFee).toNumber();
      },
      0,
      Number(tokenAmountUSDWithoutFee),
      tokenAmountUSDWithoutFee.times(100).toNumber()
    );

    const tokenSpend = BigNumber(tokenAmountUSD).div(tokenPriceUSD);
    const feeAmountUSD = BigNumber(tokenAmountUSD).minus(tokenAmountUSDWithoutFee);
    const feeAmount = feeAmountUSD.div(tokenPriceUSD);

    return { tokenSpend, minLpReceive: lpAmount, fee: feeAmount };
  }
  else {
    const amount = BigNumber(tokenInput);
    const amountUSD = amount.times(tokenPriceUSD);
    const feeAmountUSD = calculateFeeAmountUSD(amountUSD);
    const feeAmount = feeAmountUSD.div(tokenPriceUSD);
    const lpAmount = amountUSD.minus(feeAmountUSD).times(totalSupply).div(totalValue);

    return { tokenSpend: amount, minLpReceive: lpAmount, fee: feeAmount };
  }
};
