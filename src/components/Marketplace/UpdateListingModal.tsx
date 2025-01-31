import { useContractKit } from '@celo-tools/use-contractkit'
import { TokenAmount, Token } from '@ubeswap/sdk'
import { useDoTransaction } from 'components/swap/routing'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { ErrorBoundary } from '@sentry/react'

import { useMarketplaceContract } from '../../hooks/useContract'
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
import { MARKETPLACE_ADDRESS } from '../../constants'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface UpdateListingModalProps {
  isOpen: boolean
  onDismiss: () => void
  poolAddress: string
  listingIndex: number
  availableC1: string
  availableC2: string
  availableC3: string
  availableC4: string
  tokenClass: number
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

export default function UpdateListingModal({ isOpen, onDismiss, poolAddress, listingIndex, availableC1, availableC2, availableC3, availableC4, tokenClass }: UpdateListingModalProps) {
  const { address: account, network } = useContractKit()
  const { chainId } = network

  C1 = availableC1;
  C2 = availableC2;
  C3 = availableC3;
  C4 = availableC4;
  let tokenBalance = Number(C1) + Number(C2) + Number(C3) + Number(C4);

  let maxAvailableTokens = getMaxAvailableTokens(tokenClass);

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

  const [typedValue2, setTypedValue2] = useState('');
  const parsedAmount2 = (Number(typedValue2) > 1000000 || Number(typedValue2) == 0) ? BigInt(0) : BigInt(Number(typedValue2) * 1e18);
  const error2 = (parsedAmount2 == BigInt(0)) ? 'Enter a price' : undefined;

  console.log(parsedAmount);
  console.log(parsedAmount2);
  console.log(error);
  console.log(error2);

  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS)

  async function onUpdateQuantity() {
    if (marketplaceContract && parsedAmount != BigInt(0)) {
      setAttempting(true)
      await doTransaction(marketplaceContract, 'updateQuantity', {
        args: [poolAddress, listingIndex, `0x${parsedAmount.toString(16)}`],
        summary: `Update quantity`,
      })
        .then((response) => {
          setHash(response.hash)
        })
        .catch(() => {
          setAttempting(false)
        })
    }
  }

  async function onUpdatePrice() {
    if (marketplaceContract && parsedAmount != BigInt(0)) {
      setAttempting(true)
      await doTransaction(marketplaceContract, 'updatePrice', {
        args: [poolAddress, listingIndex, `0x${parsedAmount2.toString(16)}`],
        summary: `Update price`,
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

  // wrapped onUserInput to clear signatures
  const onUserInput2 = useCallback((typedValue2: string) => {
    setTypedValue2(typedValue2)
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
            <TYPE.mediumHeader>Update Listing</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} />
          </RowBetween>
          <p>Available C{tokenClass.toString()}: {maxAvailableTokens.toString()}</p>
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
            isQuantity={true}
          />
          <InputPanel
            value={typedValue2}
            onUserInput={onUserInput2}
            showMaxButton={false}
            currency={undefined}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={undefined}
            id="stake-liquidity-token"
            availableTokens={"1,000,000"}
            isQuantity={false}
          />
          <ButtonError disabled={!!error} error={!!error} onClick={onUpdateQuantity}>
            {error ?? 'Update quantity'}
          </ButtonError>
          <ButtonError disabled={!!error2} error={!!error2} onClick={onUpdatePrice}>
            {error2 ?? 'Update price'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Update marketplace listing</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Updated marketplace listing!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}