import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { stringifyError } from '../utils/error'
import { useAuth } from './useAuth'

interface IUseStatusStateProps {
  isNotNeedAuth?: boolean
}

export function useStatusState<ResultType, Arguments = void>(props?: IUseStatusStateProps) {
  const { isConnected } = useAccount()
  const { connect } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [result, setResult] = useState<ResultType>()

  const wrapPromise = useCallback((call: (args: Arguments) => Promise<ResultType>) => {
    return async (args: Arguments) => {
      if (!isConnected && !props?.isNotNeedAuth) {
        connect()

        setIsLoading(false)

        return
      }
      console.log('OPOAAAA')
      setIsLoading(true)
      setError(undefined)
      setResult(undefined)
      try {
        const result = await call(args)
        setIsLoading(false)
        setResult(result)

        return result
      } catch (err) {
        setIsLoading(false)
        setError(stringifyError(err))
        throw err
      }
    }
  }, [connect, isConnected, props?.isNotNeedAuth])

  return {
    statuses: {
      isLoading,
      error,
      result,
    },
    setIsLoading,
    setError,
    setResult,
    wrapPromise,
  }
}
