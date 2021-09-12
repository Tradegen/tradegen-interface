import styled from 'styled-components'
import { useUserInvestmentInfo } from '../../features/NFTPools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatBalance } from '../../functions/format'

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

export function UserInvestmentInfo(props:any) {
    let data = useUserInvestmentInfo(props.poolAddress, props.userAddress);
    const info = useMemo(() => {
        console.log(data);
        return data;
    }, [data]);

    console.log(info.userBalances);

    return info ? (
        <>
            <div>
                <ItemWrapper>
                    <ErrorBoundary>
                        {
                        info.userBalances.map((balance:bigint, index:number) => (
                            <ErrorBoundary>
                                <p>C{index + 1}: {formatBalance(Number(balance), 0)}</p>
                            </ErrorBoundary>
                        ))}
                        <p>Your USD balance: {formatNumber(BigInt(BigInt(info.userUSDBalance) / BigInt(1e18)).toString(), true, true, 18)}</p>
                    </ErrorBoundary>
                </ItemWrapper>
            </div>
        </>
    ) : (
        <NoResults>Not invested in pool.</NoResults>
    )
}