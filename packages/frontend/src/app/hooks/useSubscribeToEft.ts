import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { type EFTSubscriptionRequest } from '../../swagger/Api'
import { type Params } from '../utils/router'
import { useChainStore } from './useChainStore'
import { useStores } from './useStores'

interface IUseSubscribeToEft {
  isDisableListener?: boolean
}

export const useSubscribeToEft = (props?: IUseSubscribeToEft) => {
  const { collectionAddress, tokenId, chainName } = useParams<Params>()
  const { socketStore } = useStores()

  const chainStore = useChainStore(chainName)

  const subscribe = (params: EFTSubscriptionRequest, chainName?: string) => {
    socketStore.subscribeToEft(params, chainStore.selectedChain?.chain.id)
  }

  useEffect(() => {
    if (!props?.isDisableListener) socketStore.subscribeToEft({ collectionAddress, tokenId }, chainStore.selectedChain?.chain.id)
  }, [props?.isDisableListener, chainName, collectionAddress, tokenId])

  return {
    subscribe,
  }
}
