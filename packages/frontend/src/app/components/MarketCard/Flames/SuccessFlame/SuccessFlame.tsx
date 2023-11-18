import React, { useRef } from 'react'

import {
  FlameWrapper,
  StyledFlameContainer,
  StyledFlameFinal,
  StyledFlameIconMain, useCardFlameAnimation,
} from '../CardFlame'

export const SuccessFlame = () => {
  const tlBurningRef = useRef<GSAPTimeline | null>(null)
  const tlGlowingRef = useRef<GSAPTimeline | null>(null)

  useCardFlameAnimation({
    tlBurningRef,
    isModal: true,
    tlGlowingRef,
    successState: true,
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
