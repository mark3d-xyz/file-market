import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import { useAccount } from 'wagmi'

import { Api, type ProfileEmailExistsResponse } from '../../../swagger/Api'
import { BaseModal } from '../../components'
import { useStores } from '../../hooks'
import { useStatusModal } from '../../hooks/useStatusModal'
import { Button, PageLayout, Txt } from '../../UIkit'
import { wrapRequest } from '../../utils/error/wrapRequest'
import { requestJwtAccess } from '../../utils/jwt/function'
import { reduceAddress } from '../../utils/nfts'
import ReturnButton from './components/ReturnButton/ReturnButton'
import { useUpdateProfile } from './helper/hooks/useUpdateProfile'
import { type IProfileSettings } from './helper/types/formType'
import { Form, GrayBgText, StyledTitle, WalletName, WalletNameMobile } from './ProfileSettings.styles'
import AppearanceSection from './sections/Appereance/Appereance'
import Links from './sections/Links/Links'
import Notifications from './sections/Notifications/Notifications'

export default observer(function ProfileSettings() {
  const { userStore } = useStores()
  const { address } = useAccount()
  const profileService = new Api({ baseUrl: '/api' }).profile

  const [isEmailExist, setIsEmailExist] = useState<boolean>()
  const [isNameExist, setIsNamelExist] = useState<boolean>()
  const [isUrlExist, setIsUrlExist] = useState<boolean>()

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<IProfileSettings>({
    mode: 'all',
    defaultValues: {
      name: userStore.user?.name,
      username: userStore.user?.username,
      bio: userStore.user?.bio,
      email: userStore.user?.email,
      websiteUrl: userStore.user?.websiteUrl,
      twitter: userStore.user?.twitter,
      telegram: userStore.user?.telegram,
      discord: userStore.user?.discord,
      isEmailNotificationEnabled: userStore.user?.isEmailNotificationEnabled,
    },
  })

  const email = watch('email')
  const name = watch('name')
  const username = watch('username')

  const emailExistCheck = useDebouncedCallback(async (value) => {
    if (userStore.user?.email === email) {
      setIsEmailExist(false)

      return
    }

    return wrapRequest<ProfileEmailExistsResponse>(async () => {
      return requestJwtAccess(profileService.emailExistsCreate, { email: value })
    }).then((res) => {
      setIsEmailExist(res.exist)
    })
  }, 500,
  )

  const nameExistCheck = useDebouncedCallback(async (value) => {
    if (userStore.user?.name === name) {
      setIsEmailExist(false)

      return
    }

    return wrapRequest<ProfileEmailExistsResponse>(async () => {
      return requestJwtAccess(profileService.nameExistsCreate, { name: value })
    }).then((res) => {
      setIsNamelExist(res.exist)
    })
  }, 500,
  )

  const urlExistCheck = useDebouncedCallback(async (value) => {
    if (userStore.user?.username === username) {
      setIsEmailExist(false)

      return
    }

    return wrapRequest<ProfileEmailExistsResponse>(async () => {
      return requestJwtAccess(profileService.usernameExistsCreate, { username: value })
    }).then((res) => {
      setIsUrlExist(res.exist)
    })
  }, 500,
  )

  const {
    statuses,
    updateProfile,
    isEmailUpdated,
  } = useUpdateProfile()

  const onSubmit: SubmitHandler<IProfileSettings> = (data) => {
    updateProfile(data)
  }

  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Profile data update completed successfully!',
    loadingMsg: 'Profile is updating',
    waitForSign: false,
    successNavTo: isEmailUpdated ? undefined : `/profile/${statuses?.result?.username ?? statuses.result?.address}`,
  })

  const isExistProblem = useMemo(() => {
    return isNameExist || isUrlExist || isEmailExist
  }, [isNameExist, isUrlExist, isEmailExist])

  return (
    <>
      <BaseModal
        {...modalProps}
      />
      <PageLayout css={{ minHeight: '100vh' }}>
        <ReturnButton />
        <Form onSubmit={handleSubmit(onSubmit)}>
          <StyledTitle>Profile settings</StyledTitle>
          <GrayBgText YourWalletStyled>
            <Txt primary1>
              Your wallet:
            </Txt>
            <WalletName>
              {address ?? 'Please connect the wallet'}

            </WalletName>
            <WalletNameMobile>
              {reduceAddress(address ?? '') ?? 'Please connect the wallet'}

            </WalletNameMobile>
          </GrayBgText>
          <AppearanceSection<IProfileSettings>
            name={{
              control,
              setValue,
              name: 'name',
              rules: {
                validate: async (value) => {
                  if (!value) return
                  nameExistCheck(value)
                  if (value[0] === '0' && value[1] === 'x') return 'Please enter valid username'

                  return value.length > 3 && value.length < 50 ? undefined : 'The name must have more than 3 characters and less than 50 characters'
                },
              },
              error: isNameExist ? 'This name already exists' : undefined,
            }}
            url={{
              control,
              setValue,
              name: 'username',
              rules: {
                validate: async (value) => {
                  if (!value) return

                  urlExistCheck(value)

                  if (value.length < 3 || value.length > 50) return 'The username must have more than 3 characters and less than 50 characters'
                  if (value[0] === '0' && value[1] === 'x') return 'Please enter valid username'
                },
              },
              validateParams: {
                pattern: /^[a-z0-9_]+$/,
                isLowerCase: true,
              },
              error: isUrlExist ? 'This URL already exists' : undefined,
            }}
            bio={{
              setValue,
              control,
              name: 'bio',
              rules: {
                validate: (value) => {
                  if (!value) return

                  return value.length < 1000 ? undefined : 'The bio must have less than 1000 characters'
                },
              },
            }}
          />
          <Notifications<IProfileSettings>
            email={{
              control,
              setValue,
              name: 'email',
              rules: {
                validate: async (value) => {
                  if (!value) return

                  emailExistCheck(value)

                  return value?.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/) ? undefined : 'Please enter valid email'
                },
              },
              error: isEmailExist ? 'This email is exist' : undefined,
            }}
            emailNotification={{
              control,
              name: 'isEmailNotificationEnabled',
            }}
            isEmailConfirmed={userStore.user?.isEmailConfirmed ||
              !userStore.user?.email ||
              userStore.user?.email !== email}
            isEmailChanged={userStore.user?.email !== email}
            leftTime={userStore.timeToCanResend}
          />
          <Links<IProfileSettings>
            websiteUrl={{
              control,
              setValue,
              name: 'websiteUrl',
              rules: {
                validate: (value) => {
                  if (!value) return

                  return value?.match(/^(https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,40}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*$/) ? undefined : 'Please enter valid site'
                },
              },
            }}
            twitter={{
              control,
              setValue,
              name: 'twitter',
              rules: {
                validate: (value) => {
                  if (!value) return

                  return value.length < 50 ? undefined : 'The twitter must have less than 1000 characters'
                },
              },
            }}
            telegram={{
              control,
              setValue,
              name: 'telegram',
              rules: {
                validate: (value) => {
                  if (!value) return

                  return value.length < 50 ? undefined : 'The telegram must have less than 1000 characters'
                },
              },
            }}
            discord={{
              control,
              setValue,
              name: 'discord',
              rules: {
                validate: (value) => {
                  if (!value) return

                  return value.length < 50 ? undefined : 'The discord must have less than 1000 characters'
                },
              },
            }}
          />
          <Button
            primary
            type='submit'
            isDisabled={!!Object.keys(errors).length || isExistProblem}
            title={!Object.keys(errors).length ? undefined : 'Required fields must be filled'}
            css={{
              width: '240px',
            }}
          >
            Update profile
          </Button>
        </Form>
      </PageLayout>
    </>
  )
})
