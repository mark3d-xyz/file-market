import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Outlet, useLocation, useParams } from 'react-router'

import FileLogo from '../../../assets/FilemarketFileLogo.png'
import { styled } from '../../../styles'
import { useChainStore } from '../../hooks/useChainStore'
import { useCollectionTokenListStore } from '../../hooks/useCollectionTokenListStore'
import { useMultiChainStore } from '../../hooks/useMultiChainStore'
import { Badge, Container, gradientPlaceholderImg, Link, NavLink, Tabs, textVariant } from '../../UIkit'
import { TabsContainer } from '../../UIkit/Tabs/TabsContainer'
import { getHttpLinkFromIpfsString } from '../../utils/nfts/getHttpLinkFromIpfsString'
import { getProfileImageUrl } from '../../utils/nfts/getProfileImageUrl'
import { reduceAddress } from '../../utils/nfts/reduceAddress'
import { type Params } from '../../utils/router'

const Background = styled('div', {
  background: '$gradients$background',
  width: '100%',
  height: 352,
})

const Profile = styled('div', {
  paddingBottom: '$4',
})

const ProfileHeader = styled('div', {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '$3',
  marginTop: -80,
  marginBottom: '$4',
  '@sm': {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '$3',
  },
})

const ProfileImage = styled('img', {
  width: 160,
  height: 160,
  borderRadius: '25%',
  border: '8px solid $white',
  objectFit: 'cover',
  background: '$gradients$mainNew',
})

const ProfileName = styled('h2', {
  ...textVariant('h2').true,
  color: '$blue900',
  paddingBottom: '$3',
  '@sm': {
    fontSize: 'calc(5vw + 10px)',
  },
})

const Badges = styled('div', {
  display: 'flex',
  gap: '$2',
  marginBottom: '$4',
  flexWrap: 'wrap',
  '& .firstLink': {
    width: '400px',
  },
  '@sm': {
    '& a': {
      width: '100%',
    },
    '& .firstLink': {
      width: '100%',
    },
  },
})

const GrayOverlay = styled('div', {
  backgroundColor: '$gray100',
})

const ProfileDescription = styled('pre', {
  ...textVariant('body3').true,
  maxWidth: 540,
  whiteSpace: 'break-spaces',
  color: '$gray500',
})

const Inventory = styled(Container, {
  paddingTB: '$4',
  backgroundColor: '$white',
  borderRadius: '$6 $6 0 0',
  '@md': {
    borderRadius: '$4 $4 0 0',
  },
  boxShadow: '$footer',
  minHeight: 460, // prevent floating footer
})

const StyledContainer = styled(Container, {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '@lg': {
    flexDirection: 'column',
    paddingBottom: '$4',
  },
})

const CollectionPage = observer(() => {
  const { collectionAddress, chainName } = useParams<Params>()
  useMultiChainStore()

  const chainStore = useChainStore(chainName)

  const { data: collectionAndNfts } = useCollectionTokenListStore(collectionAddress, chainStore.selectedChain?.chain.id)
  const { pathname: currentPath } = useLocation()

  const collectionImgUrl = useMemo(() => {
    if (collectionAndNfts?.collection?.type === 'Public Collection') return FileLogo
    if (collectionAndNfts?.collection?.image) { return getHttpLinkFromIpfsString(collectionAndNfts.collection.image) }

    return gradientPlaceholderImg
  }, [collectionAndNfts?.collection])

  const collectionName = useMemo(() => {
    if (collectionAndNfts?.collection?.type === 'Public Collection') {
      return 'Public Collection'
    }

    return collectionAndNfts?.collection?.name
  }, [collectionAndNfts?.collection])

  return (
    <GrayOverlay>
      <Background />
      {collectionAndNfts && (
        <StyledContainer>
          <Profile>
            <ProfileHeader>
              <ProfileImage src={collectionImgUrl} />
              <ProfileName>{collectionName}</ProfileName>
            </ProfileHeader>
            <Badges>
              <NavLink
                to={
                  collectionAndNfts.collection?.owner
                    ? `/profile/${collectionAndNfts.collection.owner}`
                    : currentPath
                }
                className={'firstLink'}
              >
                <Badge
                  wrapperProps={{
                    fullWidth: true,
                  }}
                  content={{
                    title: 'Creator',
                    value: reduceAddress(collectionAndNfts.collection?.owner ?? ''),
                  }}
                  image={{
                    url: getProfileImageUrl(collectionAndNfts.collection?.owner ?? ''),
                    borderRadius: 'circle',
                  }}
                />
              </NavLink>
              {collectionAndNfts.collection?.address && (
                <Link
                  target='_blank'
                  rel='noopener noreferrer'
                  href={`${chainStore.selectedChain?.chain.blockExplorers?.default.url}` +
                      `/address/${collectionAndNfts.collection?.address}`}
                >
                  <Badge
                    content={{
                      title: chainStore.selectedChain?.chain.blockExplorers?.default.name,
                      value: reduceAddress(collectionAndNfts.collection?.address ?? ''),
                    }}
                  />
                </Link>
              )}
            </Badges>
            <ProfileDescription>
              {collectionAndNfts.collection?.description}
            </ProfileDescription>
          </Profile>
        </StyledContainer>
      )}
      <Inventory>
        <TabsContainer>
          <Tabs
            tabs={[
              {
                value: 'efts',
                label: 'EFTs',
                url: 'efts',
                amount: collectionAndNfts?.total ?? 0,
              },
            ]}
            isSmall
          />
        </TabsContainer>
        <Outlet />
      </Inventory>
    </GrayOverlay>
  )
})

export default CollectionPage
