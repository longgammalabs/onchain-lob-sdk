import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers';

const MAX_PRICE_SCALING_FACTOR = 6;

export const getPriceDecimals = (price: BigNumber, priceScalingFactor: number) => {
  const priceUnits = parseUnits(price.toString(), priceScalingFactor).toString();
  if (priceUnits.length <= MAX_PRICE_SCALING_FACTOR) {
    return priceScalingFactor;
  }

  return priceScalingFactor - (priceUnits.length - MAX_PRICE_SCALING_FACTOR);  
}
