import { Token } from '@ubeswap/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  id
}: {
  currency?: Token
  size?: string
  style?: React.CSSProperties
  id?: string
}) {
  let uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  let srcs: string[] = useMemo(() => {
    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, currency.logoURI ?? currency.address]
      }

      return []
    }
    return []
  }, [currency, uriLocations])

  if (id == "deposit")
  {
    srcs = ["https://raw.githubusercontent.com/tradegen/default-token-list/master/assets/asset_mcUSD.png"]
  }

  console.log(srcs)

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
