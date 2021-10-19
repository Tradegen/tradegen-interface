import { Percent, Token } from '@ubeswap/sdk'
import QuestionHelper, { LightQuestionHelper } from 'components/QuestionHelper'
import React from 'react'
import { DualRewardsInfo } from 'state/stake/useDualStakeRewards'
import styled from 'styled-components'
import { NETWORK_CHAIN_ID } from '../../connectors'
import useCUSDPrice from 'utils/useCUSDPrice'

import { BIG_INT_SECONDS_IN_WEEK, TGEN } from '../../constants'
import { StakingInfo } from '../../state/stake/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { Break, CardNoise } from './styled'
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

const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  z-index: 1;
`

interface Props {
  stakingInfo: StakingInfo
  dualRewards?: DualRewardsInfo
}

export const PoolCard: React.FC<Props> = ({ stakingInfo, dualRewards }: Props) => {
  const name = stakingInfo.name;

  const isStaking = Boolean(stakingInfo.stakedAmount && stakingInfo.stakedAmount.greaterThan('0'))

  //get the USD value of staked TGEN
  let TGENToken = new Token(NETWORK_CHAIN_ID, TGEN, 18);
  let price = useCUSDPrice(TGENToken);
  let stringPrice = price?.raw.numerator.toString();
  let stringPrice2 = price?.raw.denominator.toString();
  const TGENPrice = (stringPrice && stringPrice2) ? BigInt(BigInt(stringPrice) * BigInt(1e18) / BigInt(stringPrice2)) : BigInt(0);
  console.log(TGENPrice);

  const tokenPrice = stakingInfo.tokenPrice?.toString() ?? "0";
  const poolValue = BigInt(stakingInfo.totalStakedAmount.raw.toString()) * BigInt(tokenPrice);

  console.log(tokenPrice.toString());
  console.log(stakingInfo.totalStakedAmount.raw.toString());

  // get the background color
  const backgroundColor = '#2172E5';

  const rewardRate = BigInt(stakingInfo.totalRewardRate.numerator.toString()) * BigInt(BIG_INT_SECONDS_IN_WEEK.toString()) / BigInt(stakingInfo.totalRewardRate.denominator.toString());

  console.log(rewardRate);
  
  const valueOfTGENInUSD = (BigInt(TGENPrice) != BigInt(0)) ? (BigInt(TGENPrice) * BigInt(rewardRate) * BigInt(52) / BigInt(1e36)) : BigInt(0);
  const userValueUSD = (stakingInfo.stakedAmount && stakingInfo.totalStakedAmount && BigInt(stakingInfo.totalStakedAmount.toExact()) != BigInt(0)) ?
                        valueOfTGENInUSD * BigInt(stakingInfo.stakedAmount?.toExact()) / BigInt(stakingInfo.totalStakedAmount.toExact()) : BigInt(0);
  const apr = (BigInt(poolValue) != BigInt(0)) ? BigInt(valueOfTGENInUSD) / BigInt(poolValue) * BigInt(100) : BigInt(0)

  const apy = poolValue ? new Percent(poolValue, "1000") : undefined

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

  const showNextPoolRate =
    (stakingInfo.active && stakingInfo.nextPeriodRewards.equalTo('0')) ||
    (stakingInfo.active &&
      // If the next rate is >=1_000 change from previous rate, then show it
      Math.abs(
        parseFloat(
          stakingInfo.totalRewardRate
            ?.multiply(BIG_INT_SECONDS_IN_WEEK)
            .subtract(stakingInfo.nextPeriodRewards)
            .toFixed(0) ?? 0
        )
      ) >= 1_000) ||
    (!stakingInfo.active && stakingInfo.nextPeriodRewards.greaterThan('0'))

  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <CardNoise />

      <TopSection>
        <PoolInfo style={{ marginLeft: '8px' }}>
          <TYPE.white fontWeight={600} fontSize={[18, 24]}>
            {name}
          </TYPE.white>
          {apr && BigInt(apr) != BigInt(0) && (
            <TYPE.small className="apr" fontWeight={400} fontSize={14}>
              {apr.toString()}% APR
            </TYPE.small>
          )}
        </PoolInfo>

        <StyledInternalLink
          to={`/farm/${stakingInfo.stakingRewardAddress}`}
          style={{ width: '25%', marginLeft: '90%' }}
        >
          <ButtonPrimary padding="8px" borderRadius="8px">
            {isStaking ? 'Manage' : 'Deposit'}
          </ButtonPrimary>
        </StyledInternalLink>
      </TopSection>

      <StatContainer>
        <RowBetween>
          <TYPE.white>Total deposited</TYPE.white>
          <TYPE.white>
            {poolValue
              ? formatNumber(poolValue)
              : '-'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white>Pool rate</TYPE.white>
          <TYPE.white>
            {rewardRate.toString()} TGEN / week
          </TYPE.white>
        </RowBetween>
        {apr && BigInt(apr) != BigInt(0) && (
          <RowBetween>
            <RowFixed>
              <TYPE.white>{dualRewards ? 'Combined APR' : 'APR'}</TYPE.white>
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
              {apr ? apr.toString() + '%' : '-'}
            </TYPE.white>
          </RowBetween>
        )}

        {showNextPoolRate && (
          <RowBetween>
            <RowFixed>
              <TYPE.white>Next pool rate</TYPE.white>
              <LightQuestionHelper text="The rate of emissions this pool will receive on the next rewards refresh." />
            </RowFixed>
            <TYPE.white>
              {`${stakingInfo.nextPeriodRewards.toFixed(0, {
                groupSeparator: ',',
              })} TGEN / week`}
            </TYPE.white>
          </RowBetween>
        )}
      </StatContainer>

      {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <RowBetween>
              <TYPE.black color={'white'} fontWeight={500}>
                <span>Your rate</span>
              </TYPE.black>

              <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
                <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                  ⚡
                </span>
                {stakingInfo
                  ? `${
                      stakingInfo.active
                        ? stakingInfo.ubeRewardRate
                            ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                            ?.toSignificant(4, { groupSeparator: ',' })
                        : '0'
                    } TGEN / week`
                  : '-'}
              </TYPE.black>
            </RowBetween>
            {userValueUSD && BigInt(userValueUSD) != BigInt(0) && (
              <RowBetween>
                <TYPE.black color={'white'} fontWeight={500}>
                  <span>Your stake</span>
                </TYPE.black>

                <RowFixed>
                  <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
                    {formatNumber(userValueUSD)}
                  </TYPE.black>
                </RowFixed>
              </RowBetween>
            )}
          </BottomSection>
        </>
      )}
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
