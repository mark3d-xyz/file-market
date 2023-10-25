import { type FC, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { type BreakpointsOptions } from '../../../../styles'
import { useMediaMui } from '../../../hooks/useMediaMui'
import { useScrollWindow } from '../../../hooks/useScrollWindow'
import { NavBar } from '../../../UIkit'
import { AppConnectWidget } from '../AppConnectWidget'
import { AppLogoButton } from '../AppLogoButton'
import { paths, pathsWithoutCurrentBlockchain } from './paths'

const mobileBp: BreakpointsOptions = 'lg'

export const AppNav: FC = () => {
  const { smValue, mdValue, xlValue, lgValue } = useMediaMui()
  const location = useLocation()
  const scrollY = useScrollWindow()

  const isFilebunnies: boolean = useMemo(() => {
    return location.pathname.includes('/fileBunnies')
  }, [location.pathname])

  const isMarketPage: boolean = useMemo(() => {
    return location.pathname.includes('/market')
  }, [location.pathname])

  const isTransparent = useMemo(() => {
    if (smValue) return scrollY < -1
    if (mdValue) return scrollY < -1
    if (lgValue) return scrollY < 1284
    if (xlValue) return scrollY < 783

    return scrollY < 808
  }, [scrollY])

  const noneBlurShadow = useMemo(() => {
    return scrollY < 1
  }, [scrollY])

  const isCurrentBlockchainVisibleByScroll = useMemo(() => {
    return scrollY < 1
  }, [scrollY])

  const isCurrentBlockchainVisibleByPath = useMemo(() => {
    return location?.pathname?.split('/').findIndex(item => pathsWithoutCurrentBlockchain.includes(item)) < 0
  }, [location])

  const isCurrentBlockchainVisible = useMemo(() => {
    return isCurrentBlockchainVisibleByPath && isCurrentBlockchainVisibleByScroll
  }, [isCurrentBlockchainVisibleByScroll, isCurrentBlockchainVisibleByPath])

  return (
    <NavBar
      noneBlurShadow={(noneBlurShadow && isFilebunnies) || isMarketPage}
      isTransparent={isTransparent && isFilebunnies}
      mobileBp={mobileBp}
      brand={<AppLogoButton to='/' hideNameIn={mobileBp} />}
      items={paths}
      actions={<AppConnectWidget />}
      isCurrentBlockchainVisible={isCurrentBlockchainVisible}
    />
  )
}
