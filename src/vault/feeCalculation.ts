import BigNumber from 'bignumber.js';

export function getFeeBasisPoints(
  {
    totalValue,
    initialTokenValue,
    nextTokenValue,
    targetTokenWeight,
    totalWeight,
    feeBasisPoints,
    taxBasisPoints,
    dynamicFeesEnabled,
  }: {
    totalValue: BigNumber;
    initialTokenValue: BigNumber;
    nextTokenValue: BigNumber;
    targetTokenWeight: BigNumber;
    totalWeight: BigNumber;
    feeBasisPoints: BigNumber;
    taxBasisPoints: BigNumber;
    dynamicFeesEnabled: boolean;
  }
): BigNumber {
  if (!dynamicFeesEnabled) {
    return feeBasisPoints;
  }

  const targetTokenValue = totalValue.times(targetTokenWeight).div(totalWeight);
  if (targetTokenValue.isZero()) {
    return feeBasisPoints;
  }

  const initialDiff = initialTokenValue.minus(targetTokenValue).abs();
  const nextDiff = nextTokenValue.minus(targetTokenValue).abs();

  if (nextDiff.lt(initialDiff)) {
    const rebateBps = initialDiff.times(taxBasisPoints).div(targetTokenValue);
    return safeSubtract(feeBasisPoints, rebateBps);
  }

  let averageDiff = initialDiff.plus(nextDiff).div(2);
  if (averageDiff.gt(targetTokenValue)) {
    averageDiff = targetTokenValue;
  }
  const taxBps = averageDiff.times(taxBasisPoints).div(targetTokenValue);
  return feeBasisPoints.plus(taxBps);
}

function safeSubtract(a: BigNumber, b: BigNumber): BigNumber {
  return a.gt(b) ? a.minus(b) : BigNumber(0);
}
