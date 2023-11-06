import React from 'react'
import { InlineShareButtons } from 'sharethis-reactjs'

import { StyledPanelInfoItem } from '../../pages/NFTPage/components/PanelInfo/Item/PanelInfoItem.styles'
import { Popover, PopoverContent, PopoverTrigger, Txt } from '../../UIkit'
import ShareImg from './img/Share.png'

export const Share = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <StyledPanelInfoItem style={{ cursor: 'pointer' }}>
          <img src={ShareImg} />
          <Txt primary1 style={{ fontSize: '14px', lineHeight: '32px', color: '#C9CBCF' }}>Share</Txt>
        </StyledPanelInfoItem>
      </PopoverTrigger>
      <PopoverContent>
        <InlineShareButtons
          config={{
            alignment: 'center', // alignment of buttons (left, center, right)
            color: 'social', // set the color of buttons (social, white)
            enabled: true, // show/hide buttons (true, false)
            font_size: 16, // font size for the buttons
            labels: 'cta', // button labels (cta, counts, null)
            language: 'en', // which language to use (see LANGUAGES)
            networks: [ // which networks to include (see SHARING NETWORKS)
              'blogger',
              'delicious',
              'digg',
              'email',
              'facebook',
              'flipboard',
              'google',
              'linkedin',
              'livejournal',
              'mailru',
              'meneame',
              'messenger',
              'oknoklassniki',
              'pinterest',
              'print',
              'reddit',
              'sharethis',
              'sms',
              'stumbleupon',
              'tumblr',
              'twitter',
              'vk',
              'wechat',
              'weibo',
              'whatsapp',
              'xing',
            ],
            show_total: false,
            padding: 12, // padding within buttons (INTEGER)
            radius: 4, // the corner radius on each button (INTEGER)
            size: 40, // the size of each button (INTEGER)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
