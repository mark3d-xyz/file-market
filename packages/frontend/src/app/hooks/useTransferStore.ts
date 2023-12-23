import { useActivateDeactivateRequireParams } from './useActivateDeactivateStore'
import { useStores } from './useStores'

/**
 * Component, using this hook, MUST be wrapped into observer.
 * Returned store contains fields with collections, tokens and status fields like isLoading, isLoaded
 * @param collectionAddress
 * @param tokenId
 */
export function useTransferStore(collectionAddress?: string, tokenId?: string, chainId?: number) {
  const { transferStore } = useStores()
  useActivateDeactivateRequireParams(transferStore, collectionAddress, tokenId, chainId)

  return transferStore
}
