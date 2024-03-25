import { styled } from '../../../../../../styles'
import { Button, CheckBoxContainer } from '../../../../../UIkit'

export const AddCollectionButton = styled(Button, {
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$3',
  minWidth: 0,
  padding: 0,
  backgroundColor: '$white',
  boxShadow: '0px 0px 15px rgba(19, 19, 45, 0.05)',
})
export const Icon = styled('img', {
  width: 16,
  height: 16,
})
export const CollectionPickerContainer = styled('div', {
  display: 'flex',
  gap: '$2',
  justifyContent: 'space-between',
  '& div:first-child': {
    flexGrow: 1,
  },
  // set width to full width of form
  // calc inside calcs is taken from container props
  '& ul': {
    width: 'calc(100% - 2 * calc((100% - $breakpoints$xl) * 0.5 + $space$3))',
    '@xl': {
      width:
        'calc(100% - 2 * calc((100% - $breakpoints$lg) * 0.5 + $space$3) - $space$2 - 48px)',
    },
    '@lg': {
      width: 'calc(100% - 2 * calc((100% - $breakpoints$md) * 0.5 + $space$4))',
    },
    '@md': {
      width: 'calc(100% - 2 * calc((100% - $breakpoints$sm) * 0.5 + $space$3))',
    },
    '@sm': {
      width: 'calc(100% - 2 * $space$3)',
    },
  },
})
export const SubTitle = styled('div', {
  color: '$gray600',
})
export const CategoryAndSubcategory = styled('div', {
  display: 'flex',
  gap: '30px',
  '@sm': {
    flexDirection: 'column',
  },
})
export const ContentField = styled(CollectionPickerContainer, {
  padding: '$3',
  border: '1px solid #e9e9e9',
  borderRadius: '20px',
  flexDirection: 'column',
  flexWrap: 'wrap',
  gap: '$3',
  '& ul': {
    maxWidth: '562px',
    '@lg': {
      width: 'calc(100% - 2 * calc((100% - $breakpoints$md) * 0.5 + $space$5))',
    },
    '@md': {
      width: 'calc(100% - 2 * calc((100% - $breakpoints$sm) * 0.5 + $space$4))',
    },
    '@sm': {
      width: 'calc(100% - 2 * $space$4)',
    },
  },
})
export const NFTLicense = styled('div', {
  '& a': {
    fontSize: '14px',
  },
})

export const SecondaryText = styled('span', {
  color: '$gray400',
})

export const HighlightedText = styled('span', {
  color: '$gray700',
})

export const CheckBoxContainerDisabled = styled(CheckBoxContainer, {
  pointerEvents: 'none',
  opacity: 0.5,
})

export const CheckBoxLabel = styled('div', {
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
})

export const CheckBoxLogo = styled('img', {
  width: '40px',
  height: '40px',
  objectFit: 'contain',
})
