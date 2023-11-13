import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

import { useAuth } from '../../../../hooks/useAuth'
import Title from '../../components/SectionTitle/SectionTitle'
import { WhatCanBeSoldData } from '../../helper/WhatCanBeSold/data'
import SellableItem from './SellableItem/SellableItem'
import { StyledExploreButton, StyledInfo, StyledSellableItemsList, StyledStartSellingButton, StyledStartSellingTitle, StyledWhatCanBeSold } from './WhatCanBeSold.styles'

const WhatCanBeSold = () => {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { connect } = useAuth()

  return (
    <StyledWhatCanBeSold>
      <Title marginBottom="32">What can be sold or bought?</Title>
      <StyledInfo>
        With FileMarket, anyone can earn their first crypto
        by selling or reselling access to anything digital that can be a file.
      </StyledInfo>
      <StyledInfo>
        Explore what products they can be.
      </StyledInfo>
      <StyledSellableItemsList >
        {WhatCanBeSoldData.map((item) => {
          return (
            <SellableItem
              key={item.title}
              {...item}
            />
          )
        })}
      </StyledSellableItemsList>
      <StyledExploreButton
        whiteWithBlueBlindsMd
        bigHg
        onClick={() => {
          navigate('/market')
        }}
      >
        Explore
      </StyledExploreButton>
      <StyledStartSellingTitle>
        Your work has value.
        {' '}
        <br />
        Sell it for crypto.
      </StyledStartSellingTitle>
      <StyledStartSellingButton
        primary
        bigHg
        onClick={() => {
          if (isConnected) {
            navigate('/create/eft')

            return
          }
          connect()
        }}
      >
        Start Selling
      </StyledStartSellingButton>
    </StyledWhatCanBeSold>
  )
}

export default WhatCanBeSold
