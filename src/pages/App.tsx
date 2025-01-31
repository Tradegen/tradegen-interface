import { DappKitResponseStatus } from '@celo/utils'
import { ErrorBoundary } from '@sentry/react'
import React, { Suspense } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import Investments from './Investments'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import { getMobileOperatingSystem, Mobile } from '../utils/mobile'
import Pool from './UbeswapPool'
import PoolPage from './Pool'
import TradePoolPage from './Trade/TradePool'
import ManagePoolPage from './Manage/ManagePool'
import ManageNFTPoolPage from './Manage/ManageNFTPool'
import ProfilePage from './Profile'
import NFTPoolPage from './NFTPool'
import TradeNFTPoolPage from './Trade/TradeNFTPool'
import { RedirectPathToInvestmentsOnly } from './Swap/redirects'
import ManageTGEN from './Stake/ManageTGEN'
import ManageLP from './Stake/ManageLP'
import Filler from './Filler'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const localStorageKey = 'valoraRedirect'

export default function App() {
  const location = useLocation()
  React.useEffect(() => {
    // Close window if search params from Valora redirect are present (handles Valora connection issue)
    if (typeof window !== 'undefined') {
      const url = window.location.href
      const whereQuery = url.indexOf('?')
      if (whereQuery !== -1) {
        const query = url.slice(whereQuery)
        const params = new URLSearchParams(query)
        if (params.get('status') === DappKitResponseStatus.SUCCESS) {
          localStorage.setItem(localStorageKey, window.location.href)
          const mobileOS = getMobileOperatingSystem()
          if (mobileOS === Mobile.ANDROID) {
            window.close()
          }
        }
      }
    }
  }, [location])
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <URLWarning />
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <Popups />
          <Polling />
          <ErrorBoundary fallback={<p>An unexpected error occured on this part of the page. Please reload.</p>}>
            <Switch>
              <Route exact strict path="/pool" component={Pool} />
              <Route exact strict path="/farm" component={Filler} />
              <Route exact strict path="/farm/:stakingAddress" component={Filler} />
              <Route exact strict path="/stake" component={Filler} />
              <Route exact strict path="/stake/TGEN" component={Filler} />
              <Route exact strict path="/stake/LP" component={Filler} />
              <Route exact strict path="/manage_pool/:id" component={ManagePoolPage} />
              <Route exact strict path="/manage_NFTpool/:id" component={ManageNFTPoolPage} />
              <Route exact strict path="/trade_pool/:id" component={TradePoolPage} />
              <Route exact strict path="/trade_NFTpool/:id" component={TradeNFTPoolPage} />
              <Route exact strict path="/NFTpool/:id" component={NFTPoolPage} />
              <Route exact strict path="/pool/:id" component={PoolPage} />
              <Route exact strict path="/investments" component={Investments} />
              <Route exact strict path="/profile/:account" component={ProfilePage} />
              <Route component={RedirectPathToInvestmentsOnly} />
            </Switch>
          </ErrorBoundary>
          <Marginer />
        </BodyWrapper>
      </AppWrapper>
    </Suspense>
  )
}
