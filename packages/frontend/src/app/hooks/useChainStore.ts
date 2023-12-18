import { useActivateDeactivateRequireParams } from './useActivateDeactivateStore'
import { useStores } from './useStores'

export function useChainStore(chainName?: string) {
  const { chainStore } = useStores()
  useActivateDeactivateRequireParams(chainStore, chainName)

  return chainStore
}
