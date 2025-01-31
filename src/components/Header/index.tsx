import { useContractKit } from '@celo-tools/use-contractkit'
import { CELO, ChainId, TokenAmount } from '@ubeswap/sdk'
import { CardNoise } from 'components/earn/styled'
import Modal from 'components/Modal'
import usePrevious from 'hooks/usePrevious'
import { darken } from 'polished'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Moon, Sun } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { Text } from 'rebass'
import { useAggregateMCUSDBalance, useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { ExternalLink } from 'theme/components'
import { CountUp } from 'use-count-up'

import Logo from '../../assets/images/logo_with_name.JPG'
import LogoDark from '../../assets/images/logo_with_name.png'
import { useDarkModeManager } from '../../state/user/hooks'
import { BlueCard } from '../Card'
import Menu from '../Menu'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import UbeBalanceContent from './UbeBalanceContent'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: #252e42;
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #A0A4A7;
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  border-color: #A0A4A7;
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(BlueCard)`
  border-radius: 12px;
  padding: 8px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled(NavLink)`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const TradegenIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: #83888C;
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: #5271FF;
  }

  :hover,
  :focus {
    color: #5271FF;
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName,
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: #83888C;
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: #5271FF;;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
`}
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: 'Celo',
  [ChainId.ALFAJORES]: 'Alfajores',
  [ChainId.BAKLAVA]: 'Baklava',
}

export default function Header() {
  const { address: account, network } = useContractKit()
  const chainId = network.chainId
  const { t } = useTranslation()

  const userCELOBalance = useTokenBalance(account ?? undefined, CELO[chainId])
  const [showUbeBalanceModal, setShowUbeBalanceModal] = useState<boolean>(false)
  const mcUSDBalance: TokenAmount | undefined = useAggregateMCUSDBalance()
  const countUpValue2 = mcUSDBalance?.toFixed(2) ?? '0'
  const countUpValuePrevious2 = usePrevious(countUpValue2) ?? '0'
  const countUpValue3 = userCELOBalance?.toFixed(2) ?? '0'
  const countUpValuePrevious3 = usePrevious(countUpValue3) ?? '0'

  return (
    <HeaderFrame>
      <Modal isOpen={showUbeBalanceModal} onDismiss={() => setShowUbeBalanceModal(false)}>
        <UbeBalanceContent setShowUbeBalanceModal={setShowUbeBalanceModal} />
      </Modal>
      <HeaderRow>
        <Title to="/">
          <TradegenIcon>
            <img width={'180px'} src={LogoDark} alt="logo" />
          </TradegenIcon>
        </Title>
        <HeaderLinks>
          {isMobile && chainId && NETWORK_LABELS[chainId] && (
            <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
          )}
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/investments'}
          >
            Investments
          </StyledNavLink>
          {account && (
            <StyledNavLink id="farm-nav-link" to={`/profile/${account}`}>
              Profile
            </StyledNavLink>
          )}
          <StyledNavLink id="farm-nav-link" to="/farm">
            Farm
          </StyledNavLink>
          <StyledNavLink id="farm-nav-link" to="/stake">
            Stake
          </StyledNavLink>
          <StyledExternalLink id={`stake-nav-link`} href={'https://info.tradegen.io'}>
            Charts <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink>
          <StyledExternalLink id={`stake-nav-link`} href={'https://app.moola.market'}>
            Get mcUSD <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink>
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>

          {mcUSDBalance && (
            <UBEWrapper>
              <UBEAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                {account && (
                  <HideSmall>
                    <TYPE.white
                      style={{
                        paddingRight: '.4rem',
                      }}
                    >
                      <CountUp
                        key={countUpValue2}
                        isCounting
                        start={parseFloat(countUpValuePrevious2)}
                        end={parseFloat(countUpValue2)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.white>
                  </HideSmall>
                )}
                mcUSD
              </UBEAmount>
              <CardNoise />
            </UBEWrapper>
          )}

          {userCELOBalance && (
            <UBEWrapper>
              <UBEAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                {account && (
                  <HideSmall>
                    <TYPE.white
                      style={{
                        paddingRight: '.4rem',
                      }}
                    >
                      <CountUp
                        key={countUpValue3}
                        isCounting
                        start={parseFloat(countUpValuePrevious3)}
                        end={parseFloat(countUpValue3)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.white>
                  </HideSmall>
                )}
                CELO
              </UBEAmount>
              <CardNoise />
            </UBEWrapper>
          )}

          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}

const UBEAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, ${({ theme }) => theme.primary1} 0%, #2172e5 100%), #edeef2;
`

const UBEWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.9;
  }
`
