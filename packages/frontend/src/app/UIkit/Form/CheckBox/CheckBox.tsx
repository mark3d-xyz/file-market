import { type Checkbox as CheckBoxDefault } from '@mui/material'
import React, { type ComponentProps } from 'react'
import {
  type Control,
  Controller, type FieldValues, type Path,
} from 'react-hook-form'
import { type RegisterOptions } from 'react-hook-form/dist/types/validator'

import { StyledCheckbox, StyledIconContainer } from './CheckBox.styles'

export const CheckedIcon = () => {
  return (
    <StyledIconContainer>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="10"
        viewBox="0 0 14 10"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.7493 0L4.95043 6.60063L2.25073 3.97964L0.5 5.67932L4.95043 10L13.5 1.69969L11.7493 0Z"
          fill="white"
        />
      </svg>
    </StyledIconContainer>
  )
}

export interface ControlledCheckBoxProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  placeholder?: string
  rules?: RegisterOptions
}

export type CheckBoxProps = & {
  errorMessage?: string
}

export type CheckBoxControlProps<T extends FieldValues> = CheckBoxProps
& Omit<ComponentProps<typeof CheckBoxDefault>, 'sx' | 'disableRipple'>
& {
  controlledCheckBoxProps: ControlledCheckBoxProps<T>
}

export const CheckBox = <T extends FieldValues>({
  controlledCheckBoxProps,
  ...inputProps
}: CheckBoxControlProps<T>) => {
  return (
    <Controller
      control={controlledCheckBoxProps?.control}
      name={controlledCheckBoxProps?.name}
      rules={controlledCheckBoxProps?.rules}
      render={({ field: { value, ...field } }) => (
        <StyledCheckbox
          {...inputProps}
          checkedIcon={<CheckedIcon />}
          icon={<span />}
          {...field}
          checked={value}
          disableRipple
        />
      )}
    />
  )
}
