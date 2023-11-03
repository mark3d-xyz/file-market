import { FeaturesData } from '../../helper/Features/data'
import { StyledFeaturesItemIcon, StyledFeaturesItemInner, StyledFeaturesItemTitle, StyledFeaturesItemWrapper, StyledFeaturesList } from './Features.styles'

export interface FeaturesItemProps {
  icon: string
  name: string
  mobileName?: string
}

const FeaturesItem = ({ icon, name, mobileName }: FeaturesItemProps) => {
  return (
    <StyledFeaturesItemWrapper>
      <StyledFeaturesItemInner>
        <StyledFeaturesItemIcon src={icon} aria-hidden="true" />
        <StyledFeaturesItemTitle>
          {!mobileName && name}
          {mobileName && (
            <>
              <span className="_desktop">{name}</span>
              <span className="_mobile">{mobileName}</span>
            </>
          )}
        </StyledFeaturesItemTitle>
      </StyledFeaturesItemInner>
    </StyledFeaturesItemWrapper>
  )
}

const Features = () => {
  return (
    <StyledFeaturesList>
      {FeaturesData.map((item, index) => {
        return (
          <FeaturesItem
            key={item.name}
            {...item}
          />
        )
      })}
    </StyledFeaturesList>
  )
}

export default Features
