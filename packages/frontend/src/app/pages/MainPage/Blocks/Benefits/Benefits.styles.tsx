import { styled } from '../../../../../styles'

export const StyledBenefitItem = styled('li', {
  display: 'flex',
  columnGap: 12,
  justifyContent: 'flex-start',
  border: '2px solid #898E94',
  borderRadius: 16,
  padding: 14,
  paddingRight: 12,
  background: '$white',
})

export const StyledBenefitItemIconsWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: 4,
  '@sm': {
    alignSelf: 'center',
  },
})

export const StyledBenefitItemIconMain = styled('img', {
  minWidth: 40,
  maxWidth: 40,
  height: 'auto',
  '@md': {
    minWidth: 32,
    maxWidth: 32,
  },
  '@sm': {
    height: 34,
  },
  '@xs': {
    height: 36,
  },
})

export const StyledBenefitItemTitle = styled('h4', {
  color: '$gray700',
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '20px',
  marginBottom: 8,
})

export const StyledBenefitItemText = styled('p', {
  color: '$gray700',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '20px',
})

export const StyledBenefitItemDotsGradient = styled('img', {
  height: 44,
  width: 'auto',
  '@md': {
    height: 34,
  },
  '@sm': {
    height: 36,
  },
  '@xs': {
    height: 38,
  },
})

export const StyledBenefits = styled('section', {
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

export const StyledBenefitsList = styled('ul', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  columnGap: 16,
  rowGap: 16,
  gridAutoRows: '1fr',
  '@lg': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@md': {
    gridTemplateColumns: 'repeat(1, 1fr)',
    rowGap: 12,
  },
})
