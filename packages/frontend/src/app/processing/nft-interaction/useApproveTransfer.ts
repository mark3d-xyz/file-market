import assert from 'assert'
import { useCallback } from 'react'
import { type TransactionReceipt } from 'viem'
import { useAccount } from 'wagmi'

import { useStatusState } from '../../hooks'
import { useCallContract } from '../../hooks/useCallContract'
import { useConfig } from '../../hooks/useConfig'
import { useHiddenFileProcessorFactory } from '../HiddenFileProcessorFactory'
import { assertAccount, assertCollection, assertTokenId, bufferToEtherHex, hexToBuffer } from '../utils'

interface IApproveTransfer {
  tokenId?: string
  publicKey?: string
  collectionAddress?: string
}

export function useApproveTransfer() {
  const { address } = useAccount()
  const { statuses, wrapPromise } = useStatusState<TransactionReceipt, IApproveTransfer>()
  const factory = useHiddenFileProcessorFactory()
  const { callContract } = useCallContract()
  const config = useConfig()

  const approveTransfer = useCallback(wrapPromise(async ({ tokenId, publicKey, collectionAddress }) => {
    assertAccount(address)
    assertCollection(collectionAddress)
    assertTokenId(tokenId)
    assert(publicKey, 'publicKey was not set (or transfer object is null)')

    if (!publicKey.startsWith('0x')) {
      publicKey = `0x${publicKey}`
    }
    const owner = await factory.getOwner(address, collectionAddress, +tokenId)
    console.log('got owner', owner)
    try {
      const encryptedFilePassword = await owner.encryptFilePassword(hexToBuffer(publicKey))

      return await callContract(
        {
          callContractConfig: {
            address: collectionAddress as `0x${string}`,
            abi: config.collectionToken.abi,
            functionName: 'approveTransfer',
            gasPrice: config?.gasPrice,
            args: [BigInt(tokenId), bufferToEtherHex(encryptedFilePassword)],
          },
        },
      )
    } catch (e) {
      console.error('encrypt file password error', e)
      throw e
    }
  }), [config, address, wrapPromise])

  return {
    ...statuses,
    approveTransfer,
  }
}
