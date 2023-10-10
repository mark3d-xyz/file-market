import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { type OptionSwitch, SwitchButton } from '../../components/Switch/Switch'
import { cutNumber } from '../../utils/number'
import { StyledAmount, SwitchWrapperTabs } from './Tabs.styles'

export interface TabItem extends OptionSwitch {
  url: string
  amount?: number
}

export interface TabsProps {
  tabs: TabItem[]
  isSmall?: boolean
  isTransparent?: boolean
}

export const Tabs: React.FC<TabsProps> = observer(({ tabs, isSmall, isTransparent }) => {
  const [tab, setTab] = useState<TabItem | undefined>()
  const location = useLocation()
  const navigate = useNavigate()

  const onChange = (newValue: TabItem) => {
    setTab(newValue)
    navigate(newValue.url)
  }

  useEffect(() => {
    const currentTabUrl = location?.pathname?.split('/')?.at?.(-1) ?? ''
    let tabIndex = tabs.find((t) =>
      t.value === currentTabUrl,
    )
    if (!tabIndex) {
      tabIndex = tabs[0]
    }
    setTab(tabIndex)
  }, [location, tabs])

  return (
    <>
      <SwitchWrapperTabs small={isSmall} transparent={isTransparent}>
        {tabs.map((tabItem) => (
          <SwitchButton
            key={tabItem.value}
            onClick={() => {
              onChange(tabItem)
              navigate(tabItem.url)
            }}
            activate={tab?.value === tabItem.value}
            small={isSmall}
          >
            {tabItem.label}
          </SwitchButton>
        ))}
      </SwitchWrapperTabs>
      <StyledAmount small={isSmall}>
        <span>{`Total ${cutNumber(tab?.amount)}`}</span>
      </StyledAmount>
    </>
  )
})
