import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router'
import { formatUnits } from 'viem'

import { formatNumber } from '../utils/number'
import { type Params } from '../utils/router'
import { formatCurrency as formatCurrencyProps } from '../utils/web3'
import { useChainStore } from './useChainStore'
import { useConfig } from './useConfig'

export const useCurrency = () => {
  const configHook = useConfig()
  const { chainName } = useParams<Params>()
  const chainStore = useChainStore(chainName)

  const chain = useMemo(() => {
    return chainStore.selectedChain?.chain ?? configHook.chain
  }, [chainStore.selectedChain, configHook])

  const formatCurrency = useCallback((value: string) => {
    return formatCurrencyProps(value, chain)
  }, [chain])

  const toCurrency = useCallback((value: string): number => {
    const decimals = chain.nativeCurrency?.decimals ?? 18

    return Number(formatUnits(BigInt(value), decimals))
  }, [chain])

  const fromCurrency = useCallback((value: number): bigint => {
    const decimals = chain.nativeCurrency?.decimals ?? 18
    const meaningfulDecimals = 9

    return (BigInt(Math.round(value * Math.pow(10, meaningfulDecimals)))) *
      (BigInt(Math.pow(10, decimals - meaningfulDecimals)))
  }, [chain])

  const formatUsd = useCallback((value: string | number) => {
    return `${formatNumber(value, 2)}$`
  }, [chain])

  const formatRoyalty = useCallback((value: bigint) => {
    return +formatUnits(value, 2)
  }, [chain])

  const formatFee = useCallback((value: bigint) => {
    return +formatUnits(value, 2)
  }, [chain])

  return {
    formatCurrency,
    fromCurrency,
    toCurrency,
    formatUsd,
    formatFee,
    formatRoyalty,
  }
}
