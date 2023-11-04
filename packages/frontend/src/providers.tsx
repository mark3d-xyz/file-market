import { NextUIProvider } from '@nextui-org/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type FC, type PropsWithChildren } from 'react'
import { WagmiConfig } from 'wagmi'

import { DialogManager } from './app/components/DialogManager/DialogManager'
import { BlockNumberWatcher } from './app/components/Web3/BlockNumberWatcher/BlockNumberWatcher'
import { FileWalletConnectWatcher } from './app/components/Web3/FileWalletConnectWatcher'
import { chains, wagmiConfig } from './app/config/web3Modal'
import { StoreProvider, useStores } from './app/hooks'
import { StitchesProvider } from './styles'

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = new QueryClient()

  useStores()

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <StitchesProvider>
            <NextUIProvider disableBaseline>
              <StoreProvider>
                {children}
                <DialogManager />
              </StoreProvider>
            </NextUIProvider>
          </StitchesProvider>
          <FileWalletConnectWatcher />
          <BlockNumberWatcher />
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}
