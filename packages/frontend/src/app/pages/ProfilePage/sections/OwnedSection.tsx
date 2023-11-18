import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { styled } from '../../../../styles'
import { NFTCard } from '../../../components'
import Plug from '../../../components/Plug/Plug'
import { useCollectionAndTokenListStore } from '../../../hooks'
import { Button, InfiniteScroll, nftCardListCss, Txt } from '../../../UIkit'
import { type Params } from '../../../utils/router'

const NoNftContainer = styled('div', {
  gridColumn: '1/-1',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '$3',
  width: '100%',
})

export const OwnedSection: React.FC = observer(() => {
  const collectionAndTokenListStore = useCollectionAndTokenListStore()
  const { profileAddress } = useParams<Params>()
  const { address: currentAddress } = useAccount()
  const navigate = useNavigate()

  return (
    <>
      <InfiniteScroll
        hasMore={collectionAndTokenListStore.hasMoreData}
        fetchMore={() => { collectionAndTokenListStore.requestMoreTokens() }}
        isLoading={collectionAndTokenListStore.isLoading}
        currentItemCount={collectionAndTokenListStore.nftCards.length}
        render={({ index }) => (
          <NFTCard
            {...collectionAndTokenListStore.nftCards[index]}
            onFlameSuccess={() => {
              collectionAndTokenListStore.increaseLikeCount(index)
            }}
            key={index}
          />
        )}
        listCss={nftCardListCss}
      />
      {
        !collectionAndTokenListStore.nftCards.length &&
        !collectionAndTokenListStore.isLoading &&
        profileAddress === currentAddress && (
          <NoNftContainer>
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
          </NoNftContainer>
        )}
    </>
  )
})

export default OwnedSection
