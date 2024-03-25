import { styled } from '../../../../../styles'
import { textVariant } from '../../../../UIkit'

export const StyledMainText = styled('span', {
  ...textVariant('body4').true,
  color: '$gray700',
})

export const StyledHighlightedText = styled('span', {
  ...textVariant('body4').true,
  fontWeight: '700',
  color: '$gray700',
  fontStyle: 'italic',
})

export const StyledChainLogo = styled('img', {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
})
