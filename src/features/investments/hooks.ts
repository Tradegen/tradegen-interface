import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'
import { usePoolFactoryContract, useNFTPoolFactoryContract } from '../../hooks/useContract'
import { POOL_FACTORY_ADDRESS, NFT_POOL_FACTORY_ADDRESS } from '../../constants'
import { useSingleCallResult, NEVER_RELOAD, useMultipleContractSingleData } from '../../state/multicall/hooks'
import { ChainId } from '@ubeswap/sdk'
import { concat } from 'lodash'
import { POOL_INTERFACE } from '../../constants/abis/pool'
import { NFT_POOL_INTERFACE } from '../../constants/abis/NFTpool'

/*
  Currently expensive to render farm list item. The infinite scroll is used to
  to minimize this impact. This hook pairs with it, keeping track of visible
  items and passes this to <InfiniteScroll> component.
*/
export function useInfiniteScroll(items: any[]): [number, Dispatch<number>] {
  const [itemsDisplayed, setItemsDisplayed] = useState(10)
  useEffect(() => setItemsDisplayed(10), [items.length])
  return [itemsDisplayed, setItemsDisplayed]
}

export function useInvestments() {
  const poolFactoryContract = usePoolFactoryContract(POOL_FACTORY_ADDRESS);
  const NFTPoolFactoryContract = useNFTPoolFactoryContract(NFT_POOL_FACTORY_ADDRESS);

  const poolAddresses = useSingleCallResult(poolFactoryContract ? poolFactoryContract : null, 'pools', undefined, NEVER_RELOAD)?.result?.[0];
  const NFTPoolAddresses = useSingleCallResult(NFTPoolFactoryContract ? NFTPoolFactoryContract : null, 'pools', undefined, NEVER_RELOAD)?.result?.[0];

  const poolTokenPrices = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'tokenPrice', undefined, NEVER_RELOAD)?.map((result:any) => (result?.[0]));
  const NFTPoolTokenPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'tokenPrice', undefined, NEVER_RELOAD)?.map((result:any) => (result?.[0]));

  const poolValues = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'getPoolValue', undefined, NEVER_RELOAD)?.map((result:any) => (result?.[0]));
  const NFTPoolValues = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'getPoolValue', undefined, NEVER_RELOAD)?.map((result:any) => (result?.[0]));

  let pools:any[] = [];
  let NFTPools:any[] = [];

  for (var i = 0; i < poolAddresses.length; i++)
  {
    pools.push({
      type: "Pool",
      address: poolAddresses[i],
      tokenPrice: poolTokenPrices[i],
      TVL: poolValues[i]
    });
  }

  for (var i = 0; i < NFTPoolAddresses.length; i++)
  {
    pools.push({
      type: "NFTPool",
      address: NFTPoolAddresses[i],
      tokenPrice: NFTPoolTokenPrices[i],
      TVL: NFTPoolValues[i]
    });
  }

  return concat(pools, NFTPools);
}