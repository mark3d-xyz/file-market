import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

import FileMarketIcon from '../../../../../../assets/FileMarketLogoFooter.svg'
import DeBankImg from '../../../../../../assets/img/DeBankImg.svg'
import DiscordImg from '../../../../../../assets/img/DiscordImg.svg'
import InstagramImg from '../../../../../../assets/img/InstagramImg.svg'
import LinkedinImg from '../../../../../../assets/img/LinkedinImg.svg'
import MediumImg from '../../../../../../assets/img/MediumImg.svg'
import TelegramImg from '../../../../../../assets/img/TelegramImg.svg'
import TwitterImg from '../../../../../../assets/img/TwitterImg.svg'
import YoutubeImg from '../../../../../../assets/img/YoutubeImg.svg'
import { styled } from '../../../../../../styles'
import { useMediaMui } from '../../../../../hooks/useMediaMui'
import { textVariant } from '../../../../../UIkit'

const TopSectionStyle = styled('div', {
  '& .section': {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    ...textVariant('secondary2'),
  },
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  gap: '16px',
  flexWrap: 'wrap',
  '& .first': {
    maxWidth: '360px',
    '& img': {
      width: '170px',
      height: '30px',
    },
    '& h5': {
      fontWeight: '500 !important',
      fontSize: '16px !important',
    },
  },
  '& .third': {
    maxWidth: '256px',
  },
  '@lg': {
    '& .third': {
      maxWidth: '360px',
    },
  },
  '@md': {
    '& .first, .third': {
      maxWidth: '100%',
      width: '100%',
    },
  },
  '@sm': {
    columnGap: '74px',
    justifyContent: 'left',
    gap: '32px',
    '& .second': {
      width: '140px',
    },
  },
})
const styleLink = {
  ...textVariant('secondary2').true,
  fontFamily: '$body',
  fontWeight: '500',
  color: 'white',
  textDecoration: 'none',
  '&:hover': {
    color: '#D3D3D4',
  },
  variants: {
    black: {
      true: {
        color: '#232528',
        '&:hover': {
          color: '#393B3E',
        },
      },
    },
  },
}
export const TextLink = styled('a', {
  ...styleLink,
})

export const TextLinkMock = styled(Link, {
  ...styleLink,
})

export const Text = styled('span', {
  ...textVariant('primary2').true,
  fontWeight: '500',
  fontSize: '14px',
  color: 'white',
  textDecoration: 'none',
  variants: {
    black: {
      true: {
        color: '#232528',
      },
    },
  },
})

const HeaderText = styled('h4', {
  ...textVariant('secondary2').true,
  fontFamily: '$body',
  fontWeight: '700',
  color: '#7B7C7E',
})

const SecondContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

const ThirdContent = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  width: '100%',
})

export const Card = styled('a', {
  background: '#232528',
  width: '49%',
  height: '44px',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '4px',
  borderRadius: '8px',
  textDecoration: 'none',
  paddingLeft: 16,
  paddingRight: 16,
  '@lg': {
    justifyContent: 'center',
  },
  '&:hover': {
    background: '#393B3E',
  },
  variants: {
    white: {
      true: {
        background: 'white',
        border: '1px solid $gray300',
        boxShadow: '0px 4px 20px rgba(35, 37, 40, 0.05)',
        '&:hover': {
          background: '#D3D3D4',
        },
      },
    },
  },
  '@md': {
    width: '49%',
  },
})

interface ILink {
  text: string
  url: string
  isMock?: boolean
  onClick?: () => void
}

export const Cards: Array<{
  img: string
  text: string
  url: string
}> = [
  {
    img: TwitterImg,
    text: '(Twitter)',
    url: 'https://twitter.com/filemarket_xyz',
  },
  {
    img: DiscordImg,
    text: 'Discord',
    url: 'https://discord.gg/filemarket',
  },
  {
    img: TelegramImg,
    text: 'Telegram',
    url: 'https://t.me/FileMarketChat',
  },
  {
    img: YoutubeImg,
    text: 'Youtube',
    url: 'https://www.youtube.com/@filemarket_xyz',
  },
  {
    img: MediumImg,
    text: 'Medium',
    url: 'https://medium.com/filemarket-xyz',
  },
  {
    img: LinkedinImg,
    text: 'LinkedIn',
    url: 'https://www.linkedin.com/company/filemarketxyz/',
  },
  {
    img: InstagramImg,
    text: 'Instagram',
    url: 'https://instagram.com/filemarket_xyz',
  },
  {
    img: DeBankImg,
    text: 'DeBank',
    url: 'https://debank.com/official-account/111822',
  },
]

export const TopSection = () => {
  const { smValue, mdValue, xlValue, lgValue } = useMediaMui()
  const collectionPosition = useMemo(() => {
    if (smValue) return 1900
    if (mdValue) return 1400
    if (lgValue) return 1400
    if (xlValue) return 847

    return 808
  }, [scrollY])
  const MarketPlaceItems: ILink[] = [
    {
      text: 'Explore EFTs',
      url: '/market',
      isMock: true,
    },
    {
      text: 'Build own Shop',
      url: 'https://form.typeform.com/to/gulmhUKG?typeform-source=filemarket.xyz',
    },
    {
      text: 'Collections',
      url: '/market/collections',
      isMock: true,
      onClick: () => {
        window.scrollTo(0, collectionPosition)
      },
    },
    {
      text: 'FileBunnies',
      url: '/fileBunnies',
      isMock: true,
    },
    {
      text: 'How to get FIL',
      url: 'https://medium.com/filemarket-xyz/how-to-buy-fil-and-use-fil-in-the-filecoin-virtual-machine-d67fa90764d5',
    },
    {
      text: 'FAQ',
      url: '',
    },
  ]
  const Links: ILink[] = [
    {
      text: 'EFT Protocol',
      url: 'https://medium.com/filemarket-xyz/how-to-attach-an-encrypted-file-to-your-nft-7d6232fd6d34',
    },
    {
      text: 'SDK',
      url: '',
    },
    {
      text: 'DAO',
      url: 'https://discord.gg/filemarket',
    },
    {
      text: 'GitHub',
      url: 'https://github.com/Filemarket-xyz/file-market',
    },
    {
      text: 'Blogs',
      url: 'https://medium.com/filemarket-xyz',
    },
  ]
  const Company: ILink[] = [
    {
      text: 'About',
      url: '',
    },
    {
      text: 'Ambassador program',
      url: 'https://filemarket.typeform.com/to/MTwDOB1J',
    },
    {
      text: 'Become a partner',
      url: 'https://filemarket.typeform.com/to/BqkdzJQM',
    },
    {
      text: 'Branding',
      url: '/branding',
      isMock: true,
    },
    {
      text: 'Calendly',
      url: 'http://calendly.com/filemarket',
    },
  ]

  return (
    <TopSectionStyle>
      <div className='section first'>
        <Link to={'/mainpage'}>
          <img src={FileMarketIcon} alt='' />
        </Link>
        <Text style={{ lineHeight: '24px', fontSize: '16px' }}>
          FileMarket is a multi-chain marketplace specializing in the
          tokenization and monetization of pivotal public data through perpetual
          decentralized storage with a privacy layer, opening the data economy
          to the mass market.
        </Text>
      </div>
      <div className='section second'>
        <HeaderText>Platform</HeaderText>
        <SecondContent>
          {MarketPlaceItems.map((item, index) => {
            return item.isMock ? (
              <TextLinkMock
                key={index}
                to={item.url}
                onClick={() => {
                  item.onClick?.()
                }}
              >
                {item.text}
              </TextLinkMock>
            ) : (
              <TextLink
                key={index}
                href={item.url}
                target={'_blank'}
                onClick={() => {
                  item.onClick?.()
                }}
              >
                {item.text}
              </TextLink>
            )
          })}
        </SecondContent>
      </div>
      <div className='section second'>
        <HeaderText>Links</HeaderText>
        <SecondContent>
          {Links.map((item, index) => {
            return item.isMock ? (
              <TextLinkMock
                key={index}
                to={item.url}
                onClick={() => {
                  item.onClick?.()
                }}
              >
                {item.text}
              </TextLinkMock>
            ) : (
              <TextLink
                key={index}
                href={item.url}
                target={'_blank'}
                onClick={() => {
                  item.onClick?.()
                }}
              >
                {item.text}
              </TextLink>
            )
          })}
        </SecondContent>
      </div>
      <div className='section second'>
        <HeaderText>Company</HeaderText>
        <SecondContent>
          {Company.map((item, index) => {
            return item.isMock ? (
              <TextLinkMock
                key={index}
                to={item.url}
                onClick={() => {
                  item.onClick?.()
                }}
              >
                {item.text}
              </TextLinkMock>
            ) : (
              <TextLink
                key={index}
                href={item.url}
                target={'_blank'}
                onClick={() => {
                  item.onClick?.()
                }}
              >
                {item.text}
              </TextLink>
            )
          })}
        </SecondContent>
      </div>
      <div className='section third'>
        <HeaderText>Join our community</HeaderText>
        <ThirdContent>
          {Cards.map((item, index) => (
            <Card key={index} href={item.url} target={'_blank'}>
              <img src={item.img} />
              <Text>{item.text}</Text>
            </Card>
          ))}
        </ThirdContent>
      </div>
    </TopSectionStyle>
  )
}
