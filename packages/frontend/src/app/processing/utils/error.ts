
import { JsonRpcError, serializeError } from '@metamask/rpc-errors'
import { BigNumber, Contract, ContractTransaction, Signer } from 'ethers'

import { wagmiClient } from '../../config/web3Modal'

const FIVE_MINUTES = 300_000
const fallbackError = { code: 500, message: 'unknown' }

const stringifyContractError = (error: any) => {
  if (error?.code === 'ACTION_REJECTED') {
    return 'Contract call rejected by user.'
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
  } else {
    message = `Contract call failed. Reason: ${serializedError.message}`
  }

  return message
}

export const callContractGetter = async <R = any>({
  contract,
  method
}: {
  contract: Contract
  method: keyof Contract
},
  ...args: any[]
): Promise<R> => {
  try {
    await contract.callStatic[method](...args)

    return contract[method](...args)
  } catch (error: any) {
    console.error(error)

    throw new Error(stringifyContractError(error))
  }
}

export const callContract = async ({
  contract,
  method,
  signer,
  ignoreTxFailture,
  minBalance
}: {
  contract: Contract
  method: keyof Contract
  signer?: Signer
  ignoreTxFailture?: boolean
  minBalance?: BigNumber
},
...args: any[]
) => {
  try {
    if (signer) {
      const balance = await signer.getBalance()
      // equality anyway throws an error because of gas
      if (balance.isZero() || minBalance?.gte(balance)) {
        throw new JsonRpcError(402, 'Insufficient balance')
      }
    }

    await contract.callStatic[method](...args)
    const tx: ContractTransaction = await contract[method](...args)

    if (ignoreTxFailture) {
      return await tx.wait()
    }

    return await getTxReceipt(tx)
  } catch (error: any) {
    console.error(error)

    throw new Error(stringifyContractError(error))
  }
}

export const wait = (miliseconds: number) => new Promise<void>((resolve) => {
  setTimeout(() => resolve(), miliseconds)
})

const pingTx = async (txHash: string) => {
  let receipt = null
  const start = Date.now()

  while (receipt === null) {
    if (Date.now() - start > FIVE_MINUTES) break
    await wait(1000)

    receipt = await wagmiClient.provider.getTransactionReceipt(txHash)

    if (receipt === null) continue
  }

  return receipt
}

const getTxReceipt = async (tx: ContractTransaction) => {
  const receipt = await Promise.race([
    tx.wait(),
    pingTx(tx.hash)
  ])

  if (!receipt) {
    throw new JsonRpcError(503, `The transaction ${tx.hash} is failed`)
  }

  return receipt
}