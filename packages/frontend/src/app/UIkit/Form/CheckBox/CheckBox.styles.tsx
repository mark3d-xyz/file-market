import { Checkbox } from '@mui/material'

import { styled } from '../../../../styles'

export const StyledIconContainer = styled('div', {
  background: '#0090FF',
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const StyledCheckbox = styled(Checkbox, {
  '&.MuiCheckbox-root': {
    borderRadius: '8px',
    border: '2px solid #A9ADB1',
    background: '#D9D9D9',
    position: 'relative',
    overflow: 'hidden',
    width: '28px',
    height: '28px',
    boxShadow: '2px 2px 0px 0px rgba(0, 0, 0, 0.25)',
    marginRight: '12px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: 'none',
    },
  },
})
