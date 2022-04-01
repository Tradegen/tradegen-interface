import styled from 'styled-components'
import { useNFTPoolInfo, usePositionNames, useUserBalance, useUserInvestmentInfo } from '../../features/NFTPools/hooks'
import { useListingIndex } from '../../features/marketplace/hooks'
import { MarketplaceListingInfo } from '../../features/marketplace/MarketplaceListingInfo'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import { useWalletModalToggle } from '../../state/application/hooks'
import React, { useCallback, useState } from 'react'
import StakingModal from '../../components/NFTPools/DepositModal'
import UnstakingModal from '../../components/NFTPools/WithdrawModal'
import { ExternalLink } from 'theme/components'
import CreateListingModal from '../../components/Marketplace/CreateListingModal'

const TitleRow = styled.div`
  width: 100%;
  color: black;
  display: flex;
  background-color: none;
  margin-top: 30px;
`

const TitleRowContent = styled.div`
  width: 24%;
  text-align: left;
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

const Buffer = styled.div`
  width: 30%;
  background-color: none;
  height: 15px;
`

const FirstRowButtonWrapper = styled.div`
  width: 35%;
  background-color: none;
  margin-left: 3%;
  float: right;
`

const MiddleRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
  margin-top: 30px;
  margin-bottom: 60px;
`

const MiddleRowItem = styled.div`
  width: 30%;
  color: black;
  background-color: white;
  margin-left: 5%;
  height: 60px;
  border: 0.07143rem solid #E6E9EC;
  border-radius: 8px;
  text-align: center;
  padding-top: 5px;
`

const MiddleRowItemTop = styled.div`
  width: 100%;
  display: block;
  color: #83888C;
`

const MiddleRowItemBottom = styled.div`
  width: 100%;
  display: block;
  margin-top: 5px;
`

const ListingRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
`

const FactsheetTitle = styled.div`
  width: 100%;
  font-size: 22px;
  color: black;
`

const ListingRowLeft = styled.div`
  width: 30%;
  font-size: 22px;
  color: black;
  float: left;
  background-color: none;
`

const ListingRowRight = styled.div`
  width: 70%;
  color: black;
  float: right;
  background-color: none;
  font-size: 16px;
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

const StyledExternalLink = styled(ExternalLink).attrs({
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none !important;
  color: white;
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  :hover,
  :focus {
      text-decoration: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
`}
`

function getColour(totalReturn:string)
{
    if (totalReturn.charAt(0) == '-')
    {
        return 'rgba(248,113,113,1)'
    }

    return 'rgba(52,211,153,1)'
}

export function NFTPoolInfo(props:any) {
    const [showStakingModal, setShowStakingModal] = useState(false)
    const [showUnstakingModal, setShowUnstakingModal] = useState(false)
    const [showCreateListingModal, setShowCreateListingModal] = useState(false)

    const toggleWalletModal = useWalletModalToggle()

    const handleDepositClick = useCallback(() => {
    if (props.account) {
        setShowStakingModal(true)
    } else {
        toggleWalletModal()
    }
    }, [props.account, toggleWalletModal])

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
                                {poolInfo.manager == props.account ? (
                                    <FirstRowButtonWrapper>
                                        <StyledInternalLink
                                            to={`/manage_NFTpool/${props.address}`}
                                            style={{ width: '100%' }}
                                        >
                                            <ButtonPrimary padding="8px" borderRadius="8px">
                                                {'Manage Pool'}
                                            </ButtonPrimary>
                                        </StyledInternalLink>
                                    </FirstRowButtonWrapper>
                                ) : (
                                    <Buffer/>
                                )}
                                {props.account && (
                                    <>
                                        <FirstRowButtonWrapper>
                                            <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleDepositClick}>
                                                {'Deposit'}
                                            </ButtonPrimary>
                                        </FirstRowButtonWrapper>
                                        <FirstRowButtonWrapper>
                                            <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => setShowUnstakingModal(true)}>
                                                {'Withdraw'}
                                            </ButtonPrimary>
                                        </FirstRowButtonWrapper>
                                        <FirstRowButtonWrapper>
                                            <ButtonPrimary padding="8px" borderRadius="8px">
                                                <StyledExternalLink  id={`stake-nav-link`} href={'https://info.tradegen.io/nftpool/' + props.address}>
                                                    {'Charts'}
                                                </StyledExternalLink>
                                            </ButtonPrimary>
                                        </FirstRowButtonWrapper>
                                    </>
                                )}
                            </FirstRowRight>
                        </FirstRow>
                        <MiddleRow>
                            <MiddleRowItem style={{marginLeft: '0%'}}>
                                <MiddleRowItemTop>
                                    TVL
                                </MiddleRowItemTop>
                                <MiddleRowItemBottom>
                                    {formatNumber(Number(poolInfo.TVL) / 100, true, true, 18)}
                                </MiddleRowItemBottom>
                            </MiddleRowItem>
                            <MiddleRowItem>
                                <MiddleRowItemTop>
                                    Token Price
                                </MiddleRowItemTop>
                                <MiddleRowItemBottom>
                                    {formatNumber(Number(poolInfo.tokenPrice) / 100, true, true, 18)}
                                </MiddleRowItemBottom>
                            </MiddleRowItem>
                            <MiddleRowItem>
                                <MiddleRowItemTop>
                                    Total Return
                                </MiddleRowItemTop>
                                <MiddleRowItemBottom style={{color:getColour(poolInfo.totalReturn)}}>
                                    {poolInfo.totalReturn}
                                </MiddleRowItemBottom>
                            </MiddleRowItem>
                        </MiddleRow>
                        {positionValue && (
                            <>
                                <ListingRow>
                                    <ListingRowLeft>
                                        Your Investment
                                    </ListingRowLeft>
                                    {listingIndex && (Number(listingIndex.toString()) == 0) && (
                                        <ListingRowRight>
                                            <FirstRowButtonWrapper>
                                                <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => setShowCreateListingModal(true)}>
                                                    {'Create Listing'}
                                                </ButtonPrimary>
                                            </FirstRowButtonWrapper>
                                        </ListingRowRight>
                                    )}
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
                        {(Number(listingIndex.toString()) > 0) && 
                            <MarketplaceListingInfo
                                account={props.account}
                                address={props.address}
                                listingIndex={Number(listingIndex.toString())}
                                availableC1={availableC1.toString()}
                                availableC2={availableC2.toString()}
                                availableC3={availableC3.toString()}
                                availableC4={availableC4.toString()}
                            ></MarketplaceListingInfo>
                        }
                        <FactsheetTitle>
                            Factsheet
                        </FactsheetTitle>
                        <FactsheetContent>
                            <p>Name: {poolInfo.name}</p>
                            <p>Address: {poolInfo.address}</p>
                            <p>Manager: {poolInfo.manager}</p>
                            <p>Max Supply: {Number(poolInfo.maxSupply)}</p>
                            <p>Seed Price: {formatNumber(Number(poolInfo.seedPrice) / 100, true, true, 18)}</p>
                        </FactsheetContent>
                        <FactsheetTitle>
                            Available tokens per class
                        </FactsheetTitle>
                        <FactsheetContent style={{paddingTop: '20px', paddingBottom: '20px'}}>
                            <TitleRow style={{marginTop: '0px'}}>
                                <TitleRowContent>
                                    C1
                                </TitleRowContent>
                                <TitleRowContent>
                                    C2
                                </TitleRowContent>
                                <TitleRowContent>
                                    C3
                                </TitleRowContent>
                                <TitleRowContent>
                                    C4
                                </TitleRowContent>
                            </TitleRow>
                            <TitleRow>
                                <TitleRowContent>
                                    {formatBalance(Number(poolInfo.tokenBalancesPerClass[0]), 0)}
                                </TitleRowContent>
                                <TitleRowContent>
                                    {formatBalance(Number(poolInfo.tokenBalancesPerClass[1]), 0)}
                                </TitleRowContent>
                                <TitleRowContent>
                                    {formatBalance(Number(poolInfo.tokenBalancesPerClass[2]), 0)}
                                </TitleRowContent>
                                <TitleRowContent>
                                    {formatBalance(Number(poolInfo.tokenBalancesPerClass[3]), 0)}
                                </TitleRowContent>
                            </TitleRow>
                        </FactsheetContent>
                        {combinedPositions.length > 0 && (
                            <>
                                <FactsheetTitle>
                                    Positions
                                </FactsheetTitle>
                                <FactsheetContent style={{paddingTop: '20px', paddingBottom: '20px'}}>
                                    <TitleRow style={{marginTop: '0px'}}>
                                        <TitleRowContent>
                                            Symbol
                                        </TitleRowContent>
                                        <TitleRowContent>
                                            Name
                                        </TitleRowContent>
                                        <TitleRowContent>
                                            Type
                                        </TitleRowContent>
                                        <TitleRowContent>
                                            Balance
                                        </TitleRowContent>
                                    </TitleRow>
                                    <>
                                        {combinedPositions.map((element:any) => (element.symbol && element.name &&
                                            <ErrorBoundary key={element.symbol}>
                                                <TitleRow>
                                                    <TitleRowContent>
                                                        {element.symbol}
                                                    </TitleRowContent>
                                                    <TitleRowContent>
                                                        {element.name}
                                                    </TitleRowContent>
                                                    <TitleRowContent>
                                                        {element.type}
                                                    </TitleRowContent>
                                                    <TitleRowContent>
                                                        {formatBalance(element.balance)}
                                                    </TitleRowContent>
                                                </TitleRow>
                                            </ErrorBoundary>
                                        ))}
                                    </>
                                </FactsheetContent>
                            </>
                        )}
                    </ErrorBoundary>
                </ItemWrapper>
            </div>

            <StakingModal
                isOpen={showStakingModal}
                onDismiss={() => setShowStakingModal(false)}
                poolAddress={props.address}
                mcUSDBalance={props.mcUSDBalance}
                maxSupply={props.maxSupply}
                totalSupply={props.totalSupply}
                tokenPrice={props.tokenPrice}
            />
            <UnstakingModal
                isOpen={showUnstakingModal}
                onDismiss={() => setShowUnstakingModal(false)}
                poolAddress={props.address}
                availableC1={availableC1.toString()}
                availableC2={availableC2.toString()}
                availableC3={availableC3.toString()}
                availableC4={availableC4.toString()}
                combinedPositions={combinedPositions}
            />
            <CreateListingModal
                isOpen={showCreateListingModal}
                onDismiss={() => setShowCreateListingModal(false)}
                poolAddress={props.address}
                availableC1={availableC1.toString()}
                availableC2={availableC2.toString()}
                availableC3={availableC3.toString()}
                availableC4={availableC4.toString()}
            />
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}