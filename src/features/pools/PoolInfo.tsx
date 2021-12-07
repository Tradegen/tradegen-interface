import styled from 'styled-components'
import { usePoolInfo } from '../../features/pools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ZERO_ADDRESS } from '../../constants'
import StakingModal from '../../components/pools/DepositModal'
import UnstakingModal from '../../components/pools/WithdrawModal'
import { useWalletModalToggle } from '../../state/application/hooks'
import React, { useCallback, useState } from 'react'

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
  width: 30%;
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

function getColour(totalReturn:string)
{
    if (totalReturn.charAt(0) == '-')
    {
        return 'rgba(248,113,113,1)'
    }

    return 'rgba(52,211,153,1)'
}

export function PoolInfo(props:any) {

    const [showStakingModal, setShowStakingModal] = useState(false)
    const [showUnstakingModal, setShowUnstakingModal] = useState(false)

    const toggleWalletModal = useWalletModalToggle()

    const handleDepositClick = useCallback(() => {
    if (props.account) {
        setShowStakingModal(true)
    } else {
        toggleWalletModal()
    }
    }, [props.account, toggleWalletModal])
    
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
                                            <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleDepositClick}>
                                                {'Deposit'}
                                            </ButtonPrimary>
                                        </FirstRowButtonWrapper>
                                        <FirstRowButtonWrapper>
                                            <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => setShowUnstakingModal(true)}>
                                                {'Withdraw'}
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
                    </ErrorBoundary>
                </ItemWrapper>
            </div>

            <StakingModal
                isOpen={showStakingModal}
                onDismiss={() => setShowStakingModal(false)}
                poolAddress={props.address}
                mcUSDBalance={props.mcUSDBalance}
            />
            <UnstakingModal
                isOpen={showUnstakingModal}
                onDismiss={() => setShowUnstakingModal(false)}
                poolAddress={props.address}
                tokenBalance={props.tokenBalance}
            />
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}