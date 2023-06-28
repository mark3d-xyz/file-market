import { FC, useEffect } from 'react'

import { useStores } from '../../../../../hooks'
import { useStatusModal } from '../../../../../hooks/useStatusModal'
import { useCancelTransfer } from '../../../../../processing'
import { TokenFullId } from '../../../../../processing/types'
import { Button } from '../../../../../UIkit'
import BaseModal from '../../../../Modal/Modal'
import { ActionButtonProps } from './types/types'

export type ButtonCancelTransferProps = ActionButtonProps & {
  tokenFullId: TokenFullId
}

export const ButtonCancelTransfer: FC<ButtonCancelTransferProps> = ({
  tokenFullId, onStart, onEnd, isDisabled, onError,
}) => {
  const { cancelTransfer, ...statuses } = useCancelTransfer({ ...tokenFullId })
  const { isLoading } = statuses
  const { blockStore } = useStores()
  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Transfer cancelled',
    loadingMsg: 'Cancelling transfer',
  })

  useEffect(() => {
    if (statuses.result) blockStore.setReceiptBlock(statuses.result.blockNumber)
  }, [statuses.result])

  return (
    <>
      <BaseModal {...modalProps} />
      <Button
        primary
        fullWidth
        borderRadiusSecond
        isDisabled={isLoading || isDisabled}
        onPress={async () => {
          onStart?.()
          await cancelTransfer(tokenFullId).catch(e => {
            onError?.()
            throw e
          })
          onEnd?.()
        }}
      >
        Cancel deal
      </Button>
    </>
  )
}
