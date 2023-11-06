import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { useCallback, useEffect, useRef } from 'react'

import Title from '../../components/SectionTitle/SectionTitle'
import { PartnersData } from '../../helper/Partners/data'
import { StyledPartnerItem, StyledPartnerItemLink, StyledPartners, StyledPartnersList, StyledPartnersScrollWrapper } from './Partners.styles'

gsap.registerPlugin(Draggable)

export interface PartnerItemProps {
  name: string
  icon?: string
  iconSizeX2?: boolean
  link: string
}

const PartnerItem = ({ name, icon, iconSizeX2, link }: PartnerItemProps) => {
  return (
    <StyledPartnerItem size={iconSizeX2 ? 'x2' : undefined} noPointerEvents={!icon}>
      <StyledPartnerItemLink href={icon ? link : ''} target="_blank">
        {icon && <img src={icon} aria-label={`${name} icon`} />}
      </StyledPartnerItemLink>
    </StyledPartnerItem>
  )
}

const Partners = () => {
  const scrollWrapperRef = useRef<HTMLDivElement>(null)
  const partnersListRef = useRef<HTMLUListElement>(null)
  let draggableInstance: Draggable[] | null = null

  const updateMaxScrollBound = useCallback((): number => {
    if (!partnersListRef.current || !scrollWrapperRef.current) return 0

    const maxScrollBound = partnersListRef.current.offsetWidth - scrollWrapperRef.current.offsetWidth
    if (draggableInstance) {
      draggableInstance[0].applyBounds({ minX: -maxScrollBound, maxX: 0 })
    }

    return maxScrollBound
  }, [partnersListRef.current, scrollWrapperRef.current])

  useEffect(() => {
    let maxScrollBound = updateMaxScrollBound()

    const ctx = gsap.context(() => {
      draggableInstance = Draggable.create(scrollWrapperRef.current, {
        type: 'x',
        bounds: { minX: -maxScrollBound, maxX: 0 },
      })
    })

    const handleResize = () => {
      maxScrollBound = updateMaxScrollBound()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      ctx.revert()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <StyledPartners>
      <Title marginBottom="32">Partners</Title>
      <StyledPartnersScrollWrapper ref={scrollWrapperRef}>
        <StyledPartnersList ref={partnersListRef}>
          {PartnersData.map((item, index) => {
            return (
              <PartnerItem
                key={item.name}
                {...item}
              />
            )
          })}
        </StyledPartnersList>
      </StyledPartnersScrollWrapper>
    </StyledPartners>
  )
}

export default Partners
