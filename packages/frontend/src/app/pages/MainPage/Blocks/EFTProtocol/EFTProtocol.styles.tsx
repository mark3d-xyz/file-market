import { styled } from '../../../../../styles'

export const StyledEFTProtocol = styled('div', {
  marginBottom: 120,
  '@lg': {
    marginBottom: 100,
  },
  '@md': {
    marginBottom: 85,
  },
  '@sm': {
    marginBottom: 70,
  },
  '@xs': {
    marginBottom: 55,
  },
})

export const StyledContentWrapper = styled('div', {
  maxWidth: 660,
  '@lg': {
    maxWidth: 600,
  },
})

export const StyledEFTProtocolText = styled('p', {
  color: '$gray700',
  fontSize: 20,
  fontWeight: 400,
  lineHeight: '140%',
  '@lg': {
    fontSize: 18,
  },
  '@md': {
    fontSize: 16,
  },
  '& + &': {
    marginTop: 12,
  },
})

export const StyledEFTProtocolLogo = styled('img', {
  position: 'absolute',
  left: 820,
  top: '58%',
  transform: 'translateY(-50%)',
  width: 450,
  height: 'auto',
  '@xl': {
    top: '50%',
    left: 'auto',
    width: 312,
    right: 0,
  },
  '@lg': {
    top: '45%',
    width: 300,
    right: 'calc(50% - 40vw - 100px)',
  },
  '@md': {
    display: 'none',
  },
})
