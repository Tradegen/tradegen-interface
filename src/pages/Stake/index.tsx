import { ErrorBoundary } from '@sentry/react'
import { JSBI } from '@ubeswap/sdk'
import { partition } from 'lodash'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import { PoolCard } from '../../components/earn/PoolCard'
import Loader from '../../components/Loader'
import { RowBetween } from '../../components/Row'
import { BIG_INT_ZERO } from '../../constants'
import {
  MOO_DUAL_POOL1,
  MOO_DUAL_POOL2,
  MOO_LP1,
  MOO_LP2,
  POOF_DUAL_LP,
  StakingInfo,
  useStakingInfo,
} from '../../state/stake/hooks'
import { ExternalLink, TYPE } from '../../theme'
const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

export default function Stake() {
  // staking info for connected account
  const stakingInfos = useStakingInfo()

  // toggle copy if rewards are inactive
  const stakingRewardsExist = true

  const allPools = useMemo(
    () =>
      // Sort staking info by highest rewards
      stakingInfos?.slice().sort((a: StakingInfo, b: StakingInfo) => {
        return JSBI.toNumber(JSBI.subtract(b.totalRewardRate.raw, a.totalRewardRate.raw))
      }),
    [stakingInfos]
  )

  const [stakedPools, unstakedPools] = useMemo(() => {
    return partition(allPools, (pool) => pool.stakedAmount && JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  }, [allPools])

  const [activePools, inactivePools] = partition(unstakedPools, (pool) => pool.active)

  return (
    <PageWrapper gap="lg" justify="center">
      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Tradegen Staking</TYPE.mediumHeader>
        </DataRow>
        <PoolSection>
          {stakingRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : (
            activePools?.map((pool) => (
              <ErrorBoundary key={pool.stakingRewardAddress}>
                <PoolCard stakingInfo={pool} />
              </ErrorBoundary>
            ))
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
