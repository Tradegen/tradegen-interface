import { useContractKit } from '@celo-tools/use-contractkit'
import { Token } from '@ubeswap/sdk'
import React, { useCallback, useState, useMemo } from 'react'
import { Link, RouteComponentProps, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { CountUp } from 'use-count-up'
import { NETWORK_CHAIN_ID } from '../../connectors'

import { ButtonEmpty, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import { RowBetween, RowFixed } from '../../components/Row'
import { BIG_INT_SECONDS_IN_WEEK, ZERO_ADDRESS, TGEN_cUSD } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLinkIcon, TYPE } from '../../theme'
import { useTradegenLPStakingRewardsInfo, useUserTradegenLPStakingInfo, usePriceOfLPToken, useNextVestingEntry } from '../../features/stake/hooks'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'
import StakingModal from '../../components/Stake/DepositModalLP'
import ClaimRewardModal from '../../components/Stake/ClaimRewardModalLP'
import UnstakingModal from '../../components/Stake/WithdrawModalLP'

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

export default function ManageLP() {
    let { address: account, network } = useContractKit()
    account = account ?? ZERO_ADDRESS;

    let data = useTradegenLPStakingRewardsInfo();
    const stakingRewardsInfo = useMemo(() => {
        return data;
    }, [data]);
  
    let data2 = useUserTradegenLPStakingInfo(account);
    const userStakingInfo = useMemo(() => {
        return data2;
    }, [data2]);
    console.log(userStakingInfo);

    let data3 = usePriceOfLPToken(TGEN_cUSD);
    const tokenPrice = useMemo(() => {
        return data3;
    }, [data3]);

    let data4 = useNextVestingEntry(account);
    const vestingEntry = useMemo(() => {
        return data4;
    }, [data4]);

    console.log(data4)

    const nextVestTimestamp = vestingEntry ? vestingEntry[0] : BigInt(0);
    const nextVestQuantity = vestingEntry ? vestingEntry[1] : BigInt(0);

    console.log(Number(nextVestTimestamp.toString()));
    console.log(formatBalance(nextVestQuantity));

    const userTokensStaked = userStakingInfo[0];
    const userRewardsEarned = userStakingInfo[1];
    const totalSupply = userStakingInfo[2];

    const rewardRate = BigInt(stakingRewardsInfo.rewardRate);
    const TVL = BigInt(stakingRewardsInfo.TVL);
    const valueOfTotalStakedAmountInCUSD = (tokenPrice) ? (BigInt(tokenPrice) * TVL / BigInt(1e18)) : undefined;
    const userValueInCUSD = (tokenPrice) ? (BigInt(tokenPrice) * BigInt(userTokensStaked) / BigInt(1e18)) : undefined;
    const userRewardRate = (BigInt(totalSupply) == BigInt(0)) ? BigInt(0) : BigInt(rewardRate) * BigInt(userTokensStaked) / BigInt(totalSupply);
  
    // detect existing unstaked LP position to show add button if none found
    const userLiquidityUnstaked = useTokenBalance(account, new Token(NETWORK_CHAIN_ID, TGEN_cUSD, 18))
    const showAddLiquidityButton = Boolean(userTokensStaked.toString() == "0" && userLiquidityUnstaked?.equalTo('0'))

    // toggle for staking modal and unstaking modal
    const [showStakingModal, setShowStakingModal] = useState(false)
    const [showUnstakingModal, setShowUnstakingModal] = useState(false)
    const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

    // fade cards if nothing staked or nothing earned yet
    const disableTop = Boolean(userTokensStaked.toString() == "0")

    const backgroundColor = '#2172E5';

    const ubeCountUpAmount = formatBalance(userRewardsEarned) ?? '0'
    const ubeCountUpAmountPrevious = usePrevious(ubeCountUpAmount) ?? '0'
    const countUpAmount = formatBalance(userRewardsEarned) ?? '0'
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
          TGEN-cUSD Staking
        </TYPE.mediumHeader>
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total staked</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {valueOfTotalStakedAmountInCUSD
                ? '$' + valueOfTotalStakedAmountInCUSD
                : '-'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {formatBalance(BigInt(rewardRate) / BigInt(1e18), 0)} TGEN / week
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
            <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get TGEN tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`TGEN tokens are required. After you have TGEN tokens, you can stake them on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={`https://app.ubeswap.org/#/swap`}
              >
                {`Add TGEN-cUSD liquidity`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )}

      <StakingModal
          isOpen={showStakingModal}
          onDismiss={() => setShowStakingModal(false)}
          TGENBalance={userLiquidityUnstaked?.raw.toString()}
      />
      <UnstakingModal
          isOpen={showUnstakingModal}
          onDismiss={() => setShowUnstakingModal(false)}
          tokenBalance={userTokensStaked ? userTokensStaked.toString() : "0"}
      />
      <ClaimRewardModal
        isOpen={showClaimRewardModal}
        onDismiss={() => setShowClaimRewardModal(false)}
        availableRewards={userRewardsEarned ? userRewardsEarned.toString() : "0"}
      />

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
                    {formatBalance(userTokensStaked.toString())}
                  </TYPE.white>
                  <RowFixed>
                    <TYPE.white>
                      TGEN-cUSD
                    </TYPE.white>
                  </RowFixed>
                </RowBetween>
                {userTokensStaked && userTokensStaked.toString() != "0" && (
                  <RowBetween>
                    <RowFixed>
                      <TYPE.white>
                        Current value:{' '}
                        {userValueInCUSD
                          ? `$${formatBalance(userValueInCUSD)}`
                          : '--'}
                      </TYPE.white>
                    </RowFixed>
                  </RowBetween>
                )}
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={!userTokensStaked || userTokensStaked.toString() == "0"}>
            <CardNoise />
            <AutoColumn gap="sm">
                <RowBetween>
                    <div>
                    <TYPE.black>Your unclaimed rewards</TYPE.black>
                    </div>
                    {userRewardsEarned && userRewardsEarned.toString() != "0" && (
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
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(ubeCountUpAmountPrevious.toString())}
                    end={parseFloat(ubeCountUpAmount.toString())}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                  </span>
                  {userRewardRate ? formatBalance(userRewardRate / BigInt(1e18), 0)
                    : '0'}
                  {` TGEN / week`}
                </TYPE.black>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          When you withdraw, the contract will automagically claim TGEN rewards on your behalf!
        </TYPE.main>

        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem' }}>
            <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
              {userTokensStaked.toString() != "0" ? 'Deposit' : 'Deposit TGEN-cUSD tokens'}
            </ButtonPrimary>

            {userTokensStaked && userTokensStaked.toString() != "0" && (
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
          </DataRow>
        )}
        {userLiquidityUnstaked && userLiquidityUnstaked.toString() != "0" && (
          <TYPE.main>{formatBalance(userLiquidityUnstaked.raw.toString())} TGEN-cUSD tokens available</TYPE.main>
        )}
        {nextVestQuantity.toString() != "0" && nextVestTimestamp.toString() != "0" && (
            <>
          <TYPE.main>Next vesting timestamp: {Number(nextVestTimestamp.toString())}</TYPE.main>
          <TYPE.main>Next vesting quantity: {formatBalance(nextVestQuantity)} TGEN-cUSD</TYPE.main>
          </>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}