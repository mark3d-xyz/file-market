import { RoundedBadge } from '../../../../UIkit'
import { StyledChainLogo, StyledHighlightedText, StyledMainText } from './BackedOnGreenfield.styles'

export const BackedOnGreenfield = () => {
  return (
    <RoundedBadge
      size='md'
      icon={<StyledChainLogo src='/OpBnb.svg' alt='Greenfield' />}
    >
      <span>
        <StyledMainText>Backed up on</StyledMainText>
        {' '}
        <StyledHighlightedText>BNB Greenfield</StyledHighlightedText>
      </span>
    </RoundedBadge>
  )
}
