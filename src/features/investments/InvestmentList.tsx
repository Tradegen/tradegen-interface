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
import { Box, Flex, Text } from 'rebass'
import { RowFixed } from '../../components/Row'
import PopupItem from 'components/Popups/PopupItem'
import DropdownSelect from '../../components/DropdownSelect'

const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.15); 
  border-radius: 8px;
  padding: 4px 10px;
  padding-right: 6px;
  justify-content: center;
  height: 32px;
  outline: none;
  width: 100%;
  color: black;
  font-size: ${({ large }) => (large ? '20px' : '14px')};
  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 16px;
  }
  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const ListItemWrapper = styled.div`
    border-top: 0.07143rem solid #E6E9EC;
    line-height: 1.35;
    :hover {
        background-color: #F5F9FF;
    }
`

const ListWrapper = styled.div`
    color: black;
    background-color: white;
    border: 2px solid #E6E9EC;
    border-radius: 8px;
`

const PageWrapper = styled.div`
    width: 1000px;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-areas: 'name liq vol';
  padding: 0 1.125rem;
  > * {
    justify-content: flex-end;
    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }
  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol liq vol ';
    > * {
      justify-content: flex-end;
      width: 100%;
      &:first-child {
        justify-content: flex-start;
      }
    }
  }
  @media screen and (min-width: 1080px) {
    display: grid;
    grid-gap: 0.1em;
    grid-template-columns: 1fr 1fr 1fr 1fr 0.8fr 1fr;
    grid-template-areas: 'name type tvl price roi view';
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: black;
  & > * {
    font-size: 14px;
  }
  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const ListItem = ({ item, index, user }) => {
    return (
        <DashGrid style={{ height: '48px' }} focus={true}>
            <DataText area="name">{item.name}</DataText>
            <DataText area="type">{item.type}</DataText>
            <DataText area="tvl">{user ? item.type == 'Pool' ? Number(item.balance) / 100 : Number(item.balance) : formatNumber(Number(item.TVL) / 100, true, true, 16)}</DataText>
            <DataText area="price">{user ? formatNumber(Number(item.USDBalance) / 100, true, true, 18) : formatNumber(Number(item.tokenPrice) / 100, true, true, 18)}</DataText>
            <DataText area="roi" style={{color:getColour(item.totalReturn)}}>{item.totalReturn}</DataText>
            <DataText>
                <ButtonPrimary padding="8px" borderRadius="8px" width="80px" marginLeft="10px">
                    <StyledInternalLink
                        to={(item.type == "Pool" ? `/trade_pool/${item.address}` : `/trade_NFTPool/${item.address}`)}
                        style={{ width: '50px', textDecoration: 'none', color: 'white' }}
                    >
                        {'Trade'}
                    </StyledInternalLink>
                </ButtonPrimary>
                <ButtonPrimary padding="8px" borderRadius="8px" width="80px" marginLeft="10px" backgroundColor="#CCDFFF !important">
                    <StyledInternalLink
                        to={(item.type == "Pool" ? `/pool/${item.address}` : `/NFTPool/${item.address}`)}
                        style={{ width: '50px', textDecoration: 'none', color: '#5271FF' }}
                    >
                        {'View'}
                    </StyledInternalLink>
                </ButtonPrimary>
            </DataText>
                
        </DashGrid>
    )
}

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 2em;
`

const Divider = styled(Box)`
  height: 1px;
  background-color: none;
`

const NoResults = styled.div`
  min-width:1000px;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  text-align: center;
`

const FirstRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
  margin-top: 30px;
  margin-bottom: 60px;
`

const FirstRowLeft = styled.div`
  width: 25%;
  color: white;
  float: left;
  background-color: none;
  font-size: 30px;
`

const FirstRowRight = styled.div`
  width: 75%;
  color: white;
  float: right;
  background-color: none;
  font-size: 16px;
  display: flex;
`

const Buffer = styled.div`
  width: 33%;
  background-color: none;
  height: 15px;
`

const FirstRowText = styled.div`
  font-size: 18px;
  color: black;
  height: 15px;
  margin-right: 10px;
  margin-left: 10px;
  padding-top: 5px;
`

const FILTER_OPTIONS = {
    ALL: 'All',
    POOLS: 'Pools',
    CAPPED_POOLS: 'Capped Pools'
  }

const SORT_OPTIONS = {
    NONE: 'None',
    NAME_ASC: 'Name ↑',
    NAME_DESC: 'Name ↓',
    PRICE_ASC: 'Price ↑',
    PRICE_DESC: 'Price ↓',
    TVL_ASC: 'TVL ↑',
    TVL_DESC: 'TVL ↓',
    ROI_ASC: 'ROI ↑',
    ROI_DESC: 'ROI ↓',
  }

function filterInvestments(investments:Investment[], filter:string, sort:string, value: string)
{
    let output = [];

    if (filter == "All")
    {
        output = investments;
    }
    else if (filter == "Pools")
    {
        output = investments.filter((x): x is Investment => x.type=="Pool")
    }
    else if (filter == "Capped Pools")
    {
        output = investments.filter((x): x is Investment => x.type=="NFT Pool")
    }
    else if (filter == "myInvestments")
    {
        output = investments;
    }
    else if (filter == "managedInvestments")
    {
        output = investments;
    }

    if (sort == "Name ↑")
    {
        output = output.sort((a, b) => {return (a.name > b.name ? 1 : -1)})
    }
    else if (sort == "Name ↓")
    {
        output = output.sort((a, b) => {return (a.name > b.name ? -1 : 1)})
    }
    else if (sort == "Price ↑")
    {
        output = output.sort((a, b) => {return (Number(a.tokenPrice) > Number(b.tokenPrice) ? 1 : -1)})
    }
    else if (sort == "Price ↓")
    {
        output = output.sort((a, b) => {return (Number(a.tokenPrice) > Number(b.tokenPrice) ? -1 : 1)})
    }
    else if (sort == "TVL ↑")
    {
        output = output.sort((a, b) => {return (Number(a.TVL) > Number(b.TVL) ? 1 : -1)})
    }
    else if (sort == "TVL ↓")
    {
        output = output.sort((a, b) => {return (Number(a.TVL) > Number(b.TVL) ? -1 : 1)})
    }
    else if (sort == "ROI ↑")
    {
        output = output.sort((a, b) => {return (a.totalReturn > b.totalReturn ? 1 : -1)})
    }
    else if (sort == "ROI ↓")
    {
        output = output.sort((a, b) => {return (a.totalReturn > b.totalReturn ? -1 : 1)})
    }

    if (value != '') {
        output = output.filter((x): x is Investment => x.name.startsWith(value));
    }

    return output;
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

    investments = investments.filter((x): x is UserInvestment => BigInt(x.balance) > BigInt(0));

    return investments ? (
        <PageWrapper>
                <ListWrapper>
                    <DashGrid center={true} style={{ height: 'fit-content', padding: '0 1.125rem 1rem 1.125rem', fontWeight: '550', paddingTop: '20px' }}>
                        <Flex alignItems="center" justifyContent="flexStart">
                            <DataText area="name">Name</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="type">Type</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="price">Balance</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="value">Value</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="roi">ROI</DataText>
                        </Flex>
                    </DashGrid>
                    <Divider />
                    <List p={0}>
                        {investments &&
                            investments.map((item, index) => {
                                return (
                                    <ListItemWrapper>
                                        <ListItem key={index} index={index + 1} item={item} user={true} />
                                        <Divider />
                                    </ListItemWrapper>
                                )
                            })}
                    </List>
                </ListWrapper>
            </PageWrapper>
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

    investments = investments.filter((x): x is ManagedInvestment => x.manager == props.userAddress);

    return investments ? (
        <PageWrapper>
                <ListWrapper>
                    <DashGrid center={true} style={{ height: 'fit-content', padding: '0 1.125rem 1rem 1.125rem', fontWeight: '550', paddingTop: '20px' }}>
                        <Flex alignItems="center" justifyContent="flexStart">
                            <DataText area="name">Name</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="type">Type</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="tvl">TVL</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="price">Price</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="roi">ROI</DataText>
                        </Flex>
                    </DashGrid>
                    <Divider />
                    <List p={0}>
                        {investments &&
                            investments.map((item, index) => {
                                return (
                                    <ListItemWrapper>
                                        <ListItem key={index} index={index + 1} item={item} user={false} />
                                        <Divider />
                                    </ListItemWrapper>
                                )
                            })}
                    </List>
                </ListWrapper>
            </PageWrapper>
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

    const [filterOptions, setFilterOptions] = useState(FILTER_OPTIONS.ALL);
    const [sortOptions, setSortOptions] = useState(SORT_OPTIONS.NONE);
    const [value, setValue] = useState('');

    const [page, setPage] = useState(1)
    const [maxPage, setMaxPage] = useState(1)

    const itemMax = 10;

    let { network, account } = useContractKit();
    console.log(account);
    account = account ?? null;

    const [showCreatePoolModal, setShowCreatePoolModal] = useState(false)
    const [showCreateNFTPoolModal, setShowCreateNFTPoolModal] = useState(false)
    const [filter, setFilter] = useState(FILTER_OPTIONS.ALL);

    investments = filterInvestments(investments, filterOptions, sortOptions, value);

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
        setFilterOptions(newFilter == 'all' ? FILTER_OPTIONS.ALL : newFilter == 'pools' ? FILTER_OPTIONS.POOLS : FILTER_OPTIONS.CAPPED_POOLS);
    }, [])

    return investments ? (
        <>
            <PageWrapper>
                <FirstRow>
                    <FirstRowLeft>
                        <Input
                            placeholder={'Search...'}
                            onChange={(e) => {
                                setValue(e.target.value)
                            }}
                        />
                    </FirstRowLeft>
                    <FirstRowRight>
                        <Buffer/>
                        <FirstRowText>Sort by: </FirstRowText>
                        <DropdownSelect options={SORT_OPTIONS} active={sortOptions} setActive={setSortOptions} color={'black'} />
                        <FirstRowText>Filter by: </FirstRowText>
                        <DropdownSelect options={FILTER_OPTIONS} active={filterOptions} setActive={setFilterOptions} color={'black'} />
                    </FirstRowRight>
                </FirstRow>

                

                <ListWrapper>
                    <DashGrid center={true} style={{ height: 'fit-content', padding: '0 1.125rem 1rem 1.125rem', fontWeight: '550', paddingTop: '20px' }}>
                        <Flex alignItems="center" justifyContent="flexStart">
                            <DataText area="name">Name</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="type">Type</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="tvl">TVL</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="price">Price</DataText>
                        </Flex>
                        <Flex alignItems="center">
                            <DataText area="roi">ROI</DataText>
                        </Flex>
                    </DashGrid>
                    <Divider />
                    <List p={0}>
                        {investments &&
                            investments.map((item, index) => {
                                return (
                                    <ListItemWrapper>
                                        <ListItem key={index} index={(page - 1) * itemMax + index + 1} item={item} user={false} />
                                        <Divider />
                                    </ListItemWrapper>
                                )
                            })}
                    </List>
                    {maxPage > 1 && (
                        <PageButtons>
                            <div onClick={() => setPage(page === 1 ? page : page - 1)}>
                                <Arrow faded={page === 1 ? true : false}>←</Arrow>
                            </div>
                            <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
                            <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
                                <Arrow faded={page === maxPage ? true : false}>→</Arrow>
                            </div>
                        </PageButtons>
                    )}
                </ListWrapper>
            </PageWrapper>

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