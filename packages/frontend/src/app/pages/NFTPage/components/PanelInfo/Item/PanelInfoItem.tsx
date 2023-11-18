import React, { type ReactNode } from 'react'

import { Txt } from '../../../../../UIkit'
import { StyledPanelInfoItem } from './PanelInfoItem.styles'

export interface IPanelInfoItemProps {
  text?: string
  icon: ReactNode
  isCanView?: boolean
}

export const PanelInfoItem = ({ text, icon, isCanView }: IPanelInfoItemProps) => {
  return isCanView ? (
    <StyledPanelInfoItem>
      {icon}
      {text && <Txt primary1 style={{ fontSize: '14px', lineHeight: '32px', color: '#C9CBCF' }}>{text}</Txt>}
    </StyledPanelInfoItem>
  ) : <></>
}
