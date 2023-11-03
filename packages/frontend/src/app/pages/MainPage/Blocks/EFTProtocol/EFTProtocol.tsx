import Title from '../../components/SectionTitle/SectionTitle'
import EFTProtocolImg from '../img/EFTProtocol/eft-logo.svg'
import { StyledContentWrapper, StyledEFTProtocol, StyledEFTProtocolLogo, StyledEFTProtocolText } from './EFTProtocol.styles'

const EFTProtocol = () => {
  return (
    <StyledEFTProtocol>
      <Title marginBottom="32">Encrypted FileToken Protocol</Title>
      <div style={{ position: 'relative' }}>
        <StyledContentWrapper>
          <StyledEFTProtocolText>
            FileMarket Labs has developed a new token type and protocol,
            allowing users to securely and privately transfer data on a public blockchain in a decentralized way.
          </StyledEFTProtocolText>
          <StyledEFTProtocolText>
            The &ldquo;right-click-and-save&rdquo; issue,
            common with traditional NFTs, has been addressed,
            effectively establishing a new narrative for owning
            and trading encrypted tokenized files, which is called EFT.
          </StyledEFTProtocolText>
        </StyledContentWrapper>
        <StyledEFTProtocolLogo src={EFTProtocolImg} />
      </div>
    </StyledEFTProtocol>
  )
}

export default EFTProtocol
