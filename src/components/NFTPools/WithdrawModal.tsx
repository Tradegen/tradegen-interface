import { useContractKit } from '@celo-tools/use-contractkit'
import { TokenAmount, Token } from '@ubeswap/sdk'
import { useDoTransaction } from 'components/swap/routing'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { ErrorBoundary } from '@sentry/react'

import { useNFTPoolContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'
import { formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import InputPanel from './InputPanel'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const PositionRow = styled.div`
  width: 100%;
  color: white;
  display: block;
  background-color: none;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolAddress: string
  availableC1: string
  availableC2: string
  availableC3: string
  availableC4: string
  combinedPositions: object[]
}

let C1:string = "0";
let C2:string = "0";
let C3:string = "0";
let C4:string = "0";

function getMaxAvailableTokens(tokenClass:number)
{
    if (tokenClass == 1)
    {
        return C1;
    }

    if (tokenClass == 2)
    {
        return C2;
    }

    if (tokenClass == 3)
    {
        return C3;
    }

    if (tokenClass == 4)
    {
        return C4;
    }

    return "0";
}

export default function UnstakingModal({ isOpen, onDismiss, poolAddress, availableC1, availableC2, availableC3, availableC4, combinedPositions }: StakingModalProps) {
  const { address: account, network } = useContractKit()
  const { chainId } = network

  const [filter, setFilter] = useState(1);
  const handleFilterChange = useCallback((newFilter:number) => {
    setFilter(newFilter);
}, [])

  C1 = availableC1;
  C2 = availableC2;
  C3 = availableC3;
  C4 = availableC4;
  let tokenBalance = Number(C1) + Number(C2) + Number(C3) + Number(C4);

  let maxAvailableTokens = getMaxAvailableTokens(filter);

  console.log(filter);
  console.log(maxAvailableTokens);

  // monitor call to help UI loading state
  const doTransaction = useDoTransaction()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const [typedValue, setTypedValue] = useState('');
  const parsedAmount = (BigInt(typedValue) > BigInt(maxAvailableTokens) || BigInt(typedValue) == BigInt(0)) ? BigInt(0) : BigInt(typedValue);
  const error = (BigInt(typedValue) > BigInt(maxAvailableTokens) || BigInt(typedValue) == BigInt(0)) ? 'Enter an amount' : undefined;

  console.log(parsedAmount);
  console.log(error);

  const poolContract = useNFTPoolContract(poolAddress)

  async function onWithdraw() {
    if (poolContract && BigInt(maxAvailableTokens) != BigInt(0)) {
      setAttempting(true)
      await doTransaction(poolContract, 'withdraw', {
        args: [`0x${parsedAmount.toString(16)}`, filter],
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

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    if (typedValue.charAt(typedValue.length - 1) == ".") {
      typedValue = typedValue.slice(0, -1);
    }
    console.log(typedValue)
    setTypedValue(typedValue)
  }, [])
  
  // used for max input button
  const maxAmountInput = BigInt(maxAvailableTokens)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount == BigInt(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toString())
  }, [maxAmountInput, onUserInput])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          <p>Available C{filter.toString()}: {maxAvailableTokens.toString()}</p>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {handleFilterChange(1)}}>
            {'C1'}
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {handleFilterChange(2)}}>
            {'C2'}
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {handleFilterChange(3)}}>
            {'C3'}
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {handleFilterChange(4)}}>
            {'C4'}
          </ButtonPrimary>
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
          <PositionRow>
            You'll receive:
          </PositionRow>
          <>
            {combinedPositions.map((element:any) => (
                <ErrorBoundary key={element.symbol}>
                  <PositionRow>
                    {element.symbol + ': ' + formatBalance((typedValue ? BigInt(typedValue) : BigInt(0)) * BigInt(element.balance) / BigInt(tokenBalance))}
                  </PositionRow>
                </ErrorBoundary>
            ))}
        </>
          <ButtonError disabled={!!error} error={!!error && BigInt(maxAvailableTokens) == BigInt(0)} onClick={onWithdraw}>
            {error ?? 'Withdraw'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Withdrawing {typedValue} C{filter.toString()} NFT pool tokens</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Withdrew C{filter.toString()} NFT pool tokens!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}