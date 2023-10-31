import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { EthereumClient, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { type FC } from 'react'
import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

import multichainConfig from '../../../../../config/multiChainConfig.json'
import { theme } from '../../styles'
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

// Montserrat, sans-serif
export const Web3ModalConfigured: FC = () => (
  <Web3Modal
    projectId={projectId}
    themeMode="light"
    ethereumClient={ethereumClient}
    themeVariables={{
      '--w3m-font-family': theme.fonts.primary.value,
      '--w3m-accent-color': theme.colors.blue500.value,
      '--w3m-z-index': '9999',
    }}
  />
)
