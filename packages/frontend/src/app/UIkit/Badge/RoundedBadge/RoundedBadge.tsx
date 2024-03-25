import { type ComponentProps, forwardRef, type ReactNode } from 'react'

import { StyledRoundedBadge } from './RoundedBadge.styles'

export interface RoundedBadgeProps extends Omit<ComponentProps<typeof StyledRoundedBadge>, 'withIcon' | 'ref'> {
  icon?: ReactNode
}

export const RoundedBadge = forwardRef<HTMLDivElement, RoundedBadgeProps>(({
  children,
  icon,
  ...other
}, ref) => {
  return (
    <StyledRoundedBadge
      ref={ref}
      withIcon={Boolean(icon)}
      {...other}
    >
      {children}
      {icon}
    </StyledRoundedBadge>
  )
})
