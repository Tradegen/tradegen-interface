import { useMemo } from 'react'
import { usePoolContract, useTokenContract } from '../../hooks/useContract'
import { useSingleCallResult, NEVER_RELOAD, useMultipleContractSingleData } from '../../state/multicall/hooks'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ZERO_ADDRESS } from '../../constants'

export interface PoolInfo {
  TVL: bigint | null,
  address: string,
  name: string | null,
  tokenPrice: bigint | null,
  totalReturn: string,
  manager: string,
  performanceFee: number,
  positionAddresses: string[],
  positionBalances: bigint[],
  positionNames: string[]
}

export interface UserInvestmentInfo {
  userBalance: bigint,
  userUSDBalance: bigint,
  manager: string
}

export interface PositionsAndTotal {
    positions: string[],
    balances: bigint[],
    total: bigint
}

export function useTokenPrice(
    poolContract: any,
  ): bigint {
  
    const tokenPrice = useSingleCallResult(poolContract, 'tokenPrice', undefined);
  
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
  
    const name = useSingleCallResult(poolContract, 'name', undefined);
  
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
  
    const totalSupply = useSingleCallResult(poolContract, 'totalSupply', undefined);
  
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

  let positions = (!positionsAndTotal || positionsAndTotal[0] === undefined) ? [] : positionsAndTotal[0];
  const names = usePositionNames(positions);

  let totalReturn = "0%";
  if (!tokenPrice)
  {
    totalReturn = "0%";
  }
  else
  {
    if (BigInt(tokenPrice) >= BigInt(1e18))
    {
      totalReturn = formatPercent(formatBalance((BigInt(tokenPrice) - BigInt(1e18)) * BigInt(100)));
    }
    else
    {
      totalReturn = "-" + formatPercent(formatBalance((BigInt(1e18) - BigInt(tokenPrice)) * BigInt(100)));
    }
  }

  return {
    TVL: (!positionsAndTotal || positionsAndTotal[2] === undefined) ? BigInt(0) : BigInt(positionsAndTotal[2]) / BigInt(1e16),
    address: poolAddress,
    name: name ?? "",
    tokenPrice: (!tokenPrice) ? BigInt(0) : BigInt(tokenPrice) / BigInt(1e16),
    totalReturn: totalReturn,
    manager: manager ?? "",
    performanceFee: (!performanceFee) ? 0 : Number(performanceFee),
    positionAddresses: (!positionsAndTotal || positionsAndTotal[0] === undefined) ? [] : positionsAndTotal[0],
    positionBalances: (!positionsAndTotal || positionsAndTotal[1] === undefined) ? [] : positionsAndTotal[1],
    positionNames: names
  }
}

export function useUserInvestmentInfo(poolAddress:string): UserInvestmentInfo {
  let { network, account } = useContractKit();
  const { chainId } = network
  console.log(account);
  account = account ?? ZERO_ADDRESS;

  const poolContract = usePoolContract(poolAddress);

  const userTokenBalance = useBalanceOf(poolContract, account);
  const userUSDBalance = useUSDBalance(poolContract, account);
  const manager = useManager(poolContract);

  return {
    userBalance: (!userTokenBalance) ? BigInt(0) : BigInt(userTokenBalance),
    userUSDBalance: (!userUSDBalance) ? BigInt(0) : BigInt(userUSDBalance),
    manager: manager ?? ""
  }
}

export function useStableCoinBalance(cUSD:string, userAddress:string): bigint {
  const cUSDContract = useTokenContract(cUSD);

  const balance = useBalanceOf(cUSDContract, userAddress);

  return balance ?? BigInt(0)
}

export function usePositionNames(positions:string[]): string[] {
  const names = useMultipleContractSingleData(positions, ERC20_INTERFACE, 'symbol')?.map((element:any) => (element?.result ? element?.result[0] : null));

  return names ?? [];
}