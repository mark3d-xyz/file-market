import { type Chain } from 'wagmi'

export interface IMultiChainConfig {
  chain: Chain
  img: string
  imgGray: string
  likeEmitterAddress: `0x${string}`
  accessTokenAddress: `0x${string}`
  exchangeTokenAddress: `0x${string}`
  isDefault?: boolean
  baseUrl: string
  explorer: string
  wsUrl: string
  hacks?: {
    // FileCoin and ZkSync testnets need ridiculously high gas price to process transaction
    gasPrice?: string
  }
}
