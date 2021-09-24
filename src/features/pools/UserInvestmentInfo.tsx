import styled from 'styled-components'
import { useUserInvestmentInfo } from '../../features/pools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatBalance } from '../../functions/format'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ZERO_ADDRESS } from '../../constants'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'

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
    let { address: account, network } = useContractKit()
    account = account ?? ZERO_ADDRESS;

    let data = useUserInvestmentInfo(props.poolAddress);
    const info = useMemo(() => {
        console.log(data);
        return data;
    }, [data]);

    return info.userBalance.toString() != "0" ? (
        <>
            <div>
                <ItemWrapper>
                    <ErrorBoundary>
                        <p>Your token balance: {formatBalance(info.userBalance)}</p>
                        <p>Your USD value: {formatNumber(Number(info.userUSDBalance / BigInt(1e16)) / 100, true, true, 18)}</p>
                    </ErrorBoundary>
                </ItemWrapper>
                {info.manager == account &&
                    <StyledInternalLink
                        to={`/manage_pool/${props.poolAddress}`}
                        style={{ width: '100%' }}
                    >
                        <ButtonPrimary padding="8px" borderRadius="8px">
                            {'Manage Pool'}
                        </ButtonPrimary>
                    </StyledInternalLink>
                }
            </div>
        </>
    ) : (
        <>
          <NoResults>Not invested in pool.</NoResults>
          {info.manager == account &&
              <StyledInternalLink
                  to={`/manage_pool/${props.poolAddress}`}
                  style={{ width: '100%' }}
              >
                  <ButtonPrimary padding="8px" borderRadius="8px">
                      {'Manage Pool'}
                  </ButtonPrimary>
              </StyledInternalLink>
          }
        </>
    )
}