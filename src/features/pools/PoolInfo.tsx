import styled from 'styled-components'
import { usePoolInfo } from '../../features/pools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ZERO_ADDRESS } from '../../constants'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  color: rgba(191, 191, 191, 1);
`

const ColumnWrapper = styled.div`
  display: flex;
  align-items: center;
  grid-column: span 2/span 2;
  padding-left: 1rem;
  padding-right: 1rem;
  cursor: pointer;
`

const ColumnWrapper2 = styled.div`
  display: flex;
  align-items: center;
  padding-left: 1rem;
  padding-right: 1rem;
  cursor: pointer;
`

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`

const NoResults = styled.div`
  width: 100%;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  text-align: center;
`

export function PoolInfo(props:any) {
    let { address: account, network } = useContractKit()
    account = account ?? ZERO_ADDRESS;

    let data = usePoolInfo(props.address);
    const poolInfo = useMemo(() => {
        return data;
    }, [data]);

    return poolInfo ? (
        <>
            <div>
                <ItemWrapper>
                    <ErrorBoundary key={poolInfo.address}>
                        <p>Name: {poolInfo.name}</p>
                        <p>Address: {poolInfo.address}</p>
                        <p>Manager: {poolInfo.manager}</p>
                        <p>Performance fee: {Number(poolInfo.performanceFee) / 100}%</p>
                        <p>Token price: {formatNumber(Number(poolInfo.tokenPrice), true, true, 18)}</p>
                        <p>TVL: {formatNumber(Number(poolInfo.TVL), true, true, 18)}</p>
                        <p>Total Return: {formatPercent(Number(poolInfo.totalReturn))}</p>
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
                        {poolInfo.manager == account &&
                            <StyledInternalLink
                                to={`/manage_pool/${poolInfo.address}`}
                                style={{ width: '100%' }}
                            >
                                <ButtonPrimary padding="8px" borderRadius="8px">
                                    {'Manage Pool'}
                                </ButtonPrimary>
                            </StyledInternalLink>
                        }
                    </ErrorBoundary>
                </ItemWrapper>
            </div>
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}