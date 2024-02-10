import { useCallback } from 'react'
import { type TransactionReceipt } from 'viem'

import { useStatusState } from '../../hooks'
import { useCallContract } from '../../hooks/useCallContract'
import { useConfig } from '../../hooks/useConfig'
import { assertCollection, assertConfig, assertTokenId } from '../utils'

/**
 * Calls Mark3dExchange contract to cancel an order
 * @param collectionAddress
 * @param tokenId assigned to a token by the mint function
 */

interface ICancelOrder {
  collectionAddress?: string
  tokenId?: string
}

export function useCancelOrder() {
  const { callContract } = useCallContract()
  const config = useConfig()
  const { wrapPromise, statuses } = useStatusState<TransactionReceipt, ICancelOrder>()
  const cancelOrder = useCallback(wrapPromise(async ({ collectionAddress, tokenId }) => {
    assertCollection(collectionAddress)
    assertTokenId(tokenId)
    assertConfig(config)

    return callContract({
      callContractConfig: {
        address: config.exchangeToken.address,
        abi: config.exchangeToken.abi,
        functionName: 'cancelOrder',
        gasPrice: config?.gasPrice,
        args: [collectionAddress as `0x${string}`,
          BigInt(tokenId)],
      },
    })
  }), [config, wrapPromise, callContract])

  return {
    ...statuses,
    cancelOrder,
  }
}
