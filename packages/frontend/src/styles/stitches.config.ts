import { createStitches, PropertyValue } from '@stitches/react'

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config
} = createStitches({
  theme: {
    colors: {
      blue300: '#4DB1FF',
      blue500: '#0090FF',
      blue600: '#655BE5', // Color: Slate Blue
      blue700: '#4160ED', // Color: Ultramarine Blue
      blue900: '#13132D', // Color: Space Cadet

      purple: '#AF29FF', // Color: Electric Purple
      magenta: '#E14BEC', // Color: Magenta
      pink: '#F4CFF3', // Color: Pink Lace

      black: '#000000', // Color: Eerie Black
      white: '#ffffff',
      whiteOp50: 'rgba(255, 255, 255, 0.5)',
      whiteOp75: 'rgba(255, 255, 255, 0.75)',
      blue500Op75: 'rgba(0, 144, 255, 0.75)',

      gray100: '#F9F9F9',
      gray200: '#E5E5E5',
      gray300: '#E9E9EA', // raisin + 90%
      gray400: '#A7A8A9', // raisin + 60%
      gray500: '#59596C',
      gray600: '#656669', // raisin + 30%
      gray800: '#232528', // raisin

      green: '#00FF0A',

      red: '#D81B60',

      gradient0: '#38BCC9',
      gradient1: '#088DFA'
    },

    space: {
      1: '4px', // на мобилках
      2: '8px',
      3: '16px', // самый ходовой
      4: '32px',
      5: '40px',
      6: '80px'
    },

    fonts: {
      h: 'Montserrat, sans-serif',
      body: 'Montserrat, sans-serif',
      button: 'Montserrat, sans-serif',
      primary: 'Montserrat, sans-serif',
      secondary: 'Inter, sans-serif'
    },

    // 1rem = 16px
    fontSizes: {
      html: '16px', // defines 1rem

      h1: '3rem', // 48px
      h2: '2.5rem', // 40px
      h3: '2rem', // 32px
      h4: '1.5625rem', // 25px
      h5: '1.25rem', // 20px

      body1: '1.5rem', // 24px
      body2: '1.25rem', // 20px
      body3: '1.125rem', // 18px
      body4: '1rem', // 16px

      button1: '1rem', // 16px

      primary1: '1rem', // 16px
      primary2: '0.875rem', // 14px
      primary3: '0.75rem', // 12px

      secondary1: '1rem', // 16px
      secondary2: '0.875rem', // 14px
      secondary3: '0.75rem' // 12px
    },

    fontWeights: {
      h: 700, // header
      body: 400,
      button: 600,
      primary: 600,
      secondary: 400
    },

    lineHeights: {
      h1: 1.1666,
      h2: 1.26,
      h3: 1.26,
      h4: 1.26,
      h5: 1.2,

      body1: 1.333,
      body2: 1.219, // 20px
      body3: 1.2777, // 18px
      body4: 1.21875, // 16px

      button1: 1.5, // 16px

      primary1: 1.25, // 16px
      primary2: 1.4285714, // 14px
      primary3: 1.333, // 12px

      secondary1: 1.21, // 16px
      secondary2: 1.2857143, // 14px
      secondary3: 1.333333 // 12px
    },

    radii: {
      1: '8px',
      2: '12px',
      3: '16px',
      4: '32px',
      6: '80px'
    },

    shadows: {
      // names of shadows are from the figma
      form: '0px 0px 15px rgba(19, 19, 45, 0.05)',
      hover: '0px 2px 15px rgba(19, 19, 45, 0.2)',
      header: '0px 4px 15px rgba(19, 19, 45, 0.05)',
      footer: '0px -4px 15px rgba(19, 19, 45, 0.05)',
      low: '0px 4px 15px rgba(19, 19, 45, 0.1)'
    },

    breakpoints: {
      sm: '600px',
      mdx: '700px',
      md: '900px',
      lg: '1200px',
      xl: '1536px'
    },

    gradients: {
      main: 'linear-gradient(90deg, $colors$gradient0 0%, $colors$gradient1 100%)',
      background: 'linear-gradient(291.31deg, #0291FC 0%, #4AC6D1 100%)'
    },

    layout: {
      navBarHeight: '80px',
      bannerHeight: '36px'
    }
  },

  media: {
    sm: '(max-width: 600px)',
    mdx: '(max-width: 700px)',
    md: '(max-width: 900px)',
    lg: '(max-width: 1200px)',
    xl: '(max-width: 1536px)',

    smUp: '(min-width: 600px)',
    mdxUp: '(min-width: 700px)',
    mdUp: '(min-width: 900px)',
    lgUp: '(min-width: 1200px)',
    xlUp: '(min-width: 1536px)'
  },

  utils: {
    focusRing: (color: string) => ({
      outline: `2px solid ${color}`,
      outlineOffset: '2px'
    }),
    paddingLR: (padding: PropertyValue<'paddingLeft'>) => ({
      paddingLeft: padding,
      paddingRight: padding
    }),
    paddingTB: (padding: PropertyValue<'paddingTop'>) => ({
      paddingTop: padding,
      paddingBottom: padding
    }),
    dflex: (value: PropertyValue<'alignItems'>) => ({
      display: 'flex',
      alignItems: value,
      justifyContent: value
    }),
    size: (value: PropertyValue<'width'>) => ({
      width: value,
      height: value
    })
  }
})
