import styled from 'styled-components'
import { usePoolInfo } from '../../features/pools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import { useWalletModalToggle } from '../../state/application/hooks'
import React, { useCallback, useState } from 'react'
import { ExternalLink } from 'theme/components'

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
  color: white;
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

const FactsheetTitle = styled.div`
  width: 100%;
  font-size: 22px;
  color: black;
`

const FactsheetContent = styled.div`
  width: 100%;
  background-color: white;
  color: black;
  border: 0.07143rem solid #E6E9EC;
  border-radius: 8px;
  padding-top: 5px;
  margin-top: 30px;
  padding-left: 20px;
  margin-bottom: 30px;
`
const StyledExternalLink = styled(ExternalLink).attrs({
  })<{ isActive?: boolean }>`
    ${({ theme }) => theme.flexRowNoWrap}
    border-radius: 3rem;
    outline: none;
    cursor: pointer;
    text-decoration: none !important;
    color: white;
    font-size: 1rem;
    width: fit-content;
    margin: 0 12px;
    font-weight: 500;
    text-align: center

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

export function PoolInfo(props:any) {

    const toggleWalletModal = useWalletModalToggle()
    
    let data = usePoolInfo(props.address);
    const poolInfo = useMemo(() => {
        return data;
    }, [data]);

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
                                            to={`/manage_pool/${props.address}`}
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
                                        <ButtonPrimary padding="8px" borderRadius="8px" marginLeft="10px">
                                            <StyledInternalLink
                                                to={`/trade_pool/${props.address}`}
                                                style={{ width: '50px', textDecoration: 'none', color: 'white' }}
                                            >
                                                {'Trade'}
                                            </StyledInternalLink>
                                        </ButtonPrimary>
                                        </FirstRowButtonWrapper>
                                        <FirstRowButtonWrapper>
                                            <ButtonPrimary padding="8px" borderRadius="8px">
                                                <StyledExternalLink  id={`stake-nav-link`} href={'https://info.tradegen.io/pool/' + props.address}>
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
                        {props.tokenBalance && props.positionValue && (
                            <>
                                <FactsheetTitle>
                                    Your Investment
                                </FactsheetTitle>
                                <FactsheetContent>
                                    <p>Token balance: {formatBalance(props.tokenBalance)}</p>
                                    <p>USD value: {props.positionValue}</p>
                                </FactsheetContent>
                            </>
                        ) }
                        <FactsheetTitle>
                            Factsheet
                        </FactsheetTitle>
                        <FactsheetContent>
                            <p>Name: {poolInfo.name}</p>
                            <p>Address: {poolInfo.address}</p>
                            <p>Manager: {poolInfo.manager}</p>
                            <p>Performance fee: {Number(poolInfo.performanceFee) / 100}%</p>
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
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}