import { useActivateDeactivateRequireParams } from './useActivateDeactivateStore'
import { useStores } from './useStores'

/**
 * Component, using this hook, MUST be wrapped into observer.
 * Supports repeated usage in nested components.
 * Returns store containing data field with collection's tokens, and status fields like isLoading, isLoaded
 * @param collectionAddress
 */
export function useCollectionTokenListStore(collectionAddress?: string, chainId?: number) {
  const { collectionTokenList } = useStores()
  useActivateDeactivateRequireParams(collectionTokenList, collectionAddress, chainId)

  return collectionTokenList
}
