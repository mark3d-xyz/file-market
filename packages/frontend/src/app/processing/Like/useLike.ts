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

interface IUseLikeProps {
  collectionAddress?: string
  tokenId?: string
}

export function useLike() {
  const { callContract } = useCallContract()
  const config = useConfig()
  const { wrapPromise, statuses } = useStatusState<TransactionReceipt, IUseLikeProps>()
  const like = useCallback(wrapPromise(async ({ collectionAddress, tokenId }) => {
    assertCollection(collectionAddress)
    assertTokenId(tokenId)
    assertConfig(config)

    return callContract({
      callContractConfig: {
        address: config.likesToken.address,
        abi: config.likesToken.abi,
        functionName: 'like',
        gasPrice: config?.gasPrice,
        args: [collectionAddress as `0x${string}`,
          BigInt(tokenId)],
      },
    })
  }), [config, wrapPromise])

  return {
    ...statuses,
    like,
  }
}
