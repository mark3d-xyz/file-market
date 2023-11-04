import { observer } from 'mobx-react-lite'
import React, { type MouseEventHandler, type PropsWithChildren, type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CardFlame, StyledFlamesCardContainer } from '../../../../components/MarketCard/Flames'
import { type TokenFullId } from '../../../../processing/types'
import { cutNumber } from '../../../../utils/number'
import { Flex } from '../../../Flex'
import { Txt } from '../../../Txt'
import { CardImg } from '../../CardImg'
import {
  StyledBottomContentContainer,
  StyledButton,
  StyledButtonWrapper,
  StyledCard,
  StyledCardBorder,
  StyledCardInner, StyledChain,
  StyledCollectionName,
  StyledInfoWrapper,
  StyledTitle, StyledTypeAndChainContainer,
} from './NftCardBase.styles'

interface NftCardProps extends PropsWithChildren {
  className?: string
  likesCount?: number
  to: string
  fileType?: ReactNode
  imgSrc: string
  title?: ReactNode
  collectionName?: ReactNode
  tokenFullId: TokenFullId
  onFlameSuccess: () => void
  button: {
    onClick?: MouseEventHandler<HTMLAnchorElement>
    text: string
    to: string
  }
  chainImg?: string
  chainName?: string
}

export const NftCardBase: React.FC<NftCardProps> = observer(({
  to,
  className,
  tokenFullId,
  likesCount,
  fileType,
  imgSrc,
  title,
  collectionName,
  children,
  button,
  chainImg,
  chainName,
  onFlameSuccess,
}) => {
  const navigate = useNavigate()
  const [flameState, setFlameState] = useState<'in' | 'out' | undefined>()

  return (
    <StyledCard
      onClick={() => { navigate(to) }}
      className={className}
    >
      <StyledCardBorder>
        <StyledCardInner>
          <StyledTypeAndChainContainer>
            {fileType}
            <StyledChain>
              <img src={chainImg} />
              <Txt primary1 style={{ fontSize: '10px', color: '#6B6F76', lineHeight: '16px' }}>{chainName}</Txt>
            </StyledChain>
          </StyledTypeAndChainContainer>
          <CardImg src={imgSrc} />
          <StyledInfoWrapper>
            <Flex flexDirection='column' gap="$2" alignItems='start'>
              <Flex
                flexDirection='column'
                gap="$1"
                alignItems='start'
                w100
              >
                {title && <StyledTitle primary2>{title}</StyledTitle>}
                {collectionName && <StyledCollectionName primary3>{collectionName}</StyledCollectionName>}
              </Flex>
              {children}
            </Flex>
            <StyledButtonWrapper>
              <StyledBottomContentContainer>
                <StyledFlamesCardContainer
                  onMouseOver={() => { setFlameState('in') }}
                  onMouseLeave={() => { setFlameState('out') }}
                  style={{ cursor: 'pointer' }}
                >
                  <CardFlame
                    tokenFullId={tokenFullId}
                    mouseState={flameState}
                    withState
                    onSuccess={onFlameSuccess}
                  />
                  {likesCount !== undefined && (
                    <Txt primary1 style={{ fontSize: '14px', lineHeight: '20px', color: '#6B6F76' }}>
                      {cutNumber(likesCount, 0)}
                    </Txt>
                  )}
                </StyledFlamesCardContainer>
                <StyledButton
                  primary
                  small
                  fullWidth
                  to={button.to}
                  onClick={button.onClick}
                >
                  <Txt primary3>{button.text}</Txt>
                </StyledButton>
              </StyledBottomContentContainer>
            </StyledButtonWrapper>
          </StyledInfoWrapper>
        </StyledCardInner>
      </StyledCardBorder>
    </StyledCard>
  )
})
