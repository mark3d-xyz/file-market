import { styled } from '../../../../styles'

export const StyledRoundedBadge = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '$gray50',
  variants: {
    withIcon: {
      true: {
        // just to define a variant
      },
    },
    size: {
      sm: {
        height: '32px',
        borderRadius: '16px',
        padding: '4px 12px',
      },
      md: {
        height: '48px',
        padding: '8xp 24px',
      },
    },
  },
  compoundVariants: [
    {
      withIcon: true,
      size: 'sm',
      css: {
        paddingRight: '4px',
        gap: '4px',
      },
    },
    {
      withIcon: true,
      size: 'md',
      css: {
        paddingRight: '8px',
        gap: '8px',
      },
    },
  ],
})
