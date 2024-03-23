import FormControlLabel from '@mui/material/FormControlLabel'

import { styled } from '../../../../styles'

export const StyledCheckBoxContainer = styled(FormControlLabel, {
  borderRadius: '12px',
  outline: '1px solid #EAEAEC',
  padding: '16px',
  width: '100%',
  margin: '0 !important',
  transition: 'outline 0.25s ease-in-out',
  color: '$gray600',
  '&:hover': {
    outline: '1px solid $blue500',
    '> span:first-child': {
      boxShadow: 'none',
    },
  },
})
