import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { styled } from '../../../styles'
import { useHiddenFileDownload } from '../../hooks/useHiddenFilesDownload'
import { useTokenMetaStore } from '../../hooks/useTokenMetaStore'
import { useTokenStore } from '../../hooks/useTokenStore'
import { useTransferStoreWatchEvents } from '../../hooks/useTransferStoreWatchEvents'
import { useIsBuyer, useIsOwner } from '../../processing'
import { makeTokenFullId } from '../../processing/utils/id'
import { PageLayout } from '../../UIkit'
import { getHttpLinkFromIpfsString } from '../../utils/nfts/getHttpLinkFromIpfsString'
import { Params } from '../../utils/router/Params'
import { transferPermissions } from '../../utils/transfer/status'
import { PreviewNFTFlow } from './components/PreviewNFTFlow'
import { GridBlock } from './helper/styles/style'
import BaseInfoSection from './section/BaseInfo/BaseInfoSection'
import ControlSection from './section/Contol/ControlSection'
import DescriptionSection from './section/Description/DescriptionSection'
import FileInfoSection from './section/FileInfo/FileInfoSection'
import HomeLandSection from './section/HomeLand/HomeLandSection'
import TagsSection from './section/Tags/TagsSection'

const NFTPreviewContainer = styled('div', {
  width: '100%',
  height: 555,
  background: '$gradients$background',
  paddingTop: 'calc($layout$navBarHeight)',
  paddingBottom: '$6',
  boxSizing: 'content-box'
})

const MainInfo = styled(PageLayout, {
  marginTop: '-80px',
  paddingTB: 48,
  fontSize: '16px',
  gridTemplateColumns: '3fr 1fr',
  gridTemplateRows: 'max-content',
  columnGap: '$4',
  minHeight: '100%',
  borderRadius: '$6 $6 0 0',
  top: '-$6',
  boxShadow: '$footer'
})

const GridLayout = styled('div', {
  display: 'grid',
  gap: '3rem',
  position: 'relative',
  gridTemplateColumns: '3fr 1fr',
  gridTemplateRows: 'max-content',
  columnGap: '$4',
  minHeight: '100%',
  '@mdx': {
    display: 'flex'
  }
})

const GridBlockSection = styled(GridBlock, {
  display: 'flex',
  flexDirection: 'column',
  gap: '48px'
})

const GridBlockSectionRow = styled(GridBlockSection, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: '12px',
  '@mdx': {
    flexDirection: 'column'
  }
})

const DisplayLayout = styled('div', {
  display: 'flex',
  gap: '32px',
  marginTop: '32px',
  flexDirection: 'column'
})

const NFTPage = observer(() => {
  const { collectionAddress, tokenId } = useParams<Params>()
  const transferStore = useTransferStoreWatchEvents(collectionAddress, tokenId)
  const tokenStore = useTokenStore(collectionAddress, tokenId)
  const tokenMetaStore = useTokenMetaStore(tokenStore.data?.metaUri)
  const files = useHiddenFileDownload(tokenMetaStore, tokenStore.data)
  const tokenFullId = useMemo(
    () => makeTokenFullId(collectionAddress, tokenId),
    [collectionAddress, tokenId]
  )
  const { isOwner } = useIsOwner(tokenFullId)
  const isBuyer = useIsBuyer(transferStore.data)
  const canViewHiddenFiles = isBuyer && transferPermissions.buyer.canViewHiddenFiles(
    transferStore.data
  )

  return (
    <>
      <NFTPreviewContainer>
        {
          <PreviewNFTFlow
            getFile={files[0]?.getFile}
            hiddenFile={tokenStore.data?.hiddenFileMeta}
            canViewFile={isOwner || canViewHiddenFiles}
            imageURL={getHttpLinkFromIpfsString(tokenStore.data?.image ?? '')}
          />
        }
      </NFTPreviewContainer>
      <MainInfo>
        <GridLayout>
          <GridBlockSection>
            <BaseInfoSection />
            {window.innerWidth <= 900 && (
              <GridBlockSectionRow>
                <ControlSection />
                <FileInfoSection
                  isOwner={isOwner}
                  canViewHiddenFiles={canViewHiddenFiles}
                  files={files}
                />
              </GridBlockSectionRow>
            )}
            <HomeLandSection />
            <TagsSection
              tags={tokenStore.data?.tags}
              categories={[
                ...Array.from(tokenStore.data?.categories ?? []),
                ...Array.from(tokenStore.data?.subcategories ?? [])
              ]}
            />
            {window.innerWidth > 1200 && <DescriptionSection />}
          </GridBlockSection>

          {window.innerWidth > 900 && (
            <GridBlockSection>
              <ControlSection />
              <FileInfoSection
                isOwner={isOwner}
                canViewHiddenFiles={canViewHiddenFiles}
                files={files}
              />
            </GridBlockSection>
          )}
        </GridLayout>

        {window.innerWidth <= 1200 && (
          <DisplayLayout>
            <DescriptionSection />
          </DisplayLayout>
        )}
      </MainInfo>
    </>
  )
})

export default NFTPage
