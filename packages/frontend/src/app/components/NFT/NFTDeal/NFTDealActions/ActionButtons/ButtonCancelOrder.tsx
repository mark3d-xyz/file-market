import { type PressEvent } from '@react-types/shared/src/events'
import { type FC } from 'react'

import { useStores } from '../../../../../hooks'
import { useStatusModal } from '../../../../../hooks/useStatusModal'
import { useCancelOrder } from '../../../../../processing'
import { type TokenFullId } from '../../../../../processing/types'
import { Button } from '../../../../../UIkit'
import BaseModal from '../../../../Modal/Modal'
import { wrapButtonActionsFunction } from '../../helper/wrapButtonActionsFunction'
import { type ActionButtonProps } from './types/types'

export type ButtonCancelOrderProps = ActionButtonProps & {
  tokenFullId: TokenFullId
}

export const ButtonCancelOrder: FC<ButtonCancelOrderProps> = ({ tokenFullId, isDisabled }) => {
  const { cancelOrder, ...statuses } = useCancelOrder()
  const { isLoading } = statuses
  const { wrapAction } = wrapButtonActionsFunction<PressEvent>()
  const { transferStore } = useStores()
  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Order cancelled',
    loadingMsg: 'Cancelling order',
  })

  return (
    <>
      <BaseModal {...modalProps} />
      <Button
        primary
        fullWidth
        borderRadiusSecond
        isDisabled={isLoading || isDisabled}
        onPress={wrapAction(async () => {
          console.log('START1')
          const receipt = await cancelOrder(tokenFullId)
          if (receipt?.blockNumber) {
            transferStore.onTransferCancellation(BigInt(tokenFullId.tokenId), receipt?.blockNumber)
          }
        })
        }
      >
        Cancel order
      </Button>
    </>
  )
}
