import { Percent, Token, Price, cUSD } from '@ubeswap/sdk'
import QuestionHelper, { LightQuestionHelper } from 'components/QuestionHelper'
import React from 'react'
import { useMemo } from 'react'
import styled from 'styled-components'
import { useTradegenLPStakingRewardsInfo, useTokenAmountsFromPair, usePriceOfLPToken } from '../../features/stake/hooks'

import { BIG_INT_SECONDS_IN_WEEK, TGEN, TGEN_cUSD } from '../../constants'
import { NETWORK_CHAIN_ID } from '../../connectors'
import { StyledInternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import useCUSDPrice from 'utils/useCUSDPrice'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'

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

export function StakeLPCard() {
  const backgroundColor = '#2172E5';

  //get the USD value of staked TGEN
  let TGENToken = new Token(NETWORK_CHAIN_ID, TGEN, 18);
  let price = useCUSDPrice(TGENToken);
  let stringPrice = price?.raw.numerator.toString();
  let stringPrice2 = price?.raw.denominator.toString();
  const TGENPrice = (stringPrice && stringPrice2) ? BigInt(BigInt(stringPrice) * BigInt(1e18) / BigInt(stringPrice2)) : BigInt(0);
  console.log(TGENPrice);

  let data = useTradegenLPStakingRewardsInfo();
  const stakingRewardsInfo = useMemo(() => {
      return data;
  }, [data]);

  let data2 = usePriceOfLPToken(TGEN_cUSD);
  const tokenPrice = useMemo(() => {
      return data2;
  }, [data2]);

  const rewardRate = BigInt(stakingRewardsInfo.rewardRate);
  const TVL = BigInt(stakingRewardsInfo.TVL);
  const valueOfTotalStakedAmountInCUSD = (tokenPrice) ? (BigInt(tokenPrice) * BigInt(TVL) / BigInt(1e18)) : BigInt(0);
  const valueOfTGENInUSD = (TGENPrice != BigInt(0)) ? (BigInt(TGENPrice) * BigInt(rewardRate) * BigInt(52) / BigInt(1e18)) : BigInt(0);
  
  const apr = (valueOfTotalStakedAmountInCUSD != BigInt(0)) ? BigInt(valueOfTGENInUSD) / BigInt(valueOfTotalStakedAmountInCUSD) * BigInt(100) : BigInt(0)

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
            TGEN-CELO
          </TYPE.white>
          {apy && apy.greaterThan('0') && (
            <TYPE.small className="apr" fontWeight={400} fontSize={14}>
              {apr.toString()}% APR
            </TYPE.small>
          )}
        </PoolInfo>

        <StyledInternalLink
          to={`/stake/LP`}
          style={{ width: '25%', marginLeft: '90%' }}
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
              ? TVL.toString() + ' TGEN-CELO'
              : '-'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white>TGEN rate</TYPE.white>
          <TYPE.white>
            {formatBalance(BigInt(rewardRate) / BigInt(1e18), 0)} TGEN / week
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
              {apr.toString()}%
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
