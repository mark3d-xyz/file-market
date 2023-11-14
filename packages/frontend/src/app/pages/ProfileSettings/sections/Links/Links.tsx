import React from 'react'
import { type FieldValues } from 'react-hook-form'

import { TextStartInput } from '../../../../components/Form/TextStartInput/TextStartInput'
import { type ControlledInputProps, Input } from '../../../../UIkit'
import {
  FormControlSettings,
  StyledSectionContent,
  StyledTitleInput,
  StyledTitleSection,
} from '../../ProfileSettings.styles'

interface ILinksSection<T extends FieldValues> {
  websiteUrl: ControlledInputProps<T>
  twitter: ControlledInputProps<T>
  telegram: ControlledInputProps<T>
  discord: ControlledInputProps<T>
  instagram: ControlledInputProps<T>
}

const LinksSection = <T extends FieldValues>({ websiteUrl, telegram, discord, twitter, instagram }: ILinksSection<T>) => {
  return (
    <StyledSectionContent>
      <StyledTitleSection>Links</StyledTitleSection>
      <FormControlSettings>
        <StyledTitleInput>Website</StyledTitleInput>
        <Input<T>
          settings
          placeholder='Website URL'
          controlledInputProps={websiteUrl}
          errorMessage={websiteUrl.control._formState.errors.websiteUrl?.message as string}
          isError={!!websiteUrl.control._formState.errors.websiteUrl?.message}
        />
      </FormControlSettings>
      <FormControlSettings>
        <StyledTitleInput>X (ex-twitter) handle</StyledTitleInput>
        <TextStartInput<T>
          inputProps={{
            placeholder: 'X username',
            settings: true,
            errorMessage: twitter.control._formState.errors.twitter?.message as string,
            isError: !!twitter.control._formState.errors.twitter?.message,
          }}
          controlledInputProps={twitter}
          textStart={'@'}
        />
      </FormControlSettings>
      <FormControlSettings>
        <StyledTitleInput>Instagram handle</StyledTitleInput>
        <TextStartInput<T>
          inputProps={{
            placeholder: 'Instagram username',
            settings: true,
            errorMessage: instagram.control._formState.errors.instagram?.message as string,
            isError: !!instagram.control._formState.errors.instagram?.message,
          }}
          controlledInputProps={instagram}
          textStart={'@'}
        />
      </FormControlSettings>
      <FormControlSettings>
        <StyledTitleInput>Telegram handle</StyledTitleInput>
        <TextStartInput<T>
          inputProps={{
            placeholder: 'Telegram username',
            settings: true,
            errorMessage: telegram.control._formState.errors.telegram?.message as string,
            isError: !!telegram.control._formState.errors.telegram?.message,
          }}
          controlledInputProps={telegram}
          textStart={'@'}
        />
      </FormControlSettings>
      <FormControlSettings>
        <StyledTitleInput>Discord</StyledTitleInput>
        <Input<T>
          settings
          placeholder='Discord username'
          controlledInputProps={discord}
          errorMessage={discord.control._formState.errors.discord?.message as string}
          isError={!!discord.control._formState.errors.discord?.message}
        />
      </FormControlSettings>
    </StyledSectionContent>
  )
}

export default LinksSection
