import React, { useRef } from 'react'

import {
  FlameWrapper,
  StyledFlameContainer,
  StyledFlameFinal,
  StyledFlameIconMain, useCardFlameAnimation,
} from '../CardFlame'

export const LoadingFlame = () => {
  const tlBurningRef = useRef<GSAPTimeline | null>(null)
  const tlGlowingRef = useRef<GSAPTimeline | null>(null)

  useCardFlameAnimation({
    tlBurningRef,
    isModal: true,
    tlGlowingRef,
  })

  return (
    <StyledFlameContainer isModal disabled>
      <FlameWrapper modal>
        <StyledFlameFinal className='flameFinal' />
        <StyledFlameIconMain className='flame' />
      </FlameWrapper>
    </StyledFlameContainer>
  )
}
