import { JsonRpcError } from '@metamask/rpc-errors'
import { getWalletClient, waitForTransaction, writeContract } from '@wagmi/core'
import assert from 'assert'
import { type Abi, type PublicClient } from 'viem'
import { useAccount, useBalance, useNetwork } from 'wagmi'
import { type WriteContractPreparedArgs, type WriteContractUnpreparedArgs } from 'wagmi/actions'

import { ErrorMessages, getTxReceipt, stringifyContractError } from '../processing'

interface ICallContract<TAbi extends Abi | readonly unknown[], TFunctionName extends string> {
  callContractConfig: WriteContractUnpreparedArgs<TAbi, TFunctionName> | WriteContractPreparedArgs<TAbi, TFunctionName>
  publicClient?: PublicClient
  ignoreTxFailture?: boolean
  minBalance?: bigint
  params?: { gasPrice?: bigint, value?: bigint }
}

export const useCallContract = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { data } = useBalance({
    address,
  })
  const callContract = async <TAbi extends Abi | readonly unknown[], TFunctionName extends string> ({
    callContractConfig,
    ignoreTxFailture,
    minBalance,
  }: ICallContract<TAbi, TFunctionName>,
  ) => {
    try {
      const walletClient = await getWalletClient()

      assert(walletClient)

      if (data && minBalance) {
        // equality anyway throws an error because of gas
        if (data.value === 0n || minBalance >= data.value) {
          throw new JsonRpcError(402, ErrorMessages.InsufficientBalance)
        }
      }

      const { hash } = await writeContract({
        chainId: chain?.id,
        ...callContractConfig,
      })

      if (ignoreTxFailture) {
        return await waitForTransaction({
          hash,
        })
      }

      return await getTxReceipt(hash, chain?.id)
    } catch (error: any) {
      console.error(error)

      throw new Error(stringifyContractError(error))
    }
  }

  return {
    callContract,
  }
}
