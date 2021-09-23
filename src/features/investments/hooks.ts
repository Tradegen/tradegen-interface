import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'
import { usePoolFactoryContract, useNFTPoolFactoryContract, usePoolManagerContract } from '../../hooks/useContract'
import { POOL_FACTORY_ADDRESS, NFT_POOL_FACTORY_ADDRESS } from '../../constants'
import { useSingleCallResult, NEVER_RELOAD, useMultipleContractSingleData } from '../../state/multicall/hooks'
import { ChainId } from '@ubeswap/sdk'
import { concat } from 'lodash'
import { POOL_INTERFACE } from '../../constants/abis/pool'
import { NFT_POOL_INTERFACE } from '../../constants/abis/NFTpool'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'

export interface Investment {
  TVL: bigint | null,
  address: string,
  name: string | null,
  tokenPrice: bigint | null,
  totalReturn: string,
  type: string
}

export interface UserInvestment {
  name: string,
  type: string,
  address: string,
  balance: bigint,
  USDBalance: bigint,
  totalReturn: string
}

export interface ManagedInvestment {
  name: string,
  type: string,
  address: string,
  TVL: bigint,
  tokenPrice: bigint,
  totalReturn: string,
  manager: string
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
  poolAddresses = poolAddresses ?? [];
  NFTPoolAddresses = NFTPoolAddresses ?? [];
  
  for (var i = 0; i < poolAddresses.length; i++)
  {
    let totalReturn = "0%";
    if (!poolTokenPrices[i])
    {
      totalReturn = "0%";
    }
    else
    {
      if (BigInt(poolTokenPrices[i]) >= BigInt(1e18))
      {
        totalReturn = formatPercent(formatBalance((BigInt(poolTokenPrices[i]) - BigInt(1e18)) * BigInt(100)));
      }
      else
      {
        totalReturn = "-" + formatPercent(formatBalance((BigInt(1e18) - BigInt(poolTokenPrices[i])) * BigInt(100)));
      }
    }

    investments.push({
      type: "Pool",
      address: poolAddresses[i],
      tokenPrice: (poolTokenPrices[i] === null) ? BigInt(0) : BigInt(poolTokenPrices[i]) / BigInt(1e16),
      TVL: (poolValues[i] === null) ? BigInt(0) : BigInt(poolValues[i]) / BigInt(1e16),
      name: poolNames[i],
      totalReturn: totalReturn
    });
  }
  
  for (var i = 0; i < NFTPoolAddresses.length; i++)
  {
    let totalReturn = "0%";
    if (!NFTPoolTokenPrices[i] || !NFTPoolSeedPrices[i] || BigInt(NFTPoolSeedPrices[i]) == BigInt(0))
    {
      totalReturn = "0%";
    }
    else
    {
      if (BigInt(NFTPoolTokenPrices[i]) >= BigInt(NFTPoolSeedPrices[i]))
      {
        totalReturn = formatPercent(formatBalance((BigInt(NFTPoolTokenPrices[i]) - BigInt(NFTPoolSeedPrices[i])) * BigInt(100) * BigInt(1e18) / BigInt(NFTPoolSeedPrices[i])));
      }
      else
      {
        totalReturn = "-" + formatPercent(formatBalance((BigInt(NFTPoolSeedPrices[i]) - BigInt(NFTPoolTokenPrices[i])) * BigInt(100) * BigInt(1e18) / BigInt(NFTPoolSeedPrices[i])));
      }
    }

    investments.push({
      type: "NFT Pool",
      address: NFTPoolAddresses[i],
      tokenPrice: (NFTPoolTokenPrices[i] === null) ? BigInt(0) : BigInt(NFTPoolTokenPrices[i]) / BigInt(1e16),
      TVL: (NFTPoolValues[i] === null) ? BigInt(0) : BigInt(NFTPoolValues[i]) / BigInt(1e16),
      name: NFTPoolNames[i],
      totalReturn: totalReturn
    });
  }

  return investments;
}

export function useUserInvestments(userAddress:string): UserInvestment[] {
  const poolFactoryContract = usePoolFactoryContract(POOL_FACTORY_ADDRESS);
  const NFTPoolFactoryContract = useNFTPoolFactoryContract(NFT_POOL_FACTORY_ADDRESS);
  
  let poolAddresses = usePoolAddresses(poolFactoryContract);
  let NFTPoolAddresses = useNFTPoolAddresses(NFTPoolFactoryContract);
  poolAddresses = poolAddresses ?? [];
  NFTPoolAddresses = NFTPoolAddresses ?? [];

  const poolBalances = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'balanceOf', [userAddress])?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolBalances = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'balance', [userAddress])?.map((element:any) => (element?.result ? element?.result[0] : null));

  const poolNames = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolNames = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const poolUSDBalances = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'getUSDBalance', [userAddress])?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolUSDBalances = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'getUSDBalance', [userAddress])?.map((element:any) => (element?.result ? element?.result[0] : null));
  
  const poolTokenPrices = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolTokenPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const NFTPoolSeedPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'seedPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
  
  let investments:UserInvestment[] = [];
  
  for (var i = 0; i < poolAddresses.length; i++)
  {
    let totalReturn = "0%";
    if (!poolTokenPrices[i])
    {
      totalReturn = "0%";
    }
    else
    {
      if (BigInt(poolTokenPrices[i]) >= BigInt(1e18))
      {
        totalReturn = formatPercent(formatBalance((BigInt(poolTokenPrices[i]) - BigInt(1e18)) * BigInt(100)));
      }
      else
      {
        totalReturn = "-" + formatPercent(formatBalance((BigInt(1e18) - BigInt(poolTokenPrices[i])) * BigInt(100)));
      }
    }

    investments.push({
      name: poolNames[i],
      type: "Pool",
      address: poolAddresses[i],
      balance: (!poolBalances[i]) ? BigInt(0) : BigInt(poolBalances[i]),
      USDBalance: (!poolUSDBalances[i]) ? BigInt(0) : BigInt(poolUSDBalances[i]) / BigInt(1e16),
      totalReturn: totalReturn
    });
  }
  
  for (var i = 0; i < NFTPoolAddresses.length; i++)
  {
    let totalReturn = "0%";
    if (!NFTPoolTokenPrices[i] || !NFTPoolSeedPrices[i] || BigInt(NFTPoolSeedPrices[i]) == BigInt(0))
    {
      totalReturn = "0%";
    }
    else
    {
      if (BigInt(NFTPoolTokenPrices[i]) >= BigInt(NFTPoolSeedPrices[i]))
      {
        totalReturn = formatPercent(formatBalance((BigInt(NFTPoolTokenPrices[i]) - BigInt(NFTPoolSeedPrices[i])) * BigInt(100) * BigInt(1e18) / BigInt(NFTPoolSeedPrices[i])));
      }
      else
      {
        totalReturn = "-" + formatPercent(formatBalance((BigInt(NFTPoolSeedPrices[i]) - BigInt(NFTPoolTokenPrices[i])) * BigInt(100) * BigInt(1e18) / BigInt(NFTPoolSeedPrices[i])));
      }
    }

    investments.push({
      name: NFTPoolNames[i],
      type: "NFT Pool",
      address: NFTPoolAddresses[i],
      balance: (!NFTPoolBalances[i]) ? BigInt(0) : BigInt(NFTPoolBalances[i]),
      USDBalance: (!NFTPoolUSDBalances[i]) ? BigInt(0) : BigInt(NFTPoolUSDBalances[i]) / BigInt(1e16),
      totalReturn: totalReturn
    });
  }

  return investments;
}

export function useManagedInvestments(): ManagedInvestment[] {
  const poolFactoryContract = usePoolFactoryContract(POOL_FACTORY_ADDRESS);
  const NFTPoolFactoryContract = useNFTPoolFactoryContract(NFT_POOL_FACTORY_ADDRESS);
  
  let poolAddresses = usePoolAddresses(poolFactoryContract);
  let NFTPoolAddresses = useNFTPoolAddresses(NFTPoolFactoryContract);
  poolAddresses = poolAddresses ?? [];
  NFTPoolAddresses = NFTPoolAddresses ?? [];

  const poolNames = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolNames = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const poolManagers = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'getManagerAddress')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolManagers = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'manager')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const poolValues = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'getPoolValue')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolValues = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'getPoolValue')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const poolTokenPrices = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
  const NFTPoolTokenPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));

  const NFTPoolSeedPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'seedPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
  
  let investments:ManagedInvestment[] = [];
  
  for (var i = 0; i < poolAddresses.length; i++)
  {
    let totalReturn = "0%";
    if (!poolTokenPrices[i])
    {
      totalReturn = "0%";
    }
    else
    {
      if (BigInt(poolTokenPrices[i]) >= BigInt(1e18))
      {
        totalReturn = formatPercent(formatBalance((BigInt(poolTokenPrices[i]) - BigInt(1e18)) * BigInt(100)));
      }
      else
      {
        totalReturn = "-" + formatPercent(formatBalance((BigInt(1e18) - BigInt(poolTokenPrices[i])) * BigInt(100)));
      }
    }

    investments.push({
      name: poolNames[i],
      type: "Pool",
      address: poolAddresses[i],
      TVL: (!poolValues[i]) ? BigInt(0) : BigInt(poolValues[i]) / BigInt(1e16),
      tokenPrice: (poolTokenPrices[i] === null) ? BigInt(0) : BigInt(poolTokenPrices[i]) / BigInt(1e16),
      totalReturn: totalReturn,
      manager: poolManagers[i]
    });
  }
  
  for (var i = 0; i < NFTPoolAddresses.length; i++)
  {
    let totalReturn = "0%";
    if (!NFTPoolTokenPrices[i] || !NFTPoolSeedPrices[i] || BigInt(NFTPoolSeedPrices[i]) == BigInt(0))
    {
      totalReturn = "0%";
    }
    else
    {
      if (BigInt(NFTPoolTokenPrices[i]) >= BigInt(NFTPoolSeedPrices[i]))
      {
        totalReturn = formatPercent(formatBalance((BigInt(NFTPoolTokenPrices[i]) - BigInt(NFTPoolSeedPrices[i])) * BigInt(100) * BigInt(1e18) / BigInt(NFTPoolSeedPrices[i])));
      }
      else
      {
        totalReturn = "-" + formatPercent(formatBalance((BigInt(NFTPoolSeedPrices[i]) - BigInt(NFTPoolTokenPrices[i])) * BigInt(100) * BigInt(1e18) / BigInt(NFTPoolSeedPrices[i])));
      }
    }

    investments.push({
      name: NFTPoolNames[i],
      type: "NFT Pool",
      address: NFTPoolAddresses[i],
      TVL: (!NFTPoolValues[i]) ? BigInt(0) : BigInt(NFTPoolValues[i]) / BigInt(1e16),
      tokenPrice: (NFTPoolTokenPrices[i] === null) ? BigInt(0) : BigInt(NFTPoolTokenPrices[i]) / BigInt(1e16),
      totalReturn: totalReturn,
      manager: NFTPoolManagers[i]
    });
  }

  return investments;
}