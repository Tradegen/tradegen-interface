import { useContractKit } from '@celo-tools/use-contractkit'
import { JSBI, Token, TokenAmount, Trade } from '@ubeswap/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { MaxUint256 } from '@ethersproject/constants'
import styled from 'styled-components'

import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import Loader from '../../components/Loader'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import ProgressSteps from '../../components/ProgressSteps'
import { AutoRow, RowBetween } from '../../components/Row'
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
import { LinkStyledButton, TYPE } from '../../theme'
import AppBody from '../../pages/AppBody'
import { ClickableText } from '../../pages/UbeswapPool/styleds'
import Web3 from 'web3'
import { useDoTransaction } from 'components/swap/routing'
import { useTokenContract, usePoolContract, useNFTPoolContract } from '../../hooks/useContract'
import { useManagerInfo } from '../../features/pools/hooks'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'

const web3 = new Web3('https://alfajores-forno.celo-testnet.org');

const DataRow = styled.div`
  width: 100%;
  display: block;
  background-color: none;
  margin-top: 10px;
  padding-left: 10px;
  color: black;
`

const Buffer = styled.div`
  width: 100%;
  height: 30px;
`

interface SwapProps {
  poolAddress: string
  manager: string
  isNFTPool: boolean
}

let disableMenu = true;

export default function Actions({ poolAddress, manager }: SwapProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()

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

  let managerInfo = useManagerInfo(poolAddress);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

    // state for pending and submitted txn views
    const poolContract = usePoolContract(poolAddress)
    const [attempting, setAttempting] = useState<boolean>(false)
    const [hash, setHash] = useState<string | undefined>()
  const doTransaction = useDoTransaction()
  async function onMintFee() {
    setAttempting(true)
    if (poolContract && managerInfo.manager == manager) {
        const response = await doTransaction(poolContract, 'mintManagerFee', {
            args: [],
            summary: `Minted manager fee`,
        })
        setHash(response.hash)
    }
  }

  async function onRemoveEmptyPositions() {
    setAttempting(true)
    if (poolContract && managerInfo.manager == manager) {
        const response = await doTransaction(poolContract, 'removeEmptyPositions', {
            args: [],
            summary: `Removed empty positions`,
        })
        setHash(response.hash)
    }
  }

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
      <SwapPoolTabs active={'swap'} />
      <AppBody>
        <SwapHeader title={"Actions"} />
        <Wrapper id="swap-page">
          <AutoColumn gap={'md'}>
              <DataRow>
                Token price at last fee mint: {formatNumber(Number(managerInfo.tokenPriceAtLastFeeMint) / 100, true, true, 18)}
              </DataRow>
              <DataRow>
                Available manager fee: {formatNumber(Number(managerInfo.availableManagerFee) / 1000000, true, true, 18)}
              </DataRow>
          </AutoColumn>
          <Buffer></Buffer>
          <RowBetween>
            <ButtonError
              onClick={onMintFee}
            >
              {'Mint manager fee'}
            </ButtonError>
          </RowBetween>
          <Buffer></Buffer>
          <RowBetween>
            <ButtonError
              onClick={onRemoveEmptyPositions}
            >
              {'Remove empty positions'}
            </ButtonError>
          </RowBetween>
        </Wrapper>
      </AppBody>
    </>
  )
}
