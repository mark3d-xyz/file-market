import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'

import { styled } from '../../../../../styles'
import { useAfterDidMountEffect } from '../../../../hooks/useDidMountEffect'
import { useStatusModal } from '../../../../hooks/useStatusModal'
import { useLike } from '../../../../processing/Like/useLike'
import { type TokenFullId } from '../../../../processing/types'
import { Button } from '../../../../UIkit'
import { BaseModal } from '../../../Modal'
import FlameFinalSub from '../flame-active.svg?react'
import FlameIconMain from '../flame-morph.svg?react'
import { useCardFlameAnimation } from './useCardFlameAnimation'

gsap.registerPlugin(MorphSVGPlugin)

interface CardFlameProps {
  isModal?: boolean
  modalLoadFinished?: boolean
  tokenFullId: TokenFullId
  onSuccess?: () => void
  mouseState?: 'in' | 'out'
  successState: boolean
}

const FlameWrapper = styled(Button, {
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

export const CardFlame = observer(
  ({
    isModal,
    modalLoadFinished,
    tokenFullId,
    mouseState,
    onSuccess,
    successState,
  }: CardFlameProps) => {
    const tlBurningRef = useRef<GSAPTimeline | null>(null)
    const tlGlowingRef = useRef<GSAPTimeline | null>(null)

    const { handleMouseLeave, handleMouseOver } = useCardFlameAnimation({
      tlBurningRef,
      isModal,
      modalLoadFinished,
      tlGlowingRef,
      successState,
    })

    const { like, ...statuses } = useLike()

    const { modalProps } = useStatusModal({
      statuses,
      okMsg: 'Thank you for your engagement!',
      okMsgUnderText:
        'Your little flame will warm the heart of the EFT owner and increase its chances of sale.',
      loadingMsg: 'Your flame is igniting in the blockchain, \n' + 'please wait',
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
    }, [statuses.result])

    return (
      <>
        <BaseModal {...modalProps} />
        <FlameWrapper
          onPress={async () => {
            await like(tokenFullId)
          }}
          onMouseOver={!isModal ? handleMouseOver : () => {}}
          onMouseLeave={!isModal ? handleMouseLeave : () => {}}
          modal={isModal}
        >
          <StyledFlameFinal className='flameFinal' />
          <StyledFlameIconMain className='flame' />
        </FlameWrapper>
      </>
    )
  },
)
