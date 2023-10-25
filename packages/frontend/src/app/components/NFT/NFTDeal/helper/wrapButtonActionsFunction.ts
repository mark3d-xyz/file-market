import { useCallback } from 'react'

import { useStores } from '../../../../hooks'

export function wrapButtonActionsFunction<Arguments = void>() {
  const { transferStore } = useStores()

  const onActionStart = () => {
    // we disable buttons when user starts contract interaction, and enable back when event arrives
    transferStore.setIsWaitingForEvent(true)
    transferStore.setIsWaitingReciept(true)
    transferStore.setIsWaitingSocket(true)
  }

  const onActionError = () => {
    transferStore.setIsWaitingReciept(false)
    transferStore.setIsWaitingForEvent(false)
    transferStore.setIsWaitingSocket(false)
  }

  const onActionEnd = () => {
    transferStore.setIsWaitingReciept(false)
  }

  const wrapAction = useCallback((call: (args: Arguments) => Promise<void>) => {
    return async (args: Arguments) => {
      try {
        onActionStart()
        await call(args)
        onActionEnd()
      } catch (err) {
        onActionError()
        throw err
      }
    }
  }, [])

  return {
    wrapAction,
  }
}
