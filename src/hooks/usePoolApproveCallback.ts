import { useContractKit, useGetConnectedSigner } from '@celo-tools/use-contractkit'
import { MaxUint256 } from '@ethersproject/constants'
import { TokenAmount, Trade } from '@ubeswap/sdk'
import { useDoTransaction } from 'components/swap/routing'
import { MoolaRouterTrade } from 'components/swap/routing/hooks/useTrade'
import { MoolaDirectTrade } from 'components/swap/routing/moola/MoolaDirectTrade'
import { useMoolaConfig } from 'components/swap/routing/moola/useMoola'
import { useCallback, useMemo } from 'react'
import { useUserMinApprove } from 'state/user/hooks'

import { ROUTER_ADDRESS, UBESWAP_MOOLA_ROUTER_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { Field } from '../state/swap/actions'
import { useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { useTokenContract, usePoolContract, useNFTPoolContract } from './useContract'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function usePoolApproveCallback(
  amountToApprove?: TokenAmount,
  poolAddress?: string,
  data?: string,
  isNFTPool?: boolean
): [ApprovalState, () => Promise<void>] {
  const getConnectedSigner = useGetConnectedSigner()

  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, poolAddress ?? undefined, ROUTER_ADDRESS)
  const pendingApproval = useHasPendingApproval(token?.address, ROUTER_ADDRESS)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove) return ApprovalState.UNKNOWN
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, ROUTER_ADDRESS])

  const poolContract = usePoolContract(poolAddress)
  const NFTPoolContract = useNFTPoolContract(poolAddress)
  const doTransaction = useDoTransaction()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!poolContract && !isNFTPool) {
      console.error('poolContract is null')
      return
    }

    if (!NFTPoolContract && isNFTPool) {
      console.error('NFTPoolContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!ROUTER_ADDRESS) {
      console.error('no spender')
      return
    }

    if (!isNFTPool)
    {
      await doTransaction(poolContract, 'executeTransaction', {
        args: [token?.address, data],
        summary: `Approve ${amountToApprove.toSignificant(6)} ${amountToApprove.currency.symbol}`,
        approval: { tokenAddress: token.address, spender: ROUTER_ADDRESS },
      })
    }
    else
    {
      await doTransaction(NFTPoolContract, 'executeTransaction', {
        args: [token?.address, data],
        summary: `Approve ${amountToApprove.toSignificant(6)} ${amountToApprove.currency.symbol}`,
        approval: { tokenAddress: token.address, spender: ROUTER_ADDRESS },
    })
    }
    
  }, [
    approvalState,
    token,
    poolContract,
    amountToApprove,
    ROUTER_ADDRESS,
    getConnectedSigner,
    doTransaction,
  ])

  return [approvalState, approve]
}
