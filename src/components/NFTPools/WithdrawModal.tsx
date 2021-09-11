import { useContractKit } from '@celo-tools/use-contractkit'
import { TokenAmount, Token } from '@ubeswap/sdk'
import { useDoTransaction } from 'components/swap/routing'
import React, { useState } from 'react'
import styled from 'styled-components'

import { usePoolContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'
import { formatBalance } from '../../functions/format'


const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolAddress: string,
  tokenBalance: string
}

export default function UnstakingModal({ isOpen, onDismiss, poolAddress, tokenBalance }: StakingModalProps) {
  const { address: account, network } = useContractKit()
  const { chainId } = network

  // monitor call to help UI loading state
  const doTransaction = useDoTransaction()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const poolContract = usePoolContract(poolAddress)

  async function onWithdraw() {
    if (poolContract && tokenBalance) {
      setAttempting(true)
      await doTransaction(poolContract, 'exit', {
        args: [],
        summary: `Withdraw from pool`,
      })
        .then((response) => {
          setHash(response.hash)
        })
        .catch(() => {
          setAttempting(false)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!tokenBalance) {
    error = error ?? 'Enter an amount'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          {tokenBalance && (
            <AutoColumn justify="center" gap="md">
              <TYPE.body fontWeight={600} fontSize={36}>
                { formatBalance(tokenBalance, 18) }
              </TYPE.body>
              <TYPE.body>Deposited pool tokens</TYPE.body>
            </AutoColumn>
          )}
          <ButtonError disabled={!!error} error={!!error && !!tokenBalance} onClick={onWithdraw}>
            {error ?? 'Withdraw'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Withdrawing {formatBalance(tokenBalance, 18)} pool tokens</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Withdrew pool tokens!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}