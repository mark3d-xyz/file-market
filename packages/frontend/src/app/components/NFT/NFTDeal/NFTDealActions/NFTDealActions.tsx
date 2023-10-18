import { Tooltip } from '@nextui-org/react'
import { observer } from 'mobx-react-lite'
import React, { type FC, useEffect, useMemo, useState } from 'react'
import { getAddress } from 'viem'

import { styled } from '../../../../../styles'
import { Api, type Order, type Transfer } from '../../../../../swagger/Api'
import { useStores } from '../../../../hooks'
import { useConfig } from '../../../../hooks/useConfig'
import { type TokenFullId } from '../../../../processing/types'
import { NFTDealActionsBuyer } from './NFTDealActionsBuyer'
import { NFTDealActionOwner } from './NFTDealActionsOwner'

const ButtonsContainer = styled(Tooltip, {
  display: 'flex',
  justifyContent: 'stretch',
  gap: '$3',
  width: '100%',
  flexDirection: 'column',
  padding: '0 16px',
  '@sm': {
    flexDirection: 'column',
    gap: '$3',
  },
})

export interface NFTDealActionsProps {
  tokenFullId: TokenFullId
  order?: Order
  reFetchOrder?: () => void
  transfer?: Transfer
  isOwner?: boolean
  isBuyer?: boolean
  isApprovedExchange?: boolean
  runIsApprovedRefetch: () => void
}

export const NFTDealActions: FC<NFTDealActionsProps> = observer(({
  tokenFullId,
  order,
  transfer,
  isOwner,
  isApprovedExchange,
  isBuyer,
  runIsApprovedRefetch,
}) => {
  const { blockStore, transferStore } = useStores()
  const [serverTime, setServerTime] = useState<number>()
  const isDisabled = !blockStore.canContinue || transferStore.isWaitingForContinue
  const config = useConfig()
  const timeService = new Api({ baseUrl: '/api' }).serverTime
  const collectionAddressNormalized = tokenFullId?.collectionAddress && getAddress(tokenFullId?.collectionAddress)
  const fileBunniesAddressNormalized = getAddress(config?.fileBunniesCollectionToken.address ?? '')
  const isFileBunnies = collectionAddressNormalized === fileBunniesAddressNormalized
  const transferNumber = Number(transfer?.number)

  const isDisabledFileBunnies = useMemo(() => {
    return isFileBunnies && +tokenFullId.tokenId < 7000
  }, [isFileBunnies, transfer, tokenFullId, transferNumber])

  const fileBunniesText = useMemo(() => {
    return isDisabledFileBunnies ? 'Unlocked 24.12.2023' : ''
  }, [isDisabledFileBunnies])

  useEffect(() => {
    if (!serverTime) {
      timeService.serverTimeList().then((res) => {
        setServerTime(res.data.serverTime)
      })
    }
  }, [serverTime])

  return (
    <ButtonsContainer
      content={(isOwner && isDisabledFileBunnies ? fileBunniesText : undefined) ?? blockStore.confirmationsText}
    >
      {isOwner ? (
        <NFTDealActionOwner
          transfer={transfer}
          tokenFullId={tokenFullId}
          isDisabled={isDisabled || isDisabledFileBunnies}
          isApprovedExchange={isApprovedExchange}
          runIsApprovedRefetch={runIsApprovedRefetch}
        />
      ) : (
        <NFTDealActionsBuyer
          transfer={transfer}
          order={order}
          tokenFullId={tokenFullId}
          isBuyer={isBuyer}
          isDisabled={isDisabled}
        />
      )}
    </ButtonsContainer>
  )
})
