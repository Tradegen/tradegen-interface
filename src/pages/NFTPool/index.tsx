import { NFTPoolInfo } from '../../features/NFTPools/NFTPoolInfo'
import { UserInvestmentInfo } from '../../features/NFTPools/UserInvestmentInfo'
import { useUserBalance, useTotalSupply, useMaxSupply, useTokenPrice } from '../../features/NFTPools/hooks'
import { useStableCoinBalance } from '../../features/pools/hooks'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { useContractKit } from '@celo-tools/use-contractkit'
import StakingModal from '../../components/NFTPools/DepositModal'
import UnstakingModal from '../../components/NFTPools/WithdrawModal'
import { useWalletModalToggle } from '../../state/application/hooks'
import React, { useCallback, useState } from 'react'
import { ButtonPrimary } from '../../components/Button'
import { cUSD } from '@ubeswap/sdk'
import { ZERO_ADDRESS } from '../../constants'
import { useNFTPoolContract } from '../../hooks/useContract'

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

export default function NFTPoolPage({
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

    const cUSDBalance = useStableCoinBalance(cUSD[chainId].address, account).toString()

    const NFTPoolContract = useNFTPoolContract(id);

    const tokenBalances = useUserBalance(NFTPoolContract, account);
    const availableC1 = tokenBalances[0] ?? BigInt(0);
    const availableC2 = tokenBalances[1] ?? BigInt(0);
    const availableC3 = tokenBalances[2] ?? BigInt(0);
    const availableC4 = tokenBalances[3] ?? BigInt(0);

    let totalSupply = useTotalSupply(NFTPoolContract);
    let maxSupply = useMaxSupply(NFTPoolContract);
    let tokenPrice = useTokenPrice(NFTPoolContract);
    totalSupply = totalSupply ?? BigInt(0);
    maxSupply = maxSupply ?? BigInt(0);
    tokenPrice = tokenPrice ?? BigInt(0);

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
            <p>NFT Pool Info</p>
            <NFTPoolInfo address={id}></NFTPoolInfo>

            {account && <UserInvestmentInfo poolAddress={id} userAddress={account}></UserInvestmentInfo>}

            <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleDepositClick}>
                {'Deposit'}
            </ButtonPrimary>
            <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => setShowUnstakingModal(true)}>
                {'Withdraw'}
            </ButtonPrimary>

            <StakingModal
                isOpen={showStakingModal}
                onDismiss={() => setShowStakingModal(false)}
                poolAddress={id}
                cUSDBalance={cUSDBalance}
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                tokenPrice={tokenPrice}
            />
            <UnstakingModal
                isOpen={showUnstakingModal}
                onDismiss={() => setShowUnstakingModal(false)}
                poolAddress={id}
                availableC1={availableC1.toString()}
                availableC2={availableC2.toString()}
                availableC3={availableC3.toString()}
                availableC4={availableC4.toString()}
            />
        </>
    )
}