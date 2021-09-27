import { Interface } from '@ethersproject/abi'

import NFT_POOL_ABI from './NFTPool.json'

const NFT_POOL_INTERFACE = new Interface(NFT_POOL_ABI)

export default NFT_POOL_INTERFACE
