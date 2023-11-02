import { styled } from '../../../../styles'
import Title from '../components/SectionTitle/SectionTitle'
import EFTProtocolImg from '../img/EFTProtocol/eft-logo.svg'

const EFTProtocolStyles = styled('div', {
  marginBottom: 120,
  '@lg': {
    marginBottom: 100,
  },
  '@md': {
    marginBottom: 85,
  },
  '@sm': {
    marginBottom: 70,
  },
  '@xs': {
    marginBottom: 55,
  },
})

const ContentWrapper = styled('div', {
  maxWidth: 660,
  '@lg': {
    maxWidth: 600,
  },
})

const EFTProtocolText = styled('p', {
  color: '$gray700',
  fontSize: 20,
  fontWeight: 400,
  lineHeight: '140%',
  '@lg': {
    fontSize: 18,
  },
  '@md': {
    fontSize: 16,
  },
  '& + &': {
    marginTop: 12,
  },
})

const EFTProtocolLogo = styled('img', {
  position: 'absolute',
  left: 820,
  top: '58%',
  transform: 'translateY(-50%)',
  width: 450,
  height: 'auto',
  '@xl': {
    top: '50%',
    left: 'auto',
    width: 312,
    right: 0,
  },
  '@lg': {
    top: '45%',
    width: 300,
    right: 'calc(50% - 40vw - 100px)',
  },
  '@md': {
    display: 'none',
  },
})

const EFTProtocol = () => {
  return (
    <EFTProtocolStyles>
      <Title marginBottom="32">Encrypted FileToken Protocol</Title>
      <div style={{ position: 'relative' }}>
        <ContentWrapper>
          <EFTProtocolText>
            FileMarket Labs has developed a new token type and protocol,
            allowing users to securely and privately transfer data on a public blockchain in a decentralized way.
          </EFTProtocolText>
          <EFTProtocolText>
            The &ldquo;right-click-and-save&rdquo; issue,
            common with traditional NFTs, has been addressed,
            effectively establishing a new narrative for owning
            and trading encrypted tokenized files, which is called EFT.
          </EFTProtocolText>
        </ContentWrapper>
        <EFTProtocolLogo src={EFTProtocolImg} />
      </div>
    </EFTProtocolStyles>
  )
}

export default EFTProtocol
