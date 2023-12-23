import { useCallback } from 'react'
import { type TransactionReceipt } from 'viem'

import { useCallContract, useStatusState } from '../../hooks'
import { useConfig } from '../../hooks/useConfig'
import { assertCollection, assertConfig, assertTokenId } from '../utils'

interface IUseLikeProps {
  collectionAddress?: string
  tokenId?: string
}

export function useLike() {
  const { callContract } = useCallContract()
  const config = useConfig()
  const { wrapPromise, statuses, setResult } = useStatusState<TransactionReceipt, IUseLikeProps>()
  const like = useCallback(wrapPromise(async ({ collectionAddress, tokenId }) => {
    assertCollection(collectionAddress)
    assertTokenId(tokenId)
    assertConfig(config)

    console.log(config.likesToken.address)

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
    setResult,
  }
}
