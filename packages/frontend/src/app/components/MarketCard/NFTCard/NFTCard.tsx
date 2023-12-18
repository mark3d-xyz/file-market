import React from 'react'
import { type Chain } from 'wagmi'

import { type HiddenFileMetaData } from '../../../../swagger/Api'
import { useCurrency } from '../../../hooks/useCurrency'
import { type TokenFullId } from '../../../processing/types'
import { NftCardBase, NftCardUserInfo, PriceBadge, Txt } from '../../../UIkit'
import { StyledWrapper } from '../../../UIkit/Badge/PriceBadge/PriceBadge.styles'
import { FileType } from '../FileType/FileType'

export interface NFTCardProps {
  imageURL: string
  title: string
  collectionName: string
  categories?: string
  likesCount?: number
  tokenFullId: TokenFullId
  onFlameSuccess: () => void
  user: {
    img: string
    address: string
  }
  button: {
    text: string
    link: string
  }
  priceUsd?: string
  price?: string
  hiddenFileMeta?: HiddenFileMetaData
  chain?: Chain
  chainImg?: string
}

export const NFTCard: React.FC<NFTCardProps> = ({
  collectionName,
  button,
  imageURL,
  likesCount,
  categories,
  tokenFullId,
  onFlameSuccess,
  hiddenFileMeta,
  title,
  user,
  price,
  priceUsd,
  chainImg,
  chain,
}) => {
  const { formatCurrency, formatUsd } = useCurrency()

  return (
    <NftCardBase
      to={button.link}
      title={title}
      collectionName={collectionName}
      onFlameSuccess={onFlameSuccess}
      likesCount={likesCount}
      tokenFullId={tokenFullId}
      fileType={<FileType hiddenFileMeta={hiddenFileMeta} categories={categories} />}
      imgSrc={imageURL}
      button={{
        to: button.link,
        text: button.text,
      }}
      chain={chain}
      chainImg={chainImg}
    >
      <NftCardUserInfo img={user.img} address={user.address} />
      {price ? (
        <PriceBadge
          left={formatCurrency(price ?? '0')}
          right={priceUsd && `~${formatUsd(priceUsd ?? 0)}`}
        />
      )
        : (
          <StyledWrapper background={'primary'} size={'sm'} style={{ display: 'flex', justifyContent: 'center' }}>
            <Txt primary1 style={{ fontSize: '14px', color: '#A9ADB1', lineHeight: '20px' }}>EFT is not listed</Txt>
          </StyledWrapper>
        )
      }
    </NftCardBase>
  )
}
