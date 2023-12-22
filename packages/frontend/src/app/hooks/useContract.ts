import { useMemo } from 'react'
import { type Abi, getAddress } from 'viem'
import { useNetwork, useWalletClient } from 'wagmi'
import { getContract } from 'wagmi/actions'

export const useContract = <A extends Abi>(address: string | undefined, abi: A | undefined) => {
  const { chain } = useNetwork()
  const { data: walletClient } = useWalletClient()

  return useMemo(() => {
    console.log(address)
    console.log(walletClient)
    console.log(abi)
    console.log(chain)
    if (address && walletClient && abi && chain) {
      return getContract({
        abi,
        address: getAddress(address),
        walletClient,
      })
    }

    return null
  }, [address, abi, chain, walletClient])
}
