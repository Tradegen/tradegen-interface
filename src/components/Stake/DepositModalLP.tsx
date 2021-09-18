import { useProvider, useContractKit } from '@celo-tools/use-contractkit'
import { Pair, TokenAmount, Token, cUSD } from '@ubeswap/sdk'
import Loader from 'components/Loader'
import { useDoTransaction } from 'components/swap/routing'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useTradegenLPStakingRewardsContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { ButtonConfirmed, ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import ProgressCircles from '../ProgressSteps'
import { AutoRow, RowBetween } from '../Row'
import { TRADEGEN_LP_STAKING_REWARDS_ADDRESS, TGEN_cUSD } from '../../constants'
import { NETWORK_CHAIN_ID } from '../../connectors'
import InputPanel from './InputPanel'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  TGENBalance: string | undefined
}

export default function StakingModal({ isOpen, onDismiss, TGENBalance }: StakingModalProps) {
  const library = useProvider()

  let token = new Token(NETWORK_CHAIN_ID, TGEN_cUSD, 18, "TGEN-cUSD", "Tradegen");

  TGENBalance = TGENBalance ?? "0";

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, token, new TokenAmount(token, TGENBalance))

  const [typedValue2, setTypedValue2] = useState('');
  const parsedAmount2 = (Number(typedValue2) > 52) ? BigInt(0) : BigInt(Math.floor(Number(typedValue2)));
  const error2 = (Number(typedValue2) > 52) ? 'Enter an amount' : undefined;

  console.log(parsedAmount2);

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
  const [approval, approveCallback] = useApproveCallback(parsedAmount, TRADEGEN_LP_STAKING_REWARDS_ADDRESS)

  const stakingContract = useTradegenLPStakingRewardsContract(TRADEGEN_LP_STAKING_REWARDS_ADDRESS)
  const doTransaction = useDoTransaction()

  async function onStake() {
    setAttempting(true)
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const response = await doTransaction(stakingContract, 'stake', {
          args: [`0x${parsedAmount.raw.toString(16)}`, parsedAmount2],
          summary: `Staked TGEN-cUSD`,
        })
        setHash(response.hash)
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // wrapped onUserInput2 to clear signatures
  const onUserInput2 = useCallback((typedValue2: string) => {
    setTypedValue2(typedValue2)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(new TokenAmount(token, TGENBalance))
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing TGEN amount')

    approveCallback()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Stake</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <InputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={undefined}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={undefined}
            id="stake-liquidity-token"
            availableTokens={TGENBalance}
          />
          <InputPanel
            value={typedValue2}
            onUserInput={onUserInput2}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={undefined}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={'Max number of weeks: '}
            id="stake-liquidity-token"
            availableTokens={'52'}
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
              disabled={!!error || !!error2 || approval !== ApprovalState.APPROVED}
              error={(!!error || !!error2) && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? 'Stake'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Staking TGEN-cUSD</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} TGEN-cUSD</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Staked {parsedAmount?.toSignificant(4)} TGEN-cUSD</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}