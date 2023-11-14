import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

import { TransferCard } from '../../../components/MarketCard/TransferCard'
import Plug from '../../../components/Plug/Plug'
import { useAddress } from '../../../hooks/useAddress'
import { useUserTransferStore } from '../../../hooks/useUserTransfers'
import { Button, InfiniteScroll, nftCardListCss, Txt } from '../../../UIkit'

const TransfersSection: React.FC = observer(() => {
  const { address: currentAddress } = useAccount()
  const userAddress = useAddress()
  const userTransferStore = useUserTransferStore(userAddress)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentAddress || !userAddress) navigate('/')
    if (getAddress(currentAddress ?? '') !== getAddress(userAddress ?? '')) {
      navigate('/')
    }
  }, [userAddress, currentAddress])

  return (
    <>
      <InfiniteScroll
        hasMore={userTransferStore.hasMoreData}
        fetchMore={() => { userTransferStore.requestMore() }}
        isLoading={userTransferStore.isLoading}
        currentItemCount={userTransferStore.transferCards.length}
        render={({ index }) => (
          <TransferCard
            {...userTransferStore.transferCards[index]}
            onFlameSuccess={() => {
              userTransferStore.increaseLikeCount(index)
            }}
            key={index}
          />
        )}
        listCss={nftCardListCss}
      />
      {!userTransferStore.transferCards.length && !userTransferStore.isLoading && (
        <Plug
          header={'You don`t have any activity'}
          mainText={'Get started by creating your own EFT or go to the market to find something amazing'}
          buttonsBlock={(
            <>
              <Button primary onClick={() => { navigate('/market') } }>
                <Txt primary1>3D Market</Txt>
              </Button>
              <Button onClick={() => { navigate('/create') } }>
                <Txt primary1>Create</Txt>
              </Button>
            </>
          )}
        />
      )}
    </>
  )
})

export default TransfersSection
