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

    return marketplaceListing && (
        <>
            <div>
                <FactsheetTitle>
                    Your Marketplace Listing
                </FactsheetTitle>
                <FactsheetContent>
                    <p>Token Class: {Number(marketplaceListing.tokenClass?.toString()) / 1e18}</p>
                    <p>Quantity: {marketplaceListing.numberOfTokens?.toString()}</p>
                    <p>Price: {marketplaceListing.price?.toString()}</p>
                </FactsheetContent>
            </div>
        </>
    )
}