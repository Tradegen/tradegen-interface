import { Percent, Token, Price } from '@ubeswap/sdk'
import QuestionHelper, { LightQuestionHelper } from 'components/QuestionHelper'
import { useStakingPoolValue } from 'pages/Earn/useStakingPoolValue'
import React from 'react'
import { DualRewardsInfo } from 'state/stake/useDualStakeRewards'
import styled from 'styled-components'
import { useTradegenStakingRewardsInfo, useTradegenStakingRewardsTVL, useRewardRate, useLastTimeRewardsApplicable, StakingRewardsInfo } from '../../features/stake/hooks'

import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import { useColor } from '../../hooks/useColor'
import { StakingInfo } from '../../state/stake/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import useCUSDPrice from 'utils/useCUSDPrice'

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  background: ${({ bgColor }) => `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, #212429 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

export function StakeCard() {
  const backgroundColor = '#2172E5';

  // get the USD value of staked TGEN
  const TGENPrice = "1"; //test
  const TVL = "100"; //test
  const rewardRate = "1000"; //test
  const valueOfTotalStakedAmountInCUSD = "1000000"

  const apy = valueOfTotalStakedAmountInCUSD ? new Percent(valueOfTotalStakedAmountInCUSD, "1000") : undefined

  const dpy = apy
    ? new Percent(Math.floor(parseFloat(apy.divide('365').toFixed(10)) * 1_000_000).toFixed(0), '1000000')
    : undefined

  let weeklyAPY: React.ReactNode | undefined = <>🤯</>
  try {
    weeklyAPY = apy
      ? new Percent(
          Math.floor(parseFloat(apy.divide('52').add('1').toFixed(10)) ** 52 * 1_000_000).toFixed(0),
          '1000000'
        ).toFixed(0, { groupSeparator: ',' })
      : undefined
  } catch (e) {
    console.error('Weekly apy overflow', e)
  }

  return (
    <Wrapper showBackground={false} bgColor={backgroundColor}>
      <TopSection>
        <PoolInfo style={{ marginLeft: '8px' }}>
          <TYPE.white fontWeight={600} fontSize={[18, 24]}>
            TGEN Staking
          </TYPE.white>
          {apy && apy.greaterThan('0') && (
            <TYPE.small className="apr" fontWeight={400} fontSize={14}>
              {apy.denominator.toString() !== '0' ? `${apy.toFixed(0, { groupSeparator: ',' })}%` : '-'} APR
            </TYPE.small>
          )}
        </PoolInfo>

        <StyledInternalLink
          to={`/investments`}
          style={{ width: '25%', marginLeft: '20%' }}
        >
          <ButtonPrimary padding="8px" borderRadius="8px">
            {'Stake'}
          </ButtonPrimary>
        </StyledInternalLink>
      </TopSection>

      <StatContainer>
        <RowBetween>
          <TYPE.white>Total staked</TYPE.white>
          <TYPE.white>
            {valueOfTotalStakedAmountInCUSD
              ? valueOfTotalStakedAmountInCUSD
              : '-'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white>TGEN rate</TYPE.white>
          <TYPE.white>
            {rewardRate} TGEN / week
          </TYPE.white>
        </RowBetween>
        {apy && apy.greaterThan('0') && (
          <RowBetween>
            <RowFixed>
              <TYPE.white>APR</TYPE.white>
              <LightQuestionHelper
                text={
                  <>
                    Yield/day: {dpy?.toSignificant(4)}%<br />
                    APY (weekly compounded): {weeklyAPY}%
                  </>
                }
              />
            </RowFixed>
            <TYPE.white>
              {apy.denominator.toString() !== '0' ? `${apy.toFixed(0, { groupSeparator: ',' })}%` : '-'}
            </TYPE.white>
          </RowBetween>
        )}
      </StatContainer>
    </Wrapper>
  )
}

const PoolInfo = styled.div`
  .apr {
    margin-top: 4px;
    display: none;
    ${({ theme }) => theme.mediaWidth.upToSmall`
  display: block;
  `}
  }
`
