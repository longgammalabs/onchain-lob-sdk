import BigNumber from 'bignumber.js';
export declare function getFeeBasisPoints({ totalValue, initialTokenValue, nextTokenValue, targetTokenWeight, totalWeight, feeBasisPoints, taxBasisPoints, dynamicFeesEnabled, }: {
    totalValue: BigNumber;
    initialTokenValue: BigNumber;
    nextTokenValue: BigNumber;
    targetTokenWeight: BigNumber;
    totalWeight: BigNumber;
    feeBasisPoints: BigNumber;
    taxBasisPoints: BigNumber;
    dynamicFeesEnabled: boolean;
}): BigNumber;
