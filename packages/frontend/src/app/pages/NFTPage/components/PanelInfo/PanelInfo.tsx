import React from 'react'

import { type typeFiles } from '../../../../components/MarketCard/helper/data'
import { Share } from '../../../../components/Share/Share'
import { type TokenFullId } from '../../../../processing/types'
import ViewFile from '../ViewFile/ViewFile'
import { CardFlameItem } from './CardFlameItem/CardFlameItem'
import { StyledPanelInfo, StyledPanelInfoContainer } from './PanelInfo.styles'

interface IPanelInfoProps {
  likesCount: number
  tokenFullId: TokenFullId
  isCanViewFile?: boolean
  isLoadingFile?: boolean
  isViewFile?: boolean
  typeFile: typeFiles
  onViewFileClick: () => void
}

export const PanelInfo = ({
  likesCount,
  tokenFullId,
  isLoadingFile,
  isCanViewFile,
  isViewFile,
  typeFile,
  onViewFileClick,
}: IPanelInfoProps) => {
  return (
    <StyledPanelInfo>
      <StyledPanelInfoContainer>
        <CardFlameItem tokenFullId={tokenFullId} likesCount={likesCount} />
        <Share />
        {(isCanViewFile && !isLoadingFile) && (
          <ViewFile
            isPreviewView={!isViewFile}
            type={typeFile}
            onClick={onViewFileClick
            }
          />
        )}
      </StyledPanelInfoContainer>
    </StyledPanelInfo>
  )
}
