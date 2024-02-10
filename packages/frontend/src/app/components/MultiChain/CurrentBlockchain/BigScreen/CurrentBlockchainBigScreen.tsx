import { observer } from 'mobx-react-lite'
import React from 'react'

import { useChangeNetwork } from '../../../../hooks/useChangeNetwork'
import { useCurrentBlockChain } from '../../../../hooks/useCurrentBlockChain'
import { useMultiChainStore } from '../../../../hooks/useMultiChainStore'
import { Txt } from '../../../../UIkit'
import { type ICurrentBlockchain } from '../../helper/types/currentBlockChainTypes'
import { CurrentBlockchainStyle } from '../CurrentBlockchain.styles'
import CurrentBlockchainBlock from '../CurrentBlockchainBlock/CurrentBlockchainBlock'

const CurrentBlockchain = observer(({ isVisible, isLight }: ICurrentBlockchain) => {
  const multiChainStore = useMultiChainStore()
  const currentChainStore = useCurrentBlockChain()
  const { changeNetwork, isLoading, error } = useChangeNetwork()

  return (
    <CurrentBlockchainStyle isLight={isLight}>
      <Txt css={{ fontWeight: 500 }}>Current blockchain:</Txt>
      <>
        {multiChainStore.data?.map(item => {
          return (
            <CurrentBlockchainBlock
              key={item.chain.id.toString()}
              isLight={isLight}
              isActive={currentChainStore.chainId === item.chain.id}
              name={item.chain.name}
              img={item.img}
              isDisable={isLoading && !error}
              onClick={() => {
                changeNetwork(item.chain.id)
              }}
            />
          )
        })}
      </>
    </CurrentBlockchainStyle>
  )
})

export default CurrentBlockchain
