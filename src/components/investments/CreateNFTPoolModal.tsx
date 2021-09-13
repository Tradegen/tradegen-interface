import { useProvider, useContractKit } from '@celo-tools/use-contractkit'
import { Pair, TokenAmount, Token, cUSD } from '@ubeswap/sdk'
import Loader from 'components/Loader'
import { useDoTransaction } from 'components/swap/routing'
import React, { useCallback, useState } from 'react'
import { StringDecoder } from 'string_decoder'
import styled from 'styled-components'

import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useNFTPoolFactoryContract } from '../../hooks/useContract'
import { NFT_POOL_FACTORY_ADDRESS } from '../../constants'
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
import NameInputPanel from './NameInputPanel'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface CreateNFTPoolModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function CreateNFTPoolModal({ isOpen, onDismiss }: CreateNFTPoolModalProps) {
  const library = useProvider()
  const { address: account, network } = useContractKit()
  const { chainId } = network

  // track and parse user max supply input
  const [typedValue, setTypedValue] = useState('')
  const parsedAmount2 = (Number(typedValue) > 1000000 || Number(typedValue) == 0) ? 0 : Number(typedValue);
  const error3 = (Number(typedValue) > 1000000 || Number(typedValue) == 0) ? 'Enter max supply' : undefined;

  console.log(parsedAmount2);
  console.log(error3);

  // track and parse user name input
  const [typedName, setTypedName] = useState('')
  const parsedName = (typedName.length > 36 || typedName.length == 0) ? "" : typedName;
  const error2 = (typedName.length > 36 || typedName.length == 0) ? 'Enter a name' : undefined;

  console.log(parsedName);
  console.log(error2);

  // track and parse user seed price input
  const [typedValue2, setTypedValue2] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue2, cUSD[chainId], new TokenAmount(cUSD[chainId], BigInt(1e21)))

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

  const NFTPoolFactoryContract = useNFTPoolFactoryContract(NFT_POOL_FACTORY_ADDRESS)
  const doTransaction = useDoTransaction()

  async function onCreate() {
    setAttempting(true)
    if (NFTPoolFactoryContract && parsedAmount && !error && parsedName != "" && !error2) {
        const response = await doTransaction(NFTPoolFactoryContract, 'createPool', {
            args: [parsedName, `0x${parsedAmount2.toString(16)}`, `0x${parsedAmount.raw.toString(16)}`],
            summary: `Created NFT pool`,
        })
        setHash(response.hash)
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // wrapped onUserInput to clear signatures
  const onUserInput2 = useCallback((typedName: string) => {
    setTypedName(typedName)
  }, [])

  // wrapped onUserInput to clear signatures
  const onUserInput3 = useCallback((typedValue2: string) => {
    setTypedValue2(typedValue2)
  }, [])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Create NFT Pool</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <NameInputPanel
            value={typedName}
            onUserInput={onUserInput2}
            showMaxButton={false}
            currency={undefined}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={undefined}
            id="stake-liquidity-token"
            availableTokens={"3000"}
          />
          <InputPanel
            value={typedValue}
            onUserInput={onUserInput}
            showMaxButton={false}
            currency={undefined}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={"Supply cap: "}
            id="stake-liquidity-token"
            availableTokens={"1000000"}
          />
          <InputPanel
            value={typedValue2}
            onUserInput={onUserInput3}
            showMaxButton={false}
            currency={undefined}
            pair={undefined}
            label={''}
            disableCurrencySelect={true}
            customBalanceText={"Max seed price: "}
            id="stake-liquidity-token"
            availableTokens={"1000"}
          />

          <RowBetween>
            <ButtonError
              disabled={!!error}
              error={!!error && !!parsedAmount}
              onClick={onCreate}
            >
              {error ?? 'Create NFT pool'}
            </ButtonError>
          </RowBetween>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Creating NFT pool</TYPE.largeHeader>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Created NFT pool</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}