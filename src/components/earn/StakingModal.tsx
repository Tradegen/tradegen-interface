import { useDoTransaction } from 'components/swap/routing'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { useStakingContract } from '../../hooks/useContract'
import { StakingInfo } from '../../state/stake/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'
import InputPanel from './InputPanel'
import { ButtonPrimary } from '../../components/Button'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
  availableC1: string
  availableC2: string
  availableC3: string
  availableC4: string
}

let tokenClass:number = 1;
let maxAvailableTokens:string = "0";
let C1:string = "0";
let C2:string = "0";
let C3:string = "0";
let C4:string = "0";

function updateTokenClass(newTokenClass:number)
{
    console.log("update token class:");
    console.log(newTokenClass);

    tokenClass = newTokenClass;
    maxAvailableTokens = getMaxAvailableTokens();

    console.log(maxAvailableTokens);
}

function getMaxAvailableTokens()
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

export default function StakingModal({ isOpen, onDismiss, stakingInfo, availableC1, availableC2, availableC3, availableC4 }: StakingModalProps) {

  C1 = availableC1;
  C2 = availableC2;
  C3 = availableC3;
  C4 = availableC4;

  maxAvailableTokens = getMaxAvailableTokens();

  console.log(tokenClass);
  console.log(maxAvailableTokens);

  const [typedValue, setTypedValue] = useState('');
  const parsedAmount = (BigInt(typedValue) > BigInt(maxAvailableTokens) || BigInt(typedValue) == BigInt(0)) ? BigInt(0) : BigInt(typedValue);
  const error = (BigInt(typedValue) > BigInt(maxAvailableTokens) || BigInt(typedValue) == BigInt(0)) ? 'Enter an amount' : undefined;

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

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  const doTransaction = useDoTransaction()

  async function onStake() {
    setAttempting(true)
    if (stakingContract && parsedAmount && BigInt(maxAvailableTokens) != BigInt(0)) {
      await doTransaction(stakingContract, 'stake', {
        args: [`0x${parsedAmount.toString(16)}`, tokenClass],
        summary: `Stake NFT pool tokens`,
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
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = BigInt(maxAvailableTokens)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount == BigInt(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toString())
  }, [maxAmountInput, onUserInput])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Deposit</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <p>Available C{tokenClass.toString()}: {maxAvailableTokens.toString()}</p>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateTokenClass(1)}}>
            {'C1'}
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateTokenClass(2)}}>
            {'C2'}
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateTokenClass(3)}}>
            {'C3'}
          </ButtonPrimary>
          <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateTokenClass(4)}}>
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

          <RowBetween>
            <ButtonError
              disabled={!!error}
              error={!!error && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? 'Stake'}
            </ButtonError>
          </RowBetween>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Staking {typedValue} C{tokenClass.toString()} NFT pool tokens</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Staked C{tokenClass.toString()} NFT pool tokens!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
