import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { FC } from 'react'
import { configureChains, createClient } from 'wagmi'
import { Buffer } from 'buffer'
import multichainConfig from '../../../../../config/multiChainConfig.json'
import { theme } from '../../styles'
import { IMultiChainConfig } from './multiChainConfigType'

export const chains = (JSON.parse(JSON.stringify(multichainConfig)) as IMultiChainConfig[])
  .map(item => item.chain)
  .filter(item => {
    return (item.testnet === true) === !import.meta.env.VITE_IS_MAINNET
  })

export const projectId = import.meta.env.VITE_WEB3_MODAL_PROJECT_ID

if (typeof window !== 'undefined') {
    if (!window.Buffer) {
        window.Buffer = Buffer
    }
    if (!window.global) {
        window.global = window
    }
    if (!window.process) {
        // @ts-expect-error minimal process
        window.process = { env: {} }
    }
}
if (!projectId) {
  throw new Error('You need to provide VITE_WEB3_MODAL_PROJECT_ID env variable')
}

const { provider, webSocketProvider } = configureChains(chains, [
  w3mProvider({ projectId }),
])

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  provider,
  webSocketProvider,
})

const ethereumClient = new EthereumClient(wagmiClient, chains)

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
