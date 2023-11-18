import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

import Banner from '../../components/ViewInfo/Banner/Banner'
import ProfileImage from '../../components/ViewInfo/ProfileImage/ProfileImage'
import SettingsButton from '../../components/ViewInfo/SettingsButton/SettingsButton'
import { useCollectionAndTokenListStore, useStores } from '../../hooks'
import { useAddress } from '../../hooks/useAddress'
import { useProfileStore } from '../../hooks/useProfileStore'
import { useTransfersHistoryStore } from '../../hooks/useTransfersHistory'
import { useUserTransferStore } from '../../hooks/useUserTransfers'
import { Button, PageLayout, type TabItem, Tabs, Txt } from '../../UIkit'
import { TabsContainer } from '../../UIkit/Tabs/TabsContainer'
import { copyToClipboard } from '../../utils/clipboard/clipboard'
import { getHttpLinkFromIpfsString } from '../../utils/nfts'
import { getProfileImageUrl } from '../../utils/nfts/getProfileImageUrl'
import { reduceAddress } from '../../utils/nfts/reduceAddress'
import { type Params } from '../../utils/router'
import EthereumImg from './img/EthereumIcon.svg'
import {
  AddressesButtonsContainer,
  BioAndLinks,
  GrayOverlay,
  Inventory,
  Profile,
  ProfileHeader,
  ProfileName,
} from './ProfilePage.styles'
import Bio from './sections/Bio'
import Links from './sections/Links'

// По хорошему затянуть SVGR на проект, чтобы импортить SVG как компонент напрямую из assets
const CopySVGIcon = () => (
  <svg
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.4961 18L18.4961 13M13.4961 18H8.49609V15M13.4961 18V13H18.4961M18.4961 13V5H12.4961M8.49609 15V5H12.4961M8.49609 15H2.49609V2H12.4961V5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
  </svg>
)

const ProfilePage: React.FC = observer(() => {
  const { profileAddress } = useParams<Params>()
  const { userStore } = useStores()
  const profileStore = useProfileStore(profileAddress)
  const profileAddressMemo = useAddress()

  const { address: currentAddress } = useAccount()
  const transferHistoryStore = useTransfersHistoryStore(profileAddressMemo)
  const collectionAndTokenListStore = useCollectionAndTokenListStore(profileAddressMemo)
  const userTransferStore = useUserTransferStore(profileAddressMemo)

  const isOwner = useMemo(() => {
    if (!currentAddress || !profileAddressMemo) return false

    return getAddress(currentAddress ?? '') === getAddress(profileAddressMemo ?? '')
  }, [profileAddressMemo, currentAddress])

  const tabs = useMemo(() => {
    const tabs: TabItem[] = [
      {
        value: 'Owned',
        label: 'Owned',
        url: 'owned',
        amount: collectionAndTokenListStore.data.tokensTotal ?? 0,
      },
      {
        value: 'history',
        label: 'History',
        url: 'history',
        amount: transferHistoryStore.total,
      },
    ]

    if (isOwner) {
      tabs.push({
        amount: userTransferStore.total,
        url: 'transfers',
        value: 'transfers',
        label: 'Transfers',
      })
    }

    return tabs
  }, [collectionAndTokenListStore.data.tokensTotal, transferHistoryStore.tableRows, userTransferStore.total])

  const user = useMemo(() => {
    if (isOwner && userStore.user) return userStore.user

    return profileStore.user
  }, [isOwner, profileStore.user, userStore.user])

  const isAleshka = useMemo(() => {
    return profileAddress === 'lesopolosat' || profileAddress === 'lewinUp' || profileAddress === 'psyarcus' || profileAddress === '0x5de89e63edb4492d1c6e141b29474f69ef8c4f08'
  }, [profileAddress])

  return (
    <GrayOverlay style={{ width: '100%', overflow: 'hidden' }}>
      <PageLayout isHasSelectBlockChain>
        <Banner
          isOwner={isOwner}
          src={user?.bannerUrl ? getHttpLinkFromIpfsString(user?.bannerUrl) : undefined}
        />
        <Profile>
          <ProfileHeader>
            <ProfileImage
              src={user?.avatarUrl ? getHttpLinkFromIpfsString(user?.avatarUrl) : getProfileImageUrl(profileAddress ?? '')}
              isOwner={isOwner}
            />
            <ProfileName isAleshka={isAleshka}>{user?.name ?? reduceAddress(profileAddressMemo ?? '')}</ProfileName>
          </ProfileHeader>
          {isOwner && <SettingsButton />}
        </Profile>
        <AddressesButtonsContainer>
          <Button
            settings
            onClick={() => {
              copyToClipboard(profileAddressMemo)
            }}
          >
            <img src={EthereumImg} />
            <Txt primary2>{reduceAddress(profileAddressMemo ?? '')}</Txt>
            <CopySVGIcon />
          </Button>
          {/* <Button settings> */}
          {/*  <Txt primary2>f4 address</Txt> */}
          {/*  <img src={CopyImg} /> */}
          {/* </Button> */}
        </AddressesButtonsContainer>
        <BioAndLinks>
          <Bio text={user?.bio} />
          <Links items={{
            url: (() => {
              const index = user?.websiteUrl?.indexOf('://')
              if (index !== undefined && index > -1) {
                return user?.websiteUrl?.substring(index + 3, user?.websiteUrl.length)
              }

              return user?.websiteUrl
            })(),
            twitter: (() => {
              const index = user?.twitter?.indexOf('twitter.com/')
              if (index !== undefined && index > -1) {
                return user?.twitter?.substring(index + 12, user?.twitter.length)
              }

              return user?.twitter
            })(),
            instagram: user?.instagram,
            discord: user?.discord,
            telegram: user?.telegram,
          }}
          />
        </BioAndLinks>
      </PageLayout>

      <Inventory>
        <TabsContainer>
          <Tabs tabs={tabs} isSmall isTransparent />
        </TabsContainer>
        <Outlet />
      </Inventory>
    </GrayOverlay>
  )
})

export default ProfilePage
