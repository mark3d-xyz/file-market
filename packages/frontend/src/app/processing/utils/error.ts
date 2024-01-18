import { JsonRpcError, serializeError } from '@metamask/rpc-errors'
import { readContract, type ReadContractConfig, waitForTransaction } from '@wagmi/core'
import { type Abi } from 'viem'

import { wagmiConfig } from '../../config/web3Modal'

const FIVE_MINUTES = 300_000
const fallbackError = { code: 500, message: 'unknown' }

export enum ProviderErrorMessages {
  InternalError = 'Internal JSON-RPC error.',
  InsufficientBalance = 'Actor balance less than needed.',
}

export enum ErrorMessages {
  InsufficientBalance = 'Balance too low for transaction.',
  RejectedByUser = 'Transaction rejected by user.',
}

export const stringifyContractError = (error: any) => {
  if (error?.code === 'ACTION_REJECTED') {
    return ErrorMessages.RejectedByUser
  }

  let message = 'Unknown'
  const serializedError = serializeError(error, { fallbackError })
  const { data }: any = serializedError
  if (serializedError.code === 500) {
    if (data?.cause?.error?.data?.message) {
      const rawMessage: string = data.cause.error.data.message
      // vm error is truncated and useless for us
      message = rawMessage.split(', vm error:')[0]
    } else if (data?.cause?.reason) {
      message = data.cause.reason
    } else if (data?.cause?.message) {
      message = data.cause.message
    }
  } else if (serializedError.message === ProviderErrorMessages.InternalError) {
    if (data.message?.includes(ProviderErrorMessages.InsufficientBalance)) {
      message = ErrorMessages.InsufficientBalance
    } else {
      message = data.message
    }
  } else {
    message = `Transaction failed. Reason: ${serializedError.message}`
  }

  return `${message} Please try again.`
}

export const callContractGetter = async <T extends Abi, B extends string, R = any>({
  callContractConfig,
}: {
  callContractConfig: ReadContractConfig<T, B>
},
  ...args: any[]
): Promise<R> => {
  try {
    const data = (await readContract<T, B>(callContractConfig)) as R

    console.log('CONTRACT GETTER')
    console.log(data)

    return data
  } catch (error: any) {
    console.error('contract getter error', error, callContractConfig)

    throw new Error(stringifyContractError(error))
  }
}
export const wait = (miliseconds: number) => new Promise<void>((resolve) => {
  setTimeout(() => { resolve() }, miliseconds)
})

const pingTx = async (txHash: `0x${string}`) => {
  let receipt = null
  const start = Date.now()

  while (receipt === null) {
    if (Date.now() - start > FIVE_MINUTES) break
    await wait(5000)

    try {
      receipt = await wagmiConfig.getPublicClient().getTransactionReceipt({ hash: txHash })
    } catch (e) {
      console.error('wagmi getTransactionReceipt error', e)
    }
  }

  console.log('PING')

  return receipt
}

export const getTxReceipt = async (hash: `0x${string}`) => {
  console.log(hash)

  const receipt = await Promise.race([
    await waitForTransaction({
      hash,
    }),
    pingTx(hash),
  ])

  if (!receipt) {
    throw new JsonRpcError(503, `The transaction ${hash} is failed`)
  }

  return receipt
}
