import React, { useState } from 'react'

import { useStatusState, useStores } from '../../../hooks'
import { useJwtAuth } from '../../../hooks/useJwtAuth'
import { useStatusModal } from '../../../hooks/useStatusModal'
import { useUpdateProfile } from '../../../pages/ProfileSettings/helper/hooks/useUpdateProfile'
import { useUploadLighthouse } from '../../../processing'
import { gradientPlaceholderImg } from '../../../UIkit'
import { BaseModal } from '../../Modal'
import {
  EditProfileImageDialog,
  type IEditProfileImageDialogForm,
} from './EditProfileImageDialog/EditProfileImageDialog'
import ChangeLogoImg from './img/ChangeLogo.png'
import { StyledProfileCameraImage, StyledProfileImage, StyledProfileImageContent } from './ProfileImage.styles'

interface IProfileImageProps {
  src?: string
  isOwner?: boolean
  onSuccess?: () => void
}

const ProfileImage = ({ src, isOwner, onSuccess }: IProfileImageProps) => {
  const [isShowEdit, setIsShowEdit] = useState<boolean>(false)

  const { dialogStore, userStore } = useStores()
  const { uploadWithoutToken } = useUploadLighthouse()
  const openWindow = () => {
    dialogStore.openDialog({
      component: EditProfileImageDialog,
      props: {
        onSubmit: updateProfileFunc,

      },
    })
  }

  const { wrapPromise, statuses } = useStatusState<string, IEditProfileImageDialogForm>()

  const updateProfileFunc = wrapPromise(async (item: IEditProfileImageDialogForm) => {
    const url = await uploadWithoutToken(item.image[0])
    updateProfile({
      ...userStore.user,
      avatarUrl: url.url,
    })

    return Date.now().toString()
  })

  const connectFunc = useJwtAuth({
    isWithSign: true,
    onSuccess: () => {
      openWindow()
    },
  })

  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Profile data update completed successfully!',
    waitForSign: false,
    loadingMsg: 'Profile is updating',
  })

  const {
    updateProfile,
  } = useUpdateProfile(onSuccess)

  return (
    <>
      <BaseModal
        {...modalProps}
      />
      <StyledProfileImage
        onMouseEnter={() => { setIsShowEdit(true) }}
        onMouseLeave={() => { setIsShowEdit(false) }}
      >

        <StyledProfileImageContent
          style={{
            backgroundImage: `url(${!!src ? src : gradientPlaceholderImg})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: '50%',
          }}
          withHover={isOwner}
        >
          {
            (isShowEdit && isOwner) && (
              <StyledProfileCameraImage
                src={ChangeLogoImg}
                onClick={() => {
                  connectFunc()
                }
                }
              />
            )}
        </StyledProfileImageContent>
      </StyledProfileImage>
    </>
  )
}

export default ProfileImage
