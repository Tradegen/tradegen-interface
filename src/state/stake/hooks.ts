import { ChainId, useContractKit } from '@celo-tools/use-contractkit'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId as UbeswapChainId, JSBI, Pair, Token, TokenAmount } from '@ubeswap/sdk'
import { POOL_MANAGER } from 'constants/poolManager'
import { UBE } from 'constants/tokens'
import { TGEN, POOL_MANAGER_ADDRESS } from '../../constants'
import { NETWORK_CHAIN_ID } from 'connectors'
import { PoolManager } from 'generated/'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { zip } from 'lodash'
// Hooks
import { useMemo } from 'react'
import useCUSDPrice from 'utils/useCUSDPrice'

import NFT_POOL_INTERFACE from '../../constants/abis/NFTpool'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
// Interfaces
import { usePoolManagerContract, useTokenContract } from '../../hooks/useContract'
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
import { DualRewardsInfo, useDualStakeRewards } from './useDualStakeRewards'

export const POOF_DUAL_POOL = '0x969D7653ddBAbb42589d73EfBC2051432332A940'
export const POOF_DUAL_LP = '0x573bcEBD09Ff805eD32df2cb1A968418DC74DCf7'

export const MOO_DUAL_POOL1 = '0x2f0ddEAa9DD2A0FB78d41e58AD35373d6A81EbB0'
export const MOO_LP1 = '0x27616d3DBa43f55279726c422daf644bc60128a8'
export const MOO_DUAL_POOL2 = '0x84Bb1795b699Bf7a798C0d63e9Aad4c96B0830f4'
export const MOO_LP2 = '0x69d5646e63C7cE63171F76EBA89348b52c1D552c'

export const STAKING_GENESIS = 1619100000

export interface StakingInfo {
  // the address of the reward contract
  readonly stakingRewardAddress: string
  // the token of the NFT pool
  readonly stakingToken: Token
  // the tokens involved in this pair
  readonly name: string
  // staked tokens by classs
  readonly stakedC1?: TokenAmount
  readonly stakedC2?: TokenAmount
  readonly stakedC3?: TokenAmount
  readonly stakedC4?: TokenAmount
  // the amount of token currently staked, or undefined if no account
  readonly stakedAmount?: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  readonly earnedAmount: TokenAmount
  readonly earnedAmountUbe: TokenAmount
  // the total amount of token staked in the contract
  readonly totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  readonly totalRewardRate: TokenAmount
  readonly ubeRewardRate: TokenAmount
  readonly totalUBERewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  readonly rewardRate: TokenAmount
  // when the period ends
  readonly periodFinish: Date | undefined
  // if pool is active
  readonly active: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
  readonly getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
  readonly nextPeriodRewards: TokenAmount
  readonly poolInfo: IRawPool
  readonly dollarRewardPerYear: TokenAmount | undefined
  readonly rewardToken: Token | undefined
  readonly dualRewards: boolean
  readonly tokenPrice?: BigInt
}

export const usePairStakingInfo = (poolNameToFilterBy?: string | null, stakingAddress?: string): StakingInfo | undefined => {
  return useStakingInfo(poolNameToFilterBy, stakingAddress)[0] ?? undefined
}

export const usePairDualStakingInfo = (stakingInfo: StakingInfo | undefined): DualRewardsInfo | null => {
  const { address } = useContractKit()
  let dualStakeAddress = ''
  if (stakingInfo?.poolInfo.stakingToken === POOF_DUAL_LP) {
    dualStakeAddress = POOF_DUAL_POOL
  } else if (stakingInfo?.poolInfo.stakingToken == MOO_LP1) {
    dualStakeAddress = MOO_DUAL_POOL1
  } else if (stakingInfo?.poolInfo.stakingToken == MOO_LP2) {
    dualStakeAddress = MOO_DUAL_POOL2
  }
  return useDualStakeRewards(dualStakeAddress, stakingInfo, address)
}

interface UnclaimedInfo {
  /**
   * Total tokens left in the contract
   */
  balanceRemaining: BigNumber | null
  /**
   * Earned but unclaimed tokens
   */
  earned: BigNumber | null
  /**
   * Tokens not in the circulating supply
   */
  noncirculatingSupply: BigNumber | null
}

export const useUnclaimedStakingRewards = (): UnclaimedInfo => {
  const { network } = useContractKit()
  const { chainId } = network
  const tgen = new Token(NETWORK_CHAIN_ID, TGEN, 18);
  const tgenPrice = useCUSDPrice(tgen)
  const tgenContract = useTokenContract(tgen?.address)
  const poolManagerContract = usePoolManagerContract(
    POOL_MANAGER_ADDRESS
  )
  const poolsCountBigNumber = useSingleCallResult(poolManagerContract, 'poolsCount').result?.[0] as
    | BigNumber
    | undefined
  const poolsCount = poolsCountBigNumber?.toNumber() ?? 0
  const poolAddresses = useStakingPoolAddresses(poolManagerContract, poolsCount)

  // compute amount that is locked up
  const balancesRaw = useSingleContractMultipleData(
    tgenContract,
    'balanceOf',
    poolAddresses.map((addr) => [addr])
  )
  const balances = balancesRaw.find((b) => !b.result)
    ? null
    : (balancesRaw.map((b) => b.result?.[0] ?? BigNumber.from(0)) as readonly BigNumber[])
  const balanceRemaining = balances?.reduce((sum, b) => b.add(sum), BigNumber.from(0)) ?? null

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )

  const periodFinishes = useMultipleContractSingleData(
    poolAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  const now = useCurrentBlockTimestamp()
  const amounts = now
    ? zip(rewardRates, periodFinishes).map(([rate, finish]): BigNumber => {
        const rawRate = rate?.result?.[0] as BigNumber | undefined
        const finishTime = finish?.result?.[0] as BigNumber | undefined
        if (rawRate && finishTime && finishTime.gt(now)) {
          return rawRate.mul(finishTime.sub(now).toNumber())
        }
        return BigNumber.from(0)
      })
    : undefined
  const earned =
    rewardRates?.[0]?.loading || !amounts ? null : amounts.reduce((sum, amt) => sum.add(amt), BigNumber.from(0))

  return {
    balanceRemaining,
    earned,
    noncirculatingSupply: balanceRemaining && earned ? balanceRemaining.sub(earned) : null,
  }
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(poolNameToFilterBy?: string | null, stakingAddress?: string): readonly StakingInfo[] {
  const { network, address } = useContractKit()
  const chainId = network.chainId as unknown as UbeswapChainId
  const tgen = new Token(NETWORK_CHAIN_ID, TGEN, 18);
  const tgenPrice = useCUSDPrice(tgen)

  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useStakingPools(poolNameToFilterBy, stakingAddress)

  // These are the staking pools
  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const stakingTokenAddresses = useMemo(() => info.map(({ poolInfo }) => poolInfo.stakingToken), [info])

  const accountArg = useMemo(() => [address ?? undefined], [address])
  const C1Arg = useMemo(() => [address ?? undefined, 1], [address]);
  const C2Arg = useMemo(() => [address ?? undefined, 2], [address]);
  const C3Arg = useMemo(() => [address ?? undefined, 3], [address]);
  const C4Arg = useMemo(() => [address ?? undefined, 4], [address]);

  // get all the info from the staking rewards contracts
  const balanceC1 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', C1Arg)
  const balanceC2 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', C2Arg)
  const balanceC3 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', C3Arg)
  const balanceC4 = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', C4Arg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )

  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  const prices = useMultipleContractSingleData(
    stakingTokenAddresses,
    NFT_POOL_INTERFACE,
    'tokenPrice',
    undefined,
    NEVER_RELOAD
  )?.map((element:any) => (element?.result ? element?.result[0] : BigInt(0)));

  return useMemo(() => {
    if (!chainId || !tgen) return []

    return info.reduce(
      (memo: StakingInfo[], { stakingRewardAddress: rewardsAddress, poolInfo, name }, index: number) => {
        // these two are dependent on account
        const balanceC1State = balanceC1[index]
        const balanceC2State = balanceC2[index]
        const balanceC3State = balanceC3[index]
        const balanceC4State = balanceC4[index]
        const earnedAmountState = earnedAmounts[index]
        const priceState = prices[index]

        // these get fetched regardless of account
        const totalSupplyState = totalSupplies[index]
        const rewardRateState = rewardRates[index]
        const periodFinishState = periodFinishes[index]

        if (
          // these may be undefined if not logged in
          !balanceC1State?.loading &&
          !balanceC2State?.loading &&
          !balanceC3State?.loading &&
          !balanceC4State?.loading &&
          !earnedAmountState?.loading &&
          !priceState?.loading &&
          // always need these
          totalSupplyState &&
          !totalSupplyState.loading &&
          rewardRateState &&
          !rewardRateState.loading &&
          periodFinishState &&
          !periodFinishState.loading
        ) {
          if (
            balanceC1State?.error ||
            balanceC2State?.error ||
            balanceC3State?.error ||
            balanceC4State?.error ||
            earnedAmountState?.error ||
            priceState?.error ||
            totalSupplyState.error ||
            rewardRateState.error ||
            periodFinishState.error
          ) {
            console.error('Failed to load staking rewards info')
            return memo
          }

          const rewardToken = poolInfo.rewardToken
            ? new Token(chainId, poolInfo.rewardToken, 18, poolInfo.rewardTokenSymbol)
            : tgen

          // get the pool token
          const poolToken = new Token(chainId, poolInfo.stakingToken, 0, 'TOK', 'NFT Pool Token')

          const rawC1 = balanceC1State?.result?.[0] ?? 0;
          const rawC2 = balanceC1State?.result?.[0] ?? 0;
          const rawC3 = balanceC1State?.result?.[0] ?? 0;
          const rawC4 = balanceC1State?.result?.[0] ?? 0;

          const rawStakedAmount = BigInt(rawC1) + BigInt(rawC2) + BigInt(rawC3) + BigInt(rawC4);

          const price = priceState?.result?.[0] ?? BigInt(0);

          // check for account, if no account set to 0
          const stakedAmount = new TokenAmount(poolToken, BigInt(rawStakedAmount))
          const balanceC1 = new TokenAmount(poolToken, BigInt(rawC1))
          const balanceC2 = new TokenAmount(poolToken, BigInt(rawC2))
          const balanceC3 = new TokenAmount(poolToken, BigInt(rawC3))
          const balanceC4 = new TokenAmount(poolToken, BigInt(rawC4))
          const totalStakedAmount = new TokenAmount(poolToken, JSBI.BigInt(totalSupplyState.result?.[0]))
          const totalRewardRate = new TokenAmount(rewardToken, JSBI.BigInt(rewardRateState.result?.[0]))
          const nextPeriodRewards = new TokenAmount(tgen, poolInfo.nextPeriodRewards?.toString() ?? '0')

          // tokens per month
          const ubePerYear =
            rewardToken === tgen
              ? new TokenAmount(tgen, JSBI.multiply(totalRewardRate.raw, JSBI.BigInt(365 * 24 * 60 * 60)))
              : new TokenAmount(tgen, '0')
          const dollarRewardPerYear = tgenPrice?.quote(ubePerYear)

          const getHypotheticalRewardRate = (
            stakedAmount: TokenAmount,
            totalStakedAmount: TokenAmount,
            totalRewardRate: TokenAmount
          ): TokenAmount => {
            return new TokenAmount(
              rewardToken,
              JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
                ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
                : JSBI.BigInt(0)
            )
          }

          const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

          const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber()
          const periodFinishMs = periodFinishSeconds * 1000

          // compare period end timestamp vs current block timestamp (in seconds)
          const active =
            periodFinishSeconds && currentBlockTimestamp
              ? periodFinishSeconds > currentBlockTimestamp.toNumber()
              : false

          if (!name) {
            return memo
          }

          memo.push({
            stakingRewardAddress: rewardsAddress,
            stakingToken: totalStakedAmount.token,
            name,
            stakedC1: balanceC1,
            stakedC2: balanceC2,
            stakedC3: balanceC3,
            stakedC4: balanceC4,
            periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
            earnedAmount: new TokenAmount(rewardToken, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
            earnedAmountUbe: new TokenAmount(rewardToken, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
            rewardRate: individualRewardRate,
            ubeRewardRate: individualRewardRate,
            totalRewardRate: totalRewardRate,
            totalUBERewardRate: totalRewardRate,
            nextPeriodRewards,
            stakedAmount: stakedAmount,
            totalStakedAmount: totalStakedAmount,
            getHypotheticalRewardRate,
            active,
            poolInfo,
            dollarRewardPerYear,
            rewardToken,
            dualRewards: false,
            tokenPrice: price
          })
        }
        return memo
      },
      []
    )
  }, [
    balanceC1,
    balanceC2,
    balanceC3,
    balanceC4,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    totalSupplies,
    tgen,
    tgenPrice,
  ])
}

interface IStakingPool {
  stakingRewardAddress: string
  name?: string
  poolInfo: IRawPool
}

export function useStakingPools(nameToFilterBy?: string | null, stakingAddress?: string): readonly IStakingPool[] {
  const tgen = new Token(NETWORK_CHAIN_ID, TGEN, 18);

  const poolManagerContract = usePoolManagerContract(
    POOL_MANAGER_ADDRESS
  )
  const poolsCountBigNumber = useSingleCallResult(poolManagerContract, 'poolsCount').result?.[0] as
    | BigNumber
    | undefined
  const poolsCount = poolsCountBigNumber?.toNumber() ?? 0

  const poolAddresses = useStakingPoolAddresses(poolManagerContract, poolsCount)
  const pools = useStakingPoolsInfo(poolManagerContract, poolAddresses)

  const stakingTokens = pools.map((p) => p?.stakingToken as string)
  const poolNames = useStakingPoolNamesFromAddresses(stakingTokens)

  return useMemo(() => {
    if (!tgen || !pools || !poolNames) return []

    return (
      pools
        .reduce((memo: IStakingPool[], poolInfo:IRawPool, index) => {
          return [
            ...memo,
            {
              stakingRewardAddress: poolInfo.poolAddress,
              name: poolNames[index],
              poolInfo,
            },
          ]
        }, [])
        .filter((stakingRewardInfo:any) => {
          if (nameToFilterBy === undefined) {
            return true
          }
          if (nameToFilterBy === null) {
            return false
          }
          if (stakingAddress) {
            return stakingAddress.toLowerCase() === stakingRewardInfo.stakingRewardAddress.toLowerCase()
          }
          return (
            stakingRewardInfo.name &&
            stakingRewardInfo.name.includes(nameToFilterBy)
          )
        }) ?? []
    )
  }, [tgen, pools, poolNames, nameToFilterBy, stakingAddress])
}

export function useStakingPoolAddresses(
  poolManagerContract: PoolManager | null,
  poolsCount: number
): readonly string[] {
  // Get rewards pools addresses
  const inputs = [...Array(poolsCount).keys()].map((i) => [i])
  const poolAddresses = useSingleContractMultipleData(poolManagerContract, 'poolsByIndex', inputs)

  return useMemo(() => {
    return !poolAddresses.length || !poolAddresses[0] || poolAddresses[0].loading
      ? []
      : poolAddresses.map((p) => p?.result?.[0]).filter((x): x is string => !!x)
  }, [poolAddresses])
}

interface IRawPool {
  index: number
  stakingToken: string
  poolAddress: string
  weight: number
  rewardToken?: string
  rewardTokenSymbol?: string
  nextPeriod?: number
  nextPeriodRewards?: BigNumber | null
}

export function useStakingPoolsInfo(
  poolManagerContract: PoolManager | null,
  poolAddresses: readonly string[]
): readonly IRawPool[] {
  const pools = useSingleContractMultipleData(
    poolManagerContract,
    'pools',
    poolAddresses.map((addr) => [addr])
  )

  const rawPools = useMemo(() => {
    return !pools || !pools[0] || pools[0].loading
      ? []
      : pools.map((p) => p?.result as unknown as IRawPool | undefined).filter((x): x is IRawPool => !!x)
  }, [pools])

  const nextPeriod = useSingleCallResult(poolManagerContract, 'nextPeriod')
  const poolRewards = useSingleContractMultipleData(
    poolManagerContract,
    'computeAmountForPool',
    rawPools.map((p) => [p.stakingToken, nextPeriod?.result?.[0]])
  )
  return rawPools.map((pool, i) => ({
    ...pool,
    nextPeriodRewards: poolRewards?.[i]?.result?.[0] ?? null,
  }))
}

export function useStakingPoolNamesFromAddresses(
  poolAddresses: readonly string[]
): readonly (string | undefined)[] {

  const names = useMultipleContractSingleData(
    poolAddresses,
    NFT_POOL_INTERFACE,
    'name',
    undefined,
    NEVER_RELOAD
  )?.map((element:any) => (element?.result ? element?.result[0] : ""));

  return names;
}

export function useTotalUbeEarned(): TokenAmount | undefined {
  const tgen = new Token(NETWORK_CHAIN_ID, TGEN, 18);
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!tgen) return undefined
    return (
      stakingInfos
        ?.filter((stakingInfo) => stakingInfo.rewardToken == tgen)
        .reduce((accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount), new TokenAmount(tgen, '0')) ??
      new TokenAmount(tgen, '0')
    )
  }, [stakingInfos, tgen])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: TokenAmount
  error?: string
} {
  const { address } = useContractKit()

  const parsedInput: TokenAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!address) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error,
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: TokenAmount
  error?: string
} {
  const { address } = useContractKit()

  const parsedInput: TokenAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!address) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error,
  }
}
