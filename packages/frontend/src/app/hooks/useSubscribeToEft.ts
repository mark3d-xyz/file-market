import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { type EFTSubscriptionRequest } from '../../swagger/Api'
import { type Params } from '../utils/router'
import { useChainStore } from './useChainStore'
import { useCurrentBlockChain } from './useCurrentBlockChain'
import { useStores } from './useStores'

interface IUseSubscribeToEft {
  isDisableListener?: boolean
  isPageContainChain?: boolean
}

export const useSubscribeToEft = (props?: IUseSubscribeToEft) => {
  const { collectionAddress, tokenId, chainName } = useParams<Params>()
  const { socketStore } = useStores()

  const chainStore = useChainStore(chainName)
  const currentBlockChainStore = useCurrentBlockChain()

  const chainId = useMemo(() => {
    return props?.isPageContainChain && chainStore?.selectedChain ? chainStore.selectedChain?.chain.id : currentBlockChainStore?.chainId
  }, [props?.isPageContainChain, currentBlockChainStore.chainId, chainStore?.selectedChain])

  const subscribe = (params: EFTSubscriptionRequest) => {
    socketStore.subscribeToEft(params, chainId)
  }

  useEffect(() => {
    console.log(chainId)
    if (!props?.isDisableListener) socketStore.subscribeToEft({ collectionAddress, tokenId }, chainId)
  }, [props?.isDisableListener, chainId, collectionAddress, tokenId])

  return {
    subscribe,
  }
}
