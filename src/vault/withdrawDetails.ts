import BigNumber from 'bignumber.js';
import { CalculateWithdrawDetailsSyncParams, WithdrawDetails } from './params';
import { getFeeBasisPoints } from './feeCalculation';
import { binarySearch } from '../utils/binarySearch';

export const getWithdrawDetails = ({
  fee,
  inputs,
  isLpTokenInput,
  tokenPriceUSD,
  totalSupply,
  totalValue,
  targetTokenWeight,
  totalWeight,
  tokenValue,
}: CalculateWithdrawDetailsSyncParams): WithdrawDetails => {
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
      Number(tokenAmountUSDWithoutFee.times(100))
    );

    const fee = BigNumber(tokenAmountUSD).minus(tokenAmountUSDWithoutFee);

    return { lpSpend: lpAmount, minTokenReceive: tokenAmountUSDWithoutFee, fee: fee };
  }
  else {
    const amount = BigNumber(tokenInput);
    const tokenAmountUSDWithoutFee = amount.times(tokenPriceUSD);
    const tokenAmountUSD = binarySearch(
      (x: number) => {
        const amountUSD = BigNumber(x);
        const feeAmount = calculateFeeAmount(amountUSD);
        return amountUSD.minus(feeAmount).minus(tokenAmountUSDWithoutFee).toNumber();
      },
      0,
      Number(tokenAmountUSDWithoutFee),
      Number(tokenAmountUSDWithoutFee.times(100))
    );
    const feeAmount = calculateFeeAmount(BigNumber(tokenAmountUSD));
    const lpAmount = tokenAmountUSDWithoutFee.times(totalSupply).div(totalValue);

    return { lpSpend: lpAmount, minTokenReceive: amount, fee: feeAmount };
  }
};
