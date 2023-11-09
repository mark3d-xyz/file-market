import { styled } from '../../../../../styles'
import { Button } from '../../../../UIkit/Button/Button/Button'
import { LinkButton } from '../../../../UIkit/Button/LinkButton/LinkButton'

export const StyledWhatCanBeSold = styled('section', {
  marginBottom: 120,
  '@lg': {
    marginBottom: 105,
  },
  '@md': {
    marginBottom: 90,
  },
  '@sm': {
    marginBottom: 75,
  },
})

export const StyledInfo = styled('p', {
  fontSize: 20,
  fontStyle: 'normal',
  fontWeight: '400',
  lineHeight: '140%',
  maxWidth: 720,
  '@lg': {
    fontSize: 18,
  },
  '@md': {
    fontSize: 16,
  },
  '& + &': {
    marginTop: 13,
    '@lg': {
      marginTop: 10,
    },
    '@md': {
      marginTop: 8,
    },
  },
  '&:last-of-type': {
    marginBottom: 31,
    '@lg': {
      marginBottom: 28,
    },
    '@md': {
      marginBottom: 24,
    },
  },
})

export const StyledSellableItemsList = styled('ul', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  columnGap: 22,
  rowGap: 16,
  maxWidth: '100%',
  width: '100%',
  minWidth: '100%',
  marginBottom: 18,
  '@xl': {
    columnGap: 16,
    rowGap: 13,
  },
  '@lg': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@md': {
    gridTemplateColumns: 'repeat(1, 1fr)',
  },
})

export const StyledExploreButton = styled(LinkButton, {
  width: '100%',
  marginBottom: 120,
  '@lg': {
    marginBottom: 105,
  },
  '@md': {
    marginBottom: 90,
  },
  '@sm': {
    marginBottom: 75,
  },
})

export const StyledStartSellingTitle = styled('h2', {
  color: '$grey700',
  textAlign: 'center',
  fontFamily: '$fourfold',
  fontSize: '48px',
  fontWeight: '700',
  lineHeight: '56px',
  marginBottom: '41px',
  '@lg': {
    fontSize: 'calc(1.5vw + 25px)',
    lineHeight: 1,
  },
  '@sm': {
    fontSize: 26,
  },
  '@xs': {
    fontSize: 24,
  },
})

export const StyledStartSellingButton = styled(Button, {
  fontSize: 24,
  lineHeight: '32px',
  fontWeight: 600,
  display: 'block',
  maxWidth: 344,
  margin: '0 auto',
  borderRadius: 16,
  padding: '16px 96px',
  '@lg': {
    fontSize: 22,
    lineHeight: '30px',
    padding: '16px 88px',
  },
  '@sm': {
    fontSize: 20,
    lineHeight: '28px',
    minWidth: '100%',
  },
  '@xs': {
    fontSize: 18,
    lineHeight: '26px',
  },
})
