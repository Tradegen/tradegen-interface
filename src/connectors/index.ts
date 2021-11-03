import { Alfajores, Baklava, Mainnet } from '@celo-tools/use-contractkit'
import { ChainId, parseNetwork } from '@ubeswap/sdk'

const networkChainIDFromHostname: ChainId = ChainId.MAINNET

export const NETWORK_CHAIN_ID: ChainId = ChainId.MAINNET

const chainIdToName = (chainId: ChainId): string => {
  switch (chainId) {
    case ChainId.ALFAJORES:
      return 'alfajores'
    case ChainId.BAKLAVA:
      return 'baklava'
    case ChainId.MAINNET:
      return 'mainnet'
    default:
      return 'unknown'
  }
}

export const NETWORK_CHAIN_NAME: string = chainIdToName(NETWORK_CHAIN_ID)

export const NETWORK = Mainnet

console.log('Loading Ubeswap interface at', window.location.hostname, networkChainIDFromHostname, NETWORK_CHAIN_ID)
