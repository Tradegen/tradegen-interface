import { useContractKit } from '@celo-tools/use-contractkit'
import { useDoTransaction } from 'components/swap/routing'
import React, { useState } from 'react'
import styled from 'styled-components'

import { useTradegenLPStakingRewardsContract } from '../../hooks/useContract'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'
import { TRADEGEN_LP_STAKING_REWARDS_ADDRESS, TGEN } from '../../constants'
import { formatBalance } from '../../functions/format'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  availableRewards: string
}

export default function ClaimRewardModal({ isOpen, onDismiss, availableRewards }: StakingModalProps) {
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

  const stakingContract = useTradegenLPStakingRewardsContract(TRADEGEN_LP_STAKING_REWARDS_ADDRESS)

  async function onClaimReward() {
    if (stakingContract && availableRewards != "0") {
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
  if (availableRewards == "0") {
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
          <AutoColumn justify="center" gap="md">
            <TYPE.body fontWeight={600} fontSize={36}>
                {formatBalance(BigInt(availableRewards) / BigInt(1e14), 4)} TGEN
            </TYPE.body>
            <TYPE.body>Unclaimed rewards</TYPE.body>
          </AutoColumn>
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you claim without withdrawing your TGEN-cUSD remains staked in the contract.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && availableRewards != "0"} onClick={onClaimReward}>
            {error ?? 'Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>
              Claiming{' '}
              {formatBalance(BigInt(availableRewards) / BigInt(1e14), 4)} TGEN
            </TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
            {formatBalance(BigInt(availableRewards) / BigInt(1e14), 4)} TGEN
            </TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}