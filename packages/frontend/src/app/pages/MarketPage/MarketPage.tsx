import { observer } from 'mobx-react-lite'
import { Outlet } from 'react-router'

import { styled } from '../../../styles'
import { useOpenOrderListStore } from '../../hooks/useOrdersListStore'
import { PageLayout, Tabs } from '../../UIkit'

const TabsContainer = styled('div', {
  marginBottom: '$4',
})

const MarketPage = observer(() => {
  const { data } = useOpenOrderListStore()

  return (
    <PageLayout>
      <TabsContainer>
        <Tabs
          textAlign='left'
          tabs={[
            {
              name: 'EFTs',
              url: '/market/efts',
              amount: data.total ?? 0,
            },
          ]}
        />
      </TabsContainer>
      <Outlet />
    </PageLayout>
  )
})
export default MarketPage
