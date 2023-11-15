import React from 'react'

import { type HiddenFileMetaData } from '../../../../swagger/Api'
import { useCurrency } from '../../../hooks/useCurrency'
import { NftCardBase, NftCardUserInfo, PriceBadge, Txt } from '../../../UIkit'
import { StyledWrapper } from '../../../UIkit/Badge/PriceBadge/PriceBadge.styles'
import { FileType } from '../FileType/FileType'

export interface NFTCardProps {
  imageURL: string
  title: string
  collectionName: string
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
  chainName?: string
  chainImg?: string
  categories?: string
}

export const NFTCard: React.FC<NFTCardProps> = ({
  collectionName,
  button,
  imageURL,
  hiddenFileMeta,
  title,
  user,
  price,
  priceUsd,
  chainImg,
  chainName,
  categories,
}) => {
  const { formatCurrency, formatUsd } = useCurrency()

  return (
    <NftCardBase
      to={button.link}
      title={title}
      collectionName={collectionName}
      fileType={<FileType hiddenFileMeta={hiddenFileMeta} categories={categories} />}
      imgSrc={imageURL}
      button={{
        to: button.link,
        text: button.text,
      }}
      chainName={chainName}
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
