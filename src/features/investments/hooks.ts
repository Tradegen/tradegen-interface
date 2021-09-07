import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'
import { usePoolFactoryContract, useNFTPoolFactoryContract, usePoolManagerContract } from '../../hooks/useContract'
import { POOL_FACTORY_ADDRESS, NFT_POOL_FACTORY_ADDRESS } from '../../constants'
import { useSingleCallResult, NEVER_RELOAD, useMultipleContractSingleData } from '../../state/multicall/hooks'
import { ChainId } from '@ubeswap/sdk'
import { concat } from 'lodash'
import { POOL_INTERFACE } from '../../constants/abis/pool'
import { NFT_POOL_INTERFACE } from '../../constants/abis/NFTpool'

export interface Investment {
  TVL: bigint | null,
  address: string,
  name: string | null,
  tokenPrice: bigint | null,
  totalReturn: bigint,
  type: string
}

/*
  Currently expensive to render farm list item. The infinite scroll is used to
  to minimize this impact. This hook pairs with it, keeping track of visible
  items and passes this to <InfiniteScroll> component.
*/
export function useInfiniteScroll(items: Investment[]): [number, Dispatch<number>] {
  const [itemsDisplayed, setItemsDisplayed] = useState(10)
  useEffect(() => setItemsDisplayed(10), [items.length])
  return [itemsDisplayed, setItemsDisplayed]
}

export function usePoolAddresses(
  poolFactoryContract: any,
): readonly string[] {

  const poolAddresses = useSingleCallResult(poolFactoryContract, 'getAvailablePools');

  return useMemo(() => {
    return !poolAddresses || poolAddresses.loading
      ? []
      : poolAddresses?.result?.[0];
  }, [poolAddresses])
}

export function useNFTPoolAddresses(
  NFTPoolFactoryContract: any,
): readonly string[] {

  const NFTPoolAddresses = useSingleCallResult(NFTPoolFactoryContract, 'getAvailablePools');

  return useMemo(() => {
    return !NFTPoolAddresses || NFTPoolAddresses.loading
      ? []
      : NFTPoolAddresses?.result?.[0];
  }, [NFTPoolAddresses])
}

export function useInvestments(): Investment[] {
  const poolFactoryContract = usePoolFactoryContract(POOL_FACTORY_ADDRESS);
  const NFTPoolFactoryContract = useNFTPoolFactoryContract(NFT_POOL_FACTORY_ADDRESS);
  
  let poolAddresses = usePoolAddresses(poolFactoryContract);
  let NFTPoolAddresses = useNFTPoolAddresses(NFTPoolFactoryContract);

  const poolTokenPrices = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolTokenPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const poolValues = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'getPoolValue')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolValues = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'getPoolValue')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const poolNames = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolNames = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const NFTPoolSeedPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'seedPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
  
  let investments:Investment[] = [];
  
  for (var i = 0; i < poolAddresses.length; i++)
  {
    investments.push({
      type: "Pool",
      address: poolAddresses[i],
      tokenPrice: BigInt(poolTokenPrices[i]) / BigInt(1e18),
      TVL: BigInt(poolValues[i]) / BigInt(1e18),
      name: poolNames[i],
      totalReturn: (poolTokenPrices[i] === null || BigInt(poolTokenPrices[i]) == BigInt(0)) ? BigInt(0) : (BigInt(poolTokenPrices[i]) - BigInt(1e18)) * BigInt(100) / BigInt(1e18)
    });
  }
  
  for (var i = 0; i < NFTPoolAddresses.length; i++)
  {
    investments.push({
      type: "NFTPool",
      address: NFTPoolAddresses[i],
      tokenPrice: BigInt(NFTPoolTokenPrices[i]) / BigInt(1e18),
      TVL: BigInt(NFTPoolValues[i]) / BigInt(1e18),
      name: NFTPoolNames[i],
      totalReturn: (NFTPoolTokenPrices[i] === null) ? BigInt(0) : BigInt(BigInt(NFTPoolSeedPrices[i]) - BigInt(NFTPoolTokenPrices[i])) * BigInt(100) / BigInt(NFTPoolSeedPrices[i]) 
    });
  }

  return investments;
}