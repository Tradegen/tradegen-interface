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

const Buffer = styled.div`
  width: 100%;
  background-color: none;
  height: 15px;
`

const ButtonWrapper = styled.div`
  width: 25%;
  background-color: none;
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

    const cUSDBalance = useStableCoinBalance(cUSD[chainId].address, account).toString()

    const NFTPoolContract = useNFTPoolContract(id);
    let totalSupply = useTotalSupply(NFTPoolContract);
    let maxSupply = useMaxSupply(NFTPoolContract);
    let tokenPrice = useTokenPrice(NFTPoolContract);
    totalSupply = totalSupply ?? BigInt(0);
    maxSupply = maxSupply ?? BigInt(0);
    tokenPrice = tokenPrice ?? BigInt(0);

    return (
        <>
            <NFTPoolInfo address={id} account={account} cUSDBalance={cUSDBalance} totalSupply={totalSupply} maxSupply={maxSupply} tokenPrice={tokenPrice}></NFTPoolInfo>
        </>
    )
}