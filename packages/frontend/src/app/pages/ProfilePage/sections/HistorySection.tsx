import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import Plug from '../../../components/Plug/Plug'
import { type ITableColumn } from '../../../components/Table/TableBuilder'
import { useTransfersHistoryStore } from '../../../hooks/useTransfersHistory'
import { Button, InfiniteScroll, Txt } from '../../../UIkit'
import { HistoryTableBuilder } from './HistoryTableBuilder'

const columns: ITableColumn[] = [
  { name: 'Event', hide: false },
  { name: 'Object', hide: false },
  { name: 'From', hide: 'md' },
  { name: 'To', hide: 'md' },
  { name: 'Price', hide: 'sm' },
  { name: 'Date', hide: 'lg' },
]

export const HistorySection: React.FC = observer(() => {
  const transferHistoryStore = useTransfersHistoryStore()
  const navigate = useNavigate()
  const historyTableBuilder = new HistoryTableBuilder(columns, transferHistoryStore.tableRows)

  return (
    <>
      <InfiniteScroll
        hasMore={transferHistoryStore.hasMoreData}
        fetchMore={() => { transferHistoryStore.requestMore() }}
        isLoading={transferHistoryStore.isLoading}
        currentItemCount={transferHistoryStore.tableRows.length}
        render={({ index }) => historyTableBuilder.renderRow(index, historyTableBuilder.table.rows[index])}
        listCss={{
          display: 'flex',
          flexDirection: 'column',
          gap: '$2',
          paddingTop: 28,
          paddingBottom: '$3',
        }}
      />
      {!transferHistoryStore.tableRows.length && !transferHistoryStore.isLoading && (
        <Plug
          header={'You don`t have any EFTs '}
          mainText={'Create your own EFT or go to the market to find something amazing'}
          buttonsBlock={(
            <>
              <Button primary onClick={() => { navigate('/market') }}>
                <Txt primary1>Explore</Txt>
              </Button>
              <Button primary onClick={() => { navigate('/create') }}>
                <Txt primary1>Create</Txt>
              </Button>
            </>
          )}
        />
      )}
    </>
  )
})
