import { type PressEvent } from '@react-types/shared/src/events'
import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { useRef } from 'react'

import { styled } from '../../../../../styles'
import { useStatusModal } from '../../../../hooks/useStatusModal'
import { useLike } from '../../../../processing/Like/useLike'
import { type TokenFullId } from '../../../../processing/types'
import BaseModal from '../../../Modal/Modal'
import { wrapButtonActionsFunction } from '../../../NFT/NFTDeal/helper/wrapButtonActionsFunction'
import FlameFinalSub from '../flame-active.svg?react'
import FlameIconMain from '../flame-morph.svg?react'
import { useCardFlameAnimation } from './useCardFlameAnimation'

gsap.registerPlugin(MorphSVGPlugin)

interface CardFlameProps {
  flameSize?: number
  withState?: boolean
  playState?: boolean
  tokenFullId: TokenFullId
}

const FlameWrapper = styled('div', {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  position: 'relative',
  width: 32,
  height: 32,
})

const StyledFlameIconMain = styled(FlameIconMain, {
  position: 'absolute',
  zIndex: 2,
  width: '100%',
  height: '100%',
  color: 'white',
  '#partTopStart': {
    color: 'transparent',
    opacity: 0.2,
  },
  '#partCenterStart': {
    color: 'transparent',
    opacity: 0.4,
  },
  '#partBottomStart': {
    color: '#A9ADB1',
    opacity: 0.8,
  },
  '#partTopEnd': {
    color: '#EAEAEC',

  },
  '#partCenterEnd': {
    color: '#C9CBCF',
  },
  '#partBottomEnd': {
    color: '#A9ADB1',
  },
  '#partBorder': {
    color: '#6B6F76',
  },
})

const StyledFlameFinal = styled(FlameFinalSub, {
  position: 'absolute',
  zIndex: 1,
  top: 0,
  left: 0,
  opacity: 0,
  width: '100%',
  transform: 'scaleX(0.5)',
  height: '100%',
})

export const CardFlame = ({ flameSize, withState, playState, tokenFullId }: CardFlameProps) => {
  const tlRef = useRef<GSAPTimeline | null>(null)

  const { handleMouseLeave, handleMouseOver } = useCardFlameAnimation({ tlRef, playState })

  const { like, ...statuses } = useLike()
  const { wrapAction } = wrapButtonActionsFunction<PressEvent>()
  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Order cancelled',
    loadingMsg: 'Cancelling order',
  })

  return (
    <>
      <BaseModal {...modalProps} />
      <FlameWrapper
        onClick={() => {
          wrapAction(async () => {
            await like(tokenFullId)
          })
        }}
        onMouseOver={!withState ? handleMouseOver : () => {}}
        onMouseLeave={!withState ? handleMouseLeave : () => {}}
        style={{ width: `${flameSize || 32}px`, height: `${flameSize || 32}px` }}
      >
        <StyledFlameFinal className='flameFinal' />
        <StyledFlameIconMain className='flame' />
      </FlameWrapper>
    </>
  )
}
