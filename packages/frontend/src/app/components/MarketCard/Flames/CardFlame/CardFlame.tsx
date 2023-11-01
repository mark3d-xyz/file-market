import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { useEffect, useRef } from 'react'

import { styled } from '../../../../../styles'
import FlameFinalSub from '../flame-active.svg?react'
import FlameIconMain from '../flame-morph.svg?react'

gsap.registerPlugin(MorphSVGPlugin)

interface CardFlameProps {
  flameSize?: number
  withState?: boolean
  playState?: boolean
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

export const CardFlame = (props: CardFlameProps) => {
  const { flameSize, withState, playState } = props
  const tlRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    const flameFinal = gsap.utils.toArray('.flameFinal')

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.pause()

      tl.to(flameFinal, {
        duration: 0.5,
        opacity: 1,
        scaleX: 1,
        ease: 'power1.inOut',
      }, 0.6)
        .to('#partTopStart', { duration: 0.6, ease: 'power1.inOut', morphSVG: '#partTopEnd', opacity: 1 }, 0.4)
        .to('#partCenterStart', { duration: 0.8, ease: 'power1.inOut', morphSVG: '#partCenterEnd', opacity: 1 }, 0.2)
        .to('#partBottomStart', { duration: 1, ease: 'power1.inOut', morphSVG: '#partBottomEnd', opacity: 1 }, 0).to('#partBorder', { duration: 1, ease: 'power1.inOut', color: '#D62632' }, 0)
        .to('#partTopStart', { duration: 0.2, ease: 'power1.inOut', color: '#D62632' }, 0.6)
        .to('#partTopStart', { duration: 0.2, ease: 'power1.inOut', color: '#FB5532' }, 0.8)
        .to('#partCenterStart', { duration: 0.2, ease: 'power1.inOut', color: '#FB5532' }, 0.4)
        .to('#partCenterStart', { duration: 0.4, ease: 'power1.inOut', color: '#FFB245' }, 0.6)
        .to('#partBottomStart', { duration: 0.4, ease: 'power1.inOut', color: '#FFE562' }, 0).to('#partBorder', { duration: 1, ease: 'power1.inOut', color: '#D62632' }, 0)

      tlRef.current = tl
    })

    return () => {
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    playState && tlRef.current?.play()
  }, [playState])

  const handleMouseOver = () => {
    if (tlRef.current) {
      tlRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (tlRef.current) {
      tlRef.current.reverse()
    }
  }

  return (
    <FlameWrapper
      onMouseOver={!withState ? handleMouseOver : () => {}}
      onMouseLeave={!withState ? handleMouseLeave : () => {}}
      style={{ width: `${flameSize || 32}px`, height: `${flameSize || 32}px` }}
    >
      <StyledFlameFinal className='flameFinal' />
      <StyledFlameIconMain className='flame' />
    </FlameWrapper>
  )
}
