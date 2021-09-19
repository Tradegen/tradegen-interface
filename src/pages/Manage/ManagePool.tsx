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

const Buffer = styled.div`
  width: 100%;
  background-color: none;
  height: 15px;
`

const ButtonWrapper = styled.div`
  width: 25%;
  background-color: none;
`

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`

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

    return (
        <>
            <p>Manage Pool</p>
            <p>Positions:</p>
            <ItemWrapper>
                {poolInfo.positionAddresses?.length === 0 ? (
                    <div>No positions yet.</div>
                ) : (
                poolInfo.positionAddresses.map((address:string) => (
                    <ErrorBoundary key={address}>
                        <p>{address}</p>
                    </ErrorBoundary>
                )))}
            </ItemWrapper>
            <p>Balances:</p>
            <ItemWrapper>
                {poolInfo.positionBalances?.length === 0 ? (
                    <div>No positions yet.</div>
                ) : (
                poolInfo.positionBalances.map((balance:bigint) => (
                    <ErrorBoundary>
                        <p>{formatBalance(balance)}</p>
                    </ErrorBoundary>
                )))}
            </ItemWrapper>

            <Swap
                poolAddress={id}
                manager={manager}
            ></Swap>
        </>
    )
}