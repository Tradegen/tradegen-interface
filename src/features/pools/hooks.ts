import { useMemo } from 'react'
import { usePoolContract, useTokenContract } from '../../hooks/useContract'
import { useSingleCallResult, NEVER_RELOAD } from '../../state/multicall/hooks'

export interface PoolInfo {
  TVL: bigint | null,
  address: string,
  name: string | null,
  tokenPrice: bigint | null,
  totalReturn: bigint,
  manager: string,
  performanceFee: number,
  positionAddresses: string[],
  positionBalances: bigint[]
}

export interface UserInvestmentInfo {
  userBalance: bigint,
  userUSDBalance: bigint
}

export interface PositionsAndTotal {
    positions: string[],
    balances: bigint[],
    total: bigint
}

export function useTokenPrice(
    poolContract: any,
  ): bigint {
  
    const tokenPrice = useSingleCallResult(poolContract, 'tokenPrice', undefined, NEVER_RELOAD);
  
    return useMemo(() => {
      return !tokenPrice || tokenPrice.loading
        ? []
        : tokenPrice?.result?.[0];
    }, [tokenPrice])
}

export function useBalanceOf(
    poolContract: any,
    user: string
  ): bigint {

    const balanceOf = useSingleCallResult(poolContract, 'balanceOf', [user]);

    return useMemo(() => {
      return !balanceOf || balanceOf.loading
        ? []
        : balanceOf?.result?.[0];
    }, [balanceOf])
}

export function useName(
    poolContract: any,
  ): string {
  
    const name = useSingleCallResult(poolContract, 'name', undefined, NEVER_RELOAD);
  
    return useMemo(() => {
      return !name || name.loading
        ? []
        : name?.result?.[0];
    }, [name])
}

export function useManager(
    poolContract: any,
  ): string {
  
    const manager = useSingleCallResult(poolContract, 'getManagerAddress', undefined);
  
    return useMemo(() => {
      return !manager || manager.loading
        ? []
        : manager?.result?.[0];
    }, [manager])
}

export function useUSDBalance(
    poolContract: any,
    user: string
  ): bigint {
  
    const balanceOf = useSingleCallResult(poolContract, 'getUSDBalance', [user]);
  
    return useMemo(() => {
      return !balanceOf || balanceOf.loading
        ? []
        : balanceOf?.result?.[0];
    }, [balanceOf])
}

export function useTotalSupply(
    poolContract: any,
  ): bigint {
  
    const totalSupply = useSingleCallResult(poolContract, 'totalSupply', undefined, NEVER_RELOAD);
  
    return useMemo(() => {
      return !totalSupply || totalSupply.loading
        ? []
        : totalSupply?.result?.[0];
    }, [totalSupply])
}

export function usePerformanceFee(
    poolContract: any,
  ): bigint {
  
    const fee = useSingleCallResult(poolContract, 'getPerformanceFee', undefined);
  
    return useMemo(() => {
      return !fee || fee.loading
        ? []
        : fee?.result?.[0];
    }, [fee])
}

export function usePositionsAndTotal(
    poolContract: any,
  ): any[] {
  
    const data = useSingleCallResult(poolContract, 'getPositionsAndTotal', undefined);

    console.log(data);
  
    return useMemo(() => {
      return !data || data.loading
        ? []
        : [data?.result?.[0], data?.result?.[1], data?.result?.[2]];
    }, [data])
}

export function usePoolInfo(poolAddress:string): PoolInfo {
  const poolContract = usePoolContract(poolAddress);
  
  const tokenPrice = useTokenPrice(poolContract);
  const name = useName(poolContract);
  const performanceFee = usePerformanceFee(poolContract);
  const manager = useManager(poolContract);
  const positionsAndTotal = usePositionsAndTotal(poolContract);

  return {
    TVL: (!positionsAndTotal || positionsAndTotal[2] === undefined) ? BigInt(0) : BigInt(positionsAndTotal[2]) / BigInt(1e16),
    address: poolAddress,
    name: name,
    tokenPrice: (!tokenPrice) ? BigInt(0) : BigInt(tokenPrice) / BigInt(1e16),
    totalReturn: (!tokenPrice || BigInt(tokenPrice) == BigInt(0)) ? BigInt(0) : (BigInt(tokenPrice) - BigInt(1e18)) * BigInt(100) / BigInt(1e18),
    manager: manager,
    performanceFee: (!performanceFee) ? 0 : Number(performanceFee),
    positionAddresses: (!positionsAndTotal || positionsAndTotal[0] === undefined) ? [] : positionsAndTotal[0],
    positionBalances: (!positionsAndTotal || positionsAndTotal[1] === undefined) ? [] : positionsAndTotal[1]
  }
}

export function useUserInvestmentInfo(poolAddress:string, userAddress:string): UserInvestmentInfo {
  const poolContract = usePoolContract(poolAddress);

  const userTokenBalance = useBalanceOf(poolContract, userAddress);
  const userUSDBalance = useUSDBalance(poolContract, userAddress);

  return {
    userBalance: (!userTokenBalance) ? BigInt(0) : BigInt(userTokenBalance),
    userUSDBalance: (!userUSDBalance) ? BigInt(0) : BigInt(userUSDBalance)
  }
}

export function useStableCoinBalance(cUSD:string, userAddress:string): bigint {
  const cUSDContract = useTokenContract(cUSD);

  const balance = useBalanceOf(cUSDContract, userAddress);

  return balance ?? BigInt(0)
}