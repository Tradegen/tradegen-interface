import { PoolInfo } from '../../features/pools/PoolInfo'
import { UserInvestmentInfo } from '../../features/pools/UserInvestmentInfo'
import { useUserInvestmentInfo, useStableCoinBalance } from '../../features/pools/hooks'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { useContractKit } from '@celo-tools/use-contractkit'
import StakingModal from '../../components/pools/DepositModal'
import UnstakingModal from '../../components/pools/WithdrawModal'
import { useWalletModalToggle } from '../../state/application/hooks'
import React, { useCallback, useState } from 'react'
import { ButtonPrimary } from '../../components/Button'
import { cUSD } from '@ubeswap/sdk'
import { ZERO_ADDRESS } from '../../constants'

const Buffer = styled.div`
  width: 100%;
  background-color: none;
  height: 15px;
`

const ButtonWrapper = styled.div`
  width: 25%;
  background-color: none;
`

export default function ManagePoolPage({
        match: {
            params: { id },
        },
    }: RouteComponentProps<{ id: string }>) {

    let { network, account } = useContractKit();
    const { chainId } = network
    console.log(account);
    account = account ?? ZERO_ADDRESS;

    const [showStakingModal, setShowStakingModal] = useState(false)
    const [showUnstakingModal, setShowUnstakingModal] = useState(false)

    const investmentInfo = useUserInvestmentInfo(id, account)
    const tokenBalance = investmentInfo ? investmentInfo.userBalance.toString() : '0'
    const cUSDBalance = useStableCoinBalance(cUSD[chainId].address, account).toString()

    const toggleWalletModal = useWalletModalToggle()

    const handleDepositClick = useCallback(() => {
    if (account) {
        setShowStakingModal(true)
    } else {
        toggleWalletModal()
    }
    }, [account, toggleWalletModal])

    return (
        <>
            <p>Pool Info</p>
            <PoolInfo address={id}></PoolInfo>

            {account && <UserInvestmentInfo poolAddress={id} userAddress={account}></UserInvestmentInfo>}

            <ButtonWrapper>
                <Buffer/>
                <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleDepositClick}>
                    {'Deposit'}
                </ButtonPrimary>
                <Buffer/>
                <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => setShowUnstakingModal(true)}>
                    {'Withdraw'}
                </ButtonPrimary>
            </ButtonWrapper>

            <StakingModal
                isOpen={showStakingModal}
                onDismiss={() => setShowStakingModal(false)}
                poolAddress={id}
                cUSDBalance={cUSDBalance}
            />
            <UnstakingModal
                isOpen={showUnstakingModal}
                onDismiss={() => setShowUnstakingModal(false)}
                poolAddress={id}
                tokenBalance={tokenBalance}
            />
        </>
    )
}