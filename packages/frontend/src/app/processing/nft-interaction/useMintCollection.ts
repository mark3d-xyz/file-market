import assert from 'assert'
import { useCallback } from 'react'
import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { mark3dConfig } from '../../config/mark3d'
import { useStatusState } from '../../hooks'
import { useCallContract } from '../../hooks/useCallContract'
import { useConfig } from '../../hooks/useConfig'
import { assertAccount, assertConfig } from '../utils/assert'
import { useUploadErc721Meta } from './useUploadErc721Meta'

export interface CreateCollectionForm {
  name?: string // required, hook will return error if omitted
  symbol?: string // required
  description?: string
  image?: File // required
}

interface CreateCollectionResult {
  collectionAddress: string
}

export function useMintCollection() {
  const { address } = useAccount()
  const { wrapPromise, ...statuses } = useStatusState<CreateCollectionResult, CreateCollectionForm>()
  const upload = useUploadErc721Meta()
  const config = useConfig()
  const { callContract } = useCallContract()
  const mintCollection = useCallback(wrapPromise(async (form: CreateCollectionForm) => {
    const { name, symbol, image, description } = form
    assertConfig(config)
    assertAccount(address)
    assert(name && symbol && image, 'CreateCollection form is not filled')

    const metadata = await upload({
      name,
      description: description ?? '',
      image,
      external_link: mark3dConfig.externalLink,
    })
    console.log('mint metadata', metadata)

    const hex = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    const salt = `0x${hex}` as const
    const receipt = await callContract(
      {
        callContractConfig: {
          address: config.accessToken.address,
          abi: config.accessToken.abi,
          functionName: 'createCollection',
          args: [salt,
            name,
            symbol,
            metadata.url,
            metadata.url,
            address,
            '0x00'],
        },
        ignoreTxFailture: true,
      })

    console.log('event')

    console.log('event')
    // console.log(createCollectionEvent)

    console.log(receipt)
    // sometimes there is no collection address in a receipt
    let contractAddress = receipt?.contractAddress

    if (!contractAddress) {
      const collectionAddressLog = receipt
        ?.logs
        ?.find(log => {
          try {
            // длина массива логов меняется между чейнами, так что ищем лог с похожим на нормальный адрес
            // не 100% решение, но должно работать с хреновыми rpc
            return getAddress(log.address) !== getAddress(config.accessToken.address) &&
              getAddress(log.address) !== getAddress(address) &&
              !log.address?.startsWith('0x000000')
          } catch (e) {
            // getAddress can throw error, but it's useless. We need to find correct address
            return false
          }
        })
      contractAddress = collectionAddressLog?.address || null
    }

    if (!contractAddress) {
      throw Error('receipt does not contain Collection Create event')
    }

    return { collectionAddress: contractAddress }
  }), [config, wrapPromise, upload])

  return { ...statuses, mintCollection }
}
