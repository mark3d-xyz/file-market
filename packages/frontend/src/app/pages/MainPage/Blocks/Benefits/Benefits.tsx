import Title from '../../components/SectionTitle/SectionTitle'
import { BenefitsData } from '../../helper/Benefits/data'
import DotsGradientBottom from '../../img/Benefits/dots-gradient-bottom.svg'
import DotsGradientTop from '../../img/Benefits/dots-gradient-top.svg'
import { StyledBenefitItem, StyledBenefitItemDotsGradient, StyledBenefitItemIconMain, StyledBenefitItemIconsWrapper, StyledBenefitItemText, StyledBenefitItemTitle, StyledBenefits, StyledBenefitsList } from './Benefits.styles'

export interface BenefitItemProps {
  icon?: string
  title: string
  text: string
}

const BenefitItem = ({ icon, title, text }: BenefitItemProps) => {
  return (
    <StyledBenefitItem>
      <StyledBenefitItemIconsWrapper>
        <StyledBenefitItemDotsGradient src={DotsGradientTop} />
        <StyledBenefitItemIconMain src={icon} />
        <StyledBenefitItemDotsGradient src={DotsGradientBottom} />
      </StyledBenefitItemIconsWrapper>
      <div>
        <StyledBenefitItemTitle >{title}</StyledBenefitItemTitle>
        <StyledBenefitItemText>{text}</StyledBenefitItemText>
      </div>
    </StyledBenefitItem>
  )
}

const Benefits = () => {
  return (
    <StyledBenefits>
      <Title marginBottom="32">Discover the Benefits</Title>
      <StyledBenefitsList >
        {BenefitsData.map((item) => {
          return (
            <BenefitItem {...item} key={item.title} />
          )
        })}
      </StyledBenefitsList>
    </StyledBenefits>
  )
}

export default Benefits
