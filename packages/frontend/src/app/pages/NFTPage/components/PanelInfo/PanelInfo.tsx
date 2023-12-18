import React from 'react'
import { type Chain } from 'wagmi'

import { CardFlame } from '../../../../components/MarketCard/Flames'
import { type typeFiles } from '../../../../components/MarketCard/helper/data'
import { Share } from '../../../../components/Share/Share'
import { type TokenFullId } from '../../../../processing/types'
import ViewFile from '../ViewFile/ViewFile'
import { StyledPanelInfo, StyledPanelInfoContainer } from './PanelInfo.styles'

interface IPanelInfoProps {
  likesCount: number
  tokenFullId: TokenFullId
  isCanViewFile?: boolean
  isLoadingFile?: boolean
  isViewFile?: boolean
  typeFile?: typeFiles
  onViewFileClick: () => void
  onFlameSuccess?: () => void
  chain?: Chain
}

export const PanelInfo = ({
  likesCount,
  tokenFullId,
  isLoadingFile,
  isCanViewFile,
  isViewFile,
  typeFile,
  onFlameSuccess,
  onViewFileClick,
  chain,
}: IPanelInfoProps) => {
  return (
    <StyledPanelInfo>
      <StyledPanelInfoContainer>
        <CardFlame
          tokenFullId={tokenFullId}
          onSuccess={onFlameSuccess}
          likesCount={likesCount}
          isHasFlameText
          chain={chain}
        />
        <Share />
        {(isCanViewFile && !isLoadingFile) && (
          <ViewFile
            isPreviewView={!isViewFile}
            type={typeFile}
            onClick={onViewFileClick}
          />
        )}
      </StyledPanelInfoContainer>
    </StyledPanelInfo>
  )
}
