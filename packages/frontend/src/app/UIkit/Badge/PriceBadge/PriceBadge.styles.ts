import { styled } from '../../../../styles'
import { Flex } from '../../Flex'
import { textVariant } from '../../Txt'

export const StyledWrapper = styled('div', {
  width: '100%',
  borderRadius: '$1',
  variants: {
    size: {
      lg: { padding: '8px $3', borderRadius: '$3' },
      md: { padding: '10px $3', borderRadius: '$3' },
      sm: { padding: '6px 8px' },
    },
    background: {
      primary: {
        background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), $gray800',
      },
      secondary: {
        background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), $gray800',
      },
      notListed: {
        background: '#F4F5F5',
      },
    },
  },
})

export const StyledTitle = styled('div', {
  ...textVariant('primary2').true,
  color: '$gray500',
})

export const StyledFlex = styled(Flex, {
  color: '$gray800',
  variants: {
    size: {
      lg: { ...textVariant('body1').true, fontWeight: 600 },
      md: { ...textVariant('body2').true, fontWeight: 600 },
      sm: { ...textVariant('primary2').true },
    },
  },

})

export const StyledRight = styled('span', {
  color: '$gray600',
})
