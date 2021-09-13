import styled from 'styled-components'
import { useNFTPoolInfo } from '../../features/NFTPools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'

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

export function NFTPoolInfo(props:any) {
    console.log(props.address);
    let data = useNFTPoolInfo(props.address);
    const info = useMemo(() => {
        console.log(data);
        return data;
    }, [data]);

    return info ? (
        <>
            <div>
                <ItemWrapper>
                    <ErrorBoundary key={info.address}>
                        <p>Name: {info.name}</p>
                        <p>Address: {info.address}</p>
                        <p>Manager: {info.manager}</p>
                        <p>Max Supply: {Number(info.maxSupply)}</p>
                        <p>Seed Price: {formatNumber(Number(info.seedPrice) / 100, true, true, 18)}</p>
                        <p>Token price: {formatNumber(Number(info.tokenPrice) / 100, true, true, 18)}</p>
                        <p>TVL: {formatNumber(Number(info.TVL), true, true, 18)}</p>
                        <p>Total Return: {formatPercent(Number(info.totalReturn))}</p>
                        <p>Available tokens per class:</p>
                        <ItemWrapper>
                            {info.tokenBalancesPerClass?.length === 0 || info.tokenBalancesPerClass[0] === undefined ? (
                                <div>No tokens available.</div>
                            ) : (
                            info.tokenBalancesPerClass?.map((balance:bigint, index:number) => (
                                <ErrorBoundary>
                                    <p>C{index + 1}: {formatBalance(Number(balance), 0)}</p>
                                </ErrorBoundary>
                            )))}
                        </ItemWrapper>
                        <p>Positions:</p>
                        <ItemWrapper>
                            {info.positionAddresses?.length === 0 ? (
                                <div>No positions yet.</div>
                            ) : (
                            info.positionAddresses?.map((address:string) => (
                                <ErrorBoundary key={address}>
                                    <p>{address}</p>
                                </ErrorBoundary>
                            )))}
                        </ItemWrapper>
                        <p>Balances:</p>
                        <ItemWrapper>
                            {info.positionBalances?.length === 0 ? (
                                <div>No positions yet.</div>
                            ) : (
                            info.positionBalances?.map((balance:bigint) => (
                                <ErrorBoundary>
                                    <p>{formatBalance(BigInt(BigInt(balance)), 18)}</p>
                                </ErrorBoundary>
                            )))}
                        </ItemWrapper>
                    </ErrorBoundary>
                </ItemWrapper>
            </div>
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}