import { useContractKit } from '@celo-tools/use-contractkit'
import { TokenAmount, Token } from '@ubeswap/sdk'
import { useDoTransaction } from 'components/swap/routing'
import React, { useCallback, useState } from 'react'
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
import InputPanel from './InputPanel'

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

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const parsedAmount = (BigInt(Number(typedValue) * 1e18) == BigInt(0)) ? BigInt(0) : BigInt(Number(typedValue) * 1e18);

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

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

  async function onExit() {
    if (poolContract && tokenBalance) {
      setAttempting(true)
      await doTransaction(poolContract, 'exit', {
        args: [],
        summary: `Exit pool`,
      })
        .then((response) => {
          setHash(response.hash)
        })
        .catch(() => {
          setAttempting(false)
        })
    }
  }

  async function onWithdraw() {
    if (poolContract && parsedAmount) {
      setAttempting(true)
      await doTransaction(poolContract, 'withdraw', {
        args: [`0x${parsedAmount.toString(16)}`],
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
  console.log(formatBalance(tokenBalance, 18).toString())
  if (Number(typedValue) > Number(formatBalance(tokenBalance, 18).toString())) {
    error = error ?? 'Not enough tokens'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          <InputPanel
            value={typedValue}
            onUserInput={onUserInput}
            showMaxButton={false}
            currency={undefined}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={undefined}
            id="stake-liquidity-token"
            availableTokens={tokenBalance ? formatBalance(tokenBalance, 18).toString() : '0'}
          />
          <ButtonError disabled={!!error} error={!!error && !!tokenBalance} onClick={onWithdraw}>
            {error ?? 'Withdraw from pool'}
          </ButtonError>
          <ButtonError disabled={!tokenBalance} error={!tokenBalance} onClick={onExit}>
            {'Exit pool'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Withdrawing {(Number(typedValue) > 0 && Number(typedValue) <= Number(formatBalance(tokenBalance, 18).toString())) ? typedValue : formatBalance(tokenBalance, 18)} pool tokens</TYPE.body>
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