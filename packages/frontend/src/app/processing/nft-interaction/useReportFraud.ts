import { useCallback } from 'react'
import { type TransactionReceipt } from 'viem'
import { useAccount } from 'wagmi'

import { useStatusState } from '../../hooks'
import { useCallContract } from '../../hooks/useCallContract'
import { useConfig } from '../../hooks/useConfig'
import { useCollectionContract } from '../contracts'
import { useHiddenFileProcessorFactory } from '../HiddenFileProcessorFactory'
import { assertAccount, assertCollection, assertContract, assertTokenId, bufferToEtherHex } from '../utils'

interface IUseReportFraud {
  collectionAddress?: `0x${string}`
}

interface IReportFraud {
  tokenId?: string
}

export function useReportFraud({ collectionAddress }: IUseReportFraud = {}) {
  const { contract } = useCollectionContract(collectionAddress)
  const { address } = useAccount()
  const { statuses, wrapPromise } = useStatusState<TransactionReceipt, IReportFraud>()
  const config = useConfig()

  const { callContract } = useCallContract()

  const factory = useHiddenFileProcessorFactory()

  const reportFraud = useCallback(wrapPromise(async ({ tokenId }) => {
    assertContract(contract, config?.collectionToken.name ?? '')
    assertAccount(address)
    assertCollection(collectionAddress)
    assertTokenId(tokenId)

    const buyer = await factory.getBuyer(address, collectionAddress, +tokenId)
    const privateKey = await buyer.revealRsaPrivateKey()
    console.log('report fraud', { tokenId, privateKey })

    return callContract({ contract, method: 'reportFraud', params: { gasPrice: config?.gasPrice } },
      BigInt(tokenId),
      bufferToEtherHex(privateKey),
    )
  }), [contract, address, wrapPromise])

  return {
    ...statuses,
    reportFraud,
  }
}
