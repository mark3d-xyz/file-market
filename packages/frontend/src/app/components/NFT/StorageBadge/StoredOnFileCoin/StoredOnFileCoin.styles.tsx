import { styled } from '../../../../../styles'
import { textVariant } from '../../../../UIkit'

export const StyledText = styled('span', {
  ...textVariant('primary2'),
  color: '$gray600',
})

export const StyledChainLogo = styled('img', {
  width: '24px',
  height: '24px',
  borderRadius: '50$',
})
