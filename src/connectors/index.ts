import { Alfajores, Baklava, Mainnet } from '@celo-tools/use-contractkit'
import { ChainId, parseNetwork } from '@ubeswap/sdk'

/*
const networkChainIDFromHostname: ChainId = window.location.hostname.includes('alfajores')
  ? ChainId.ALFAJORES
  : window.location.hostname.includes('baklava')
  ? ChainId.BAKLAVA
  : ChainId.MAINNET*/

const networkChainIDFromHostname: ChainId = ChainId.ALFAJORES

export const NETWORK_CHAIN_ID: ChainId = ChainId.ALFAJORES

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

export const NETWORK = Alfajores
  /*NETWORK_CHAIN_ID === ChainId.ALFAJORES
    ? Alfajores
    : NETWORK_CHAIN_ID === ChainId.MAINNET
    ? Mainnet
    : NETWORK_CHAIN_ID === ChainId.BAKLAVA
    ? Baklava
    : (() => {
        throw new Error('Unknown network ' + NETWORK_CHAIN_ID)
      })()*/

console.log('Loading Ubeswap interface at', window.location.hostname, networkChainIDFromHostname, NETWORK_CHAIN_ID)
