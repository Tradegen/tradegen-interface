import { useMemo } from 'react'
import { useTokenContract, useTradegenStakingRewardsContract, useTradegenLPStakingRewardsContract } from '../../hooks/useContract'
import { useSingleCallResult, NEVER_RELOAD } from '../../state/multicall/hooks'
import { TRADEGEN_LP_STAKING_ESCROW_ADDRESS, TRADEGEN_LP_STAKING_REWARDS_ADDRESS, TRADEGEN_STAKING_ESCROW_ADDRESS, TRADEGEN_STAKING_REWARDS_ADDRESS, TGEN } from '../../constants/index'

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
        ? []
        : balanceOf?.result?.[0];
    }, [balanceOf])
}

export function useTotalSupply(
    stakingRewardsContract: any,
  ): bigint {
  
    const totalSupply = useSingleCallResult(stakingRewardsContract, 'totalSupply', undefined);
  
    return useMemo(() => {
      return !totalSupply || totalSupply.loading
        ? []
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
        ? []
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

export function useTradegenStakingRewardsTVL(): bigint {
  const TGENContract = useTokenContract(TGEN);

  const balance = useBalanceOf(TGENContract, TRADEGEN_STAKING_REWARDS_ADDRESS);

  return balance ?? BigInt(0)
}