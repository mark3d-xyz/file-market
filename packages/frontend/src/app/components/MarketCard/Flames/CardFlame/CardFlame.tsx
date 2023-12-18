import { Tooltip } from '@nextui-org/react'
import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { type Chain } from 'wagmi'

import { styled } from '../../../../../styles'
import { useChangeNetwork } from '../../../../hooks/useChangeNetwork'
import { useAfterDidMountEffect } from '../../../../hooks/useDidMountEffect'
import { useStatusModal } from '../../../../hooks/useStatusModal'
import { useLike } from '../../../../processing/Like/useLike'
import { type TokenFullId } from '../../../../processing/types'
import { Button, Txt } from '../../../../UIkit'
import { cutNumber } from '../../../../utils/number'
import { BaseModal } from '../../../Modal'
import FlameFinalSub from '../flame-active.svg?react'
import FlameIconMain from '../flame-morph.svg?react'
import { LoadingFlame } from '../LoadingFlame/LoadingFlame'
import { SuccessFlame } from '../SuccessFlame/SuccessFlame'
import { useCardFlameAnimation } from './useCardFlameAnimation'

gsap.registerPlugin(MorphSVGPlugin)

interface CardFlameProps {
  isModal?: boolean
  modalLoadFinished?: boolean
  tokenFullId: TokenFullId
  onSuccess?: () => void
  mouseState?: 'in' | 'out'
  isHasFlameText?: boolean
  likesCount?: number
  color?: string
  chain?: Chain
}

export const FlameWrapper = styled('div', {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  position: 'relative',
  width: 32,
  height: 32,
  minWidth: 'initial',
  background: 'none',
  padding: '0',
  variants: {
    modal: {
      true: {
        width: 200,
        height: 200,
        alignItems: 'center',
        '.flame, .flameFinal': {
          width: 120,
          height: 120,
        },
        '.flameFinal': {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        },
      },
    },
  },
})

export const StyledFlameIconMain = styled(FlameIconMain, {
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

export const StyledFlameFinal = styled(FlameFinalSub, {
  position: 'absolute',
  zIndex: 1,
  top: 0,
  left: 0,
  opacity: 0,
  width: '100%',
  transform: 'scaleX(0.5)',
  height: '100%',
})

export const StyledFlameContainer = styled(Button, {
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

  '&:hover': {
    filter: 'brightness(1.2)',
  },

  variants: {
    isModal: {
      true: {
        height: 'initial',
        width: '100%',
        justifyContent: 'center',
        '&:hover': {
          filter: 'brightness(1)',
        },
      },
    },
  },
})

export const CardFlame = observer(({
  isModal,
  modalLoadFinished,
  tokenFullId,
  mouseState,
  onSuccess,
  isHasFlameText,
  likesCount,
  chain,
  color = '#C9CBCF',
}: CardFlameProps) => {
  const tlBurningRef = useRef<GSAPTimeline | null>(null)
  const tlGlowingRef = useRef<GSAPTimeline | null>(null)

  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false)

  const { handleMouseLeave, handleMouseOver } = useCardFlameAnimation({
    tlBurningRef,
    isModal,
    modalLoadFinished,
    tlGlowingRef,
  })

  const { like, ...statuses } = useLike()

  const { changeNetwork, chain: networkChain } = useChangeNetwork()

  const { modalProps } = useStatusModal({
    statuses,
    okMsg: 'Thank you for your engagement!',
    okMsgUnderText: <>
      Your little flame will warm the heart of the EFT owner
      <br />
      and increase its chances of sale.
    </>,
    loadingMsg: 'Your flame is igniting in  the blockchain, \n' +
        'please wait',
    waitForSign: false,
    loadingIcon: <LoadingFlame />,
    successIcon: <SuccessFlame />,
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

    onSuccess?.()
  }, [statuses.result])

  const flameText = useMemo(() => {
    return isHasFlameText ? 'Flames' : ''
  }, [isHasFlameText])

  return (
    <>
      <BaseModal {...modalProps} />
      <Tooltip
        content={
          isTooltipVisible
            ? (
              <Txt>
                Send a flame onchain
              </Txt>
            )
            : undefined}
        color={'primary'}
      >
        <StyledFlameContainer
          isModal={!isHasFlameText || isModal}
          onPress={
            async () => {
              if (chain && networkChain && chain?.id !== networkChain?.id) {
                changeNetwork(chain?.id)

                return
              }
              await like(tokenFullId)
            }
          }
          onMouseOver={!isModal ? () => {
            handleMouseOver()
            setIsTooltipVisible(true)
          }
            : () => {
              setIsTooltipVisible(true)
            }}
          onMouseLeave={!isModal ? () => {
            handleMouseLeave()
            setIsTooltipVisible(false)
          }
            : () => {
              setIsTooltipVisible(false)
            }}
        >
          <FlameWrapper
            modal={isModal}
          >
            <StyledFlameFinal className='flameFinal' />
            <StyledFlameIconMain className='flame' />
          </FlameWrapper>
          <Txt
            primary1
            style={{
              fontSize: '14px',
              lineHeight: '32px',
              color,
            }}
          >
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
