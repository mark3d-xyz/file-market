import { styled } from '../../../styles'
import { FormControl, textVariant, Txt } from '../../UIkit'

export const StyledTitle = styled(Txt, {
  ...textVariant('secondary1').true,
  fontSize: '40px',
  fontWeight: '700',
  lineHeight: '48px',
  fontFamily: '$fourfold',
})

export const StyledTitleSection = styled(Txt, {
  ...textVariant('secondary1').true,
  fontSize: '28px',
  fontWeight: '700',
  color: '#2F3134',
  paddingBottom: '8px',
  fontFamily: '$primary',
})

export const StyledTitleInput = styled(Txt, {
  ...textVariant('primary1').true,
  color: '#4E5156',
  display: 'flex',
  gap: '$3',
})

export const StyledSectionContent = styled('div', {
  display: 'flex',
  gap: '24px',
  flexDirection: 'column',
})

export const LabelWithCounter = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const LetterCounter = styled('span', {
  display: 'block',
  ...textVariant('secondary3').true,
  color: '$gray400',
  variants: {
    isError: {
      true: {
        color: '$red',
      },
    },
  },
})

export const ButtonContainer = styled('div', {
  paddingTop: '$3',
  paddingLeft: '$3',
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  paddingBottom: '90px',
  '@md': {
    paddingBottom: '70px',
  },
  '@sm': {
    paddingLeft: 0,
    justifyContent: 'center',
  },
})

export const Form = styled('form', {
  maxWidth: '540px',
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  gap: '32px',
  flexDirection: 'column',
})

export const FormControlSettings = styled(FormControl, {
  maxWidth: 'inherit',
  width: '100%',
  marginBottom: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const GrayBgText = styled('span', {
  width: '100%',
  borderRadius: '12px',
  outline: '2px solid #EAEAEC',
  background: '#EAEAEC',
  padding: '16px',
  variants: {
    YourWalletStyled: {
      true: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      },
    },
  },
})

export const WalletName = styled(Txt, {
  ...textVariant('body4').true,
  display: 'block',
  '@sm': {
    fontSize: 15,
  },
  '@media (max-width: 500px)': {
    display: 'none',
  },
})

export const WalletNameMobile = styled(Txt, {
  ...textVariant('body4').true,
  display: 'none',
  '@media (max-width: 500px)': {
    fontSize: 16,
    display: 'block',
  },
})
