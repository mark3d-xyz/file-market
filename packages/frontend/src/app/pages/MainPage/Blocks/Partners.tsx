import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { useEffect, useRef } from 'react'

import { styled } from '../../../../styles'
import Title from '../components/SectionTitle/SectionTitle'
import { PartnersData } from '../helper/Partners/data'

gsap.registerPlugin(Draggable)

export interface PartnerItemProps {
  name: string
  icon?: string
  iconSizeX2?: boolean
  link: string
}

const PartnerItemStyles = styled('li', {
  width: 96,
  height: 96,
  backgroundColor: '$gray100',
  borderRadius: 12,
  boxShadow: '0px 0px 0px 0px #d9d9d9',
  border: '1px solid transparent',
  transition: 'box-shadow 0.25s ease-in-out, border-color 0.25s ease-in-out',
  '&:hover': {
    borderColor: '#A9ADB1',
    boxShadow: '2px 2px 0px 0px #d9d9d9',
  },
  variants: {
    size: {
      x2: {
        width: 194,
        height: 96,
      },
    },
    noPointerEvents: {
      true: {
        pointerEvents: 'none',
      },
    },
  },
})

const PartnerItemLink = styled('a', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
})

const PartnerItemIcon = styled('img', {})

const PartnerItem = (props: PartnerItemProps) => {
  const { name, icon, iconSizeX2, link } = props

  return (
    <PartnerItemStyles size={iconSizeX2 ? 'x2' : undefined} noPointerEvents={!icon}>
      <PartnerItemLink href={icon ? link : ''} target="_blank">
        {icon && <PartnerItemIcon src={icon} aria-label={`${name} icon`} />}
      </PartnerItemLink>
    </PartnerItemStyles>
  )
}

const PartnersStyles = styled('section', {
  marginBottom: 120,
  '@lg': {
    marginBottom: 100,
  },
  '@md': {
    marginBottom: 85,
  },
  '@sm': {
    marginBottom: 70,
  },
  '@xs': {
    marginBottom: 55,
  },
})

const PartnersList = styled('ul', {
  display: 'flex',
  gap: 2,
  flexWrap: 'wrap',
  minWidth: 1770,
})

const PartnersScrollWrapper = styled('div', {
  maxWidth: '100%',
  '@sm': {
    position: 'relative',
    left: -10,
  },
})

const Partners = () => {
  const scrollWrapperRef = useRef<HTMLDivElement>(null)
  const partnersListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let draggableInstance: Draggable[] | null = null

    const updateMaxScrollBound = (): number => {
      if (!partnersListRef.current || !scrollWrapperRef.current) return 0

      const maxScrollBound = partnersListRef.current.offsetWidth - scrollWrapperRef.current.offsetWidth
      if (draggableInstance) {
        draggableInstance[0].applyBounds({ minX: -maxScrollBound, maxX: 0 })
      }

      return maxScrollBound
    }

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
    <PartnersStyles>
      <Title marginBottom="32">Partners</Title>
      <PartnersScrollWrapper ref={scrollWrapperRef}>
        <PartnersList ref={partnersListRef}>
          {PartnersData.map((item, index) => {
            return (
              <PartnerItem
                key={item.name}
                {...item}
              />
            )
          })}
        </PartnersList>
      </PartnersScrollWrapper>
    </PartnersStyles>
  )
}

export default Partners
