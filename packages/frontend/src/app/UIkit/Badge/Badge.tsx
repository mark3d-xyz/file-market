import React, { type ComponentProps, type FC } from 'react'

import { styled } from '../../../styles'
import { gradientPlaceholderImg } from '../Placeholder'
import { textVariant } from '../Txt'

const Wrapper = styled('div', {
  backgroundColor: '$white',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, auto) minmax(0, 1fr)',
  gap: '$2',
  padding: '$2 12px',
  alignItems: 'center',
  borderRadius: '$3',
  width: '220px',
  boxShadow: '$form',
  border: '1px solid $gray300',
  '@md': {
    width: '100%',
  },
  variants: {
    nftPage: {
      true: {
        '@lg': {
          width: '100%',
        },
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
})

const Title = styled('p', {
  color: '$gray500',
  ...textVariant('primary3').true,
})

const Value = styled('p', {
  ...textVariant('primary1').true,
  color: '$blue500',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '100%',
  fontSize: '14px',
})

const Content = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '$1',
  minHeight: 48,
})

const Image = styled('img', {
  width: 48,
  height: 48,
  border: '2px solid $blue500',
  objectFit: 'cover',
  variants: {
    roundVariant: {
      circle: {
        borderRadius: '50%',
      },
      roundedSquare: {
        borderRadius: '$2',
      },
    },
    small: {
      true: {
        width: 40,
        height: 40,
      },
    },
  },
})

export interface BadgeProps {
  image?: {
    url: string
    borderRadius: 'circle' | 'roundedSquare'
  }
  content: {
    title?: string
    value: string
  }
  small?: boolean
  wrapperProps?: ComponentProps<typeof Wrapper>
  valueStyles?: ComponentProps<typeof Value>
}

export const Badge: FC<BadgeProps> = (props) => {
  return (
    <Wrapper {...props.wrapperProps}>
      {props.image && (
        <Image
          src={props.image.url}
          roundVariant={props.image.borderRadius}
          small={props.small}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src = gradientPlaceholderImg
          }}
        />
      )}
      <Content>
        {props.content.title && <Title>{props.content.title}</Title>}
        <Value css={props.valueStyles?.css}>{props.content.value}</Value>
      </Content>
    </Wrapper>
  )
}
