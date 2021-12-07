import { useProvider, useContractKit } from '@celo-tools/use-contractkit'
import { Pair, TokenAmount } from '@ubeswap/sdk'
import Loader from 'components/Loader'
import { useDoTransaction } from 'components/swap/routing'
import React, { useCallback, useState } from 'react'
import { StringDecoder } from 'string_decoder'
import styled from 'styled-components'

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useNFTPoolContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { ButtonConfirmed, ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import CurrencyInputPanel from '../CurrencyInputPanel'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import ProgressCircles from '../ProgressSteps'
import { AutoRow, RowBetween } from '../Row'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import InputPanel from './InputPanel'
import { mcUSD } from '../../constants/tokens'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolAddress: string
  mcUSDBalance: string,
  maxSupply: bigint,
  totalSupply: bigint,
  tokenPrice: bigint
}

export default function StakingModal({ isOpen, onDismiss, poolAddress, mcUSDBalance, maxSupply, totalSupply, tokenPrice }: StakingModalProps) {
  const library = useProvider()
  const { address: account, network } = useContractKit()
  const { chainId } = network

  const remainingTokens = BigInt(maxSupply - totalSupply);
  const maxTokensFromBalance = (BigInt(tokenPrice) == BigInt(0)) ? BigInt(0) : BigInt(BigInt(mcUSDBalance) / BigInt(tokenPrice));
  const maxAvailableTokens = remainingTokens < maxTokensFromBalance ? remainingTokens : maxTokensFromBalance;

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const parsedAmount = (BigInt(typedValue) > BigInt(maxAvailableTokens) || BigInt(typedValue) == BigInt(0)) ? BigInt(0) : BigInt(typedValue);
  const error = (BigInt(typedValue) > BigInt(maxAvailableTokens) || BigInt(typedValue) == BigInt(0)) ? 'Enter an amount' : undefined;
  const positionValue = new TokenAmount(mcUSD[chainId], (BigInt(typedValue) * BigInt(tokenPrice)).toString())

  console.log(parsedAmount);
  console.log(error);

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
  const [approval, approveCallback] = useApproveCallback(positionValue, poolAddress)

  const poolContract = useNFTPoolContract(poolAddress)
  const doTransaction = useDoTransaction()

  async function onStake() {
    setAttempting(true)
    if (poolContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const response = await doTransaction(poolContract, 'deposit', {
          args: [`0x${parsedAmount.toString(16)}`],
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
  const maxAmountInput = BigInt(maxAvailableTokens)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount == BigInt(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toString())
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!poolAddress || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing token amount')

    approveCallback()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Deposit</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <p>Cost: {formatNumber((BigInt(positionValue.raw.toString()) / BigInt(1e18)).toString(), true, true, 18)}</p>
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
            availableTokens={maxAvailableTokens.toString()}
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
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Depositing into NFT Pool</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount.toString()} NFT pool tokens</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Purchased {parsedAmount.toString()} NFT pool tokens</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}