import { useContractKit, useProvider } from '@celo-tools/use-contractkit'
import { Contract } from '@ethersproject/contracts'
import IUniswapV2PairABI from '@ubeswap/core/build/abi/IUniswapV2Pair.json'
import { ReleaseUbe } from 'generated/ReleaseUbe'
import { useMemo } from 'react'

import POOL_FACTORY_ABI from '../constants/abis/PoolFactory.json'
import NFT_POOL_FACTORY_ABI from '../constants/abis/NFTPoolFactory.json'
import POOL_ABI from '../constants/abis/Pool.json'
import NFT_POOL_ABI from '../constants/abis/NFTPool.json'

import TRADEGEN_STAKING_REWARDS_ABI from '../constants/abis/TradegenStakingRewards.json'
import TRADEGEN_STAKING_ESCROW_ABI from '../constants/abis/TradegenStakingEscrow.json'
import TRADEGEN_LP_STAKING_REWARDS_ABI from '../constants/abis/TradegenLPStakingRewards.json'
import TRADEGEN_LP_STAKING_ESCROW_ABI from '../constants/abis/TradegenLPStakingEscrow.json'
import BASE_UBESWAP_ADAPTER_ABI from '../constants/abis/BaseUbeswapAdapter.json'
import UBESWAP_LP_TOKEN_PRICE_AGGREGATOR_ABI from '../constants/abis/UbeswapLPTokenPriceAggregator.json'

import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ERC20_ABI, { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import DUAL_REWARDS_ABI from '../constants/abis/moola/MoolaStakingRewards.json'
import POOL_MANAGER_ABI from '../constants/abis/pool-manager.json'
import RELEASE_UBE_ABI from '../constants/abis/ReleaseUbe.json'
import STAKING_REWARDS_ABI from '../constants/abis/StakingRewards.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { Erc20, MoolaStakingRewards, PoolManager, StakingRewards, PoolFactory, NFTPoolFactory, Pool } from '../generated'
import { getContract } from '../utils'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { address: account } = useContractKit()
  const library = useProvider()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Erc20 | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible) as Erc20 | null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  // TODO(igm): find CELO equivalent of ENS
  return null
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { network } = useContractKit()
  const chainId = network.chainId
  return useContract(chainId ? MULTICALL_NETWORKS[chainId] : undefined, MULTICALL_ABI, false)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): StakingRewards | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible) as StakingRewards | null
}

export function usePoolManagerContract(
  poolManagerAddress?: string,
  withSignerIfPossible?: boolean
): PoolManager | null {
  return useContract(poolManagerAddress, POOL_MANAGER_ABI, withSignerIfPossible) as PoolManager | null
}

export function useReleaseUbeContract(withSignerIfPossible?: boolean): ReleaseUbe | null {
  return useContract(
    '0x5Ed248077bD07eE9B530f7C40BE0c1dAE4c131C0',
    RELEASE_UBE_ABI,
    withSignerIfPossible
  ) as ReleaseUbe | null
}

export function useDualStakingContract(
  stakingAddress?: string,
  withSignerIfPossible?: boolean
): MoolaStakingRewards | null {
  return useContract(stakingAddress, DUAL_REWARDS_ABI, withSignerIfPossible) as MoolaStakingRewards | null
}

export function usePoolFactoryContract(poolFactoryAddress?: string, withSignerIfPossible?: boolean): PoolFactory | null {
  return useContract(poolFactoryAddress, POOL_FACTORY_ABI, withSignerIfPossible) as PoolFactory | null
}

export function useNFTPoolFactoryContract(NFTPoolFactoryAddress?: string, withSignerIfPossible?: boolean): NFTPoolFactory | null {
  return useContract(NFTPoolFactoryAddress, NFT_POOL_FACTORY_ABI, withSignerIfPossible) as NFTPoolFactory | null
}

export function usePoolContract(poolAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(poolAddress, POOL_ABI, withSignerIfPossible) as Pool | null
}

export function useNFTPoolContract(NFTPoolAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(NFTPoolAddress, NFT_POOL_ABI, withSignerIfPossible) as Pool | null
}

export function useTradegenStakingRewardsContract(TradegenStakingRewardsAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(TradegenStakingRewardsAddress, TRADEGEN_STAKING_REWARDS_ABI, withSignerIfPossible) as Pool | null
}

export function useTradegenStakingEscrowContract(TradegenStakingEscrowAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(TradegenStakingEscrowAddress, TRADEGEN_STAKING_ESCROW_ABI, withSignerIfPossible) as Pool | null
}

export function useTradegenLPStakingRewardsContract(TradegenLPStakingRewardsAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(TradegenLPStakingRewardsAddress, TRADEGEN_LP_STAKING_REWARDS_ABI, withSignerIfPossible) as Pool | null
}

export function useTradegenLPStakingEscrowContract(TradegenLPStakingEscrowAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(TradegenLPStakingEscrowAddress, TRADEGEN_LP_STAKING_ESCROW_ABI, withSignerIfPossible) as Pool | null
}

export function useBaseUbeswapAdapterContract(BaseUbeswapAdapterAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(BaseUbeswapAdapterAddress, BASE_UBESWAP_ADAPTER_ABI, withSignerIfPossible) as Pool | null
}

export function useUbeswapLPTokenPriceAggregatorContract(UbeswapLPTokenPriceAggergatorAddress?: string, withSignerIfPossible?: boolean): Pool | null {
  return useContract(UbeswapLPTokenPriceAggergatorAddress, UBESWAP_LP_TOKEN_PRICE_AGGREGATOR_ABI, withSignerIfPossible) as Pool | null
}