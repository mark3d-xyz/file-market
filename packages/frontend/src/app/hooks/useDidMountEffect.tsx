import type React from 'react'
import { useEffect, useRef } from 'react'

const NUMBER_OF_RERENDERS_IN_DEV = 2

const numberOfRerendersInCurrentMode =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? NUMBER_OF_RERENDERS_IN_DEV
    : 1

/** Applies the same behaivour as useEffect, but does not render on first load */
export const useAfterDidMountEffect = (
  effect: React.EffectCallback,
  deps?: React.DependencyList | undefined,
) => {
  const rerendersCount = useRef(0)

  useEffect(() => {
    if (rerendersCount.current >= numberOfRerendersInCurrentMode) effect()
    else rerendersCount.current++
  }, deps)
}
