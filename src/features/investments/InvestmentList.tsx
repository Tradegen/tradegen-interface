import { InvestmentListItem } from './InvestmentListItem'
import styled from 'styled-components'
import { useInvestments, Investment, useUserInvestments, UserInvestment } from '../../features/investments/hooks'
import { useEffect, useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import Loader from '../../components/Loader'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { StyledInternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'
import { useContractKit } from '@celo-tools/use-contractkit'

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

let filter:string = "all";

function updateFilter(newFilter:string)
{
    console.log("update filter:");
    console.log(newFilter);

    filter = newFilter;
}

function filterInvestments(investments:Investment[])
{
    if (filter == "all")
    {
        return investments;
    }
    else if (filter == "pools")
    {
        return investments.filter((x): x is Investment => x.type=="Pool")
    }
    else if (filter == "NFTPools")
    {
        return investments.filter((x): x is Investment => x.type=="NFT Pool")
    }
    else if (filter == "myInvestments")
    {
        return investments;
    }

    return [];
}

export function UserInvestments(props:any) {
    console.log(props.userAddress);

    let data = useUserInvestments(props.userAddress);
    let investments = useMemo(() => {
        console.log(data);
        return data;
    }, [data]);

    return investments ? (
        <ItemWrapper>
            {investments?.length === 0 ? (
                <Loader style={{ margin: 'auto' }} />
            ) : (
            investments.map((investment:UserInvestment) => (
                <ErrorBoundary key={investment.address}>
                    <p>Name: {investment.name}</p>
                    <p>Type: {investment.type}</p>
                    <p>Address: {investment.address}</p>
                    <p>Your balance: {investment.type == "NFT Pool" ? investment.balance.toString() : formatBalance(BigInt(BigInt(investment.balance) / BigInt(1e18)).toString(), 0)}</p>
                    <p>Your USD value: {formatNumber(Number(investment.USDBalance / BigInt(1e18)), true, true, 18)}</p>
                    <StyledInternalLink
                        to={(investment.type == "Pool" ? `/pool/${investment.address}` : `/NFTPool/${investment.address}`)}
                        style={{ width: '100%' }}
                    >
                    <ButtonPrimary padding="8px" borderRadius="8px">
                        {'View Details'}
                    </ButtonPrimary>
                    </StyledInternalLink>
                </ErrorBoundary>
            )))}
        </ItemWrapper>
    ) : (
        <NoResults>No positions.</NoResults>
    )
}

export function InvestmentList() {
    let data = useInvestments();
    let investments = useMemo(() => {
        console.log(data);
        return data;
    }, [data]);

    let { network, account } = useContractKit();
    console.log(account);
    account = account ?? null;

    investments = filterInvestments(investments);

    return investments ? (
        <>
            <div>
                <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("all")}}>
                    {'All Investments'}
                </ButtonPrimary>
                <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("pools")}}>
                    {'Pools'}
                </ButtonPrimary>
                <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("NFTPools")}}>
                    {'NFT Pools'}
                </ButtonPrimary>
                <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("myInvestments")}}>
                    {'My Investments'}
                </ButtonPrimary>
                {filter != "myInvestments" &&
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
                                    to={(investment.type == "Pool" ? `/pool/${investment.address}` : `/NFTPool/${investment.address}`)}
                                    style={{ width: '100%' }}
                                >
                                <ButtonPrimary padding="8px" borderRadius="8px">
                                    {'View Details'}
                                </ButtonPrimary>
                                </StyledInternalLink>
                            </ErrorBoundary>
                        )))}
                    </ItemWrapper>
                }

                {account && filter == "myInvestments" &&
                    <UserInvestments userAddress={account}></UserInvestments>
                }

                {!account && filter == "myInvestments" &&
                    <NoResults>No positions.</NoResults>
                }
            </div>
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}