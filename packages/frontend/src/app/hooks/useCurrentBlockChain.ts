import { useStores } from './useStores'

/**
 * Component, using this hook, MUST be wrapped into observer.
 * Returned store contains open orders and status fields like isLoading, isLoaded
 */
export function useCurrentBlockChain() {
  const { currentBlockChainStore } = useStores()

  return currentBlockChainStore
}
