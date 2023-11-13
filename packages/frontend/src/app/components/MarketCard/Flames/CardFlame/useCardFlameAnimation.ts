import { gsap } from 'gsap'
import { type MutableRefObject, useEffect } from 'react'

interface IUseCardFlameAnimationProps {
  tlRef: MutableRefObject<gsap.core.Timeline | null>
  playState?: boolean
}

export const useCardFlameAnimation = ({ tlRef, playState }: IUseCardFlameAnimationProps) => {
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

  return {
    handleMouseOver,
    handleMouseLeave,
  }
}
