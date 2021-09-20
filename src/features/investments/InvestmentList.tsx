import { InvestmentListItem } from './InvestmentListItem'
import styled from 'styled-components'
import { useInvestments, Investment, useUserInvestments, UserInvestment, useManagedInvestments, ManagedInvestment } from '../../features/investments/hooks'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { ErrorBoundary } from '@sentry/react'
import Loader from '../../components/Loader'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { StyledInternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'
import { useContractKit } from '@celo-tools/use-contractkit'
import CreatePoolModal from '../../components/investments/CreatePoolModal'
import CreateNFTPoolModal from '../../components/investments/CreateNFTPoolModal'
import { useWalletModalToggle } from '../../state/application/hooks'

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  min-width:700px;
`

const NoResults = styled.div`
  width: 100%;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  text-align: center;
`

const InvestmentCard = styled.div`
  width: 100%;
  background-color:none;
  color: white;
  text-decoration: none;
  display: flex;
  margin-top: 30px;
  border: 1px solid #5271FF;
  border-radius: 8px;
`

const InvestmentCardContent = styled.div`
  width: 24%;
  text-align: center;
`

const TitleRow = styled.div`
  width: 100%;
  color: white;
  display: flex;
  background-color: none;
  margin-top: 30px;
`

const ButtonWrapper = styled.div`
  width: 50%;
  background-color: none;
  margin-left: 25%;
`

const Buffer = styled.div`
  width: 100%;
  background-color: none;
  height: 15px;
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
    else if (filter == "managedInvestments")
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
    }, [data, filter]);

    return investments ? (
        <ItemWrapper>
            {investments?.length === 0 ? (
                <Loader style={{ margin: 'auto' }} />
            ) : (
            investments.map((investment:UserInvestment) => (
                <ErrorBoundary key={investment.address}>
                    <InvestmentCard>
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
                    </InvestmentCard>
                </ErrorBoundary>
            )))}
        </ItemWrapper>
    ) : (
        <NoResults>No positions.</NoResults>
    )
}

export function ManagedInvestments(props:any) {
    console.log(props.userAddress);

    let data = useManagedInvestments();
    let investments = useMemo(() => {
        console.log(data);
        return data;
    }, [data]);

    console.log(investments);

    return investments ? (
        <ItemWrapper>
            {investments?.length === 0 ? (
                <Loader style={{ margin: 'auto' }} />
            ) : (
            investments.filter((x): x is ManagedInvestment => x.manager==props.userAddress).map((investment:ManagedInvestment) => (
                <ErrorBoundary key={investment.address}>
                    <StyledInternalLink
                        to={(investment.type == "Pool" ? `/pool/${investment.address}` : `/NFTPool/${investment.address}`)}
                        style={{ width: '100%' }}
                    >
                        <InvestmentCard>
                            <InvestmentCardContent>
                                <p>{investment.name}</p>
                                <p>{investment.type}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{formatNumber(Number(investment.TVL), true, true, 16)}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{formatNumber(Number(investment.tokenPrice) / 100, true, true, 18)}/token</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{investment.totalReturn}</p>
                            </InvestmentCardContent>
                        </InvestmentCard>
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

    const [showCreatePoolModal, setShowCreatePoolModal] = useState(false)
    const [showCreateNFTPoolModal, setShowCreateNFTPoolModal] = useState(false)

    const toggleWalletModal = useWalletModalToggle()

    const handleCreatePoolClick = useCallback(() => {
    if (account) {
        setShowCreatePoolModal(true)
    } else {
        toggleWalletModal()
    }
    }, [account, toggleWalletModal])

    const handleCreateNFTPoolClick = useCallback(() => {
        if (account) {
            setShowCreateNFTPoolModal(true)
        } else {
            toggleWalletModal()
        }
        }, [account, toggleWalletModal])

    return investments ? (
        <>
            <div>
                <ButtonWrapper>
                    <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleCreatePoolClick}>
                        {'Create Pool'}
                    </ButtonPrimary>
                    <Buffer/>
                    <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleCreateNFTPoolClick}>
                        {'Create NFT Pool'}
                    </ButtonPrimary>
                    <Buffer/>
                    <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("all")}}>
                        {'All Investments'}
                    </ButtonPrimary>
                    <Buffer/>
                    <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("pools")}}>
                        {'Pools'}
                    </ButtonPrimary>
                    <Buffer/>
                    <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("NFTPools")}}>
                        {'NFT Pools'}
                    </ButtonPrimary>
                    <Buffer/>
                    <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("all")}}>
                        {'My Investments'}
                    </ButtonPrimary>
                    <Buffer/>
                    <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => {updateFilter("managedInvestments")}}>
                        {'Managed Investments'}
                    </ButtonPrimary>
                </ButtonWrapper>
                <TitleRow>
                    <InvestmentCardContent>
                        Name
                    </InvestmentCardContent>
                    <InvestmentCardContent>
                        TVL
                    </InvestmentCardContent>
                    <InvestmentCardContent>
                        Token price
                    </InvestmentCardContent>
                    <InvestmentCardContent>
                        Total return
                    </InvestmentCardContent>
                </TitleRow>
                {filter != "myInvestments" && filter != "managedInvestments" &&
                    <ItemWrapper>
                        {investments?.length === 0 ? (
                            <Loader style={{ margin: 'auto' }} />
                        ) : (
                        investments.map((investment:Investment) => (
                            <ErrorBoundary key={investment.address}>
                                <StyledInternalLink
                                    to={(investment.type == "Pool" ? `/pool/${investment.address}` : `/NFTPool/${investment.address}`)}
                                    style={{ width: '100%' }}
                                >
                                    <InvestmentCard>
                                        <InvestmentCardContent>
                                            <p>{investment.name}</p>
                                            <p>{investment.type}</p>
                                        </InvestmentCardContent>
                                        <InvestmentCardContent>
                                            <p>{formatNumber(Number(investment.TVL) / 100, true, true, 16)}</p>
                                        </InvestmentCardContent>
                                        <InvestmentCardContent>
                                            <p>{formatNumber(Number(investment.tokenPrice) / 100, true, true, 18)}/token</p>
                                        </InvestmentCardContent>
                                        <InvestmentCardContent>
                                            <p>{investment.totalReturn}</p>
                                        </InvestmentCardContent>
                                    </InvestmentCard>
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

                {account && filter == "managedInvestments" &&
                    <ManagedInvestments userAddress={account}></ManagedInvestments>
                }

                {!account && filter == "managedInvestments" &&
                    <NoResults>No managed investments.</NoResults>
                }
            </div>

            <CreatePoolModal
                isOpen={showCreatePoolModal}
                onDismiss={() => setShowCreatePoolModal(false)}
            />

            <CreateNFTPoolModal
                isOpen={showCreateNFTPoolModal}
                onDismiss={() => setShowCreateNFTPoolModal(false)}
            />
        </>
    ) : (
        <NoResults>No results.</NoResults>
    )
}