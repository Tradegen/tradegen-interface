import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'
import { useMarketplaceContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { MARKETPLACE_ADDRESS } from '../../constants'

export interface MarketplaceListing {
  asset: string | null,
  seller: string | null,
  numberOfTokens: bigint | null,
  price: bigint | null,
  tokenClass: bigint | null
}

export function useListingIndex(
    user: string,
    asset: string
  ): bigint {
  
    const MarketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const index = useSingleCallResult(MarketplaceContract, 'getListingIndex', [user, asset]);
  
    return useMemo(() => {
      return !index || index.loading
        ? BigInt(0)
        : index?.result?.[0];
    }, [index])
}

export function useMarketplaceListing(
    MarketplaceContract: any,
    listingIndex: bigint,
  ): [string, string, bigint, bigint, bigint] {
  
    const marketplaceListing = useSingleCallResult(MarketplaceContract, 'getMarketplaceListing', [Number(listingIndex.toString())]);
  
    return useMemo(() => {
      return !marketplaceListing || marketplaceListing.loading
        ? ["", "", BigInt(0), BigInt(0), BigInt(0)]
        : [marketplaceListing?.result?.[0], marketplaceListing?.result?.[1], marketplaceListing?.result?.[2], marketplaceListing?.result?.[3], marketplaceListing?.result?.[4]];
    }, [marketplaceListing])
}

export function useMarketplaceListingInfo(user:string, asset:string): MarketplaceListing {
  const MarketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  
  let index = useListingIndex(user, asset);
  index = index ?? BigInt(0);
  console.log("Index: " + index.toString())

  const marketplaceListing = useMarketplaceListing(MarketplaceContract, index);

  return {
    asset: (!marketplaceListing || !marketplaceListing[0]) ? "" : marketplaceListing[0],
    seller: (!marketplaceListing || !marketplaceListing[1]) ? "" : marketplaceListing[1],
    numberOfTokens: (!marketplaceListing || !marketplaceListing[2]) ? BigInt(0) : marketplaceListing[2],
    price: (!marketplaceListing || !marketplaceListing[3]) ? BigInt(0) : marketplaceListing[3],
    tokenClass: (!marketplaceListing || !marketplaceListing[4]) ? BigInt(0) : marketplaceListing[4],
  }
}