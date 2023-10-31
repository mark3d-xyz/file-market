import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { EthereumClient, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

import multichainConfig from '../../../../../config/multiChainConfig.json'
import { type IMultiChainConfig } from './multiChainConfigType'

export const chainsDefault = (multichainConfig as IMultiChainConfig[])
  .map(item => item.chain)
  .filter(item => {
    return (item.testnet === true) === !import.meta.env.VITE_IS_MAINNET
  })

export const projectId = import.meta.env.VITE_WEB3_MODAL_PROJECT_ID

if (!projectId) {
  throw new Error('You need to provide VITE_WEB3_MODAL_PROJECT_ID env variable')
}

export const { chains, publicClient } = configureChains(
  chainsDefault,
  [w3mProvider({ projectId }), publicProvider()],
  { pollingInterval: 3_000 },
)

const { connectors } = getDefaultWallets({
  appName: 'Filemarket',
  projectId,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)
