import { useUserInvestmentInfo, useStableCoinBalance, usePoolInfo } from '../../features/pools/hooks'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { useContractKit } from '@celo-tools/use-contractkit'
import React, { useCallback, useState, useMemo } from 'react'
import { ButtonPrimary } from '../../components/Button'
import { ZERO_ADDRESS } from '../../constants'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import Swap from '../Swap'

const TitleRow = styled.div`
  width: 100%;
  color: white;
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
  color: white;
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
  margin-left: 30%;
`

const FactsheetTitle = styled.div`
  width: 100%;
  font-size: 22px;
  color: white;
`

const FactsheetContent = styled.div`
  width: 100%;
  background-color: rgba(86,86,86,0.15);
  border: 1px solid rgba(86,86,86,0.15);
  border-radius: 8px;
  padding-top: 5px;
  margin-top: 30px;
  padding-left: 20px;
  margin-bottom: 30px;
`

const MiddleRowItem = styled.div`
  width: 50%;
  color: white;
  background-color: rgba(86,86,86,0.15);
  margin-left: 4%;
  height: 60px;
  border: 1px solid rgba(86,86,86,0.15);
  border-radius: 8px;
  text-align: center;
  padding-top: 5px;
`

const MiddleRowItemTop = styled.div`
  width: 100%;
  display: block;
  color: #C3C5CB;
`

const MiddleRowItemBottom = styled.div`
  width: 100%;
  display: block;
  margin-top: 5px;
`

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  min-width: 1000px;
`

const SwapWrapper = styled.div`
  width: 100%;
  padding-left: 0%;
  margin-top: 50px;
`

function getColour(totalReturn:string)
{
    if (totalReturn.charAt(0) == '-')
    {
        return 'rgba(248,113,113,1)'
    }

    return 'rgba(52,211,153,1)'
}

export default function ManagePoolPage({
        match: {
            params: { id },
        },
    }: RouteComponentProps<{ id: string }>) {

    let { network, account } = useContractKit();
    console.log(account);
    account = account ?? ZERO_ADDRESS;

    let data = usePoolInfo(id);
    const poolInfo = useMemo(() => {
        return data;
    }, [data]);

    let manager = poolInfo.manager ?? ZERO_ADDRESS;

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

    return (
        <ItemWrapper>
            <FirstRow>
                <FirstRowLeft>
                    {poolInfo.name}
                </FirstRowLeft>
                <FirstRowRight>
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
                </FirstRowRight>
            </FirstRow>
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
                        {combinedPositions.map((element:any) => (
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
                    </FactsheetContent>
                </>
            )}

            <SwapWrapper>
                <Swap
                    poolAddress={id}
                    manager={manager}
                    isNFTPool={false}
                ></Swap>
            </SwapWrapper>
        </ItemWrapper>
    )
}