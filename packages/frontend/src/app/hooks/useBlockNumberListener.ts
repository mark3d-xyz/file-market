import { useEffect } from 'react'
import { useNetwork } from 'wagmi'

import { wagmiConfig } from '../config/web3Modal'
import { useStores } from './useStores'

export const useBlockNumberListener = () => {
  const { chain } = useNetwork()
  const { blockStore } = useStores()
  useEffect(() => {
    const unsubscribe = wagmiConfig.publicClient.watchBlockNumber(
      {
        onBlockNumber: blockNumber => {
          blockStore.setCurrentBlock(blockNumber)
        },
        pollingInterval: 5000,
        emitOnBegin: true,
      },
    )

    return () => {
      unsubscribe()
    }
  }, [chain?.id])
}
