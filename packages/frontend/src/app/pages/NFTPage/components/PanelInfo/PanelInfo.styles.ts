import { styled } from '../../../../../styles'

export const StyledPanelInfo = styled('div', {
  borderRadius: '12px 12px 0px 0px',
  background: '#2F3134',
  padding: '12px 0 32px',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  top: 'calc( -$6 + 4px )',
  zIndex: '2',
  position: 'relative',
})

export const StyledPanelInfoContainer = styled('div', {
  display: 'flex',
  width: '100%',
  gap: '70px',
  justifyContent: 'center',
  '@sm': {
    gap: '4px',
    justifyContent: 'space-between',
    padding: '0 16px',
    maxWidth: '450px',
  },
})
