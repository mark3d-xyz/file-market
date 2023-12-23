import { useCallback, useEffect, useState } from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'

import { stringifyError } from '../utils/error'
import { type IStoreRequester } from '../utils/store'
import { useAuth } from './useAuth'
import { useCurrentBlockChain } from './useCurrentBlockChain'
import { useMultiChainStore } from './useMultiChainStore'
import { useStores } from './useStores'

export const useChangeNetwork = (props?: { onSuccess?: (chainId?: number) => void, onError?: () => void }) => {
  const currentChainStore = useCurrentBlockChain()
  const multiChainStore = useMultiChainStore()
  const [isCanConnectAfterChange, setIsCanConnectAfterChange] = useState<boolean>(false)
  const { isConnected } = useAccount()
  const { connect } = useAuth()
  const rootStore = useStores()
  const { switchNetwork, error, isLoading } = useSwitchNetwork({
    onSuccess: (data) => {
      currentChainStore.setCurrentBlockChain(data.id)
      props?.onSuccess?.(data.id)
      reloadStores()
    },
    onError: (error) => {
      props?.onError?.()
    },
  })

  function isIStoreRequest(object: any): object is IStoreRequester {
    return 'reload' in object
  }

  const getActiveStores = () => {
    const result = []
    for (const key in rootStore) {
      // eslint-disable-next-line no-prototype-builtins
      if (rootStore.hasOwnProperty(key)) {
        const value = rootStore[key as keyof typeof rootStore]
        // eslint-disable-next-line no-prototype-builtins
        if (isIStoreRequest(value) && value.isActivated && !value.hasOwnProperty('isCustomApi')) {
          result.push(value)
        }
      }
    }

    return result
  }

  const reloadStores = () => {
    const activeStores = getActiveStores()
    let iter = 0
    const interval = setInterval(() => {
      iter++
      if (!activeStores.find((item) => item.isLoading) || iter > 3) {
        activeStores.forEach((item) => { item.reload() })
        clearInterval(interval)
      }
    }, 1000)
  }
  const { chain } = useNetwork()

  useEffect(() => {
    if (isCanConnectAfterChange) {
      connect()
      setIsCanConnectAfterChange(false)
    }
  }, [isCanConnectAfterChange])

  useEffect(() => {
    if (error) {
      rootStore.errorStore.showError(stringifyError(error !== null ? error : undefined))
    }
  }, [error])

  const changeNetwork = useCallback((chainId: number | undefined, isWarningNetwork?: boolean) => {
    console.log(isConnected)
    if (!isConnected) {
      if (!!multiChainStore.getChainById(chainId)?.chain) {
        setIsCanConnectAfterChange(true)
      } else {
        connect()
      }

      return
    }

    console.log('tik1')

    // Меняем сеть, если сеть в сторе !== сети кошелька или если сеть кошелька просто не равна переданной сети
    if ((currentChainStore.chainId !== chainId || isWarningNetwork) || chain?.id !== chainId) {
      if (!switchNetwork) {
        rootStore.errorStore.showError('Wallet not supported change network')
      }
      switchNetwork?.(chainId)
    }
    // Меняем значение в сторе, если текущая сеть кошелька !== переданной сети
    if (chain?.id === chainId) {
      console.log('tik2')
      currentChainStore.setCurrentBlockChain(chainId ?? 0)
      reloadStores()
    }
  }, [currentChainStore.chainId, isConnected, chain, switchNetwork])

  return {
    changeNetwork,
    chain,
    isLoading,
    error,
  }
}
