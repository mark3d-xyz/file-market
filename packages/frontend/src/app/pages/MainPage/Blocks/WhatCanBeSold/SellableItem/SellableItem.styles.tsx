import { styled } from '../../../../../../styles'
// Все maxWidth, width, minWidth - чтобы текст правильно обрезался

export const StyledSellableItem = styled('li', {
  position: 'relative',
  border: '2px solid $gray700',
  borderRadius: 16,
  maxWidth: '100%',
  width: '100%',
  minWidth: '100%',
  cursor: 'pointer',
  overflow: 'hidden',
})

export const StyledItemImageWrapper = styled('div', {
  display: 'block',
  position: 'relative',
  borderBottom: '2px solid $gray700',
  width: '100%',
  pointerEvents: 'none',
})

export const StyledItemImagePaddingHack = styled('div', {
  width: '100%',
  paddingBottom: 'calc(148 / 360 * 100%)',
  pointerEvents: 'none',
})

export const StyledItemBackground = styled('img', {
  position: 'absolute',
  display: 'block',
  width: '100%',
  height: '100%',
  borderTopRightRadius: 16,
  borderTopLeftRadius: 16,
  pointerEvents: 'none',
})

export const StyledItemIcon = styled('img', {
  position: 'absolute',
  width: 120,
  height: 'auto',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
  '@xl': {
    width: 100,
  },
  '@md': {
    width: 120,
  },
  '@sm': {
    width: 100,
  },
  '@xs': {
    width: 90,
  },
})

export const StyledItemContentWrapper = styled('div', {
  padding: '16px 56px 30px 22px',
  maxWidth: '100%',
  width: '100%',
  minWidth: '100%',
  pointerEvents: 'none',
})

export const StyledItemTitle = styled('h3', {
  color: '$gray700',
  fontSize: 22,
  fontWeight: '600',
  lineHeight: '24px',
  marginBottom: 10,
  pointerEvents: 'none',
  '@xl': {
    fontSize: 20,
    marginBottom: 9,
    lineHeight: '22px',
  },
  '@md': {
    fontSize: 22,
    marginBottom: 10,
    lineHeight: '24px',
  },
  '@sm': {
    fontSize: 20,
    marginBottom: 9,
    lineHeight: '22px',
  },
  '@xs': {
    fontSize: 18,
    lineHeight: '20px',
  },
})

export const StyledItemDescriptionShort = styled('p', {
  color: '#6B6F76',
  fontSize: 16,
  fontWeight: '500',
  lineHeight: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  maxWidth: '100%',
  width: '100%',
  minWidth: '100%',
  pointerEvents: 'none',
  '@xl': {
    fontSize: 14,
  },
  '@md': {
    fontSize: 16,
  },
  '@sm': {
    fontSize: 14,
  },
})

export const StyledItemDescriptionFull = styled('p', {
  color: '#4E5156',
  fontSize: 16,
  fontWeight: '500',
  lineHeight: '24px',
  opacity: 0,
  pointerEvents: 'none',
  '@xl': {
    fontSize: 14,
    lineHeight: '22px',
  },
  '@md': {
    fontSize: 16,
    lineHeight: '24px',
  },
  '@sm': {
    fontSize: 14,
    lineHeight: '22px',
  },
})

export const StyledPlusSignImage = styled('img', {
  position: 'absolute',
  width: 20,
  height: 20,
  bottom: 11,
  right: 11,
})
