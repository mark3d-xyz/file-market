import React, { useMemo } from 'react'

import { type HiddenFileMetaData } from '../../../../swagger/Api'
import { Txt } from '../../../UIkit'
import { CategoriesImg } from '../helper/data'
import { fileToExtension } from '../helper/fileToType'
import { StyledFileType } from './FileType.styles'

interface FileTypeProps {
  categories?: string
  hiddenFileMeta?: HiddenFileMetaData
  className?: string
}

export const FileType: React.FC<FileTypeProps> = ({ hiddenFileMeta, className, categories }) => {
  const { extension } = useMemo(() => {
    if (!hiddenFileMeta) return {}

    return {
      extension: fileToExtension(hiddenFileMeta),
    }
  }, [hiddenFileMeta])

  const img = useMemo(() => {
    if (categories) return CategoriesImg[categories]
  }, [categories])

  if (!hiddenFileMeta) return null

  return (
    <StyledFileType className={className}>
      <img src={img} />
      <Txt primary1 style={{ fontSize: '10px', color: '#6B6F76', lineHeight: '16px' }}>
        {categories}
        {' '}
        {' '}
        |
        {' '}
        {' '}
        .
        {extension}
      </Txt>
    </StyledFileType>
  )
}
