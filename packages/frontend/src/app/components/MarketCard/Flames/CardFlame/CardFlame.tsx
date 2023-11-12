import { Tooltip } from '@nextui-org/react'
import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { styled } from '../../../../../styles'
import { useChangeNetwork } from '../../../../hooks/useChangeNetwork'
import { useAfterDidMountEffect } from '../../../../hooks/useDidMountEffect'
import { useMultiChainStore } from '../../../../hooks/useMultiChainStore'
import { useStatusModal } from '../../../../hooks/useStatusModal'
import { useLike } from '../../../../processing/Like/useLike'
import { type TokenFullId } from '../../../../processing/types'
import { Button, Txt } from '../../../../UIkit'
import { cutNumber } from '../../../../utils/number'
import { BaseModal } from '../../../Modal'
import FlameFinalSub from '../flame-active.svg?react'
import FlameIconMain from '../flame-morph.svg?react'
import { useCardFlameAnimation } from './useCardFlameAnimation'

gsap.registerPlugin(MorphSVGPlugin)

interface CardFlameProps {
  flameSize?: number
  withState?: boolean
  playState?: boolean
  tokenFullId: TokenFullId
  onSuccess?: () => void
  mouseState?: 'in' | 'out'
  isHasFlameText?: boolean
  likesCount?: number
  color?: string
  chainName?: string
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

const StyledFlameContainer = styled(Button, {
  gap: '4px',
  display: 'flex',
  alignItems: 'center',
  minWidth: 'fit-content',
  background: 'none',
  padding: '0',
  height: '32px',
  '&[data-hovered=true]': {
    opacity: 'initial',
  },
})

export const CardFlame = observer(({
  flameSize,
  withState,
  playState,
  tokenFullId,
  mouseState,
  onSuccess,
  isHasFlameText,
  likesCount,
  chainName,
  color = '#C9CBCF',
}: CardFlameProps) => {
  const tlRef = useRef<GSAPTimeline | null>(null)

  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false)

  const multiChainStore = useMultiChainStore()

  const { handleMouseLeave, handleMouseOver } = useCardFlameAnimation({ tlRef, playState })

  const { like, ...statuses } = useLike()

  const { changeNetwork, chain: networkChain } = useChangeNetwork()

  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Thank you for your engagement!',
    okMsgUnderText: 'Your little flame will warm the heart of the EFT owner and increase its chances of sale.',
    loadingMsg: 'Your flame is igniting in the blockchain, \n' +
      'please wait',
  })

  useAfterDidMountEffect(() => {
    if (!mouseState) return

    if (mouseState === 'in') {
      handleMouseOver()

      return
    }

    handleMouseLeave()
  }, [mouseState])

  useEffect(() => {
    if (!statuses.result) return

    console.log(onSuccess)

    console.log('SUCCESSDASDAS')

    onSuccess?.()
    handleMouseLeave()
  }, [statuses.result])

  const flameText = useMemo(() => {
    return isHasFlameText ? 'Flames' : ''
  }, [isHasFlameText])

  const chain = useMemo(() => {
    return multiChainStore.getChainByName(chainName)?.chain
  }, [multiChainStore.data, chainName])

  return (
    <>
      <BaseModal {...modalProps} />
      <Tooltip
        content={
          isTooltipVisible
            ? (
              <Txt>
                Send flame onchain
              </Txt>
            )
            : undefined}
        color={'primary'}
      >
        <StyledFlameContainer
          onPress={
            async () => {
              if (networkChain && chain?.id !== networkChain?.id) {
                changeNetwork(chain?.id)

                return
              }
              await like(tokenFullId)
            }
          }
          onMouseOver={!withState ? () => {
            handleMouseOver()
            setIsTooltipVisible(true)
          }
            : () => {
              setIsTooltipVisible(true)
            }}
          onMouseLeave={!withState ? () => {
            handleMouseLeave()
            setIsTooltipVisible(false)
          }
            : () => {
              setIsTooltipVisible(false)
            }}
        >
          <FlameWrapper
            style={{ minWidth: `${flameSize || 32}px`, height: `${flameSize || 32}px` }}
          >
            <StyledFlameFinal className='flameFinal' />
            <StyledFlameIconMain className='flame' />
          </FlameWrapper>
          <Txt primary1 style={{ fontSize: '14px', lineHeight: '32px', color }}>
            { (likesCount !== undefined) && (
              <>
                {(likesCount ?? 0) > 0 ? `${cutNumber(likesCount, 0)} ${flameText}` : flameText }
              </>
            ) }
          </Txt>
        </StyledFlameContainer>
      </Tooltip>
    </>
  )
})
