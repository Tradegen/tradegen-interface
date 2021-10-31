import { InvestmentListItem } from './InvestmentListItem'
import styled from 'styled-components'
import { useInvestments, Investment, useUserInvestments, UserInvestment, useManagedInvestments, ManagedInvestment } from '../../features/investments/hooks'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { ErrorBoundary } from '@sentry/react'
import Loader from '../../components/Loader'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { StyledInternalLink, TYPE } from '../../theme'
import { ButtonTransparent, ButtonPrimary } from '../../components/Button'
import { useContractKit } from '@celo-tools/use-contractkit'
import CreatePoolModal from '../../components/investments/CreatePoolModal'
import CreateNFTPoolModal from '../../components/investments/CreateNFTPoolModal'
import { useWalletModalToggle } from '../../state/application/hooks'

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  min-width:1000px;
`

const NoResults = styled.div`
  min-width:1000px;
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
  &:hover {
    background-color: rgba(86,86,86,0.15)};
    text-decoration: none;
  }
`

const InvestmentCardContent = styled.div`
  width: 19%;
  text-align: center;
`

const TitleRow = styled.div`
  width: 100%;
  color: white;
  display: flex;
  background-color: none;
  margin-top: 30px;
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

const FirstRowButtonWrapper = styled.div`
  width: 30%;
  background-color: none;
  margin-left: 4%;
  float: right;
`

const ButtonWrapper = styled.div`
  width: 100%;
  background-color: none;
  margin-left: 0%;
  display: flex;
`

const Buffer = styled.div`
  width: 30%;
  background-color: none;
  height: 15px;
`

function filterInvestments(investments:Investment[], filter:string)
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

function getColour(totalReturn:string)
{
    if (totalReturn.charAt(0) == '-')
    {
        return 'rgba(248,113,113,1)'
    }

    return 'rgba(52,211,153,1)'
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
            investments.filter((x): x is UserInvestment => x.balance >= BigInt(0)).map((investment:UserInvestment) => (
                <ErrorBoundary key={investment.address}>
                    <StyledInternalLink
                        to={(investment.type == "Pool" ? `/pool/${investment.address}` : `/NFTPool/${investment.address}`)}
                        style={{ width: '100%', textDecoration: 'none' }}
                    >
                        <InvestmentCard>
                            <InvestmentCardContent>
                                <p>{investment.name}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{investment.type}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{investment.type == "Pool" ? formatBalance(investment.balance) : investment.balance.toString()}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{formatNumber(Number(investment.USDBalance) / 100, true, true, 18)}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p style={{color:getColour(investment.totalReturn)}}>{investment.totalReturn}</p>
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
                        style={{ width: '100%', textDecoration: 'none' }}
                    >
                        <InvestmentCard>
                            <InvestmentCardContent>
                                <p>{investment.name}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{investment.type}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{formatNumber(Number(investment.TVL) / 100, true, true, 16)}</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p>{formatNumber(Number(investment.tokenPrice) / 100, true, true, 18)}/token</p>
                            </InvestmentCardContent>
                            <InvestmentCardContent>
                                <p style={{color:getColour(investment.totalReturn)}}>{investment.totalReturn}</p>
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

    const [showCreatePoolModal, setShowCreatePoolModal] = useState(false)
    const [showCreateNFTPoolModal, setShowCreateNFTPoolModal] = useState(false)
    const [filter, setFilter] = useState("all");

    investments = filterInvestments(investments, filter);

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

    const handleFilterChange = useCallback((newFilter:string) => {
        setFilter(newFilter);
    }, [])

    return investments ? (
        <>
            <div>
                <FirstRow>
                    <FirstRowLeft>
                        Investments
                    </FirstRowLeft>
                    <FirstRowRight>
                        <Buffer/>
                        <FirstRowButtonWrapper>
                            <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleCreatePoolClick}>
                                {'Create Pool'}
                            </ButtonPrimary>
                        </FirstRowButtonWrapper>
                        <FirstRowButtonWrapper>
                            <ButtonPrimary padding="8px" borderRadius="8px" onClick={handleCreateNFTPoolClick}>
                                {'Create NFT Pool'}
                            </ButtonPrimary>
                        </FirstRowButtonWrapper>
                    </FirstRowRight>
                </FirstRow>
                <ButtonWrapper>
                    <ButtonTransparent padding="8px" onClick={() => {handleFilterChange("all")}}>
                        {'All Investments'}
                    </ButtonTransparent>
                    <ButtonTransparent padding="8px" onClick={() => {handleFilterChange("pools")}}>
                        {'Pools'}
                    </ButtonTransparent>
                    <ButtonTransparent padding="8px" onClick={() => {handleFilterChange("NFTPools")}}>
                        {'NFT Pools'}
                    </ButtonTransparent>
                    <ButtonTransparent padding="8px" onClick={() => {handleFilterChange("myInvestments")}}>
                        {'My Investments'}
                    </ButtonTransparent>
                    <ButtonTransparent padding="8px" onClick={() => {handleFilterChange("managedInvestments")}}>
                        {'Managed Investments'}
                    </ButtonTransparent>
                </ButtonWrapper>
                <TitleRow>
                    <InvestmentCardContent>
                        Name
                    </InvestmentCardContent>
                    <InvestmentCardContent>
                        Type
                    </InvestmentCardContent>
                    <InvestmentCardContent>
                        {filter == "myInvestments" ? "Tokens" : "TVL"}
                    </InvestmentCardContent>
                    <InvestmentCardContent>
                        {filter == "myInvestments" ? "USD Value" : "Token Price"}
                    </InvestmentCardContent>
                    <InvestmentCardContent>
                        Total return
                    </InvestmentCardContent>
                </TitleRow>
                {filter != "myInvestments" && filter != "managedInvestments" &&
                    <ItemWrapper>
                        {investments?.length === 0 ? (
                            <Loader style={{ marginLeft: '50%', marginTop: '10%' }} />
                        ) : (
                        investments.map((investment:Investment) => (
                            <ErrorBoundary key={investment.address}>
                                <StyledInternalLink
                                    to={(investment.type == "Pool" ? `/pool/${investment.address}` : `/NFTPool/${investment.address}`)}
                                    style={{ width: '100%', textDecoration: 'none' }}
                                >
                                    <InvestmentCard>
                                        <InvestmentCardContent>
                                            <p>{investment.name}</p>
                                        </InvestmentCardContent>
                                        <InvestmentCardContent>
                                            <p>{investment.type}</p>
                                        </InvestmentCardContent>
                                        <InvestmentCardContent>
                                            <p>{formatNumber(Number(investment.TVL) / 100, true, true, 16)}</p>
                                        </InvestmentCardContent>
                                        <InvestmentCardContent>
                                            <p>{formatNumber(Number(investment.tokenPrice) / 100, true, true, 18)}/token</p>
                                        </InvestmentCardContent>
                                        <InvestmentCardContent>
                                            <p style={{color:getColour(investment.totalReturn)}}>{investment.totalReturn}</p>
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