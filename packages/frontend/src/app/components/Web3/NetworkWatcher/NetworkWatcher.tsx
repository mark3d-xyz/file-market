import { type FC, type PropsWithChildren } from 'react'

import { useListenNetwork } from '../../../hooks/useListenNetwork'

const NetworkWatcher: FC<PropsWithChildren> = ({ children }) => {
  useListenNetwork()

  return (<>{children}</>)
}

export default NetworkWatcher
