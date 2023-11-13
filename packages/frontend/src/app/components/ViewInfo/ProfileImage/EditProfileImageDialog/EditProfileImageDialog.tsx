import React from 'react'
import { useForm } from 'react-hook-form'

import { ButtonGlowing, Txt } from '../../../../UIkit'
import {
  Modal,
  ModalBanner,
  ModalBody,
  ModalButtonContainer,
  ModalTitle,
} from '../../../../UIkit/Modal/Modal'
import { type AppDialogProps } from '../../../../utils/dialog'
import ImageLoader from '../../../Uploaders/ImageLoader/ImageLoader'

export interface IEditProfileImageDialogForm {
  image: File[]
}

type IEditProfileImageDialog = AppDialogProps<unknown> & {
  onSubmit: (item: IEditProfileImageDialogForm) => Promise<string | undefined>
}

export function EditProfileImageDialog({ open, onClose, onSubmit }: IEditProfileImageDialog): JSX.Element {
  const {
    register,
    resetField,
    handleSubmit,
  } = useForm<IEditProfileImageDialogForm>()

  return (
    <Modal
      closeButton
      aria-labelledby='modal-title'
      open={open}
      width={'320px'}
      onClose={onClose}
    >
      <ModalTitle style={{ marginBottom: 0 }}>
        Edit avatar
      </ModalTitle>
      <ModalBody edit style={{ paddingBottom: 0 }}>
        <form onSubmit={handleSubmit(async (item) => {
          onSubmit(item)
        })}
        >
          <ImageLoader
            registerProps={register('image', { required: true })}
            resetField={resetField}
            typesLoader={{
              avatar: true,
            }}
            text={'Choose file'}
          />
          <ModalBanner edit>
            <Txt primary1 style={{ color: '#6B6F76', fontWeight: '500' }}>
              <Txt primary1 style={{ color: '#2F3134' }}> Format: </Txt>
              {' '}
              jpg (max 5 MB)
            </Txt>
            <Txt primary1 style={{ color: '#6B6F76', fontWeight: '500' }}>
              <Txt primary1 style={{ color: '#2F3134' }}> Size: </Txt>
              {' '}
              300x300px
            </Txt>
          </ModalBanner>
          <ModalButtonContainer>
            <ButtonGlowing
              modalButton
              whiteWithBlue
              modalButtonFontSize
              type='submit'
            >
              Save changes
            </ButtonGlowing>
          </ModalButtonContainer>
        </form>
      </ModalBody>
    </Modal>
  )
}
