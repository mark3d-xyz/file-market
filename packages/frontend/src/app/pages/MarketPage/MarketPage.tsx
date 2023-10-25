import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Outlet } from 'react-router'
import { useLocation } from 'react-router-dom'

import { useCollectionsListStore } from '../../hooks/useCollectionsListStore'
import { useOpenOrderListStore } from '../../hooks/useOrdersListStore'
import { PageLayout, type TabItem, Tabs } from '../../UIkit'
import { TabsContainer } from '../../UIkit/Tabs/TabsContainer'

const MarketPage = observer(() => {
  const { data: orderData } = useOpenOrderListStore()
  const { data: collectionsData } = useCollectionsListStore()
  const location = useLocation()
  const isDisabledPaddingContainer = useMemo(() => {
    const currentTabUrl = location?.pathname?.split('/')?.at?.(-1) ?? ''

    return currentTabUrl === 'collections'
  }, [location])

  const tabs: TabItem[] = useMemo(() => {
    return [
      {
        value: 'efts',
        url: '/market/efts',
        amount: orderData.total ?? 0,
        label: 'EFTs',
      },
      {
        value: 'collections',
        url: '/market/collections',
        amount: collectionsData.total ?? 0,
        label: 'Collections',
      },
    ]
  }, [orderData.total, collectionsData.total])

  return (
    <PageLayout isHasSelectBlockChain collectionPage={isDisabledPaddingContainer}>
      <TabsContainer>
        <Tabs
          tabs={tabs}
          isSmall
        />
      </TabsContainer>
      <Outlet />
    </PageLayout>
  )
})
export default MarketPage
