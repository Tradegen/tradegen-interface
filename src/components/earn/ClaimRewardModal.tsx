import { useContractKit } from '@celo-tools/use-contractkit'
import { useDoTransaction } from 'components/swap/routing'
import React, { useState } from 'react'
import { DualRewardsInfo } from 'state/stake/useDualStakeRewards'
import styled from 'styled-components'

import { useStakingContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo | DualRewardsInfo
}

export default function ClaimRewardModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { address: account } = useContractKit()

  // monitor call to help UI loading state
  const doTransaction = useDoTransaction()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)

  async function onClaimReward() {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttempting(true)
      await doTransaction(stakingContract, 'getReward', {
        args: [],
        summary: `Claim accumulated TGEN rewards`,
      })
        .catch(console.error)
        .finally(() => {
          wrappedOnDismiss()
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? 'Enter an amount'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Claim</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {stakingInfo?.earnedAmountUbe && (
            <AutoColumn justify="center" gap="md">
              <TYPE.body fontWeight={600} fontSize={36}>
                {stakingInfo?.earnedAmountUbe?.toSignificant(6)}{' '}
                {stakingInfo?.dualRewards ? 'TGEN' : stakingInfo?.rewardToken?.symbol ?? 'TGEN'}
              </TYPE.body>
              {stakingInfo?.dualRewards && (
                <TYPE.body fontWeight={600} fontSize={36}>
                  {stakingInfo?.earnedAmount?.toSignificant(6)} {stakingInfo?.rewardToken?.symbol ?? 'TGEN'}
                </TYPE.body>
              )}
              <TYPE.body>Unclaimed rewards</TYPE.body>
            </AutoColumn>
          )}
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you claim without withdrawing your tokens remains in the staking pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onClaimReward}>
            {error ?? 'Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>
              Claiming {stakingInfo?.earnedAmount?.toSignificant(6)} {stakingInfo?.rewardToken?.symbol ?? 'TGEN'}
            </TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed {stakingInfo?.rewardToken?.symbol ?? 'TGEN'}!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
