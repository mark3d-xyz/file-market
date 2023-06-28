import { FC } from 'react'

import { useStores } from '../../../../../hooks'
import { useStatusModal } from '../../../../../hooks/useStatusModal'
import { useSetPublicKey } from '../../../../../processing'
import { TokenFullId } from '../../../../../processing/types'
import { Button } from '../../../../../UIkit'
import BaseModal from '../../../../Modal/Modal'
import { ActionButtonProps } from './types/types'

export type ButtonSetPublicKeyTransferProps = ActionButtonProps & {
  tokenFullId: TokenFullId
}

export const ButtonSetPublicKeyTransfer: FC<ButtonSetPublicKeyTransferProps> = ({
  tokenFullId,
  onStart,
  onEnd,
  isDisabled,
  onError,
}) => {
  const { setPublicKey, ...statuses } = useSetPublicKey({ ...tokenFullId })
  const { isLoading } = statuses
  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Public key was sent. The owner can now give you access to the hidden file.',
    loadingMsg: 'Sending keys, so owner could encrypt the file password and transfer it to you',
  })

  const { blockStore } = useStores()

  const onPress = async () => {
    onStart?.()
    const receipt = await setPublicKey(tokenFullId).catch(e => {
      onError?.()
      throw e
    })
    if (receipt?.blockNumber) {
      blockStore.setReceiptBlock(receipt.blockNumber)
    }
    onEnd?.()
  }

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
        Accept transfer
      </Button>
    </>
  )
}
