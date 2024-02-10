import { useEffect, useRef } from 'react'

import { type IActivateDeactivate } from '../utils/store'

export function useActivateDeactivateRequireParams<Args extends any[]>(
  store: IActivateDeactivate<Args>, ...args: Partial<Args>
) {
  // flag ensures, that store is deactivated only if it was activated
  const activated = useRef<boolean>(false)

  useEffect(() => {
    if (args.every(Boolean) && !store.isActivated) {
      activated.current = true
      store.activate(...(args as Args))
    }

    return () => {
      if (activated.current) {
        activated.current = false
        store.deactivate()
      }
    }
  }, args)
}
