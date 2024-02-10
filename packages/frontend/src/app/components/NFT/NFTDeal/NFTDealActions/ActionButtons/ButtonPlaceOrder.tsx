import React from 'react'

import { useStores } from '../../../../../hooks'
import { useModalOpen } from '../../../../../hooks/useModalOpen'
import { useStatusModal } from '../../../../../hooks/useStatusModal'
import { usePlaceOrder } from '../../../../../processing'
import { type TokenFullId } from '../../../../../processing/types'
import { Button } from '../../../../../UIkit'
import { Modal, ModalBody, ModalTitle } from '../../../../../UIkit/Modal/Modal'
import { BaseModal } from '../../../../Modal'
import { wrapButtonActionsFunction } from '../../helper/wrapButtonActionsFunction'
import { OrderForm, type OrderFormValue } from '../../OrderForm'
import { type ActionButtonProps } from './types/types'

export type ButtonPlaceOrderProps = ActionButtonProps & {
  tokenFullId: TokenFullId
}

export const ButtonPlaceOrder: React.FC<ButtonPlaceOrderProps> = ({
  tokenFullId, isDisabled,
}) => {
  const { modalOpen, openModal, closeModal } = useModalOpen()
  const { placeOrder, ...statuses } = usePlaceOrder()
  const { wrapAction } = wrapButtonActionsFunction<OrderFormValue>()
  const { transferStore } = useStores()
  const { isLoading } = statuses
  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Order placed! Now be ready to transfer hidden files, if someone fulfills the order.',
    loadingMsg: 'Placing order',
  })

  const onSubmit = wrapAction(async ({ price }: OrderFormValue) => {
    closeModal()
    const receipt = await placeOrder({
      ...tokenFullId,
      price,
    })
    console.log(receipt)
    if (receipt?.blockNumber) {
      transferStore.onTransferDraft(BigInt(tokenFullId.tokenId), receipt.from, receipt?.blockNumber)
    }
  })

  return (
    <>
      <Modal
        closeButton
        open={modalOpen}
        width='465px'
        onClose={closeModal}
      >
        <ModalTitle>Put EFT on sale</ModalTitle>
        <ModalBody css={{ padding: 0 }}>
          <OrderForm
            tokenFullId={tokenFullId}
            onSubmit={onSubmit}
          />
        </ModalBody>
      </Modal>
      <BaseModal {...modalProps} />
      <Button
        primary
        fullWidth
        borderRadiusSecond
        isDisabled={isLoading || isDisabled}
        onPress={openModal}
      >
        Put on sale
      </Button>
    </>
  )
}
