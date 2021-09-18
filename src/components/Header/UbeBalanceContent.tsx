import { useContractKit } from '@celo-tools/use-contractkit'
import { ChainId, TokenAmount, Token } from '@ubeswap/sdk'
import Loader from 'components/Loader'
import React, { useCallback, useState, useMemo } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import useCUSDPrice from 'utils/useCUSDPrice'

import tokenLogo from '../../assets/images/token.JPG'
import { UBE } from '../../constants'
import { useTotalSupply } from '../../data/TotalSupply'
import { useTotalUbeEarned } from '../../state/stake/hooks'
import { useAggregateTGENBalance, useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink, StyledInternalLink, TYPE, UbeTokenAnimated } from '../../theme'
import { AutoColumn } from '../Column'
import { Break, CardNoise, CardSection, DataCard } from '../earn/styled'
import { RowBetween } from '../Row'
import { useCirculatingSupply } from './useCirculatingSupply'
import { NETWORK_CHAIN_ID } from '../../connectors'
import { TGEN, ZERO_ADDRESS } from '../../constants'
import { useTradegenStakingRewardsInfo, useUserTradegenStakingInfo } from '../../features/stake/hooks'
import { formatNumber, formatPercent, formatBalance } from '../../functions/format'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: #252e42;
  padding: 0.5rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

/**
 * Content for balance stats modal
 */
export default function UbeBalanceContent({ setShowUbeBalanceModal }: { setShowUbeBalanceModal: any }) {
  let { address: account, network } = useContractKit()
  const chainId = network.chainId
  const ube = chainId ? UBE[chainId] : undefined
  account = account ?? ZERO_ADDRESS;

  let data = useUserTradegenStakingInfo(account);
  const userStakingInfo = useMemo(() => {
      return data;
  }, [data]);
  console.log(userStakingInfo);

  const userRewardsEarned = data[1] ?? BigInt(0);

  const total = useAggregateTGENBalance()
  const ubeBalance = total;
  const ubeToClaim: TokenAmount | undefined = useTotalUbeEarned()

  const totalSupply: TokenAmount | undefined = useTotalSupply(new Token(NETWORK_CHAIN_ID, TGEN, 18))
  const ubePrice = useCUSDPrice(new Token(NETWORK_CHAIN_ID, TGEN, 18))
  const deployerBalance = useTokenBalance("0xb10199414D158A264e25A5ec06b463c0cD8457Bb", new Token(NETWORK_CHAIN_ID, TGEN, 18)) ?? new TokenAmount(new Token(NETWORK_CHAIN_ID, TGEN, 18), '0')
  const circulatingSupply = (totalSupply && deployerBalance) ? Number(totalSupply?.toFixed(2)) - Number(deployerBalance.toFixed(2)) : 0;
  const circulation = new TokenAmount(new Token(NETWORK_CHAIN_ID, TGEN, 0), circulatingSupply.toString());

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color="white">Your TGEN Breakdown</TYPE.white>
            <StyledClose stroke="white" onClick={() => setShowUbeBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <UbeTokenAnimated width="48px" src={tokenLogo} />{' '}
                <TYPE.white fontSize={48} fontWeight={600} color="white">
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.white>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white color="white">Balance:</TYPE.white>
                  <TYPE.white color="white">{ubeBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">Unclaimed:</TYPE.white>
                  <TYPE.white color="white">
                    {formatBalance(BigInt(userRewardsEarned) / BigInt(1e14), 4)} TGEN
                    {ubeToClaim && ubeToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUbeBalanceModal(false)} to="/stake">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <Break />
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white color="white">TGEN price:</TYPE.white>
              <TYPE.white color="white">${ubePrice?.toFixed(2) ?? '-'}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">TGEN in circulation:</TYPE.white>
              <TYPE.white color="white">{circulation?.toFixed(0, { groupSeparator: ',' }) ?? <Loader />}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">Total Supply</TYPE.white>
              <TYPE.white color="white">{totalSupply?.toFixed(0, { groupSeparator: ',' }) ?? <Loader />}</TYPE.white>
            </RowBetween>
            {ube && ube.chainId === ChainId.MAINNET ? (
              <ExternalLink href={`https://info.ubeswap.org/token/${ube.address}`}>View TGEN Analytics</ExternalLink>
            ) : null}
          </AutoColumn>
        </CardSection>
        <CardNoise />
      </ModalUpper>
    </ContentWrapper>
  )
}
