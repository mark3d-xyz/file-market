import React from 'react'

import { styled } from '../../../../styles'
import { Container } from '../../../UIkit'
import { BottomSection, TopSection } from './section'

const FooterWrapper = styled('footer', {
  width: '100%',
  backdropFilter: 'blur(12.5px)',
  boxShadow: '$footer',
  color: '$blue900',
  background: '#131416',
})

const FooterContainer = styled(Container, {
  height: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  alignItems: 'center',
  color: '$white',
  paddingTB: '48px',
  '@md': {
    justifyContent: 'center',
    flexDirection: 'column',
    paddingTop: '32px',
    paddingBottom: '16px',
  },
  '@sm': {
    alignItems: 'center',
  },
})

const Line = styled('div', {
  width: '100%',
  height: '1px',
  background: '#232528',
  margin: '32px 0',
  '@md': {
    margin: '16px 0',
  },
})

export default function Footer() {
  return (
    <FooterWrapper>
      <FooterContainer>
        <TopSection />
        <Line />
        <BottomSection />
      </FooterContainer>
    </FooterWrapper>
  )
}
