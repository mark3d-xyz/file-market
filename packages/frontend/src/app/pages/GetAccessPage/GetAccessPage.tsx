import React from 'react'

import Circles from '../../../assets/img/GetAccessPage/Circles.svg'
import FileMarket from '../../../assets/img/GetAccessPage/FileMarket.svg'
import GreenStar from '../../../assets/img/GetAccessPage/GreenStar.svg'
import Mainnet from '../../../assets/img/GetAccessPage/Mainnet.svg'
import { styled } from '../../../styles'
import EmailForm from '../MainPage/components/EmailForm/EmailForm'
import DiscordGetAccess from './img/DiscordGetAccess.svg'
import LinkdGetAccess from './img/LinkdGetAccess.svg'
import TwitterGetAccess from './img/TwitterGetAccess.svg'

const GetAccessPageStyle = styled('div', {
  height: '100vh',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  background: '#F9F9F9',
  '& .fourthImg': {
    top: '-47px',
    left: '-66px',
  },
  '& .firstImg': {
    bottom: '-30px',
    right: '-90px',
  },
  '& .secondImg': {
    bottom: '-160px',
    left: '-141px',
  },
  '& .thirdImg': {
    top: '-107px',
    right: '-116px',
  },
  '@md': {
    '& .thirdImg, .secondImg': {
      transform: 'scale(0.5)',
    },
    '& .fourthImg': {
      top: '-36px',
    },
  },
  '@sm': {
    '& .firstImg': {
      bottom: '-22px',
      right: '-58px',
      transform: 'scale(0.6)',
    },
    '& .thirdImg, .secondImg': {
      transform: 'scale(0.37)',
    },
    '& .fourthImg': {
      top: '-22px',
      transform: 'scale(0.7)',
    },
  },
})

export const MainBlock = styled('div', {
  padding: '130px 20px',
  border: '2px solid #6B6F76',
  display: 'flex',
  justifyContent: 'center',
  borderRadius: '16px',
  position: 'relative',
  background: '#F9F9F9',
  '@lg': {
    padding: '80px 20px',
  },
  '@md': {
    padding: '80px 0',
  },
})

const Container = styled('div', {
  width: '777px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  '& img': {
    position: 'absolute',
  },
  '@lg': {
    width: '600px',
  },
  '@md': {
    width: '450px',
  },
  '@sm': {
    width: '300px',
  },
})

const IconsBlock = styled('div', {
  display: 'flex',
  position: 'absolute',
  bottom: '6vh',
  gap: '24px',
  '& a': {
    cursor: 'pointer',
  },
  '& a:hover': {
    filter: 'brightness(115%)',
  },
})

const GetAccessPage = () => {
  return (
    <GetAccessPageStyle>
      <Container>
        <img className={'thirdImg'} src={GreenStar} />
        <MainBlock>
          <EmailForm />
          <img className={'firstImg'} src={FileMarket} />
          <img className={'secondImg'} src={Circles} />
          <img className={'fourthImg'} src={Mainnet} />
        </MainBlock>
      </Container>
      <IconsBlock>
        <a href='https://discord.gg/GCjrgdEQRd' target={'_blank'} rel="noreferrer"><img src={DiscordGetAccess} alt='discord icon' /></a>
        <a href='https://twitter.com/filemarket_xyz' target={'_blank'} rel="noreferrer"><img src={TwitterGetAccess} alt='twitter icon' /></a>
        <a href='https://www.linkedin.com/company/filemarketxyz/' target={'_blank'} rel="noreferrer"><img src={LinkdGetAccess} alt='linkedin icon' /></a>
      </IconsBlock>
    </GetAccessPageStyle>
  )
}

export default GetAccessPage
