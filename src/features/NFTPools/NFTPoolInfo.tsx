import styled from 'styled-components'
import { useNFTPoolInfo, usePositionNames } from '../../features/NFTPools/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ZERO_ADDRESS } from '../../constants'

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
    let { address: account, network } = useContractKit()
    account = account ?? ZERO_ADDRESS;

    let data = useNFTPoolInfo(props.address);
    const info = useMemo(() => {
        return data;
    }, [data]);

    let positions = info ? (info.positionAddresses ?? []) : [];

    let data1 = usePositionNames(positions);
    const positionNames = useMemo(() => {
        return data1;
    }, [data1]);

    let combinedPositions = [];
    if (!info.positionBalances || !positionNames || info.positionBalances.length != positionNames.length)
    {
        combinedPositions = [];
    }
    else
    {
        for (var i = 0; i < positionNames.length; i++)
        {
            combinedPositions.push({
                symbol: positionNames[i],
                balance: info.positionBalances[i]
            });
        }
    }

    console.log(combinedPositions);

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
                        <p>TVL: {formatNumber(Number(info.TVL) / 100, true, true, 18)}</p>
                        <p>Total Return: {info.totalReturn}</p>
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
                            {combinedPositions.length === 0 ? (
                                <div>No positions yet.</div>
                            ) : (
                            combinedPositions.map((element:any) => (
                                <ErrorBoundary key={element.symbol}>
                                    <p>{element.symbol}: {formatBalance(element.balance)}</p>
                                </ErrorBoundary>
                            )))}
                        </ItemWrapper>
                        {info.manager == account &&
                            <StyledInternalLink
                                to={`/manage_NFTpool/${info.address}`}
                                style={{ width: '100%' }}
                            >
                                <ButtonPrimary padding="8px" borderRadius="8px">
                                    {'Manage NFT Pool'}
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