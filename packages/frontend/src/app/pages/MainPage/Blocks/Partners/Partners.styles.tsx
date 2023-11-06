import { styled } from '../../../../../styles'

export const StyledPartnerItem = styled('li', {
  width: 96,
  height: 96,
  backgroundColor: '$gray100',
  borderRadius: 12,
  boxShadow: '0px 0px 0px 0px #d9d9d9',
  border: '1px solid transparent',
  transition: 'box-shadow 0.25s ease-in-out, border-color 0.25s ease-in-out',
  '&:hover': {
    borderColor: '#A9ADB1',
    boxShadow: '2px 2px 0px 0px #d9d9d9',
  },
  variants: {
    size: {
      x2: {
        width: 194,
        height: 96,
      },
    },
    noPointerEvents: {
      true: {
        pointerEvents: 'none',
      },
    },
  },
})

export const StyledPartnerItemLink = styled('a', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
})

export const StyledPartners = styled('section', {
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

export const StyledPartnersList = styled('ul', {
  display: 'flex',
  gap: 2,
  flexWrap: 'wrap',
  minWidth: 1770,
})

export const StyledPartnersScrollWrapper = styled('div', {
  maxWidth: '100%',
  '@sm': {
    position: 'relative',
    left: -10,
  },
})
