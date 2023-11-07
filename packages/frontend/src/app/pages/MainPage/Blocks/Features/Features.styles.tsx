import { styled } from '../../../../../styles'

export const StyledFeaturesItemWrapper = styled('li', {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderBottom: '1px solid #EAEAEC',
  paddingTop: 8,
  paddingBottom: 7,
  '&:not(:nth-child(3n - 2)) > div': {
    borderLeft: '1px solid #EAEAEC',
    '@sm': {
      borderLeft: 0,
    },
  },
  '&:not(:nth-child(2n - 1)) > div': {

    '@sm': {
      borderLeft: '1px solid #EAEAEC',
    },
  },
  '&:last-child': {
    '@sm': {
      borderBottom: 0,
      gridColumn: '1 / 3',
    },
  },
})

export const StyledFeaturesItemInner = styled('div', {
  display: 'flex',
  columnGap: 8,
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingLeft: 16,
  '@md': {
    paddingLeft: 8,
  },
  '@sm': {
    paddingLeft: 11,
  },
  '@media (max-width: 380px)': {
    columnGap: 5,
    paddingLeft: 6,
  },
})

export const StyledFeaturesItemIcon = styled('img', {
  display: 'block',
  width: 24,
  height: 'auto',
  '@md': {
    width: 22,
  },
  '@sm': {
    width: 24,
  },
  '@media (max-width: 380px)': {
    width: 20,
  },
})

export const StyledFeaturesItemTitle = styled('p', {
  color: '$gray700',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: '$secondary',
  whiteSpace: 'nowrap',
  'span._desktop': {
    '@sm': {
      display: 'none',
    },
  },
  'span._mobile': {
    display: 'none',
    '@sm': {
      display: 'block',
    },
  },
})

export const StyledFeaturesList = styled('ul', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  maxWidth: 618,
  paddingTop: 31,
  '@lg': {
    maxWidth: 617,
  },
  '@md': {
    maxWidth: 498,
  },
  '@sm': {
    paddingTop: 36,
    gridTemplateColumns: '1fr 1.02fr',
  },
})
