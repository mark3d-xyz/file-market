import React from 'react'
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  HatenaIcon,
  HatenaShareButton,
  InstapaperIcon,
  InstapaperShareButton,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  LivejournalIcon, LivejournalShareButton,
  MailruIcon,
  MailruShareButton,
  OKIcon,
  OKShareButton,
  PocketIcon,
  PocketShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TumblrIcon,
  TumblrShareButton,
  TwitterIcon, TwitterShareButton, ViberIcon, ViberShareButton, VKIcon,
  VKShareButton, WhatsappIcon, WhatsappShareButton, WorkplaceIcon, WorkplaceShareButton,
} from 'react-share'

import { styled } from '../../../styles'
import { StyledPanelInfoItem } from '../../pages/NFTPage/components/PanelInfo/Item/PanelInfoItem.styles'
import { Popover, PopoverContent, PopoverTrigger, Txt } from '../../UIkit'
import ShareImg from './img/Share.svg'

const StyledPopoverContent = styled('div', {
  display: 'flex',
  gap: '16px',
  maxWidth: '600px',
  flexWrap: 'wrap',
  '@md': {
    maxWidth: '400px',
  },
  '@sm': {
    maxWidth: '250px',
  },
})

export const Share = () => {
  const shareUrl = window.location.href

  return (
    <Popover placement={'top'}>
      <PopoverTrigger>
        <StyledPanelInfoItem style={{ cursor: 'pointer' }}>
          <img src={ShareImg} />
          <Txt primary1 style={{ fontSize: '14px', lineHeight: '32px', color: '#C9CBCF' }}>Share</Txt>
        </StyledPanelInfoItem>
      </PopoverTrigger>
      <PopoverContent>
        <StyledPopoverContent>
          <EmailShareButton
            url={shareUrl}
          >
            <EmailIcon size={32} round />
          </EmailShareButton>
          <FacebookShareButton
            url={shareUrl}
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <HatenaShareButton
            url={shareUrl}
          >
            <HatenaIcon size={32} round />
          </HatenaShareButton>
          <InstapaperShareButton
            url={shareUrl}
          >
            <InstapaperIcon size={32} round />
          </InstapaperShareButton>
          <LineShareButton
            url={shareUrl}
          >
            <LineIcon size={32} round />
          </LineShareButton>
          <LinkedinShareButton
            url={shareUrl}
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <LivejournalShareButton
            url={shareUrl}
          >
            <LivejournalIcon size={32} round />
          </LivejournalShareButton>
          <MailruShareButton
            url={shareUrl}
          >
            <MailruIcon size={32} round />
          </MailruShareButton>
          <OKShareButton
            url={shareUrl}
          >
            <OKIcon size={32} round />
          </OKShareButton>
          <PocketShareButton
            url={shareUrl}
          >
            <PocketIcon size={32} round />
          </PocketShareButton>
          <RedditShareButton
            url={shareUrl}
          >
            <RedditIcon size={32} round />
          </RedditShareButton>
          <TelegramShareButton
            url={shareUrl}
          >
            <TelegramIcon size={32} round />
          </TelegramShareButton>
          <TumblrShareButton
            url={shareUrl}
          >
            <TumblrIcon size={32} round />
          </TumblrShareButton>
          <TwitterShareButton
            url={shareUrl}
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <ViberShareButton
            url={shareUrl}
          >
            <ViberIcon size={32} round />
          </ViberShareButton>
          <VKShareButton
            url={shareUrl}
          >
            <VKIcon size={32} round />
          </VKShareButton>
          <WhatsappShareButton
            url={shareUrl}
          >
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
          <WorkplaceShareButton
            url={shareUrl}
          >
            <WorkplaceIcon size={32} round />
          </WorkplaceShareButton>
        </StyledPopoverContent>
      </PopoverContent>
    </Popover>
  )
}
