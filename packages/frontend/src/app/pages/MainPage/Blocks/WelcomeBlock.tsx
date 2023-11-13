import React from 'react'
import { useNavigate } from 'react-router-dom'

import { styled } from '../../../../styles'
import { Button, Container, textVariant } from '../../../UIkit'
import { MainBlock } from '../../GetAccessPage/GetAccessPage'
import GiftLabel from '../components/GiftLabel/GiftLabel'
import HowToGetStart from '../components/HowToGetStart/HowToGetStart'
import bgStorage from '../img/BgStorageNew.svg'
import Achievements from './Achievements'
import Benefits from './Benefits/Benefits'
import EFTProtocol from './EFTProtocol/EFTProtocol'
import Features from './Features/Features'
import KeepTouchBlock from './KeepTouchBlock'
import Partners from './Partners/Partners'
import Publications from './Publications/Publications'
import SupportedBy from './SupportedBy'
import WhatCanBeSold from './WhatCanBeSold/WhatCanBeSold'

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
    backgroundPosition:
      'top $$topPad right 4.5%, top 188px right 0, top -68px left -10px',
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
  },
  '@media (max-width: 440px)': {
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

const FeaturesWrapper = styled('section', {
  marginBottom: '32px',
  '@md': {
    marginBottom: '40px',
  },
  '@sm': {
    marginBottom: '35px',
  },
})

const NavigateBlock = styled(MainBlock, {
  position: 'relative',
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

const GiftLabelWrapper = styled('div', {
  position: 'absolute',
  top: -15,
  left: -14,
  transform: 'rotate(-10deg)',
  '@md': {
    top: -22,
    left: -16,
  },
  '@sm': {
    top: -33,
    left: 'auto',
    right: -1,
    transform: 'rotate(10deg)',
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
  top: '150px',
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
        <WelcomeInfo>
          <StorageImg src={bgStorage} />
          <Title>
            P2P file-sharing platform
            {' '}
            <br />
            {' '}
            for trading digital goods in web3
          </Title>
          <FeaturesWrapper>
            <Features />
          </FeaturesWrapper>
          <NavigateBlock>
            <GiftLabelWrapper>
              <GiftLabel />
            </GiftLabelWrapper>

            <NavigateTitle>
              Upload your data, protect it, then start earning by selling
              access!
            </NavigateTitle>
            <div className='buttonContainer'>
              <Button
                mediumMxWidth
                whiteWithBlueBlindsMd
                bigHg
                style={{
                  height: '64px',
                  padding: '28px 59px',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => {
                  navigate('/create/eft')
                }}
              >
                Upload & sell a file
              </Button>
              <Button
                mediumMxWidth
                whiteWithBlueBlindsMd
                bigHg
                style={{
                  height: '64px',
                  padding: '28px 59px',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => {
                  navigate('/market')
                }}
              >
                Explore files
              </Button>
            </div>
          </NavigateBlock>
          <SupportedBy />
          <WhatCanBeSold />
          <HowToGetStart />
          <Benefits />
          <EFTProtocol />
          <Achievements />
          <Publications />
          <Partners />
          <KeepTouchBlock />
        </WelcomeInfo>
      </WelcomeScreenWrapper>
    </BackgroundContainer>
  )
}
