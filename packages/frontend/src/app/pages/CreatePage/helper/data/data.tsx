import { type ComboBoxOption } from '../../../../UIkit/Form/Combobox'

export type category = 'Graphics' | 'Photos' | 'Videos' | '3D models' | 'Music' | 'Sounds' | 'Docs' | 'Promocodes' | 'Archives'
export type license = 'CC0 “No Rights Reserved”' | 'CC BY “Attribution”' | 'CC BY-ND “Attribution-NoDerivs”' | 'CC BY-SA “Attribution-ShareAlike”' | 'CC BY-NC “Attribution-NonCommercial”' | 'CC BY-NC-SA “Attribution-NonCommercial-ShareAlike”' | 'CC BY-NC-ND “Attribution-NonCommercial-NoDerivs”'
export interface licenseInfoType {
  description: string
  src: string
}
export const categoryOptions: ComboBoxOption[] = [
  {
    title: 'Graphics',
    id: '0',
  },
  {
    title: 'Photos',
    id: '1',
  },
  {
    title: 'Videos',
    id: '2',
  },
  {
    title: '3D models',
    id: '3',
  },
  {
    title: 'Music',
    id: '4',
  },
  {
    title: 'Sounds',
    id: '5',
  },
  {
    title: 'Docs',
    id: '6',
  },
  {
    title: 'Promocodes',
    id: '7',
  },
  {
    title: 'Archives',
    id: '8',
  },
]
export const subcategory: Record<category, ComboBoxOption[]> = {
  Graphics: [
    {
      title: 'Abstract',
      id: '0',
    },
    {
      title: 'Backgrounds',
      id: '1',
    },
    {
      title: 'Icons',
      id: '2',
    },
    {
      title: 'Illustrations',
      id: '3',
    },
    {
      title: 'Infographics',
      id: '4',
    },
    {
      title: 'Logos',
      id: '5',
    },
    {
      title: 'Patterns',
      id: '6',
    },
    {
      title: 'Textures',
      id: '7',
    },
    {
      title: 'Typography',
      id: '8',
    },
    {
      title: 'UI Kits',
      id: '9',
    },
    {
      title: 'Vectors',
      id: '10',
    },
    {
      title: 'Web Elements',
      id: '11',
    },
  ],
  Photos: [{
    title: 'Aerial',
    id: '0',
  },
  {
    title: 'Animals',
    id: '1',
  },
  {
    title: 'Architecture',
    id: '2',
  },
  {
    title: 'Black & White',
    id: '3',
  },
  {
    title: 'Cityscapes',
    id: '4',
  },
  {
    title: 'Culture',
    id: '5',
  },
  {
    title: 'Events',
    id: '6',
  },
  {
    title: 'Fashion',
    id: '7',
  },
  {
    title: 'Food',
    id: '8',
  },
  {
    title: 'Landscapes',
    id: '9',
  },
  {
    title: 'Lifestyle',
    id: '10',
  },
  {
    title: 'Macro',
    id: '11',
  },
  {
    title: 'Nature',
    id: '12',
  },
  {
    title: 'Night',
    id: '13',
  },
  {
    title: 'Portraits',
    id: '14',
  },
  {
    title: 'Sports',
    id: '15',
  },
  {
    title: 'Stock Photos',
    id: '16',
  },
  {
    title: 'Street',
    id: '17',
  },
  {
    title: 'Travel',
    id: '18',
  },
  {
    title: 'Wedding',
    id: '19',
  }],
  Videos: [{
    title: 'Films',
    id: '0',
  },
  {
    title: 'Advertisements',
    id: '1',
  },
  {
    title: 'Animations',
    id: '2',
  },
  {
    title: 'Documentaries',
    id: '3',
  },
  {
    title: 'Drone Footage',
    id: '4',
  },
  {
    title: 'Interviews',
    id: '5',
  },
  {
    title: 'Lessons',
    id: '6',
  },
  {
    title: 'Masterclasses',
    id: '7',
  },
  {
    title: 'Mentorship',
    id: '8',
  },
  {
    title: 'Motion Graphics',
    id: '9',
  },
  {
    title: 'Music Videos',
    id: '10',
  },
  {
    title: 'Online Events',
    id: '11',
  },
  {
    title: 'Online Meetings',
    id: '12',
  },
  {
    title: 'Short Films',
    id: '13',
  },
  {
    title: 'Stock Footage',
    id: '14',
  },
  {
    title: 'Timelapse',
    id: '15',
  },
  {
    title: 'Trailers',
    id: '16',
  },
  {
    title: 'Tutorials',
    id: '17',
  },
  {
    title: 'Video Blogs',
    id: '18',
  },
  {
    title: 'Virtual Tours',
    id: '19',
  },
  {
    title: 'Webinars',
    id: '20',
  },
  {
    title: 'Workshops',
    id: '21',
  }],
  '3D models': [{
    title: 'Animals',
    id: '0',
  },
  {
    title: 'Architectural',
    id: '1',
  },
  {
    title: 'Characters',
    id: '2',
  },
  {
    title: 'Clothing',
    id: '3',
  },
  {
    title: 'Environments',
    id: '4',
  },
  {
    title: 'Furniture',
    id: '5',
  },
  {
    title: 'Gadgets',
    id: '6',
  },
  {
    title: 'Metaverse Assets',
    id: '7',
  },
  {
    title: 'Plants',
    id: '8',
  },
  {
    title: 'Props',
    id: '9',
  },
  {
    title: 'Robotics',
    id: '10',
  },
  {
    title: 'Vehicles',
    id: '11',
  },
  {
    title: 'Virtual Wearables',
    id: '12',
  },
  {
    title: 'Weapons',
    id: '13',
  }],
  Music: [{
    title: 'Albums',
    id: '0',
  },
  {
    title: 'Jingles',
    id: '1',
  },
  {
    title: 'Loops',
    id: '2',
  },
  {
    title: 'Royalty-Free Music',
    id: '3',
  },
  {
    title: 'Singles',
    id: '4',
  },
  {
    title: 'Soundtracks',
    id: '5',
  }],
  Sounds: [{
    title: 'Ambience',
    id: '0',
  },
  {
    title: 'Foley',
    id: '1',
  },
  {
    title: 'Podcasts',
    id: '2',
  },
  {
    title: 'Ringtones',
    id: '3',
  },
  {
    title: 'Sound Effects',
    id: '4',
  },
  {
    title: 'Speech',
    id: '5',
  },
  {
    title: 'Voiceovers',
    id: '6',
  }],
  Docs: [{
    title: 'Articles',
    id: '0',
  },
  {
    title: 'Business Plans',
    id: '1',
  },
  {
    title: 'Checklists',
    id: '2',
  },
  {
    title: 'Contacts',
    id: '3',
  },
  {
    title: 'eBooks',
    id: '4',
  },
  {
    title: 'Guides',
    id: '5',
  },
  {
    title: 'Legal Documents',
    id: '6',
  },
  {
    title: 'Manuals',
    id: '7',
  },
  {
    title: 'Presentations',
    id: '8',
  },
  {
    title: 'Reports',
    id: '9',
  },
  {
    title: 'Scripts',
    id: '10',
  },
  {
    title: 'Templates',
    id: '11',
  },
  {
    title: 'Translations',
    id: '12',
  },
  {
    title: 'Whitepapers',
    id: '13',
  },
  {
    title: 'Worksheets',
    id: '14',
  },
  ],
  Promocodes: [
    {
      title: 'Bundle Offers',
      id: '0',
    },
    {
      title: 'Contests',
      id: '1',
    },
    {
      title: 'Courses',
      id: '2',
    },
    {
      title: 'Discounts',
      id: '3',
    },
    {
      title: 'Event Tickets',
      id: '4',
    },
    {
      title: 'Giveaways',
      id: '5',
    },
    {
      title: 'Gift Cards',
      id: '6',
    },
    {
      title: 'Limited Time Access',
      id: '7',
    },
    {
      title: 'Memberships',
      id: '8',
    },
    {
      title: 'Services',
      id: '9',
    },
    {
      title: 'Subscriptions',
      id: '10',
    },
  ],
  Archives: [{
    title: 'Actions',
    id: '0',
  },
  {
    title: 'Add-ons',
    id: '1',
  },
  {
    title: 'Bundles',
    id: '2',
  },
  {
    title: 'Brushes',
    id: '3',
  },
  {
    title: 'Collections',
    id: '4',
  },
  {
    title: 'Fonts',
    id: '5',
  },
  {
    title: 'Games',
    id: '6',
  },
  {
    title: 'Kits',
    id: '7',
  },
  {
    title: 'Mockups',
    id: '8',
  },
  {
    title: 'Plugins',
    id: '9',
  },
  {
    title: 'Presets',
    id: '10',
  },
  {
    title: 'Software',
    id: '11',
  },
  {
    title: 'Themes',
    id: '12',
  },
  ],
}

export const licenseOptions: ComboBoxOption[] = [
  {
    title: 'CC0 “No Rights Reserved”',
    id: '0',
  },
  {
    title: 'CC BY “Attribution”',
    id: '1',
  },
  {
    title: 'CC BY-ND “Attribution-NoDerivs”',
    id: '2',
  },
  {
    title: 'CC BY-SA “Attribution-ShareAlike”',
    id: '3',
  },
  {
    title: 'CC BY-NC “Attribution-NonCommercial”',
    id: '4',
  },
  {
    title: 'CC BY-NC-SA “Attribution-NonCommercial-ShareAlike”',
    id: '5',
  },

  {
    title: 'CC BY-NC-ND “Attribution-NonCommercial-NoDerivs”',
    id: '6',
  },
]

export const licenseInfo: Record<license, licenseInfoType> = {
  'CC0 “No Rights Reserved”': {
    description: 'СС0 (aka CC Zero) is a public dedication tool, which allows creators to give up their copyright and put their works into the worldwide public domain. CC0 allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, with no conditions.',
    src: 'https://creativecommons.org/licenses/',
  },
  'CC BY “Attribution”': {
    description: 'This license lets others distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.',
    src: 'https://creativecommons.org/licenses/',
  },
  'CC BY-ND “Attribution-NoDerivs”': {
    description: 'This license lets others reuse the work for any purpose, including commercially; however, it cannot be shared with others in adapted form, and credit must be provided to you.',
    src: 'https://creativecommons.org/licenses/',
  },
  'CC BY-SA “Attribution-ShareAlike”': {
    description: 'This license lets others remix, adapt, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms.',
    src: 'https://creativecommons.org/licenses/',
  },
  'CC BY-NC “Attribution-NonCommercial”': {
    description: 'This license lets others remix, adapt, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don’t have to license their derivative works on the same terms.',
    src: 'https://creativecommons.org/licenses/',
  },
  'CC BY-NC-SA “Attribution-NonCommercial-ShareAlike”': {
    description: 'This license lets others remix, adapt, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms.',
    src: 'https://creativecommons.org/licenses/',
  },
  'CC BY-NC-ND “Attribution-NonCommercial-NoDerivs”': {
    description: 'This license allows reusers to copy and distribute the material in any medium or format in unadapted form only, and only so long as attribution is given to the creator. The license allows for commercial use.',
    src: 'https://creativecommons.org/licenses/',
  },
}

export const tags: ComboBoxOption[] = [
  {
    title: 'beginnerfriendly',
    id: '0',
  },
  {
    title: 'bestseller',
    id: '1',
  },
  {
    title: 'crossplatform',
    id: '2',
  },
  {
    title: 'customizable',
    id: '3',
  },
  {
    title: 'easytouse',
    id: '4',
  },
  {
    title: 'exclusivecontent',
    id: '5',
  },
  {
    title: 'handcrafted',
    id: '6',
  },
  {
    title: 'highquality',
    id: '7',
  },
  {
    title: 'innovative',
    id: '8',
  },
  {
    title: 'inspiration',
    id: '9',
  },
  {
    title: 'nonexclusivecontent',
    id: '10',
  },
  {
    title: 'nonoriginalcontent',
    id: '11',
  },
  {
    title: 'originalcontent',
    id: '12',
  },
  {
    title: 'premiumcontent',
    id: '13',
  },
  {
    title: 'professional',
    id: '14',
  },
  {
    title: 'royaltyfree',
    id: '15',
  },
  {
    title: 'seasonal',
    id: '16',
  },
  {
    title: 'stock',
    id: '17',
  },
  {
    title: 'trending',
    id: '18',
  },
  {
    title: 'english',
    id: '19',
  },
  {
    title: 'french',
    id: '20',
  },
  {
    title: 'german',
    id: '21',
  },
  {
    title: 'italian',
    id: '22',
  },
  {
    title: 'mandarin',
    id: '23',
  },
  {
    title: 'portuguese',
    id: '24',
  },
  {
    title: 'russian',
    id: '25',
  },
  {
    title: 'spanish',
    id: '26',
  },
  {
    title: 'arabic',
    id: '27',
  },
  {
    title: 'japanese',
    id: '28',
  },
  {
    title: 'korean',
    id: '29',
  },
  {
    title: 'hindi',
    id: '30',
  },
  {
    title: 'bengali',
    id: '31',
  },
  {
    title: 'indonesian',
    id: '32',
  },
  {
    title: 'turkish',
    id: '33',
  },
  {
    title: 'swahili',
    id: '34',
  },
  {
    title: 'dutch',
    id: '35',
  },
  {
    title: 'polish',
    id: '36',
  },
]
