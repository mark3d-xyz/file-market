import React, { useState } from 'react'

import { useStatusState, useStores } from '../../../hooks'
import { useJwtAuth } from '../../../hooks/useJwtAuth'
import { useStatusModal } from '../../../hooks/useStatusModal'
import { useUpdateProfile } from '../../../pages/ProfileSettings/helper/hooks/useUpdateProfile'
import { useUploadLighthouse } from '../../../processing'
import { Txt } from '../../../UIkit'
import { BaseModal } from '../../Modal'
import {
  type IEditProfileImageDialogForm,
} from '../ProfileImage/EditProfileImageDialog/EditProfileImageDialog'
import { StyledBanner, StyledBannerContent, StyledBannerEditCard } from './Banner.styles'
import { EditProfileBannerDialog } from './EditProfileBannerDialog/EditProfileBannerDialog'

interface IProfileImageProps {
  src?: string
  isOwner?: boolean
  onSuccess?: () => void
}

const Banner = ({ src, isOwner, onSuccess }: IProfileImageProps) => {
  const [isShowEdit, setIsShowEdit] = useState<boolean>(false)
  const { dialogStore, userStore } = useStores()
  const { uploadWithoutToken } = useUploadLighthouse()
  const openWindow = () => {
    dialogStore.openDialog({
      component: EditProfileBannerDialog,
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
      bannerUrl: url.url,
    })

    return Date.now().toString()
  })

  const connectFunc = useJwtAuth({
    isWithSign: true,
    onSuccess: () => {
      openWindow()
    },
  })

  const {
    updateProfile,
  } = useUpdateProfile(onSuccess)

  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Profile data update completed successfully!',
    waitForSign: false,
    loadingMsg: 'Profile is updating',
  })

  return (
    <>
      <BaseModal
        {...modalProps}
      />
      <StyledBanner
        onMouseEnter={() => { setIsShowEdit(true) }}
        onMouseLeave={() => { setIsShowEdit(false) }}
      >
        <StyledBannerContent
          style={{
            backgroundImage: !!src ? `url(${src})` : 'linear-gradient(135deg, #028FFF 0%, #04E762 100%)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: '16px',
          }}
          withHover={isOwner}
        >
          {
            (isShowEdit && isOwner) && (
              <StyledBannerEditCard onClick={() => {
                connectFunc()
              }}
              >
                <Txt primary1>Edit cover</Txt>
              </StyledBannerEditCard>
            )}
        </StyledBannerContent>
      </StyledBanner>
    </>
  )
}

export default Banner
