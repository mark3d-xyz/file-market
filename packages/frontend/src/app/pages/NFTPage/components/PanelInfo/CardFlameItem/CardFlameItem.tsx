import React, { useState } from 'react'

import { CardFlame } from '../../../../../components/MarketCard/Flames'
import { type TokenFullId } from '../../../../../processing/types'
import { Txt } from '../../../../../UIkit'
import { cutNumber } from '../../../../../utils/number'
import { StyledPanelInfoItem } from '../Item/PanelInfoItem.styles'

interface ICardFlameItemProps {
  tokenFullId: TokenFullId
  likesCount: number
}

export const CardFlameItem = ({ tokenFullId, likesCount }: ICardFlameItemProps) => {
  const [flameState, setFlameState] = useState<'in' | 'out' | undefined>()

  return (
    <StyledPanelInfoItem
      onMouseOver={() => { setFlameState('in') }}
      onMouseLeave={() => { setFlameState('out') }}
      style={{ cursor: 'pointer' }}
    >
      <CardFlame tokenFullId={tokenFullId} withState mouseState={flameState} />
      <Txt primary1 style={{ fontSize: '14px', lineHeight: '32px', color: '#C9CBCF' }}>
        { likesCount > 0 ? `${cutNumber(likesCount, 0)} Flames` : 'Flames' }
      </Txt>
    </StyledPanelInfoItem>
  )
}
