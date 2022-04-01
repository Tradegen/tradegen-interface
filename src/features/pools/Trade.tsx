import styled from 'styled-components'
import { usePoolInfo } from '../../features/pools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import { useWalletModalToggle } from '../../state/application/hooks'
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
  color: white;
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

export function TradePool(props:any) {

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
                    </ErrorBoundary>
                </ItemWrapper>
            </div>

            <BottomRow>
                <Deposit
                    isOpen={showStakingModal}
                    onDismiss={() => setShowStakingModal(false)}
                    poolAddress={props.address}
                    mcUSDBalance={props.mcUSDBalance}
                />
                <Withdraw
                    isOpen={showUnstakingModal}
                    onDismiss={() => setShowUnstakingModal(false)}
                    poolAddress={props.address}
                    tokenBalance={props.tokenBalance}
                    combinedPositions={combinedPositions}
                />
            </BottomRow>
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}