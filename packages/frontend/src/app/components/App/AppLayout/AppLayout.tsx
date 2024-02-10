import { type FC } from 'react'
import { Outlet } from 'react-router-dom'

import { useScrollTop } from '../../../hooks/useScrollTop'
import NetworkWatcher from '../../Web3/NetworkWatcher/NetworkWatcher'
import { AppNav } from '../AppNav'
import Footer from '../Footer/Footer'

export const AppLayout: FC = () => {
  useScrollTop()

  return (
    <NetworkWatcher>
      <AppNav />
      <Outlet />
      <Footer />
    </NetworkWatcher>
  )
}
