import { type FC } from 'react'

import { RoundedBadge } from '../../../../UIkit'
import { StyledChainLogo, StyledText } from './StoredOnFileCoin.styles'

export const StoredOnFileCoin: FC = () => {
  return (
    <RoundedBadge
      icon={
        <StyledChainLogo src='/Filecoin.svg' alt='FileCoin' />
      }
    >
      <StyledText>
        Stored on FileCoin
      </StyledText>
    </RoundedBadge>
  )
}
