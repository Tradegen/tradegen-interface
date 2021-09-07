import InfiniteScroll from 'react-infinite-scroll-component'
import { useInfiniteScroll } from './hooks'
import { InvestmentListItem } from './InvestmentListItem'
import styled from 'styled-components'
import { useInvestments, Investment } from '../../features/investments/hooks'
import { useEffect, useMemo } from 'react'
import { POOL_FACTORY_ADDRESS, NFT_POOL_FACTORY_ADDRESS } from '../../constants'
import { POOL_INTERFACE } from '../../constants/abis/pool'
import { NFT_POOL_INTERFACE } from '../../constants/abis/NFTpool'
import { usePoolFactoryContract, useNFTPoolFactoryContract } from '../../hooks/useContract'
import { useSingleCallResult, NEVER_RELOAD, useMultipleContractSingleData } from '../../state/multicall/hooks'
import { ErrorBoundary } from '@sentry/react'
import Loader from '../../components/Loader'
import { formatNumber, formatPercent } from '../../functions/format'

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
/*
function loadData()
{
    const poolFactoryContract = usePoolFactoryContract(POOL_FACTORY_ADDRESS);
    const NFTPoolFactoryContract = useNFTPoolFactoryContract(NFT_POOL_FACTORY_ADDRESS);
    
    let poolAddresses = useSingleCallResult(poolFactoryContract ? poolFactoryContract : null, 'getAvailablePools', undefined)?.result?.[0];
    let NFTPoolAddresses = useSingleCallResult(NFTPoolFactoryContract ? NFTPoolFactoryContract : null, 'getAvailablePools', undefined)?.result?.[0];
    poolAddresses = poolAddresses ?? [];
    NFTPoolAddresses = NFTPoolAddresses ?? [];

    const poolTokenPrices = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
    const NFTPoolTokenPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'tokenPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));

    const poolValues = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'getPoolValue')?.map((element:any) => (element?.result ? element?.result[0] : null));
    const NFTPoolValues = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'getPoolValue')?.map((element:any) => (element?.result ? element?.result[0] : null));

    const poolNames = useMultipleContractSingleData(poolAddresses, POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));
    const NFTPoolNames = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'name')?.map((element:any) => (element?.result ? element?.result[0] : null));

    const NFTPoolSeedPrices = useMultipleContractSingleData(NFTPoolAddresses, NFT_POOL_INTERFACE, 'seedPrice')?.map((element:any) => (element?.result ? element?.result[0] : null));
    
    for (var i = 0; i < poolAddresses.length; i++)
    {
        investments.push({
        type: "Pool",
        address: poolAddresses[i],
        tokenPrice: poolTokenPrices[i],
        TVL: poolValues[i],
        name: poolNames[i],
        totalReturn: (poolTokenPrices[i] === null || BigInt(poolTokenPrices[i]) == BigInt(0)) ? BigInt(0) : (BigInt(poolTokenPrices[i]) - BigInt(1e18)) * BigInt(100) / BigInt(1e18)
        });
    }
    
    for (var i = 0; i < NFTPoolAddresses.length; i++)
    {
        investments.push({
        type: "NFTPool",
        address: NFTPoolAddresses[i],
        tokenPrice: NFTPoolTokenPrices[i],
        TVL: NFTPoolValues[i],
        name: NFTPoolNames[i],
        totalReturn: (NFTPoolTokenPrices[i] === null) ? BigInt(0) : BigInt(BigInt(NFTPoolSeedPrices[i]) - BigInt(NFTPoolTokenPrices[i])) * BigInt(100) / BigInt(NFTPoolSeedPrices[i]) 
        });
    }
}*/

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