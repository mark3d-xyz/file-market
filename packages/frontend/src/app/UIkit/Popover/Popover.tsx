import { Popover as NextUIPopover } from '@nextui-org/react'

import { styled } from '../../../styles'

export const Popover = NextUIPopover
export const PopoverTrigger = NextUIPopover.Trigger
export const PopoverContent = styled(NextUIPopover.Content, {
  paddingTB: '$4',
  paddingLR: '30px',
  display: 'flex',
  flexWrap: 'wrap',
  '@md': {
    padding: '$3',
  },
  backgroundColor: '$white',
  border: '2px solid $gray200',
  borderRadius: '$3',
  boxShadow: '$form',
})
