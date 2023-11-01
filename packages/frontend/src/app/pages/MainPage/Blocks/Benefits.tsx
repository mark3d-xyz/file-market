import { styled } from '../../../../styles'
import Title from '../components/SectionTitle/SectionTitle'
import { BenefitsData } from '../helper/Benefits/data'
import DotsGradientBottom from '../img/Benefits/dots-gradient-bottom.svg'
import DotsGradientTop from '../img/Benefits/dots-gradient-top.svg'

export interface BenefitItemProps {
  icon?: string
  title: string
  text: string
}

const BenefitItemStyles = styled('li', {
  display: 'flex',
  columnGap: 12,
  justifyContent: 'flex-start',
  border: '2px solid #898E94',
  borderRadius: 16,
  padding: 11,
  paddingLeft: 14,
  paddingTop: 15,
  paddingBottom: 14,
  background: '$white',
})

const BenefitItemIconsWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'center',
  rowGap: 6,
})

const BenefitItemIconMain = styled('img', {
  minWidth: 40,
  maxWidth: 40,
  height: 'auto',
})

const BenefitItemTitle = styled('h4', {
  color: '$gray700',
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '20px',
  marginBottom: 8,
})

const BenefitItemText = styled('h4', {
  color: '$gray700',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '16px',
})

const BenefitItemContent = styled('div', {})

const BenefitItemDotsGradient = styled('img', {
  height: 26,
  width: 'auto',
})

const BenefitItem = (props: BenefitItemProps) => {
  const { icon, title, text } = props

  return (
    <BenefitItemStyles>
      <BenefitItemIconsWrapper>
        <BenefitItemDotsGradient src={DotsGradientTop} />
        <BenefitItemIconMain src={icon} />
        <BenefitItemDotsGradient src={DotsGradientBottom} />
      </BenefitItemIconsWrapper>
      <BenefitItemContent>
        <BenefitItemTitle >{title}</BenefitItemTitle>
        <BenefitItemText>{text}</BenefitItemText>
      </BenefitItemContent>
    </BenefitItemStyles>
  )
}

const BenefitsStyles = styled('section', {
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

const BenefitsList = styled('ul', {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  columnGap: 16,
  rowGap: 16,
  gridAutoRows: '1fr',
  '@lg': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@md': {
    gridTemplateColumns: 'repeat(1, 1fr)',
    rowGap: 12,
  },
})

const Benefits = () => {
  return (
    <BenefitsStyles>
      <Title marginBottom="32">Discover the Benefits</Title>
      <BenefitsList >
        {BenefitsData.map((item) => {
          return (
            <BenefitItem {...item} key={item.title} />
          )
        })}
      </BenefitsList>
    </BenefitsStyles>
  )
}

export default Benefits
