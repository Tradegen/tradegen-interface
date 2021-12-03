import moolaRouterAddresses from '@ubeswap/moola/deployments/router.mainnet.addresses.json'
import { CELO, ChainId, cUSD, JSBI, Percent, Token } from '@ubeswap/sdk'

import { UBE } from './tokens'

export { UBE } from './tokens'

export const ROUTER_ADDRESS = '0xe3d8bd6aed4f159bc8000a9cd47cffdb95f96121'

export const UBESWAP_MOOLA_ROUTER_ADDRESS = moolaRouterAddresses.UbeswapMoolaRouter

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// a list of tokens by chain
type ChainTokenList = {
  // readonly [chainId in ChainId]: Token[]
  readonly [chainId: number]: Token[]
}

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const MCUSD = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x64dEFa3544c695db8c535D289d843a189aa26b98',
    18,
    'mCUSD',
    'Moola cUSD'
  ),
  [ChainId.ALFAJORES]: new Token(
    ChainId.ALFAJORES,
    '0x71DB38719f9113A36e14F409bAD4F07B58b4730b',
    18,
    'mCUSD',
    'Moola cUSD'
  ),
}

export const MCELO = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x7037F7296B2fc7908de7b57a89efaa8319f0C500',
    18,
    'mCELO',
    'Moola CELO'
  ),
  [ChainId.ALFAJORES]: new Token(
    ChainId.ALFAJORES,
    '0x86f61EB83e10e914fc6F321F5dD3c2dD4860a003',
    18,
    'mCELO',
    'Moola CELO'
  ),
}

export const MCEUR = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0xa8d0E6799FF3Fd19c6459bf02689aE09c4d78Ba7',
    18,
    'mCEUR',
    'Moola Celo Euro'
  ),
  [ChainId.ALFAJORES]: new Token(
    ChainId.ALFAJORES,
    '0x32974C7335e649932b5766c5aE15595aFC269160',
    18,
    'mCEUR',
    'Moola Celo Euro'
  ),
}

export const CEUR = {
  [ChainId.ALFAJORES]: new Token(
    ChainId.ALFAJORES,
    '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    18,
    'cEUR',
    'Celo Euro'
  ),
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', 18, 'cEUR', 'Celo Euro'),
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [cUSD, CELO, CEUR, UBE, MCUSD, MCEUR, MCELO].map((el) => el[ChainId.MAINNET]),
  [ChainId.ALFAJORES]: [cUSD, CELO, CEUR].map((el) => el[ChainId.ALFAJORES]),
  [ChainId.BAKLAVA]: [cUSD, CELO].map((el) => el[ChainId.BAKLAVA]),
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...BASES_TO_CHECK_TRADES_AGAINST,
  [ChainId.MAINNET]: [MCUSD, MCEUR, CELO].map((el) => el[ChainId.MAINNET]),
  [ChainId.ALFAJORES]: [MCUSD, MCEUR, CELO].map((el) => el[ChainId.ALFAJORES]),
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = BASES_TO_CHECK_TRADES_AGAINST

export const PINNED_PAIRS: { [chainId: number]: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [cUSD, CELO],
    [MCUSD, CELO],
    [MCEUR, CELO],
    [MCUSD, UBE],
    [MCEUR, UBE],
  ].map((el) => el.map((t) => t[ChainId.MAINNET]) as [Token, Token]),
  [ChainId.ALFAJORES]: [
    [cUSD, CELO],
    [MCUSD, CELO],
  ].map((el) => el.map((t) => t[ChainId.ALFAJORES]) as [Token, Token]),
  [ChainId.BAKLAVA]: [[cUSD[ChainId.BAKLAVA], CELO[ChainId.BAKLAVA]]],
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const POOL_FACTORY_ADDRESS = '0xf3522C175F37e190582384F2F51fAc6c8934349A'
export const NFT_POOL_FACTORY_ADDRESS = '0xabD104da77bdD63175A4172715Dffb2b98E24251'

export const TRADEGEN_STAKING_REWARDS_ADDRESS = ''
export const TRADEGEN_STAKING_ESCROW_ADDRESS = ''
export const TRADEGEN_LP_STAKING_REWARDS_ADDRESS = ''
export const TRADEGEN_LP_STAKING_ESCROW_ADDRESS = ''
export const BASE_UBESWAP_ADAPTER_ADDRESS = '0x4387A2F84e6448C3b9C6F1FeC8A111c5c7f4de51'
export const UBESWAP_LP_TOKEN_PRICE_AGGREGATOR_ADDRESS = '0x620944345d7A7f792aC22947aFBB5567ae231B46'

export const POOL_MANAGER_ADDRESS = "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2";

export const TGEN = ''
export const TGEN_cUSD = ""