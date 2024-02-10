import { observer } from 'mobx-react-lite'
import React, { type ReactNode, useMemo } from 'react'

import { styled } from '../../../../styles'
import { useMultiChainStore } from '../../../hooks/useMultiChainStore'
import { PageLayout, textVariant, Txt } from '../../../UIkit'
import {
  selectBlockchainDescription,
  selectBlockchainTitle,
  type selectBlockchainType,
} from '../helper/data/SelectBlockchainData'
import SelectBlockchainBlock from './SelectBlockchainBlock/SelectBlockchainBlock'

const SelectBlockchainContainer = styled('div', {
  width: 'max-content',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '28px',
  rowGap: '28px',
  color: '#2F3134',
  '@md': {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
})

const SelectBlockchainStyle = styled(PageLayout, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 'calc($layout$navBarHeight + $space$4 + 58px)',
})

const SelectBlockchainContent = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '48px',
})

const TextBlock = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '728px',
  '@md': {
    width: '100%',
  },
})

const TitleStyled = styled(Txt, {
  marginBottom: '24px',
  ...textVariant('fourfold1').true,
  '@md': {
    fontSize: '32px',
  },
  '@sm': {
    fontSize: '28px',
  },
  '@media (max-width: 500px)': {
    fontSize: '25px',
  },
  '@media (max-width: 450px)': {
    fontSize: '32px',
  },
  '@xs': {
    fontSize: '30px',
  },
})

const DescriptionStyled = styled(Txt, {
  marginBottom: '48px',
  width: '640px',
  ...textVariant('body2').true,
  '@md': {
    width: '100%',
  },
  '@sm': {
    fontSize: '16px',
  },
})

interface ISelectBlockchain {
  type?: selectBlockchainType
  title?: ReactNode
  description?: ReactNode
  onChange?: (chainId: number) => void
}

// eslint-disable-next-line max-len
const SelectBlockchain = observer(({ type, title: titleProps, description: descriptionProps, onChange }: ISelectBlockchain) => {
  const multiChainStore = useMultiChainStore()
  const title = useMemo(() => {
    if (!type) return titleProps

    return titleProps ?? selectBlockchainTitle[type]
  }, [type, titleProps])

  const description = useMemo(() => {
    if (!type) return descriptionProps

    return descriptionProps ?? selectBlockchainDescription[type]
  }, [type, descriptionProps])

  return (
    <SelectBlockchainStyle>
      <SelectBlockchainContent>
        <TextBlock>
          <TitleStyled>{title}</TitleStyled>
          <DescriptionStyled>{description}</DescriptionStyled>
          <SelectBlockchainContainer>
            {multiChainStore.data?.map(item => {
              return (
                <SelectBlockchainBlock
                  key={item.chain.id.toString()}
                  name={item.chain.name}
                  img={item.img}
                  onClick={() => { onChange?.(item.chain.id) }}
                />
              )
            })}
          </SelectBlockchainContainer>
        </TextBlock>
      </SelectBlockchainContent>
    </SelectBlockchainStyle>
  )
})

export default SelectBlockchain
