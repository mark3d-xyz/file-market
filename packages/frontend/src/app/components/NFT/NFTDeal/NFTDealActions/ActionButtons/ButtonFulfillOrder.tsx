import { type PressEvent } from '@react-types/shared/src/events'
import { observer } from 'mobx-react-lite'
import { type FC, useCallback } from 'react'
import { useAccount } from 'wagmi'

import { type Order } from '../../../../../../swagger/Api'
import { useStores } from '../../../../../hooks'
import { useStatusModal } from '../../../../../hooks/useStatusModal'
import {
  bufferToEtherHex,
  useFulfillOrder,
  useHiddenFileProcessorFactory,
  useSeedProvider,
} from '../../../../../processing'
import { type TokenFullId } from '../../../../../processing/types'
import { Button } from '../../../../../UIkit'
import BaseModal from '../../../../Modal/Modal'
import { wrapButtonActionsFunction } from '../../helper/wrapButtonActionsFunction'
import { type ActionButtonProps } from './types/types'

export type ButtonFulfillOrderProps = ActionButtonProps & {
  tokenFullId: TokenFullId
  order?: Order
}

export const ButtonFulfillOrder: FC<ButtonFulfillOrderProps> = observer(({
  tokenFullId,
  order,
  isDisabled,
}) => {
  const { fulfillOrder, ...statuses } = useFulfillOrder()
  const { isLoading } = statuses
  const { address } = useAccount()
  const { wrapAction } = wrapButtonActionsFunction<PressEvent>()
  const { transferStore } = useStores()
  const { seedProvider } = useSeedProvider(address)
  const factory = useHiddenFileProcessorFactory()
  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Order fulfilled! Now wait until owner of the EFT transfers you hidden files. ' +
      'After that, check the hidden files and finalize the transfer',
    loadingMsg: 'Fulfilling order. The operation might seem unresponsive, but it\'s processing. Please be patient.',
  })

  const getPublicKeyHex = useCallback(async () => {
    if (address && tokenFullId && seedProvider?.seed) {
      const buyer = await factory.getBuyer(address, tokenFullId.collectionAddress, +tokenFullId.tokenId)
      const publicKey = await buyer.initBuy()

      return bufferToEtherHex(publicKey)
    }
  }, [address, tokenFullId.collectionAddress, tokenFullId.tokenId, seedProvider?.seed])

  const onPress = wrapAction(async () => {
    const receipt = await fulfillOrder({
      ...tokenFullId,
      price: order?.price,
    })
    const publicKeyHexRes = await getPublicKeyHex()
    if (receipt?.blockNumber && publicKeyHexRes) {
      transferStore.onTransferPublicKeySet(BigInt(tokenFullId.tokenId), publicKeyHexRes, receipt?.blockNumber)
    }
  })

  return (
    <>
      <BaseModal {...modalProps} />
      <Button
        primary
        fullWidth
        borderRadiusSecond
        isDisabled={isLoading || isDisabled}
        onPress={onPress}
      >
        Buy now
      </Button>
    </>
  )
})
