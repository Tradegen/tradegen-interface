import styled from 'styled-components'
import { useNFTPoolInfo, usePositionNames, useUserBalance, useUserInvestmentInfo } from '../../features/NFTPools/hooks'
import { useListingIndex } from '../../features/marketplace/hooks'
import { MarketplaceListingInfo } from '../../features/marketplace/MarketplaceListingInfo'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import React, { useCallback, useState } from 'react'
import Deposit from './Deposit'
import Withdraw from './Withdraw'

const BottomRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const FirstRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
  margin-top: 30px;
  margin-bottom: 60px;
`

const FirstRowLeft = styled.div`
  width: 30%;
  color: black;
  float: left;
  background-color: none;
  font-size: 30px;
`

const FirstRowRight = styled.div`
  width: 70%;
  color: black;
  float: right;
  background-color: none;
  font-size: 16px;
  display: flex;
  padding-left: 55%;
`

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  min-width:1000px;
`

const NoResults = styled.div`
  width: 100%;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  text-align: center;
  min-width:1000px;
`

const FirstRowButtonWrapper = styled.div`
  width: 35%;
  background-color: none;
  margin-left: 3%;
  float: right;
`
const ListingRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
`

const ListingRowLeft = styled.div`
  width: 30%;
  font-size: 22px;
  color: black;
  float: left;
  background-color: none;
`

const FactsheetContent = styled.div`
  width: 100%;
  background-color: white;
  border: 0.07143rem solid #E6E9EC;
  border-radius: 8px;
  padding-top: 5px;
  margin-top: 30px;
  padding-left: 20px;
  margin-bottom: 30px;
  color: black;
`

export function TradeNFTPool(props:any) {
    const [showStakingModal, setShowStakingModal] = useState(false)
    const [showUnstakingModal, setShowUnstakingModal] = useState(false)

    let data = useNFTPoolInfo(props.address);
    const poolInfo = useMemo(() => {
        return data;
    }, [data]);

    console.log(poolInfo);

    let listingIndex = useListingIndex(props.account, props.address);
    console.log("Marketplace listing: ");
    console.log(listingIndex);

    const investmentInfo = useUserInvestmentInfo(props.address, props.account);
    const positionValue = investmentInfo ? formatNumber(Number(investmentInfo.userUSDBalance / BigInt(1e16)) / 100, true, true, 18) : undefined
    const availableC1 = investmentInfo.userBalances[0] ?? BigInt(0);
    const availableC2 = investmentInfo.userBalances[1] ?? BigInt(0);
    const availableC3 = investmentInfo.userBalances[2] ?? BigInt(0);
    const availableC4 = investmentInfo.userBalances[3] ?? BigInt(0);

    let combinedPositions = [];
    if (!poolInfo.positionBalances || !poolInfo.positionNames || !poolInfo.positionSymbols || poolInfo.positionBalances.length != poolInfo.positionNames.length)
    {
        combinedPositions = [];
    }
    else
    {
        for (var i = 0; i < poolInfo.positionNames.length; i++)
        {
            combinedPositions.push({
                symbol: poolInfo.positionSymbols[i],
                name: poolInfo.positionNames[i],
                type: "Asset",
                balance: poolInfo.positionBalances[i]
            });
        }
    }

    console.log(combinedPositions);

    return poolInfo ? (
        <>
            <div>
                <ItemWrapper>
                    <ErrorBoundary key={poolInfo.address}>
                        <FirstRow>
                            <FirstRowLeft>
                                {poolInfo.name}
                            </FirstRowLeft>
                            <FirstRowRight>
                                <StyledInternalLink
                                    to={`/pool/${props.address}`}
                                    style={{ width: '100%' }}
                                >
                                    <ButtonPrimary padding="8px" borderRadius="8px" width="120px">
                                        {'Pool Info'}
                                    </ButtonPrimary>
                                </StyledInternalLink>
                            </FirstRowRight>
                        </FirstRow>
                        {positionValue && (
                            <>
                                <ListingRow>
                                    <ListingRowLeft>
                                        Your Investment
                                    </ListingRowLeft>
                                </ListingRow>
                                <FactsheetContent>
                                    <p>C1 tokens: {availableC1.toString()}</p>
                                    <p>C2 tokens: {availableC2.toString()}</p>
                                    <p>C3 tokens: {availableC3.toString()}</p>
                                    <p>C4 tokens: {availableC4.toString()}</p>
                                    <p>USD value: {positionValue}</p>
                                </FactsheetContent>
                            </>
                        ) }
                    </ErrorBoundary>
                </ItemWrapper>
            </div>

            <BottomRow>
                <Deposit
                    isOpen={showStakingModal}
                    onDismiss={() => setShowStakingModal(false)}
                    poolAddress={props.address}
                    mcUSDBalance={props.mcUSDBalance}
                    maxSupply={props.maxSupply}
                    totalSupply={props.totalSupply}
                    tokenPrice={props.tokenPrice}
                />
                <Withdraw
                    isOpen={showUnstakingModal}
                    onDismiss={() => setShowUnstakingModal(false)}
                    poolAddress={props.address}
                    availableC1={availableC1.toString()}
                    availableC2={availableC2.toString()}
                    availableC3={availableC3.toString()}
                    availableC4={availableC4.toString()}
                    combinedPositions={combinedPositions}
                />
            </BottomRow>
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}