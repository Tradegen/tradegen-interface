import styled from 'styled-components'
import { useNFTPoolInfo, usePositionNames, useUserBalance, useUserInvestmentInfo } from '../../features/NFTPools/hooks'
import { useMarketplaceListingInfo } from '../../features/marketplace/hooks'
import { useMemo } from 'react'
import { ErrorBoundary } from '@sentry/react'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import { ButtonPrimary } from '../../components/Button'
import { StyledInternalLink, TYPE } from '../../theme'
import { useWalletModalToggle } from '../../state/application/hooks'
import React, { useCallback, useState } from 'react'
import StakingModal from '../../components/NFTPools/DepositModal'
import UnstakingModal from '../../components/NFTPools/WithdrawModal'
import { ExternalLink } from 'theme/components'
import CreateListingModal from '../../components/Marketplace/CreateListingModal'
import { useDoTransaction } from 'components/swap/routing'
import { MARKETPLACE_ADDRESS } from '../../constants'
import { useMarketplaceContract } from '../../hooks/useContract'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { RowBetween } from '../../components/Row'
import { AutoColumn } from '../../components/Column'


const TitleRow = styled.div`
  width: 100%;
  color: white;
  display: flex;
  background-color: none;
  margin-top: 30px;
`

const TitleRowContent = styled.div`
  width: 24%;
  text-align: left;
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

const ItemWrapper = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  min-width:1000px;
`

const NoResults = styled.div`
  width: 100%;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  text-align: center;
  min-width:1000px;
`

const Buffer = styled.div`
  width: 30%;
  background-color: none;
  height: 15px;
`

const FirstRowButtonWrapper = styled.div`
  width: 35%;
  background-color: none;
  margin-left: 3%;
  float: right;
`

const MiddleRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
  margin-top: 30px;
  margin-bottom: 60px;
`

const MiddleRowItem = styled.div`
  width: 30%;
  color: white;
  background-color: #292941;
  margin-left: 5%;
  height: 60px;
  border: 1px solid rgba(86,86,86,0.15);
  border-radius: 8px;
  text-align: center;
  padding-top: 5px;
`

const MiddleRowItemTop = styled.div`
  width: 100%;
  display: block;
  color: #C3C5CB;
`

const MiddleRowItemBottom = styled.div`
  width: 100%;
  display: block;
  margin-top: 5px;
`

const ListingRow = styled.div`
  width: 100%;
  display: flex;
  background-color: none;
`

const FactsheetTitle = styled.div`
  width: 100%;
  font-size: 22px;
  color: white;
`

const ListingRowLeft = styled.div`
  width: 30%;
  font-size: 22px;
  color: white;
  float: left;
  background-color: none;
`

const ListingRowRight = styled.div`
  width: 70%;
  color: white;
  float: right;
  background-color: none;
  font-size: 16px;
`

const FactsheetContent = styled.div`
  width: 100%;
  background-color: #292941;
  border: 1px solid rgba(86,86,86,0.15);
  border-radius: 8px;
  padding-top: 5px;
  margin-top: 30px;
  padding-left: 20px;
  margin-bottom: 30px;
`

export function MarketplaceListingInfo(props:any) {
    let marketplaceListing = useMarketplaceListingInfo(props.account, props.address);
    console.log("Marketplace listing: ");
    console.log(marketplaceListing);

    // monitor call to help UI loading state
    const doTransaction = useDoTransaction()
    const [hash, setHash] = useState<string | undefined>()
    const [attempting, setAttempting] = useState(false)

    function wrappedOndismiss() {
        setHash(undefined)
        setAttempting(false)
    }

    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS)

    async function onCancel() {
        if (marketplaceContract) {
            setAttempting(true)
            await doTransaction(marketplaceContract, 'removeListing', {
            args: [props.address, props.listingIndex],
            summary: `Cancelled marketplace listing`,
            })
            .then((response) => {
                setHash(response.hash)
            })
            .catch(() => {
                setAttempting(false)
            })
        }
    }

    return marketplaceListing && (
        <>
            <div>
                <ListingRow>
                    <ListingRowLeft>
                        Your Marketplace Listing
                    </ListingRowLeft>
                    <ListingRowRight>
                        <FirstRowButtonWrapper>
                            <ButtonPrimary padding="8px" borderRadius="8px" onClick={onCancel}>
                                {'Cancel Listing'}
                            </ButtonPrimary>
                        </FirstRowButtonWrapper>
                    </ListingRowRight>
                </ListingRow>
                <FactsheetContent>
                    <p>Token Class: {Number(marketplaceListing.tokenClass?.toString())}</p>
                    <p>Quantity: {marketplaceListing.numberOfTokens?.toString()}</p>
                    <p>Price: {formatNumber(Number(marketplaceListing.price) / 1e18, true, true, 18) + '/token'}</p>
                </FactsheetContent>
            </div>
            {attempting && !hash && (
                <LoadingView onDismiss={wrappedOndismiss}>
                <AutoColumn gap="12px" justify={'center'}>
                    <TYPE.body fontSize={20}>Cancel marketplace listing</TYPE.body>
                </AutoColumn>
                </LoadingView>
            )}
            {hash && (
                <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
                <AutoColumn gap="12px" justify={'center'}>
                    <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                    <TYPE.body fontSize={20}>Cancelled marketplace listing!</TYPE.body>
                </AutoColumn>
                </SubmittedView>
            )}
        </>
    )
}