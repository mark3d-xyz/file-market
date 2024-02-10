import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useNetwork } from 'wagmi'

import { chains } from '../config/web3Modal'
import { type Params } from '../utils/router'
import { useActivateDeactivateRequireParams } from './useActivateDeactivateStore'
import { useChangeNetwork } from './useChangeNetwork'
import { useCurrentBlockChain } from './useCurrentBlockChain'
import { useMultiChainStore } from './useMultiChainStore'

export const useListenNetwork = () => {
  const { chain } = useNetwork()
  useMultiChainStore()
  const currentChainStore = useCurrentBlockChain()
  // стор активируется только в этом компоненте, чтобы быть уверенным, что это происходит один раз
  useActivateDeactivateRequireParams(currentChainStore)
  const { changeNetwork } = useChangeNetwork()
  const { chainName } = useParams<Params>()
  const location = useLocation()
  useEffect(() => {
    currentChainStore.setCurrentBlockChainByPage(chainName)
  }, [location])

  useEffect(() => {
    if (!chain) return
    if (chain?.id !== currentChainStore.chainId && chains.find(item => item.id === chain?.id)) changeNetwork(chain?.id)
  }, [chain])
}
