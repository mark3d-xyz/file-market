import { type WhatCanBeSoldItemType } from '../../Blocks/WhatCanBeSold/SellableItem/SellableItem'
import Background3DModels from '../../img/WhatCanBeSold/background-3d-models.png'
import BackgroundArchives from '../../img/WhatCanBeSold/background-archives.png'
import BackgroundDocuments from '../../img/WhatCanBeSold/background-documents.png'
import BackgroundGraphics from '../../img/WhatCanBeSold/background-graphics.png'
import BackgroundMusic from '../../img/WhatCanBeSold/background-music.png'
import BackgroundPhotos from '../../img/WhatCanBeSold/background-photos.png'
import BackgroundPromocodes from '../../img/WhatCanBeSold/background-promocodes.png'
import BackgroundSounds from '../../img/WhatCanBeSold/background-sounds.png'
import BackgroundVideos from '../../img/WhatCanBeSold/background-videos.png'
import Icon3DModels from '../../img/WhatCanBeSold/icon-3d-models.svg'
import IconArchives from '../../img/WhatCanBeSold/icon-archives.svg'
import IconDocuments from '../../img/WhatCanBeSold/icon-documents.svg'
import IconGraphics from '../../img/WhatCanBeSold/icon-graphics.svg'
import IconMusic from '../../img/WhatCanBeSold/icon-music.svg'
import IconPhotos from '../../img/WhatCanBeSold/icon-photos.svg'
import IconPromocodes from '../../img/WhatCanBeSold/icon-promocodes.svg'
import IconSounds from '../../img/WhatCanBeSold/icon-sounds.svg'
import IconVideos from '../../img/WhatCanBeSold/icon-videos.svg'

export const WhatCanBeSoldData: WhatCanBeSoldItemType[] = [
  {
    title: 'Graphics',
    description: 'Abstract, Backgrounds, Icons, Illustrations, Infographics, Logos, Patterns, Textures, Typography, UI Kits, Vectors, Web Elements',
    background: BackgroundGraphics,
    icon: IconGraphics,
  },
  {
    title: 'Photos',
    description: 'Aerial, Animals, Architecture, Black & White, Cityscapes, Culture, Events, Fashion,  Food, Landscapes, Lifestyle, Macro, Nature,  Night, Portraits, Sports, Stock Photos, Street, Travel, Wedding',
    background: BackgroundPhotos,
    icon: IconPhotos,
  },
  {
    title: 'Videos',
    description: 'Advertisements, Animations, Documentaries, Drone Footage, Interviews, Lessons, Masterclasses, Mentorship, Motion Graphics, Music Videos, Online Events, Online Meetings, Short Films, Stock Footage, Timelapse, Trailers, Tutorials, Video Blogs, Virtual Tours, Webinars, Workshops',
    background: BackgroundVideos,
    icon: IconVideos,
  },
  {
    title: '3D Models',
    description: 'Animals, Architectural, Characters, Clothing, Environments, Furniture, Gadgets, Metaverse Assets, Plants, Props, Robotics, Vehicles, Virtual Wearables, Weapons',
    background: Background3DModels,
    icon: Icon3DModels,
  },
  {
    title: 'Music',
    description: 'Albums, Jingles, Loops, Royalty-Free Music, Singles, Soundtracks',
    background: BackgroundMusic,
    icon: IconMusic,
  },
  {
    title: 'Sounds',
    description: 'Ambience, Foley, Podcasts, Ringtones, Sound Effects, Speech, Voiceovers',
    background: BackgroundSounds,
    icon: IconSounds,
  },
  {
    title: 'Documents',
    description: 'Articles, Business Plans, Checklists, Contacts, eBooks, Guides, Legal Documents, Manuals, Presentations, Reports, Scripts, Templates, Translations, Whitepapers, Worksheets',
    background: BackgroundDocuments,
    icon: IconDocuments,
  },
  {
    title: 'Promocodes',
    description: 'Bundle Offers, Contests, Courses, Discounts, Event Tickets, Giveaways, Gift Cards, Limited Time Access, Memberships, Services, Subscriptions',
    background: BackgroundPromocodes,
    icon: IconPromocodes,
  },
  {
    title: 'Archives',
    description: 'Actions, Add-ons, Bundles, Brushes, Collections, Fonts, Games, Kits, Mockups, Plugins, Presets, Software, Themes',
    background: BackgroundArchives,
    icon: IconArchives,
  },
]
