import { styled } from '../../../../../styles'

export const StyledGiftLabel = styled('div', {
  borderRadius: 43,

  '&::before': {
    position: 'absolute',
    zIndex: 1,
    content: '',
    top: '-2px',
    left: '-2px',
    width: 'calc(100% + 4px)',
    height: 'calc(100% + 4px)',
    borderRadius: 43,
    background: 'linear-gradient(96deg, #028FFF -13.62%, #04E762 115.74%)',
    boxShadow: '2px 2px 0px 0px rgba(0, 0, 0, 0.50)',
  },
})

export const StyledGiftGradientWrapper = styled('div', {
  borderRadius: 43,
  position: 'relative',
  background:
    'linear-gradient(96deg, rgba(2, 143, 255, 0.05) -13.62%, rgba(4, 231, 98, 0.05) 115.74%), white',
  zIndex: 2,
  padding: '10px 14px 8px',
  '@md': {
    padding: '8px 13px 6px',
  },
  '@sm': {
    padding: '7px 10px 6px',
  },
})

export const StyledGiftLabelText = styled('p', {
  display: 'flex',
  flexDirection: 'column',
  rowGap: 1,
  alignItems: 'center',
  textAling: 'center',
  color: 'transparent',
  '@sm': {
    padding: '0',
  },
})

export const StyledGiftLabelTextTop = styled('span', {
  fontSize: 16,
  fontWeight: 700,
  lineHeight: '14px',
  letterSpacing: 0.48,
  background: 'linear-gradient(96deg, #028FFF -13.62%, #04E762 115.74%)',
  backgroundClip: 'text',
  '@md': {
    fontSize: 15,
  },
  '@sm': {
    fontSize: 12,
    lineHeight: '12px',
  },
})

export const StyledGiftLabelTextBottom = styled('span', {
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '14px',
  letterSpacing: '0.12px',
  background: 'linear-gradient(96deg, #028FFF -13.62%, #04E762 115.74%)',
  backgroundClip: 'text',
  '@md': {
    fontSize: 11,
  },
  '@sm': {
    lineHeight: '12px',
    fontSize: 10,
  },
})
