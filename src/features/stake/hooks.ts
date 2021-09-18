import { useMemo } from 'react'
import { useTokenContract, useTradegenStakingRewardsContract,
         useTradegenLPStakingRewardsContract,
         useBaseUbeswapAdapterContract,
         useUbeswapLPTokenPriceAggregatorContract } from '../../hooks/useContract'
import { useSingleCallResult, NEVER_RELOAD } from '../../state/multicall/hooks'
import { TRADEGEN_LP_STAKING_ESCROW_ADDRESS,
        TRADEGEN_LP_STAKING_REWARDS_ADDRESS,
        TRADEGEN_STAKING_ESCROW_ADDRESS,
        TRADEGEN_STAKING_REWARDS_ADDRESS,
        TGEN,
        BASE_UBESWAP_ADAPTER_ADDRESS,
        UBESWAP_LP_TOKEN_PRICE_AGGREGATOR_ADDRESS } from '../../constants/index'

export interface UserInvestmentInfo {
  userBalance: bigint,
  userUSDBalance: bigint
}

export interface StakingRewardsInfo {
    rewardRate: bigint,
    TVL: bigint
}

export function useLastTimeRewardsApplicable(
    stakingRewardsContract: any,
  ): bigint {
  
    const timestamp = useSingleCallResult(stakingRewardsContract, 'lastTimeRewardApplicable', undefined);
  
    return useMemo(() => {
      return !timestamp || timestamp.loading
        ? []
        : timestamp?.result?.[0];
    }, [timestamp])
}

export function useRewardRate(
    stakingRewardsContract: any,
  ): bigint {
  
    const rewardRate = useSingleCallResult(stakingRewardsContract, 'rewardRate', undefined);
  
    return useMemo(() => {
      return !rewardRate || rewardRate.loading
        ? []
        : rewardRate?.result?.[0];
    }, [rewardRate])
}

export function useBalanceOf(
    stakingRewardsContract: any,
    user: string
  ): bigint {

    const balanceOf = useSingleCallResult(stakingRewardsContract, 'balanceOf', [user]);

    return useMemo(() => {
      return !balanceOf || balanceOf.loading
        ? BigInt(0)
        : balanceOf?.result?.[0];
    }, [balanceOf])
}

export function useBalance(
  stakingRewardsContract: any,
  user: string
): bigint {

  const balanceOf = useSingleCallResult(stakingRewardsContract, 'totalVestedAccountBalance', [user]);

  return useMemo(() => {
    return !balanceOf || balanceOf.loading
      ? BigInt(0)
      : balanceOf?.result?.[0];
  }, [balanceOf])
}

export function useTotalSupply(
    stakingRewardsContract: any,
  ): bigint {
  
    const totalSupply = useSingleCallResult(stakingRewardsContract, 'totalSupply', undefined);
  
    return useMemo(() => {
      return !totalSupply || totalSupply.loading
        ? BigInt(0)
        : totalSupply?.result?.[0];
    }, [totalSupply])
}

export function useTotalVestedBalance(
  stakingRewardsContract: any,
): bigint {

  const totalSupply = useSingleCallResult(stakingRewardsContract, 'totalVestedBalance', undefined);

  return useMemo(() => {
    return !totalSupply || totalSupply.loading
      ? BigInt(0)
      : totalSupply?.result?.[0];
  }, [totalSupply])
}

export function useTradegenStakingRewardsEarned(
    stakingRewardsContract: any,
    user: string
  ): bigint {

    const earned = useSingleCallResult(stakingRewardsContract, 'earned', [user]);

    return useMemo(() => {
      return !earned || earned.loading
        ? BigInt(0)
        : earned?.result?.[0];
    }, [earned])
}

export function useTradegenStakingRewardsInfo(): StakingRewardsInfo {
  const stakingRewardsContract = useTradegenStakingRewardsContract(TRADEGEN_STAKING_REWARDS_ADDRESS);
  
  const rewardRate = useRewardRate(stakingRewardsContract);
  const TVL = useTradegenStakingRewardsTVL();

  return {
    rewardRate: (!rewardRate) ? BigInt(0) : BigInt(rewardRate),
    TVL: (!TVL) ? BigInt(0) : BigInt(TVL) / BigInt(1e18)
  }
}

export function useTradegenLPStakingRewardsInfo(): StakingRewardsInfo {
    const stakingRewardsContract = useTradegenLPStakingRewardsContract(TRADEGEN_LP_STAKING_REWARDS_ADDRESS);
    
    const rewardRate = useRewardRate(stakingRewardsContract);
    const TVL = useTradegenLPStakingRewardsTVL();
  
    return {
      rewardRate: (!rewardRate) ? BigInt(0) : BigInt(rewardRate),
      TVL: (!TVL) ? BigInt(0) : BigInt(TVL) / BigInt(1e18)
    }
  }

export function useTradegenStakingRewardsTVL(): bigint {
  const TGENContract = useTokenContract(TGEN);

  const balance = useBalanceOf(TGENContract, TRADEGEN_STAKING_REWARDS_ADDRESS);

  return balance ?? BigInt(0)
}

export function useTradegenLPStakingRewardsTVL(): bigint {
    const stakingRewardsContract = useTradegenLPStakingRewardsContract(TRADEGEN_LP_STAKING_REWARDS_ADDRESS);

    const balance = useSingleCallResult(stakingRewardsContract, 'totalVestedBalance', undefined);
  
    return useMemo(() => {
        return !balance || balance.loading
          ? []
          : balance?.result?.[0];
    }, [balance])
  }

export function useTokenAmountsFromPair(tokenA:string, tokenB:string, numberOfTokens:bigint): bigint[] {
    const baseUbeswapAdapterContract = useBaseUbeswapAdapterContract(BASE_UBESWAP_ADAPTER_ADDRESS);

    const amounts = useSingleCallResult(baseUbeswapAdapterContract, 'getTokenAmountsFromPair', [tokenA, tokenB, numberOfTokens.toString()]);
    console.log(amounts);
  
    return useMemo(() => {
        return !amounts || amounts.loading
          ? [BigInt(0), BigInt(0)]
          : [amounts?.result?.[0], amounts?.result?.[1]];
    }, [amounts])
}

export function usePriceOfLPToken(pair:string): bigint {
    const UbeswapLPTokenPriceAggregatorContract = useUbeswapLPTokenPriceAggregatorContract(UBESWAP_LP_TOKEN_PRICE_AGGREGATOR_ADDRESS);

    const price = useSingleCallResult(UbeswapLPTokenPriceAggregatorContract, 'getUSDPrice', [pair]);
    console.log(price);
  
    return useMemo(() => {
        return !price || price.loading
          ? BigInt(0)
          : price?.result?.[0];
    }, [price])
}

export function useUserTradegenStakingInfo(userAddress:string): bigint[] {
  const stakingRewardsContract = useTradegenStakingRewardsContract(TRADEGEN_STAKING_REWARDS_ADDRESS);

  const balance = useBalanceOf(stakingRewardsContract, userAddress);
  console.log(balance);

  const earned = useTradegenStakingRewardsEarned(stakingRewardsContract, userAddress);
  console.log(earned);

  const totalSupply = useTotalSupply(stakingRewardsContract);
  console.log(totalSupply);

  return useMemo(() => {
      return [balance, earned, totalSupply];
  }, [balance, earned, totalSupply])
}

export function useUserTradegenLPStakingInfo(userAddress:string): bigint[] {
  const stakingRewardsContract = useTradegenLPStakingRewardsContract(TRADEGEN_LP_STAKING_REWARDS_ADDRESS);

  const balance = useBalance(stakingRewardsContract, userAddress);
  console.log(balance);

  const earned = useTradegenStakingRewardsEarned(stakingRewardsContract, userAddress);
  console.log(earned);

  const totalSupply = useTotalVestedBalance(stakingRewardsContract);
  console.log(totalSupply);

  return useMemo(() => {
      return [balance, earned, totalSupply];
  }, [balance, earned, totalSupply])
}

export function useNextVestingEntry(
  user: string
): bigint[] {

  const stakingRewardsContract = useTradegenLPStakingRewardsContract(TRADEGEN_LP_STAKING_REWARDS_ADDRESS);
  const vestingEntry = useSingleCallResult(stakingRewardsContract, 'getNextVestingEntry', [user]);

  return useMemo(() => {
    return !vestingEntry || vestingEntry.loading
      ? [BigInt(0), BigInt(0), BigInt(0)]
      : vestingEntry?.result?.[0];
  }, [vestingEntry])
}