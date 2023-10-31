import React from 'react'

import { type HiddenFileMetaData } from '../../../../swagger/Api'
import { useCurrency } from '../../../hooks/useCurrency'
import { NftCardBase, NftCardUserInfo, PriceBadge } from '../../../UIkit'
import { FileType } from '../FileType/FileType'

export interface NFTCardProps {
  imageURL: string
  title: string
  collectionName: string
  categories?: string
  likesCount?: number
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
}

export const NFTCard: React.FC<NFTCardProps> = ({
  collectionName,
  likesCount,
  button,
  categories,
  imageURL,
  hiddenFileMeta,
  title,
  user,
  price,
  priceUsd,
  chainImg,
  chainName,
}) => {
  const { formatCurrency, formatUsd } = useCurrency()

  return (
    <NftCardBase
      to={button.link}
      title={title}
      likesCount={likesCount}
      collectionName={collectionName}
      fileType={<FileType categories={categories} hiddenFileMeta={hiddenFileMeta} />}
      imgSrc={imageURL}
      button={{
        to: button.link,
        text: button.text,
      }}
      chainName={chainName}
      chainImg={chainImg}
    >
      <NftCardUserInfo img={user.img} address={user.address} />
      {price && (
        <PriceBadge
          left={formatCurrency(price ?? '0')}
          right={priceUsd && `~${formatUsd(priceUsd ?? 0)}`}
        />
      )}
    </NftCardBase>
  )
}
