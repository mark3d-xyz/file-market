import React from 'react'
import { useParams } from 'react-router-dom'

import { styled } from '../../../../../styles'
import { useChainStore } from '../../../../hooks/useChainStore'
import { useTokenStore } from '../../../../hooks/useTokenStore'
import { textVariant } from '../../../../UIkit'
import { type Params } from '../../../../utils/router'
import { GridBlock, PropertyTitle } from '../../helper/styles/style'

const DescriptionSectionStyle = styled(GridBlock, {
  paddingTop: '32px',
  paddingBottom: '32px',
  '@md': {
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  '@sm': {
    paddingTop: '8px',
    paddingBottom: '8px',
  },
})

const Pre = styled('pre', {
  ...textVariant('body4').true,
  color: '$gray800',
  fontWeight: 400,
  whiteSpace: 'pre-wrap',
  wordWrap: 'anywhere',
  lineHeight: 1.5,
  maxWidth: 640,
})

const DescriptionSection = () => {
  const { collectionAddress, tokenId, chainName } = useParams<Params>()
  const chainStore = useChainStore(chainName)
  const { data: token } = useTokenStore(collectionAddress, tokenId, chainStore.selectedChain?.chain.id)

  return (
    <>
      {token?.description && (
        <DescriptionSectionStyle style={{ gridArea: 'Description' }}>
          <PropertyTitle>Description</PropertyTitle>
          <Pre>{token?.description}</Pre>
        </DescriptionSectionStyle>
      )}
    </>
  )
}

export default DescriptionSection
