import { gsap } from 'gsap'
import { type MutableRefObject, useCallback, useEffect } from 'react'

interface IUseCardFlameAnimationProps {
  tlBurningRef: MutableRefObject<gsap.core.Timeline | null>
  isModal?: boolean
  modalLoadFinished?: boolean
  tlGlowingRef: MutableRefObject<gsap.core.Timeline | null>
  successState?: boolean
}

export const useCardFlameAnimation = ({
  tlBurningRef,
  isModal = false,
  modalLoadFinished,
  tlGlowingRef,
  successState,
}: IUseCardFlameAnimationProps) => {
  useEffect(() => {
    const flameFinal = gsap.utils.toArray('.flameFinal')

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.pause()

      tl.to(flameFinal, {
        duration: 0.3,
        opacity: 1,
        scaleX: 1,
        ease: 'power1.inOut',
      }, 0.3)
        .to('#partTopStart', { duration: 0.3, ease: 'power1.inOut', morphSVG: '#partTopEnd', opacity: 1 }, 0.3)
        .to('#partCenterStart', { duration: 0.4, ease: 'power1.inOut', morphSVG: '#partCenterEnd', opacity: 1 }, 0.1)
        .to('#partBottomStart', { duration: 0.5, ease: 'power1.inOut', morphSVG: '#partBottomEnd', opacity: 1 }, 0)
        .to('#partTopStart', { duration: 0.1, ease: 'power1.inOut', color: '#FFB245' }, 0)
        .to('#partTopStart', { duration: 0.1, ease: 'power1.inOut', color: '#FB5532' }, 0.25)
        .to('#partCenterStart', { duration: 0.1, ease: 'power1.inOut', color: '#FFE562' }, 0)
        .to('#partCenterStart', { duration: 0.1, ease: 'power1.inOut', color: '#FFB245' }, 0.05)
        .to('#partBottomStart', { duration: 0.1, ease: 'power1.inOut', color: '#FFE562' }, 0).to('#partBorder', { duration: 0.45, ease: 'power1.inOut', color: '#CC102B' }, 0.15)

      tlBurningRef.current = tl
      tlBurningRef.current.timeScale(1.5)
    })

    return () => {
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      isModal && gsap.set('feGaussianBlur', {
        attr: { stdDeviation: 6 },
      })

      const tl = gsap.timeline({ repeat: -1, yoyo: true })
      tl.pause()

      tl.to('feGaussianBlur', {
        attr: { stdDeviation: 1.5 },
        duration: 1.2,
        ease: 'power1.inOut',
      })

      tlGlowingRef.current = tl
    })

    return () => {
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    isModal && tlBurningRef.current?.progress(1)
    isModal && tlGlowingRef.current?.play()
  }, [isModal])

  const handleMouseOver = useCallback(() => {
    if (tlBurningRef.current) {
      tlBurningRef.current.play()
    }
  }, [tlBurningRef])

  const handleMouseLeave = useCallback(() => {
    if (tlBurningRef.current) {
      tlBurningRef.current.reverse()
    }
  }, [tlBurningRef])

  useEffect(() => {
    if (isModal && successState && tlGlowingRef.current) {
      tlGlowingRef.current.pause()
      const flameGlowingHandlers = gsap.utils.toArray('feGaussianBlur') as HTMLElement[]
      const currentStdDeviation = gsap.getProperty(flameGlowingHandlers[0], 'stdDeviation') as number

      const targetStdDeviation = 6
      const originalDuration = 1.2

      gsap.to(flameGlowingHandlers, {
        attr: { stdDeviation: 6 },
        duration: () => originalDuration * (targetStdDeviation - currentStdDeviation) / (targetStdDeviation - 1.5),
        ease: 'power1.inOut',
      })
    }
  }, [successState])

  return {
    handleMouseOver,
    handleMouseLeave,
  }
}
