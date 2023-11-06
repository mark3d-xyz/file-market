import { StyledGiftGradientWrapper, StyledGiftLabel, StyledGiftLabelText, StyledGiftLabelTextBottom, StyledGiftLabelTextTop } from './GiftLabel.styles'

const GiftLabel = () => {
  return (
    <StyledGiftLabel >
      <StyledGiftGradientWrapper>
        <StyledGiftLabelText>
          <StyledGiftLabelTextTop >FREE 1 GB</StyledGiftLabelTextTop>
          <StyledGiftLabelTextBottom >storage space</StyledGiftLabelTextBottom>
        </StyledGiftLabelText>
      </StyledGiftGradientWrapper>
    </StyledGiftLabel>
  )
}

export default GiftLabel
