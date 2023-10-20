import React from 'react'
import { useNavigate } from 'react-router-dom'

import { styled } from '../../../../styles'
import { Button, Container, textVariant } from '../../../UIkit'
import { MainBlock } from '../../GetAccessPage/GetAccessPage'
import HowToGetStart from '../components/HowToGetStart/HowToGetStart'
import bgStorage from '../img/BgStorageNew.svg'
import sunGreen from '../img/SunGreen.svg'
import Achievements from './Achievements'
import KeepTouchBlock from './KeepTouchBlock'
import Publications from './Publications/Publications'
import SupportedBy from './SupportedBy'

const BackgroundContainer = styled('section', {
  width: '100%',
})

const WelcomeScreenWrapper = styled('section', {
  width: '100%',
  backgroundSize: '480px',
  backgroundRepeat: 'no-repeat',
  $$topPad: '260px',
  position: 'relative',
  '& .greenSun': {
    zIndex: '1',
    position: 'absolute',
    top: '90px',
    left: '7px',
    '@media (max-width: 1750px)': {
      left: '-45px',
    },
    '@lg': {
      display: 'none',
    },
  },
  '@xl': {
    backgroundPosition: 'top $$topPad right 4.5%, top 188px right 0, top -68px left -10px',
  },
  '@lg': {
    background: 'none',
  },
})
const Title = styled('h1', {
  ...textVariant('fourfold1').true,
  lineHeight: '1.25',
  color: '$gray800',
  '@lg': {
    fontSize: 'calc(1.5vw + 20px)',
  },
  '@sm': {
    fontSize: 24,
    '& > br': {
      display: 'none',
    },
  },
  '@xs': {
    fontSize: 22,
  },
  maxWidth: '871px',
  marginBottom: 0,
})

const Description = styled('p', {
  ...textVariant('body1').true,
  fontWeight: 400,
  color: '$gray700',
  maxWidth: 776,
  marginTop: '24px',
  paddingBottom: '64px',
  '@lg': {
    paddingBottom: '58px',
  },
  '@md': {
    fontSize: '18px',
    paddingBottom: '54px',
    marginTop: '20px',
  },
  '@sm': {
    fontSize: '16px',
    marginTop: '16px',
  },
  '@xs': {
    fontSize: '14px',
    paddingBottom: '48px',
    marginTop: '12px',
  },
})

export const ToolCardContent = styled('div', {
  gap: '$2',
  padding: '$4',
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: 350,
})
export const ToolCardInfo = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$4',
  '@md': {
    gap: '$3',
  },
})
export const ToolTitle = styled('h5', {
  color: '$white',
  '@md': {
    fontSize: '$body2',
  },
  '@sm': {
    fontSize: '$body3',
  },
  ...textVariant('h5').true,
})
export const ToolDescription = styled('p', {
  fontSize: '1.25rem',
  fontWeight: '500',
  color: '$white',
  '@md': {
    fontSize: '$body2',
  },
  '@sm': {
    fontSize: '$body3',
  },
})

const NavigateBlock = styled(MainBlock, {
  maxWidth: 616,
  padding: '48px',
  flexDirection: 'column',
  rowGap: '32px',
  '& .buttonContainer': {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    columnGap: '32px',
    width: '100%',
    '@lg': {
      columnGap: '24px',
    },
    '@md': {
      columnGap: '12px',
    },
    '@media (max-width: 500px)': {
      display: 'flex',
      flexDirection: 'column',
      rowGap: '8px',
    },
  },
  '@lg': {
    maxWidth: 617,
    rowGap: '28px',
    padding: '40px',
  },
  '@md': {
    rowGap: '24px',
    maxWidth: 498,
    padding: '32px',
  },
  '@sm': {
    padding: '24px',
  },
  '@media (max-width: 500px)': {
    rowGap: '16px',
  },
  '@xs': {
    padding: '16px',
  },
})

const NavigateTitle = styled('h4', {
  ...textVariant('fourfold3').true,
  lineHeight: '1',
  '@md': {
    fontSize: '20px',
  },
  '@media (max-width: 500px)': {
    lineHeight: '1.25',
    textAlign: 'center',
  },
  br: {
    display: 'none',
    '@media (max-width: 500px)': {
      display: 'block',
    },
  },
})

const WelcomeInfo = styled(Container, {
  paddingTop: 'calc($layout$navBarHeight + 44px + 58px)',
  paddingBottom: '140px',
  zIndex: '2',
  position: 'relative',
  '@sm': {
    paddingBottom: '100px',
  },
})

const StorageImg = styled('img', {
  position: 'absolute',
  top: '102px',
  left: '55%',
  '@xl': {
    left: '65%',
  },
  '@lg': {
    left: '75%',
  },
  '@md': {
    width: '600px',
    left: '80%',
  },
  '@media (max-width: 800px)': {
    display: 'none',
  },
})

export default function WelcomeBlock() {
  const navigate = useNavigate()

  return (
    <BackgroundContainer>
      <WelcomeScreenWrapper>
        <img src={sunGreen} className={'greenSun'} />
        <WelcomeInfo>
          <StorageImg src={bgStorage} />
          <Title>
            P2P platform for trading any digital goods
          </Title>
          <Description>
            Experience true ownership and complete privacy with brand new Encrypted FileToken (EFT) standard, offering
            on-chain provenance on the secondary market with royalties, low fees, instant payouts, and decentralized
            storage for your valuable content.
          </Description>
          <NavigateBlock>
            <NavigateTitle>
              Upload your data, protect it, then start earning by selling access!
            </NavigateTitle>
            <div className='buttonContainer'>
              <Button
                mediumMxWidth
                whiteWithBlueBlindsMd
                bigHg
                style={{ height: '64px', padding: '28px 59px', whiteSpace: 'nowrap' }}
                onClick={() => {
                  navigate('/create/eft')
                }}
              >
                Upload file right here
              </Button>
              <Button
                mediumMxWidth
                whiteWithBlueBlindsMd
                bigHg
                style={{ height: '64px', padding: '28px 59px', whiteSpace: 'nowrap' }}
                onClick={() => {
                  navigate('/market')
                }}
              >
                Explore files
              </Button>
            </div>
          </NavigateBlock>
          <SupportedBy />
          <HowToGetStart />
          <Achievements />
          <Publications />
          <KeepTouchBlock />
        </WelcomeInfo>
      </WelcomeScreenWrapper>
    </BackgroundContainer>
  )
}
