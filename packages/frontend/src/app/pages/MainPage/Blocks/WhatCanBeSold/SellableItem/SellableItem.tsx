import gsap from 'gsap'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useDebounce } from 'use-debounce'

import plusSignImg from '../../../img/WhatCanBeSold/plus-sign.svg'
import { StyledItemBackground, StyledItemContentWrapper, StyledItemDescriptionFull, StyledItemDescriptionShort, StyledItemIcon, StyledItemImagePaddingHack, StyledItemImageWrapper, StyledItemTitle, StyledPlusSignImage, StyledSellableItem } from './SellableItem.styles'

export interface WhatCanBeSoldItemType {
  title: string
  description: string
  background: string
  icon: string
}

interface AnimationElements {
  itemWrapper: HTMLDivElement | null
  imageWrapper: HTMLDivElement | null
  contentWrapper: HTMLDivElement | null
  descriptionShort: HTMLDivElement | null
  descriptionFull: HTMLDivElement | null
  icon: HTMLImageElement | null
  plusSign: HTMLImageElement | null
}

const SellableItem: React.FC<WhatCanBeSoldItemType> = ({
  title,
  description,
  background,
  icon,
}) => {
  const itemRef = useRef<HTMLLIElement>(null)
  const itemWrapperRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const descriptionShortRef = useRef<HTMLDivElement>(null)
  const descriptionFullRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLImageElement>(null)
  const plusSignRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<gsap.core.Timeline>()
  let resizeTimeoutId: ReturnType<typeof setTimeout>

  const createAnimation = (elements: AnimationElements) => {
    const {
      itemWrapper,
      imageWrapper,
      contentWrapper,
      descriptionShort,
      descriptionFull,
      icon,
      plusSign,
    } = elements

    let paddingTop = 30
    let iconTop = '70%'

    const mq = gsap.matchMedia()

    mq.add('(max-width: 1536px)', () => {
      iconTop = '60%'
      paddingTop = 24
      iconTop = '60%'
    })

    mq.add('(max-width: 1200px)', () => {
      paddingTop = 30
      iconTop = '70%'
    })

    mq.add('(max-width: 600px)', () => {
      iconTop = '60%'
    })

    if (!imageWrapper) {
      return gsap.timeline()
    }

    return gsap.timeline({ paused: true }).to(itemWrapper, {
      duration: 0.4,
      y: -imageWrapper.offsetHeight - 5,
    }).to(contentWrapper, {
      duration: 0.4,
      paddingTop,
    }, 0).to(descriptionShort, {
      y: -10,
      duration: 0.4,
      autoAlpha: 0,
    }, 0).to(descriptionFull, {
      duration: 0.3,
      y: -14,
      opacity: 1,
    }, 0.1).to(icon, {
      duration: 0.3,
      top: iconTop,
    }, 0).to(plusSign, {
      duration: 0.2,
      opacity: 0,
    }, 0)
  }

  const initializeAnimation = useCallback(() => {
    const elements = {
      itemWrapper: itemWrapperRef.current,
      imageWrapper: imageWrapperRef.current,
      contentWrapper: contentWrapperRef.current,
      descriptionShort: descriptionShortRef.current,
      descriptionFull: descriptionFullRef.current,
      icon: iconRef.current,
      plusSign: plusSignRef.current,
    }

    if (Object.values(elements).every(element => element !== null)) {
      animationRef.current = createAnimation(elements)
    }
  }, [])

  const handleMouseEnter = () => animationRef.current?.play()
  const handleMouseLeave = () => animationRef.current?.reverse()

  const handleToggleAnimation = () => {
    if (!animationRef.current) return

    !animationRef.current.progress()
      ? animationRef.current.play()
      : animationRef.current.reverse()
  }

  useEffect(() => {
    initializeAnimation()

    const ctx = gsap.matchMedia()

    if (!itemRef.current) return

    ctx.add('(hover: hover)', () => {
      if (itemRef.current) {
        itemRef.current.addEventListener('mouseenter', handleMouseEnter)
        itemRef.current.addEventListener('mouseleave', handleMouseLeave)
        itemRef.current.removeEventListener('click', handleToggleAnimation)
      }
    })

    ctx.add('(hover: none)', () => {
      if (itemRef.current) {
        itemRef.current.addEventListener('click', handleToggleAnimation)
        itemRef.current.removeEventListener('mouseenter', handleMouseEnter)
        itemRef.current.removeEventListener('mouseleave', handleMouseLeave)
      }
    })

    return () => {
      if (!animationRef.current || !itemRef.current) return

      itemRef.current.removeEventListener('mouseenter', handleMouseEnter)
      itemRef.current.removeEventListener('mouseleave', handleMouseLeave)
      itemRef.current.removeEventListener('click', handleToggleAnimation)
      animationRef.current.reverse()
    }
  }, [])

  const prepareCard = () => {
    //  Фиксация высоты карточки без всплывающего описания и хендлер реинициализации анимации при ресайзе
    if (!itemRef.current || !descriptionShortRef.current || !descriptionFullRef.current) return

    descriptionFullRef.current.innerText = ''
    descriptionFullRef.current.style.minWidth = descriptionShortRef.current.offsetWidth + 34 + 'px'
    itemRef.current.style.height = 'auto'

    resizeTimeoutId && clearTimeout(resizeTimeoutId)

    resizeTimeoutId = setTimeout(() => {
      // таймаут нужен так как браузер сразу сетит последнее значение
      if (itemRef.current && descriptionShortRef.current && descriptionFullRef.current) {
        itemRef.current.style.height = `${itemRef.current.offsetHeight}px`
        descriptionFullRef.current.innerText = descriptionShortRef.current.innerText
      }

      if (animationRef.current) {
        animationRef.current.reverse()
      }

      initializeAnimation()
    }, 0)
  }

  const [debouncedprepareCard] = useDebounce(prepareCard, 250)

  useLayoutEffect(() => {
    debouncedprepareCard()

    window.addEventListener('resize', debouncedprepareCard)

    return () => { window.removeEventListener('resize', debouncedprepareCard) }
  }, [])

  return (
    <StyledSellableItem ref={itemRef}>
      <div ref={itemWrapperRef}>
        <StyledItemImageWrapper ref={imageWrapperRef}>
          <StyledItemImagePaddingHack>
            <StyledItemBackground src={background} />
            <StyledItemIcon src={icon} ref={iconRef} />
          </StyledItemImagePaddingHack>
        </StyledItemImageWrapper>
        <StyledItemContentWrapper ref={contentWrapperRef}>
          <StyledItemTitle>{title}</StyledItemTitle>
          <StyledItemDescriptionShort ref={descriptionShortRef}>
            {description}
          </StyledItemDescriptionShort>
          <StyledItemDescriptionFull ref={descriptionFullRef} />

        </StyledItemContentWrapper>
      </div>
      <StyledPlusSignImage src={plusSignImg} ref={plusSignRef} />
    </StyledSellableItem>
  )
}

export default SellableItem
