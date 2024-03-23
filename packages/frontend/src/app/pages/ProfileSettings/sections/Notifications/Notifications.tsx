import React, { useMemo } from 'react'
import { type FieldValues } from 'react-hook-form'

import { BaseModal } from '../../../../components'
import { Timer } from '../../../../components/Timer'
import { useStores } from '../../../../hooks'
import { useStatusModal } from '../../../../hooks/useStatusModal'
import {
  CheckBox, CheckBoxContainer,
  type ControlledCheckBoxProps,
  type ControlledInputProps, Input, Txt,
} from '../../../../UIkit'
import { stringifyError } from '../../../../utils/error'
import { useUpdateProfile } from '../../helper/hooks/useUpdateProfile'
import {
  FormControlSettings,
  GrayBgText,
  StyledSectionContent,
  StyledTitleInput,
  StyledTitleSection,
} from '../../ProfileSettings.styles'

interface INotificationsSection<T extends FieldValues> {
  email: ControlledInputProps<T>
  emailNotification: ControlledCheckBoxProps<T>
  isEmailConfirmed?: boolean
  isEmailChanged?: boolean
  leftTime?: number
}

const NotificationsSection = <T extends FieldValues>({
  email,
  emailNotification,
  isEmailChanged,
  isEmailConfirmed,
  leftTime,
}: INotificationsSection<T>) => {
  const {
    statuses,
    updateEmail,
  } = useUpdateProfile()

  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Em data update completed successfully!',
    waitForSign: false,
    loadingMsg: 'Profile is updating',
  })

  const { errorStore } = useStores()

  const emailValue = email.control._getWatch('email')

  const isSuccessResendEmail = useMemo(() => {
    return (leftTime ?? 0) > 0
  }, [leftTime])

  return (
    <StyledSectionContent>
      <BaseModal {...modalProps} />
      <StyledTitleSection>Notifications</StyledTitleSection>
      <FormControlSettings>
        <StyledTitleInput>Email</StyledTitleInput>
        <Input<T>
          settings
          placeholder='Email address'
          controlledInputProps={email}
          disabled={isSuccessResendEmail}
          errorMessage={
            email.error ?? email.control._formState.errors.email?.message as string
          }
          isError={!!(email.error ?? email.control._formState.errors.email?.message)}
          notification={
            <Txt primary1>{'Please, verify your email address'}</Txt>
          }
          isNotification={!isEmailConfirmed && !isEmailChanged && !email.control._formState.errors.email?.message}
          rightInputContent={(leftTime ?? 0) > 0 ? <Timer time={leftTime ?? 0} /> : undefined}
        />
        {!isEmailConfirmed && (
          <div className='resetPassword' style={{ width: '100%', textAlign: 'right', marginTop: '8px' }}>
            <Txt
              primary1
              style={{ color: '#0090FF', cursor: isSuccessResendEmail ? 'inherit' : 'pointer' }}
              onClick={() => {
                if (isSuccessResendEmail) return
                updateEmail(emailValue).catch((e) => {
                  errorStore.showError(stringifyError(e))
                })
              }}
            >
              {
                isSuccessResendEmail ? 'Successfully sent' : 'Resend verification email'
              }
            </Txt>
          </div>
        )}
      </FormControlSettings>
      <FormControlSettings>
        <GrayBgText>
          Receive notifications about
          {' '}
          <Txt primary1>starting the deal</Txt>
          {' '}
          and
          {' '}
          <Txt primary1>transferring the keys</Txt>
          {' '}
          of the files
        </GrayBgText>
        <CheckBoxContainer
          control={(
            <CheckBox<T>
              controlledCheckBoxProps={emailNotification}
              disableRipple
            />
          )}
          label={<Txt primary1>by email</Txt>}
        />
      </FormControlSettings>
    </StyledSectionContent>
  )
}

export default NotificationsSection
