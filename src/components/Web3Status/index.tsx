import { useContractKit, WalletTypes } from '@celo-tools/use-contractkit'
import * as Sentry from '@sentry/react'
import useAccountSummary from 'hooks/useAccountSummary'
import { darken, lighten } from 'polished'
import React, { useEffect, useMemo } from 'react'
import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { isAddress } from 'web3-utils'

import { NETWORK_CHAIN_NAME } from '../../connectors'
import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'
import Identicon from '../Identicon'
import Loader from '../Loader'
import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  border-color: #A0A4A7;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: #CCDFFF;
  color: #5271FF;
  font-weight: 500;
  border: none;

  :hover,
  :focus {
    cursor: pointer;
  }
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: #A0A4A7;
  color: ${({ pending, theme }) => (pending ? theme.white : theme.text1)};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${darken(0.05, '#A0A4A7')};
    border-colro: #A0A4A7;
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const StatusIcon: React.FC = () => {
  const { walletType } = useContractKit()
  if (
    walletType === WalletTypes.MetaMask ||
    walletType === WalletTypes.CeloExtensionWallet ||
    walletType === WalletTypes.Injected
  ) {
    return <Identicon />
  }
  return null
}

function Web3StatusInner() {
  const { t } = useTranslation()
  const { connect, address, account } = useContractKit()
  const error = null

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  const hasPendingTransactions = !!pending.length
  const toggleWalletModal = useWalletModalToggle()
  let accountName
  if (account) {
    // Phone numbers show up under `account`, so we need to check if it is an address
    accountName = isAddress(account) ? shortenAddress(account) : account
  } else if (address) {
    accountName = shortenAddress(address)
  }
  if (accountName) {
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            <Text>{accountName}</Text>
          </>
        )}
        {!hasPendingTransactions && <StatusIcon />}
      </Web3StatusConnected>
    )
  } else if (error) {
    return (
      <Web3StatusError onClick={connect}>
        <NetworkIcon />
        <Text>{error === 'unsupported' ? 'Wrong Network' : 'Error'}</Text>
      </Web3StatusError>
    )
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={connect} faded={!address}>
        <Text>{t('Connect to a wallet')}</Text>
      </Web3StatusConnect>
    )
  }
}

export default function Web3Status() {
  const { address: account, walletType } = useContractKit()
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)
  const { summary } = useAccountSummary(account ?? undefined)

  useEffect(() => {
    Sentry.setUser({ id: account ?? undefined })
    Sentry.setTag('connector', walletType)
    Sentry.setTag('network', NETWORK_CHAIN_NAME)
  }, [walletType, account])

  return (
    <>
      <Web3StatusInner />
      <WalletModal
        ENSName={summary?.name ?? undefined}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
      />
    </>
  )
}
