import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers';
import * as _ from 'lodash'

const MAX_PRICE_SCALING_FACTOR = 6;

export const getPriceDecimals = (price: BigNumber, priceScalingFactor: number) => {
  const wholePartDigits = price.integerValue(BigNumber.ROUND_DOWN).toString().length;
  const maxDecimals = Math.min(priceScalingFactor, MAX_PRICE_SCALING_FACTOR);
  const decimals = maxDecimals - wholePartDigits;

  return decimals > 0 ? decimals : 0;
}
