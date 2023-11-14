import { useCallback, useState } from 'react'

import { type UserProfile } from '../../../../../swagger/Api'
import { useStatusState, useStores } from '../../../../hooks'
import { useAfterDidMountEffect } from '../../../../hooks/useDidMountEffect'
import { type IProfileSettings } from '../types/formType'

export const useUpdateProfile = (onSuccess?: () => void) => {
  const { userStore } = useStores()
  const [formToTransfer, setFormToTransfer] = useState<IProfileSettings>({
    name: '',
    username: '',
    bio: '',
    email: '',
    isEmailNotificationEnabled: false,
    websiteUrl: '',
    twitter: '',
    telegram: '',
    discord: '',
    instagram: '',
  })
  const [isEmailUpdated, setIsEmailUpdated] = useState<boolean>(false)
  const {
    wrapPromise,
    statuses,
    setError,
    setIsLoading,
  } = useStatusState<UserProfile | undefined | IProfileSettings, IProfileSettings>()

  const updateEmail = async (email?: string) => {
    await userStore.updateEmail(email)
  }

  const updateProfile = useCallback(wrapPromise(async (props: IProfileSettings) => {
    if (props.email !== userStore.user?.email) {
      await updateEmail(props.email)
      setIsEmailUpdated(true)

      return props
    } else setIsEmailUpdated(false)
    const result = await userStore.updateUserInfo(props)
    onSuccess?.()

    return result
  }), [userStore, onSuccess])

  useAfterDidMountEffect(() => {
    void updateProfile(formToTransfer)
  }, [formToTransfer])

  return {
    setError,
    setIsLoading,
    statuses,
    isEmailUpdated,
    updateProfile: (form: IProfileSettings) => {
      setFormToTransfer(form)
    },
    updateEmail,
  }
}
