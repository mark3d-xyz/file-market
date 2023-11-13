import { observer } from 'mobx-react-lite'
import React from 'react'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router-dom'

import { styled } from '../../../../styles'
import { NFTCard } from '../../../components'
import Plug from '../../../components/Plug/Plug'
import { useCollectionTokenListStore } from '../../../hooks/useCollectionTokenListStore'
import { Button, InfiniteScroll, nftCardListCss, Txt } from '../../../UIkit'
import { type Params } from '../../../utils/router'

export const CardsContainer = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '$4',
  justifyContent: 'normal',
  '@md': {
    justifyContent: 'space-around',
  },
  '@sm': {
    justifyContent: 'center',
  },
  paddingBottom: '$3',
})

const NoNftContainer = styled('div', {
  gridColumn: '1/-1',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '$3',
  width: '100%',
})

const NftSection = observer(() => {
  const { collectionAddress, chainName } = useParams<Params>()
  const collectionTokenListStore = useCollectionTokenListStore(collectionAddress, chainName)
  const navigate = useNavigate()

  return (
    <>
      <InfiniteScroll
        hasMore={collectionTokenListStore.hasMoreData}
        isLoading={collectionTokenListStore.isLoading}
        currentItemCount={collectionTokenListStore.nftCards.length}
        fetchMore={() => { collectionTokenListStore.requestMore() }}
        render={({ index }) => {
          return (
            <NFTCard
              {...collectionTokenListStore.nftCards[index]}
              onFlameSuccess={() => {
                collectionTokenListStore.increaseLikeCount(index)
              }}
              key={index}
            />
          )
        }}
        listCss={nftCardListCss}
      />
      {!collectionTokenListStore.nftCards.length && !collectionTokenListStore.isLoading && (
        <NoNftContainer>
          <Plug
            header={'There\'s not one thing'}
            mainText={'Be the first and create your first EFT'}
            buttonsBlock={(
              <Button primary onClick={() => { navigate('/create/eft') }}>
                <Txt primary1>Create</Txt>
              </Button>
            )}
          />
        </NoNftContainer>
      )}
    </>
  )
})

export default NftSection
