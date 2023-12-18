import { useActivateDeactivateRequireParams } from './useActivateDeactivateStore'
import { useStores } from './useStores'

/**
 * Component, using this hook, MUST be wrapped into observer.
 * Returned store contains token state and status fields like isLoading, isLoaded
 * @param collectionAddress
 * @param tokenId
 * @param chainId
 */

export function useTokenStore(collectionAddress?: string, tokenId?: string, chainId?: number) {
  const { tokenStore } = useStores()
  useActivateDeactivateRequireParams(tokenStore, collectionAddress, tokenId, chainId)

  return tokenStore
}
