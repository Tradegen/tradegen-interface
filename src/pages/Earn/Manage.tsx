import { useContractKit } from '@celo-tools/use-contractkit'
import { cUSD, JSBI, Token } from '@ubeswap/sdk'
import React, { useCallback, useState } from 'react'
import { Link, RouteComponentProps, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { CountUp } from 'use-count-up'
import useCUSDPrice from 'utils/useCUSDPrice'
import { NETWORK_CHAIN_ID } from '../../connectors'

import { ButtonEmpty, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import StakingModal from '../../components/earn/StakingModal'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import UnstakingModal from '../../components/earn/UnstakingModal'
import { RowBetween, RowFixed } from '../../components/Row'
import { BIG_INT_SECONDS_IN_WEEK, BIG_INT_ZERO, TGEN, ZERO_ADDRESS } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { useWalletModalToggle } from '../../state/application/hooks'
import { usePairStakingInfo, useTokenBalancePerClass, useStakedBalancePerClass } from '../../state/stake/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLinkIcon, TYPE } from '../../theme'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export default function Manage({
  match: {
    params: { stakingAddress },
  },
}: RouteComponentProps<{ stakingAddress: string }>) {
  const { address: account, network } = useContractKit()

  const stakingInfo = usePairStakingInfo(undefined, stakingAddress)

  console.log(stakingInfo);

  const name = stakingInfo?.name ?? "";
  const poolAddress = stakingInfo?.stakingToken.address ?? ZERO_ADDRESS;

  const tokenBalancesPerClass = useTokenBalancePerClass(poolAddress, account ?? ZERO_ADDRESS);
  console.log(tokenBalancesPerClass);

  const stakedC1 = useStakedBalancePerClass(stakingAddress, account ?? ZERO_ADDRESS, 1) ?? BigInt(0);
  const stakedC2 = useStakedBalancePerClass(stakingAddress, account ?? ZERO_ADDRESS, 2) ?? BigInt(0);
  const stakedC3 = useStakedBalancePerClass(stakingAddress, account ?? ZERO_ADDRESS, 3) ?? BigInt(0);
  const stakedC4 = useStakedBalancePerClass(stakingAddress, account ?? ZERO_ADDRESS, 4) ?? BigInt(0);

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  const availableC1 = tokenBalancesPerClass[0] ?? BigInt(0);
  const availableC2 = tokenBalancesPerClass[1] ?? BigInt(0);
  const availableC3 = tokenBalancesPerClass[2] ?? BigInt(0);
  const availableC4 = tokenBalancesPerClass[3] ?? BigInt(0);

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const backgroundColor = '#2172E5';

  //get the USD value of staked TGEN
  let TGENToken = new Token(NETWORK_CHAIN_ID, TGEN, 18);
  let price = useCUSDPrice(TGENToken);
  let stringPrice = price?.raw.numerator.toString();
  let stringPrice2 = price?.raw.denominator.toString();
  const TGENPrice = (stringPrice && stringPrice2) ? BigInt(BigInt(stringPrice) * BigInt(1e18) / BigInt(stringPrice2)) : BigInt(0);
  console.log(TGENPrice);

  const totalStakedAmount = stakingInfo?.totalStakedAmount ? stakingInfo?.totalStakedAmount.raw.toString() : "0";
  const totalRewardRateNumerator = stakingInfo?.totalRewardRate ? stakingInfo?.totalRewardRate.numerator.toString() : "0";
  const totalRewardRateDenominator = stakingInfo?.totalRewardRate ? stakingInfo?.totalRewardRate.denominator.toString() : "0";

  const tokenPrice = stakingInfo?.tokenPrice?.toString() ?? "0";
  const poolValue = BigInt(totalStakedAmount) * BigInt(tokenPrice);

  const rewardRate = totalRewardRateDenominator == "0" ? BigInt(0) : BigInt(totalRewardRateNumerator) * BigInt(BIG_INT_SECONDS_IN_WEEK.toString()) / BigInt(totalRewardRateDenominator);

  console.log(rewardRate);
  
  const valueOfTGENInUSD = (BigInt(TGENPrice) != BigInt(0)) ? (BigInt(TGENPrice) * BigInt(rewardRate) * BigInt(52) / BigInt(1e36)) : BigInt(0);
  const userValueUSD = (stakingInfo?.stakedAmount && stakingInfo?.totalStakedAmount && BigInt(stakingInfo.totalStakedAmount.toExact()) != BigInt(0)) ?
                        valueOfTGENInUSD * BigInt(stakingInfo.stakedAmount?.toExact()) / BigInt(stakingInfo.totalStakedAmount.toExact()) : BigInt(0);
  const apr = (BigInt(poolValue) != BigInt(0)) ? BigInt(valueOfTGENInUSD) / BigInt(poolValue) * BigInt(100) : BigInt(0)

  const ubeCountUpAmount = stakingInfo?.earnedAmountUbe?.toFixed(6) ?? '0'
  const ubeCountUpAmountPrevious = usePrevious(ubeCountUpAmount) ?? '0'
  const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {name} - Farming
        </TYPE.mediumHeader>
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total staked</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {poolValue
                ? '$' + poolValue
                : '-'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo?.active
                ? rewardRate.toString() ??
                  '-'
                : '0'}
              {` TGEN / week`}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            availableC1={availableC1.toString()}
            availableC2={availableC2.toString()}
            availableC3={availableC3.toString()}
            availableC4={availableC4.toString()}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
            availableC1={stakedC1.toString()}
            availableC2={stakedC2.toString()}
            availableC3={stakedC3.toString()}
            availableC4={stakedC4.toString()}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}

      {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get NFT pool tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`NFT pool tokens are required. Once you've in the the '${name}' pool you can stake your pool tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={poolAddress ? `/NFTPool/${poolAddress}` : '/investments'}
              >
                {`Invest in '${name}'`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your stake</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakedC1.toString() ?? '-'}
                  </TYPE.white>
                  <RowFixed>
                    <TYPE.white>
                      C1 pool tokens
                    </TYPE.white>
                  </RowFixed>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakedC2.toString() ?? '-'}
                  </TYPE.white>
                  <RowFixed>
                    <TYPE.white>
                      C2 pool tokens
                    </TYPE.white>
                  </RowFixed>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakedC3.toString() ?? '-'}
                  </TYPE.white>
                  <RowFixed>
                    <TYPE.white>
                      C3 pool tokens
                    </TYPE.white>
                  </RowFixed>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakedC4.toString() ?? '-'}
                  </TYPE.white>
                  <RowFixed>
                    <TYPE.white>
                      C4 pool tokens
                    </TYPE.white>
                  </RowFixed>
                </RowBetween>
                {stakingInfo?.stakedAmount && stakingInfo.stakedAmount.greaterThan('0') && (
                  <RowBetween>
                    <RowFixed>
                      <TYPE.white>
                        Current value:{' '}
                        {userValueUSD
                          ? `${formatNumber(userValueUSD)}`
                          : '--'}
                      </TYPE.white>
                    </RowFixed>
                  </RowBetween>
                )}
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
            <CardNoise />
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>Your unclaimed rewards</TYPE.black>
                </div>
                {((stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw)) ||
                  (stakingInfo?.earnedAmountUbe && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmountUbe?.raw))) && (
                  <ButtonEmpty
                    padding="8px"
                    borderRadius="8px"
                    width="fit-content"
                    onClick={() => setShowClaimRewardModal(true)}
                  >
                    Claim
                  </ButtonEmpty>
                )}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={ubeCountUpAmount}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(ubeCountUpAmountPrevious)}
                    end={parseFloat(ubeCountUpAmount)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                  </span>
                  {stakingInfo?.active
                    ? stakingInfo?.ubeRewardRate
                        ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                        ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'
                    : '0'}
                  {`TGEN / week`}
                </TYPE.black>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          When you withdraw, the contract will automagically claim TGEN on your behalf!
        </TYPE.main>

        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem' }}>
            {stakingInfo && stakingInfo.active && (
              <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit NFT pool Tokens'}
              </ButtonPrimary>
            )}

            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                  Withdraw
                </ButtonPrimary>
              </>
            )}
            {stakingInfo && !stakingInfo.active && (
              <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
                Staking Rewards inactive for this pair.
              </TYPE.main>
            )}
          </DataRow>
        )}
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : !stakingInfo?.active ? null : (
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} NFT pool tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
