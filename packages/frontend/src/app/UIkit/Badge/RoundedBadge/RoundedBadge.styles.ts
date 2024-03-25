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
        borderRadius: '24px',
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
        // without explicit paddings it doesn't work
        padding: '8px 8px 8px 24px',
        gap: '8px',
      },
    },
  ],
  defaultVariants: {
    size: 'sm',
  },
})
