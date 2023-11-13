import React, { useMemo } from 'react'

import { styled } from '../../../../../styles'
import { type typeFiles } from '../../../../components/MarketCard/helper/data'
import { Txt } from '../../../../UIkit'
import { ViewFilesImage, ViewFilesText } from '../../helper/ViewFilesData/ViewFilesData'
import PreviewImg from '../../img/Preview.svg'

const ViewFileStyle = styled('div', {
  height: '32px',
  color: '#232528',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'flex-start',
  '&:hover': {
    opacity: '1',
  },
  '& .container': {
    padding: '0 14.5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10.5px',
    height: '100%',
  },
})

interface ViewFileProps {
  type?: typeFiles
  onClick?: () => void
  isPreviewView: boolean
}

const ViewFile = ({ type, onClick, isPreviewView }: ViewFileProps) => {
  const text: string | undefined = useMemo(() => {
    if (!type) return

    return ViewFilesText[type]
  }, [type])

  const img: string | undefined = useMemo(() => {
    if (!type) return

    return ViewFilesImage[type]
  }, [type])

  return (
    <ViewFileStyle onClick={onClick}>
      <div className='container'>
        <img src={isPreviewView ? img : PreviewImg} />
        <Txt primary1 style={{ fontSize: '14px', lineHeight: '32px', color: '#C9CBCF' }}>{isPreviewView ? text : 'Preview'}</Txt>
      </div>
    </ViewFileStyle>
  )
}

export default ViewFile
