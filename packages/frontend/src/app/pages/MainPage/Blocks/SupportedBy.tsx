import React from 'react'

import { styled } from '../../../../styles'
import { supportedByData } from '../helper/SupportedBy/data'
import item7 from '../img/SupportedBy/item7.svg'
import item8 from '../img/SupportedBy/item8.svg'

const SupportedByStyle = styled('div', {
  marginTop: '64px',
  marginBottom: '150px',
  '@lg': {
    marginBottom: '120px',
  },
  '@md': {
    width: '100%',
    marginTop: '52px',
    marginBottom: '100px',
  },
  '@sm': {
    marginBottom: '90px',
  },
  '@xs': {
    marginTop: '48px',
    marginBottom: '80px',
  },
})

const SupportedContainerBlocks = styled('div', {
  display: 'inline-flex',
  flexWrap: 'wrap',
  columnGap: '48px',
  '@xl': {
    columnGap: '42px',
  },
  '@lg': {
    columnGap: '36px',
  },
  '@md': {
    columnGap: '28px',
  },
  '@sm': {
    columnGap: '16px',
  },
  '@xs': {
    columnGap: '10px',
  },
})

const FlexLineBreak = styled('div', {
  width: '100%',
  height: '24px',
  '@xl': {
    height: '21px',
  },
  '@lg': {
    height: '18px',
  },
  '@md': {
    height: '14px',
  },
  '@sm': {
    height: '8px',
  },
  '@xs': {
    height: '5px',
  },
})

const SupportedByLink = styled('a', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80px',
  height: '80px',
  '@lg': {
    width: '65px',
    height: '65px',
  },
  '@md': {
    width: '58px',
    height: '58px',
  },
  '@sm': {
    width: '44px',
    height: '44px',
  },
  '@xs': {
    width: '32px',
    height: '32px',
  },
})

const SupportedByExtraLink = styled('a', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: `${80 * 3 + 48 * 2}px`,
  '@xl': {
    width: `${80 * 3 + 42 * 2}px`,
  },
  '@lg': {
    width: `${65 * 3 + 36 * 2}px`,
  },
  '@md': {
    width: `${58 * 3 + 28 * 2}px`,
  },
  '@sm': {
    width: `${44 * 3 + 16 * 2}px`,
  },
  '@xs': {
    width: `${32 * 3 + 10 * 2}px`,
  },
  variants: {
    start: {
      true: {
        justifyContent: 'flex-start',
      },
    },
    end: {
      true: {
        justifyContent: 'flex-end',
      },
    },
  },
})

export const SupportedByExtraImg = styled('img', {
  width: 'auto',
  variants: {
    techStars: {
      true: {
        height: '60px',
      },
    },
    cyberPort: {
      true: {
        height: '80px',
      },
    },
  },
})

const SupportedByImg = styled('img', {
  height: '100%',
  width: 'auto',
})

const SupportedByTitle = styled('h4', {
  fontFamily: '$body',
  display: 'block',
  lineHeight: 1,
  marginBottom: '24px',
  fontSize: '24px',
  fontWeight: 700,
  '@md': {
    marginBottom: '20px',
  },
  '@sm': {
    fontSize: '20px',
    marginBottom: '20px',
  },
  '@xs': {
    marginBottom: '16px',
  },
})

const SupportedBy = () => {
  return (
    <SupportedByStyle>
      <SupportedByTitle>Supported By</SupportedByTitle>
      <SupportedContainerBlocks>
        {supportedByData.map((item, index) => {
          return (
            <SupportedByLink
              key={index}
              href={item.url}
              target={'_blank'}
              rel="noreferrer"
            >
              <SupportedByImg src={item.src} />
            </SupportedByLink>
          )
        })}
        <FlexLineBreak />
        <SupportedByExtraLink
          start
          href='https://www.techstars.com/'
          target='_blank'
        >
          <SupportedByExtraImg src={item7} alt='Techstars' techStars />
        </SupportedByExtraLink>
        <SupportedByExtraLink
          end
          href='https://www.cyberport.hk/en'
          target='_blank'
        >
          <SupportedByExtraImg src={item8} alt='Cyberport' cyberPort />
        </SupportedByExtraLink>
      </SupportedContainerBlocks>
    </SupportedByStyle>
  )
}

export default SupportedBy
