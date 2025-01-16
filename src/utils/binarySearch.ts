import BigNumber from 'bignumber.js';

export const binarySearch = (
  f: (x: BigNumber) => BigNumber,
  target: BigNumber,
  left: BigNumber,
  right: BigNumber,
  precision: number = 18
): BigNumber | null => {
  const step = BigNumber(10).pow(-precision);
  while (left.isLessThanOrEqualTo(right)) {
    const mid = left.plus(right).div(2).dp(precision, BigNumber.ROUND_FLOOR);

    const res = f(mid);

    if (res.isEqualTo(target)) {
      return mid;
    }

    if (res.isLessThan(target)) {
      left = mid.plus(step);
    }
    else {
      right = mid.minus(step);
    }
  }

  return null;
};
