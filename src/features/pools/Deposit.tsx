import { useProvider, useContractKit } from '@celo-tools/use-contractkit'
import { TokenAmount } from '@ubeswap/sdk'
import Loader from 'components/Loader'
import { useDoTransaction } from 'components/swap/routing'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { usePoolContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { ButtonConfirmed, ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import ProgressCircles from 'components/ProgressSteps'
import { AutoRow, RowBetween } from 'components/Row'
import { mcUSD } from '../../constants/tokens'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const Wrapper = styled.div`
  width: 400px;
  background-color: white;
  color: black;
  border: 2px solid #E6E9EC;
  border-radius: 12px;
`

interface DepositProps {
  isOpen: boolean
  onDismiss: () => void
  poolAddress: string
  mcUSDBalance: string
}

export default function Deposit({ isOpen, onDismiss, poolAddress, mcUSDBalance }: DepositProps) {
  const library = useProvider()
  const { address: account, network } = useContractKit()
  const { chainId } = network

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, mcUSD[chainId], new TokenAmount(mcUSD[chainId], mcUSDBalance))

  // state for pending and submitted txn views
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [approval, approveCallback] = useApproveCallback(parsedAmount, poolAddress)

  const poolContract = usePoolContract(poolAddress)
  const doTransaction = useDoTransaction()

  async function onStake() {
    setAttempting(true)
    if (poolContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const response = await doTransaction(poolContract, 'deposit', {
          args: [`0x${parsedAmount.raw.toString(16)}`],
          summary: `Deposited into pool`,
        })
        setHash(response.hash)
      } else {
        setAttempting(false)
        throw new Error('Attempting to deposit without approval or a signature. Please contact support.')
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(new TokenAmount(mcUSD[chainId], mcUSDBalance))
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!poolAddress || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing cUSD amount')

    approveCallback()
  }

  return (
      <Wrapper>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Deposit</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={mcUSD[chainId]}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={'Available to deposit: '}
            id="deposit"
          />

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={onAttemptToApprove}
              confirmed={approval === ApprovalState.APPROVED}
              disabled={approval !== ApprovalState.NOT_APPROVED}
            >
              {approval === ApprovalState.PENDING ? (
                <AutoRow gap="6px" justify="center">
                  Approving <Loader stroke="white" />
                </AutoRow>
              ) : (
                'Approve'
              )}
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || approval !== ApprovalState.APPROVED}
              error={!!error && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? 'Deposit'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />
        </ContentWrapper>
      )}
    </Wrapper>
  )
}