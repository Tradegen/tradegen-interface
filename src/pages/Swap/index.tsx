import { useContractKit } from '@celo-tools/use-contractkit'
import { JSBI, Token, TokenAmount, Trade } from '@ubeswap/sdk'
import { describeTrade } from 'components/swap/routing/describeTrade'
import { MoolaDirectTrade } from 'components/swap/routing/moola/MoolaDirectTrade'
import { useTradeCallback } from 'components/swap/routing/useTradeCallback'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import useENS from 'hooks/useENS'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { MaxUint256 } from '@ethersproject/constants'
import { getPath } from 'constants/paths'

import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import Loader from '../../components/Loader'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import ProgressSteps from '../../components/ProgressSteps'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import { INITIAL_ALLOWED_SLIPPAGE, ZERO_ADDRESS, ROUTER_ADDRESS } from '../../constants'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../UbeswapPool/styleds'
import Web3 from 'web3'
import { usePoolApproveCallback } from '../../hooks/usePoolApproveCallback'
import { useDoTransaction } from 'components/swap/routing'
import { useTokenContract, usePoolContract, useNFTPoolContract } from '../../hooks/useContract'

const web3 = new Web3('https://alfajores-forno.celo-testnet.org');

interface SwapProps {
  poolAddress: string
  manager: string
  isNFTPool: boolean
}

export default function Swap({ poolAddress, manager, isNFTPool }: SwapProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()

  console.log(loadedUrlParams)
  console.log(poolAddress);
  console.log(manager);

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens)
    })

  const { address: account, network: network } = useContractKit()
  const { chainId } = network

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo(poolAddress)
  const { address: recipientAddress } = useENS(recipient)
  const trade = v2Trade

  console.log(currencies[Field.INPUT])

  const parsedAmounts = {
    [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
    [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
  }

  console.log(trade);

  let approvalAmount = parsedAmount ? parsedAmount?.raw.toString() : '0';
  let fromToken = trade ? trade?.inputAmount.token.symbol : "";
  let toToken = trade ? trade?.outputAmount.token.symbol : "";

  console.log(fromToken);
  console.log(toToken);

  let path = getPath(fromToken, toToken) ?? [ZERO_ADDRESS, ZERO_ADDRESS];

  console.log(path);

  let params = web3.eth.abi.encodeFunctionCall({
    name: 'approve',
    type: 'function',
    inputs: [{
        type: 'address',
        name: 'spender'
    },{
        type: 'uint256',
        name: 'value'
    }]
  }, [ROUTER_ADDRESS, approvalAmount]);
  
  let params2 = web3.eth.abi.encodeFunctionCall({
    name: 'swapExactTokensForTokens',
    type: 'function',
    inputs: [{
        type: 'uint256',
        name: 'amountIn'
    },{
        type: 'uint256',
        name: 'amountOutMin'
    },{
        type: 'address[]',
        name: 'path'
    },{
        type: 'address',
        name: 'to'
    },{
        type: 'uint256',
        name: 'deadline'
    }]
  }, [approvalAmount, '0', path, poolAddress, MaxUint256.toString()]);

  console.log(params2);

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]:
      (trade instanceof MoolaDirectTrade
        ? parsedAmounts[dependentField]?.toExact()
        : parsedAmounts[dependentField]?.toSignificant(6)) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const route = trade?.route
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = usePoolApproveCallback(trade?.inputAmount, poolAddress, params, isNFTPool)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: TokenAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useTradeCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

   // state for pending and submitted txn views
   const [attempting, setAttempting] = useState<boolean>(false)
   const [hash, setHash] = useState<string | undefined>()

  const doTransaction = useDoTransaction()
  const poolContract = usePoolContract(poolAddress)
  const NFTPoolContract = useNFTPoolContract(poolAddress)

  async function onSwap() {
    setAttempting(true)
    if ((poolContract || NFTPoolContract) && parsedAmount) {
      if (approval === ApprovalState.APPROVED) {
        if (!isNFTPool)
        {
          const response = await doTransaction(poolContract, 'executeTransaction', {
            args: [ROUTER_ADDRESS, params2],
            summary: `Swapped tokens for pool`,
          })
          setHash(response.hash)
        }
        else
        {
          const response = await doTransaction(NFTPoolContract, 'executeTransaction', {
            args: [ROUTER_ADDRESS, params2],
            summary: `Swapped tokens for NFT pool`,
          })
          setHash(response.hash)
        }
      } else {
        setAttempting(false)
        throw new Error('Attempting to swap without approval or a signature. Please contact support.')
      }
    }
  }

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [
    priceImpactWithoutFee,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade,
    singleHopOnly,
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
    [onCurrencySelection]
  )

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const { isEstimate, makeLabel } = describeTrade(trade)
  const actionLabel = makeLabel(independentField !== Field.INPUT)

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
      <SwapPoolTabs active={'swap'} />
      <AppBody>
        <SwapHeader title={"Swap"} />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <CurrencyInputPanel
              label={independentField === Field.OUTPUT && trade ? `From${isEstimate ? ' (estimated)' : ''}` : 'From'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
              poolAddress={poolAddress}
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="16"
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  />
                </ArrowWrapper>
                {recipient === null && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && trade ? `To${isEstimate ? ' (estimated)' : ''}` : 'To'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
              poolAddress={poolAddress}
            />

            {recipient !== null ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
            <Card padding={'0px'} borderRadius={'20px'}>
              <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                {Boolean(trade) && (
                  <RowBetween align="center">
                    <Text fontWeight={500} fontSize={14} color={theme.text2}>
                      Price
                    </Text>
                    <TradePrice
                      price={trade?.executionPrice}
                      showInverted={showInverted}
                      setShowInverted={setShowInverted}
                    />
                  </RowBetween>
                )}
                {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                  <RowBetween align="center">
                    <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                      Slippage Tolerance
                    </ClickableText>
                    <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                      {allowedSlippage / 100}%
                    </ClickableText>
                  </RowBetween>
                )}
              </AutoColumn>
            </Card>
            <BottomGrouping>
              {swapIsUnsupported ? (
                <ButtonPrimary disabled={true}>
                  <TYPE.main mb="4px">Unsupported Asset</TYPE.main>
                </ButtonPrimary>
              ) : !account ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : noRoute && userHasSpecifiedInputOutput ? (
                <GreyCard style={{ textAlign: 'center' }}>
                  <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                  {singleHopOnly && <TYPE.main mb="4px">Try enabling multi-hop trades.</TYPE.main>}
                </GreyCard>
              ) : showApproveFlow ? (
                <RowBetween>
                  <ButtonConfirmed
                    onClick={approveCallback}
                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                    width="48%"
                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                    confirmed={approval === ApprovalState.APPROVED}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <AutoRow gap="6px" justify="center">
                        Approving <Loader stroke="white" />
                      </AutoRow>
                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                      'Approved'
                    ) : (
                      'Approve ' + currencies[Field.INPUT]?.symbol
                    )}
                  </ButtonConfirmed>
                  <ButtonError
                    onClick={() => {
                      onSwap()
                    }}
                    width="48%"
                    id="swap-button"
                    disabled={
                      !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                    }
                    error={isValid && priceImpactSeverity > 2}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {priceImpactSeverity > 3 && !isExpertMode
                        ? `Price Impact High`
                        : `${actionLabel}${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                    </Text>
                  </ButtonError>
                </RowBetween>
              ) : (
                <ButtonError
                  onClick={() => {
                    onSwap()
                  }}
                  id="swap-button"
                  disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {swapInputError
                      ? swapInputError
                      : priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact Too High`
                      : `${actionLabel}${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                  </Text>
                </ButtonError>
              )}
              {showApproveFlow && (
                <Column style={{ marginTop: '1rem' }}>
                  <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                </Column>
              )}
              {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </BottomGrouping>
          </AutoColumn>
        </Wrapper>
      </AppBody>
      {!swapIsUnsupported ? (
        <AdvancedSwapDetailsDropdown trade={trade} />
      ) : (
        <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
      )}
    </>
  )
}
