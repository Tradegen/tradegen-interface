import { useContractKit } from '@celo-tools/use-contractkit'
import { TokenAmount, Token } from '@ubeswap/sdk'
import { useDoTransaction } from 'components/swap/routing'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { ErrorBoundary } from '@sentry/react'

import { usePoolContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { formatBalance } from '../../functions/format'
import InputPanel from 'components/pools/InputPanel'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const PositionRow = styled.div`
  width: 100%;
  color: black;
  display: block;
  background-color: none;
`

const Wrapper = styled.div`
  width: 400px;
  background-color: white;
  color: black;
  border: 2px solid #E6E9EC;
  border-radius: 12px;
`

interface WithdrawProps {
  isOpen: boolean
  onDismiss: () => void
  poolAddress: string,
  tokenBalance: string,
  combinedPositions: object[]
}

export default function Withdraw({ isOpen, onDismiss, poolAddress, tokenBalance, combinedPositions }: WithdrawProps) {
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

  console.log(combinedPositions);

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
  if (Number(typedValue) > Number(formatBalance(tokenBalance, 18).toString())) {
    error = error ?? 'Not enough tokens'
  }

  return (
    <Wrapper>
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
          <PositionRow>
            You'll receive:
          </PositionRow>
          <>
            {combinedPositions.map((element:any) => (
                <ErrorBoundary key={element.symbol}>
                  <PositionRow>
                    {element.symbol + ': ' + formatBalance((typedValue ? BigInt(Number(typedValue) * 1e18) : BigInt(0)) * BigInt(element.balance) / (Number(tokenBalance) == 0 ? BigInt(1) : BigInt(tokenBalance)))}
                  </PositionRow>
                </ErrorBoundary>
            ))}
        </>
          <ButtonError disabled={!!error} error={!!error && !!tokenBalance} onClick={onWithdraw}>
            {error ?? 'Withdraw from pool'}
          </ButtonError>
          <ButtonError disabled={!tokenBalance} error={!tokenBalance} onClick={onExit}>
            {'Exit pool'}
          </ButtonError>
        </ContentWrapper>
      )}
    </Wrapper>
  )
}