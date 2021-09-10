import { PoolInfo } from '../../features/pools/PoolInfo'
import { UserInvestmentInfo } from '../../features/pools/UserInvestmentInfo'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { useContractKit } from '@celo-tools/use-contractkit'
import StakingModal from '../../components/pools/DepositModal'
import { useWalletModalToggle } from '../../state/application/hooks'
import React, { useCallback, useState } from 'react'
import { ButtonPrimary } from '../../components/Button'

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-top: 1rem;
  padding-bottom: 1rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 80rem;
`

const MenuWrapper = styled.div`
    position: sticky;
    top: 0;
    max-height: 40rem;
`

export default function PoolPage({
        match: {
            params: { id },
        },
    }: RouteComponentProps<{ id: string }>) {

    let { network, account } = useContractKit();
    console.log(account);
    account = account ?? null;

    const [showStakingModal, setShowStakingModal] = useState(false)

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

            <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleDepositClick}>
                {'Deposit'}
            </ButtonPrimary>
            <ButtonPrimary padding="8px" borderRadius="8px">
                {'Withdraw'}
            </ButtonPrimary>

            <StakingModal
                isOpen={showStakingModal}
                onDismiss={() => setShowStakingModal(false)}
                poolAddress={id}
                cUSDBalance={'1000000000000000000'}
            />
        </>
    )
}