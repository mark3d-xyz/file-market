import { StyledHelperText } from '@nextui-org/react'

import { RoundedBadge } from '../../../../UIkit'
import { StyledMainText } from './BackedOnGreenfield.styles'

export const BackedOnGreenfield = () => {
  return (
    <RoundedBadge>
      <StyledMainText>Backed up on</StyledMainText>
      {' '}
      <StyledHelperText>BNB Greenfield</StyledHelperText>
    </RoundedBadge>
  )
}
