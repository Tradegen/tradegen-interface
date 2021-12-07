import { ChainId, Token } from '@ubeswap/sdk'
import mapValues from 'lodash/mapValues'

const makeTokens = (
  addresses: { [net in ChainId]: string },
  decimals: number,
  symbol: string,
  name: string
): { [net in ChainId]: Token } => {
  return mapValues(addresses, (tokenAddress, network) => {
    return new Token(parseInt(network), tokenAddress, decimals, symbol, name)
  })
}

export const UBE = makeTokens(
  {
    [ChainId.MAINNET]: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
    [ChainId.ALFAJORES]: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
    [ChainId.BAKLAVA]: '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC',
  },
  18,
  'UBE',
  'Ubeswap'
)

export const cUSD = makeTokens(
  {
    [ChainId.MAINNET]: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    [ChainId.ALFAJORES]: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    [ChainId.BAKLAVA]: '0x62492A644A588FD904270BeD06ad52B9abfEA1aE',
  },
  18,
  'cUSD',
  'Celo Dollar'
)

export const mcUSD = makeTokens(
  {
    [ChainId.MAINNET]: '0x918146359264C492BD6934071c6Bd31C854EDBc3',
    [ChainId.ALFAJORES]: '0x71DB38719f9113A36e14F409bAD4F07B58b4730b',
    [ChainId.BAKLAVA]: '0x71DB38719f9113A36e14F409bAD4F07B58b4730b',
  },
  18,
  'mcUSD',
  'Moola Interest Bearing Celo Dollar'
)
