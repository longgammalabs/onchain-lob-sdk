import BigNumber from 'bignumber.js';
import { CalculateWithdrawDetailsSyncParams, WithdrawDetails } from './params';
import { getFeeBasisPoints } from './feeCalculation';
import { binarySearch } from '../utils/binarySearch';
import { USD_DECIMALS } from './constants';
import { parseUnits } from 'ethers';

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
  tokenDecimals,
  lpTokenDecimals,
}: CalculateWithdrawDetailsSyncParams): WithdrawDetails => {
  const { tokenInput, lpInput } = inputs;
  const maxFeeBps = fee.feeBps.plus(fee.taxBps).plus(fee.adminBurnLPFeeBps).plus(fee.adminMintLPFeeBps);
  let details: WithdrawDetails = { lpSpend: BigNumber(0), tokenReceive: BigNumber(0), fee: BigNumber(0), params: { minTokenGet: 0n, minUsdValue: 0n, burnLP: 0n } };

  const calculateFeeAmountUSD = (amountUSD: BigNumber) => {
    const dinamicFeeBps = getFeeBasisPoints({
      totalValue,
      initialTokenValue: tokenValue,
      nextTokenValue: tokenValue.minus(amountUSD),
      targetTokenWeight,
      totalWeight,
      feeBasisPoints: fee.feeBps,
      taxBasisPoints: fee.taxBps,
      dynamicFeesEnabled: fee.dynamicFeesEnabled,
    });
    const feeBps = dinamicFeeBps.plus(fee.adminBurnLPFeeBps);
    const feeAmount = amountUSD.times(feeBps);
    return feeAmount;
  };

  if (isLpTokenInput) {
    const lpAmount = BigNumber(lpInput).dp(lpTokenDecimals, BigNumber.ROUND_FLOOR);
    const tokenAmountUSDWithoutFee = lpAmount.times(totalValue).div(totalSupply).dp(tokenDecimals, BigNumber.ROUND_FLOOR);

    const tokenAmountUSD = tokenAmountUSDWithoutFee.div(BigNumber(1).minus(maxFeeBps));

    const feeAmountUSD = BigNumber(tokenAmountUSD).minus(tokenAmountUSDWithoutFee);
    const tokenReceive = tokenAmountUSDWithoutFee.div(tokenPriceUSD).dp(tokenDecimals, BigNumber.ROUND_FLOOR);
    const feeAmount = feeAmountUSD.div(tokenPriceUSD).dp(tokenDecimals, BigNumber.ROUND_FLOOR);

    details = { ...details, lpSpend: lpAmount, tokenReceive, fee: feeAmount };
  }
  else {
    const amount = BigNumber(tokenInput);
    const tokenAmountUSDWithoutFee = amount.times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR);
    const tokenAmountUSD = binarySearch(
      (x: BigNumber) => {
        const amountUSD = BigNumber(x);
        const feeAmount = calculateFeeAmountUSD(amountUSD).dp(tokenDecimals, BigNumber.ROUND_FLOOR); ;
        return amountUSD.minus(feeAmount).minus(tokenAmountUSDWithoutFee);
      },
      BigNumber(0),
      tokenAmountUSDWithoutFee,
      tokenAmountUSDWithoutFee.times(BigNumber(1).plus(maxFeeBps))
    );

    if (tokenAmountUSD === null) return details;

    const feeAmount = calculateFeeAmountUSD(BigNumber(tokenAmountUSD));
    const lpAmount = tokenAmountUSDWithoutFee.times(totalSupply).div(totalValue).dp(lpTokenDecimals, BigNumber.ROUND_FLOOR);

    details = { ...details, lpSpend: lpAmount, tokenReceive: amount, fee: feeAmount };
  }

  details.params = getParams(
    details.tokenReceive.plus(details.fee),
    details.tokenReceive.plus(details.fee).times(tokenPriceUSD).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR),
    details.lpSpend,
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
): WithdrawDetails['params'] => {
  const minTokenGetWithSlippage = amount.times((BigNumber(1).minus(slippage))).dp(tokenDecimals, BigNumber.ROUND_FLOOR);
  const minUsdValueWithSlippage = amountUSD.times((BigNumber(1).minus(slippage))).dp(USD_DECIMALS, BigNumber.ROUND_FLOOR);

  return {
    burnLP: parseUnits(lpAmount.toString(), lpTokenDecimals),
    minTokenGet: parseUnits(minTokenGetWithSlippage.toString(), tokenDecimals),
    minUsdValue: parseUnits(minUsdValueWithSlippage.toString(), USD_DECIMALS),
  };
};
