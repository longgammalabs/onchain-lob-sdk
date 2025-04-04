import * as _ from 'lodash'

const MAX_PRICE_SCALING_FACTOR = 6;

export const getMinPriceScalingFactor = (priceScalingFactor: number) => {
  return Math.min(priceScalingFactor, MAX_PRICE_SCALING_FACTOR)
}
