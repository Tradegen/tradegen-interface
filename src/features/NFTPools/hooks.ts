import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'
import { useNFTPoolContract, useTokenContract } from '../../hooks/useContract'
import { useSingleCallResult, NEVER_RELOAD } from '../../state/multicall/hooks'
import { useContractKit, useProvider } from '@celo-tools/use-contractkit'

export interface NFTPoolInfo {
  TVL: bigint | null,
  address: string,
  name: string | null,
  tokenPrice: bigint | null,
  totalReturn: bigint,
  manager: string,
  maxSupply: bigint | null,
  seedPrice: bigint | null,
  positionAddresses: string[],
  positionBalances: bigint[],
  tokenBalancesPerClass: bigint[]
}

export interface UserInvestmentInfo {
    userBalances: bigint[],
    userUSDBalance: bigint
}

export interface PositionsAndTotal {
    positions: string[],
    balances: bigint[],
    total: bigint
}

export function useTokenPrice(
    NFTPoolContract: any,
  ): bigint {
  
    const tokenPrice = useSingleCallResult(NFTPoolContract, 'tokenPrice', undefined);
  
    return useMemo(() => {
      return !tokenPrice || tokenPrice.loading
        ? []
        : tokenPrice?.result?.[0];
    }, [tokenPrice])
}

export function useAvailableTokensPerClass(
    NFTPoolContract: any,
  ): bigint[] {

    const balances = useSingleCallResult(NFTPoolContract, 'getAvailableTokensPerClass', undefined);
  
    return useMemo(() => {
      return !balances || balances.loading
        ? []
        : [balances?.result?.[0], balances?.result?.[1], balances?.result?.[2], balances?.result?.[3]];
    }, [balances])
}

export function useUserBalance(
    NFTPoolContract: any,
    user: string
  ): bigint[] {

    if (user == "")
    {
        return [BigInt(0), BigInt(0), BigInt(0), BigInt(0)];
    }
  
    const balances = useSingleCallResult(NFTPoolContract, 'getTokenBalancePerClass', [user], NEVER_RELOAD);
  
    return useMemo(() => {
      return !balances || balances.loading
        ? []
        : [balances?.result?.[0], balances?.result?.[1], balances?.result?.[2], balances?.result?.[3]];
    }, [balances])
}

export function useOwnerBalance(
    NFTPoolContract: any,
    user: string
  ): bigint {

    if (user == "")
    {
        return BigInt(0);
    }
  
    const balance = useSingleCallResult(NFTPoolContract, 'balance', [user], NEVER_RELOAD);
  
    return useMemo(() => {
      return !balance || balance.loading
        ? []
        : balance?.result?.[0];
    }, [balance])
}

export function useName(
    NFTPoolContract: any,
  ): string {
  
    const name = useSingleCallResult(NFTPoolContract, 'name', undefined);
  
    return useMemo(() => {
      return !name || name.loading
        ? []
        : name?.result?.[0];
    }, [name])
}

export function useManager(
    NFTPoolContract: any,
  ): string {
  
    const manager = useSingleCallResult(NFTPoolContract, 'manager', undefined);
  
    return useMemo(() => {
      return !manager || manager.loading
        ? []
        : manager?.result?.[0];
    }, [manager])
}

export function useUSDBalance(
    NFTPoolContract: any,
    user: string
  ): bigint {

    if (user == "")
    {
        return BigInt(0);
    }
  
    const balanceOf = useSingleCallResult(NFTPoolContract, 'getUSDBalance', [user], NEVER_RELOAD);
  
    return useMemo(() => {
      return !balanceOf || balanceOf.loading
        ? []
        : balanceOf?.result?.[0];
    }, [balanceOf])
}

export function useTotalSupply(
    NFTPoolContract: any,
  ): bigint {
  
    const totalSupply = useSingleCallResult(NFTPoolContract, 'totalSupply', undefined);
  
    return useMemo(() => {
      return !totalSupply || totalSupply.loading
        ? []
        : totalSupply?.result?.[0];
    }, [totalSupply])
}

export function useMaxSupply(
    NFTPoolContract: any,
  ): bigint {
  
    const maxSupply = useSingleCallResult(NFTPoolContract, 'maxSupply', undefined);
  
    return useMemo(() => {
      return !maxSupply || maxSupply.loading
        ? []
        : maxSupply?.result?.[0];
    }, [maxSupply])
}

export function useSeedPrice(
    NFTPoolContract: any,
  ): bigint {
  
    const price = useSingleCallResult(NFTPoolContract, 'seedPrice', undefined);
  
    return useMemo(() => {
      return !price || price.loading
        ? []
        : price?.result?.[0];
    }, [price])
}

export function usePositionsAndTotal(
    NFTpoolContract: any,
  ): any[] {
  
    const data = useSingleCallResult(NFTpoolContract, 'getPositionsAndTotal', undefined, NEVER_RELOAD);
  
    return useMemo(() => {
      return !data || data.loading
        ? []
        : data?.result?.[0];
    }, [data])
}

export function useNFTPoolInfo(NFTPoolAddress:string): NFTPoolInfo {
  const NFTPoolContract = useNFTPoolContract(NFTPoolAddress);
  
  const tokenPrice = useTokenPrice(NFTPoolContract);
  const name = useName(NFTPoolContract);
  const maxSupply = useMaxSupply(NFTPoolContract);
  const seedPrice = useSeedPrice(NFTPoolContract);
  const manager = useManager(NFTPoolContract);
  const positionsAndTotal = usePositionsAndTotal(NFTPoolContract);
  const tokenBalancesPerClass = useAvailableTokensPerClass(NFTPoolContract);

  return {
    TVL: (!positionsAndTotal || positionsAndTotal[2] === undefined) ? BigInt(0) : BigInt(positionsAndTotal[2]) / BigInt(1e18),
    address: NFTPoolAddress,
    name: name,
    tokenPrice: (!tokenPrice) ? BigInt(0) : BigInt(tokenPrice) / BigInt(1e18),
    totalReturn: (!tokenPrice || BigInt(tokenPrice) == BigInt(0)) ? BigInt(0) : (BigInt(tokenPrice) - BigInt(seedPrice)) * BigInt(100) / BigInt(seedPrice),
    manager: manager,
    maxSupply: (!maxSupply) ? BigInt(0) : BigInt(maxSupply),
    seedPrice: (!seedPrice) ? BigInt(0) : BigInt(seedPrice) / BigInt(1e18),
    positionAddresses: (!positionsAndTotal || positionsAndTotal[0] === undefined) ? [] : positionsAndTotal[0],
    positionBalances: (!positionsAndTotal || positionsAndTotal[1] === undefined) ? [] : positionsAndTotal[1],
    tokenBalancesPerClass: (!tokenBalancesPerClass) ? [BigInt(0), BigInt(0), BigInt(0), BigInt(0)] : tokenBalancesPerClass
  }
}

export function useUserInvestmentInfo(NFTPoolAddress:string, userAddress:string): UserInvestmentInfo {
    const NFTPoolContract = useNFTPoolContract(NFTPoolAddress);
  
    const userTokenBalance = useUserBalance(NFTPoolContract, userAddress);
    const userUSDBalance = useUSDBalance(NFTPoolContract, userAddress);
  
    return {
        userBalances: (!userTokenBalance) ? [BigInt(0), BigInt(0), BigInt(0), BigInt(0)] : userTokenBalance,
        userUSDBalance: (!userUSDBalance) ? BigInt(0) : BigInt(userUSDBalance)
    }
}

export function useTotalBalance(NFTPoolAddress:string, userAddress:string): bigint {
  const NFTPoolContract = useNFTPoolContract(NFTPoolAddress);

  const balance = useOwnerBalance(NFTPoolContract, userAddress);

  return balance ?? BigInt(0)
}