import InfiniteScroll from 'react-infinite-scroll-component'
import { useInfiniteScroll } from './hooks'
import { InvestmentListItem } from './InvestmentListItem'
import styled from 'styled-components'
import { useInvestments, Investment } from '../../features/investments/hooks'
import { useEffect, useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import Loader from '../../components/Loader'
import { formatNumber, formatPercent } from '../../functions/format'
import { StyledInternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'

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

let numDisplayed = 10;

export function InvestmentList() {
    let data = useInvestments();
    const investments = useMemo(() => {
        console.log(data);
        return data;
    }, [data]);
    //const [numDisplayed, setNumDisplayed] = useInfiniteScroll(investments)

    return investments ? (
        <>
            <Wrapper>
                <ColumnWrapper>
                    <div>Name</div>
                </ColumnWrapper>
                <ColumnWrapper2>
                    <div>TVL</div>
                </ColumnWrapper2>
                <ColumnWrapper2>
                    <div>Token Price</div>
                </ColumnWrapper2>
                <ColumnWrapper2>
                    <div>Total Return</div>
                </ColumnWrapper2>
            </Wrapper>
            <div
            >
                <ItemWrapper>
                    {investments?.length === 0 ? (
                        <Loader style={{ margin: 'auto' }} />
                    ) : (
                    investments.map((investment:Investment) => (
                        <ErrorBoundary key={investment.address}>
                            <p>Name: {investment.name}</p>
                            <p>Type: {investment.type}</p>
                            <p>Address: {investment.address}</p>
                            <p>Token price: {formatNumber(Number(investment.tokenPrice), true, true, 18)}</p>
                            <p>TVL: {formatNumber(Number(investment.TVL), true, true, 18)}</p>
                            <p>Total Return: {formatPercent(Number(investment.totalReturn))}</p>
                            <StyledInternalLink
                            to={`/pool/${investment.address}`}
                            style={{ width: '100%' }}
                            >
                            <ButtonPrimary padding="8px" borderRadius="8px">
                                {'Deposit'}
                            </ButtonPrimary>
                            </StyledInternalLink>
                            <p>...</p>
                        </ErrorBoundary>
                    )))}
                </ItemWrapper>
            </div>
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}