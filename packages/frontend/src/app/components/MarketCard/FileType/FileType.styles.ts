import { styled } from '../../../../styles'

export const StyledFileType = styled('div', {
  borderRadius: '$1',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'all 0.25s ease-in-out',
  '& img': {
    width: '16px',
    height: '16px',
  },
  padding: 0,
  backgroundColor: 'none',
  boxShadow: 'initial',
})
