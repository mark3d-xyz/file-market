import React, { type FC, type ReactNode } from 'react'

import LoadingIcon from '../../../assets/img/LoadingIconModal.svg'
import SuccessfullImg from '../../../assets/img/SuccesfullIcon.svg'
import { styled } from '../../../styles'
import { ButtonGlowing, ButtonNavGlowing } from '../../UIkit'
import { Modal, ModalBody, ModalButtonContainer, ModalP, ModalTitle } from '../../UIkit/Modal/Modal'
import { type AppDialogProps } from '../../utils/dialog'

export interface InProcessBodyProps {
  text: ReactNode
  mainText?: ReactNode
  waitForSign?: boolean
  srcIcon?: string
  icon?: ReactNode
}

const Loading = styled('img', {
  width: '130px',
  margin: '0 auto',
  marginBottom: '20px',
})

export const InProgressBody: React.FC<InProcessBodyProps> = ({
  text,
  mainText,
  waitForSign = true,
  srcIcon = LoadingIcon,
  icon,
}) => (
  <>
    { icon ?? <Loading src={srcIcon} /> }
    <ModalTitle>{text}</ModalTitle>
    {waitForSign && <ModalP style={{ fontSize: '16px' }}>{mainText ?? 'Please check your wallet and sign the transaction'}</ModalP>}
  </>
)

interface SuccessNavBodyProps {
  buttonText: string
  link: string
  onPress: () => void
  underText?: ReactNode
  isSuccessImg?: boolean
  mainText?: ReactNode
}
export const SuccessNavBody = ({
  buttonText,
  link,
  onPress,
  underText,
  mainText,
  isSuccessImg = true,
}: SuccessNavBodyProps) => {
  return (
    <>
      {isSuccessImg && <ModalTitle style={{ marginBottom: '40px' }}><img src={SuccessfullImg} /></ModalTitle>}
      <ModalP style={{ marginBottom: '40px' }}>{ mainText ?? 'Success'}</ModalP>
      {underText && <ModalP style={{ marginBottom: '40px', fontSize: '18px' }}>{underText}</ModalP>}
      <ModalButtonContainer style={{ justifyContent: 'center' }}>
        <ButtonNavGlowing
          whiteWithBlue
          modalButton
          to={link}
          onPress={onPress}
        >
          {buttonText}
        </ButtonNavGlowing>
      </ModalButtonContainer>
    </>
  )
}
export interface SuccessOkBodyProps {
  description: ReactNode
  handleClose?: () => void
  isSuccessImg?: boolean
  buttonText?: string
  icon?: ReactNode
  underText?: ReactNode
}

export const SuccessOkBody: FC<SuccessOkBodyProps> = ({
  description,
  handleClose,
  isSuccessImg = true,
  buttonText,
  icon,
  underText,
}) => (
  <>
    {isSuccessImg && (
      <ModalTitle style={{ marginBottom: '40px' }}>
        { icon ?? <img src={SuccessfullImg} />}
      </ModalTitle>
    )}
    <ModalTitle style={{ marginBottom: '12px', fontSize: '20px' }}>
      { description }
    </ModalTitle>
    <ModalP style={{ marginBottom: '40px', fontSize: '14px', fontWeight: '400' }}>{underText}</ModalP>
    {handleClose && (
      <ModalButtonContainer style={{ justifyContent: 'center' }}>
        <ButtonGlowing whiteWithBlue modalButton onPress={handleClose}>{buttonText ?? 'Cool'}</ButtonGlowing>
      </ModalButtonContainer>
    )}
  </>
)

export const ErrorBody = ({ message, onClose }: { message: string, onClose?: () => void }) => (
  <>
    <ModalTitle style={{ color: '#C54B5C' }}>Error</ModalTitle>
    <ModalP css={{ fontSize: '16px', fontWeight: '400', wordBreak: 'break-all', textAlign: 'center' }}>{message}</ModalP>
    <ModalButtonContainer>
      <ButtonGlowing
        modalButton
        whiteWithBlue
        modalButtonFontSize
        onPress={() => {
          onClose?.()
        }}
      >
        Got it
      </ButtonGlowing>
    </ModalButtonContainer>
  </>
)

export type MintModalProps = AppDialogProps<{
  body?: ReactNode
  footer?: ReactNode
  onOpen?: () => void
  isError?: boolean
  isLoading?: boolean
}>

export default function BaseModal({
  onClose,
  open,
  body,
  footer,
  onOpen,
  isError,
  isLoading,
}: MintModalProps) {
  return (
    <Modal
      aria-labelledby='modal-title'
      open={open}
      width={'max-content'}
      isError={isError}
      preventClose={isLoading}
      style={{
        maxWidth: '690px',
      }}
      onClose={onClose}
      onOpen={onOpen}
    >
      {body && <ModalBody style={{ padding: 0 }}>{body}</ModalBody>}
      {footer}
    </Modal>
  )
}
