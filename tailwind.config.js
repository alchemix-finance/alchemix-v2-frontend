module.exports = {
  theme: {
    'flex-basis': (theme) => ({
      1: '100%',
      2: '50%',
      3: '33.333333%',
      4: '25%',
      5: '20%',
      6: '16.666666%',
      7: '14.285714%',
      0: '12.5%',
      'w-384': '384px',
      'w-336': '336px',
      'w-288': '288px',
      'w-240': '240px',
      'w-192': '192px',
      'w-144': '144px',
      'w-96': '96px',
      'w-48': '48px',
    }),
    flexGrow: {
      DEFAULT: 1,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
    },
    colors: {
      black1: '#0E251D',
      black2: '#10141A',
      bronze1: '#F5C59F',
      bronze2: '#F7C19B',
      bronze3: '#ad937c',
      bronze4: '#353130',
      blue1: '#0E8AD0',
      blue2: '#0557e8',
      blue3: '#6C93C7',
      blue4: '#0E8AD0',
      blue5: '#0557E8',
      green1: '#2ecc94',
      green2: '#3EB88E',
      green3: '#01FFD4',
      green4: '#42B792',
      green5: '#75FFD3',
      green6: '#01FFD4',
      darkgreen1: '#1C2E31',
      darkgreen2: '#2B4246',
      darkgrey1: '#908486',
      grey1: '#282D3A',
      grey2: '#b2b4b6',
      grey3: '#232833',
      grey5: '#20242C',
      grey10: '#171B24',
      grey15: '#10151B',
      grey18: '#11161C',
      grey20: '#10141A',
      grey30: '#0E1116',
      lightgrey1: '#b7b7b7',
      lightgrey5: '#b0b0b0',
      lightgrey10: '#979BA2',
      lightgrey20: '#4d5466',
      red1: '#fc4544',
      red2: '#220908',
      red3: '#DC1D1D',
      red4: '#471311',
      orange1: '#ec8339',
      orange2: '#FE6A02',
      orange3: '#F4C19D',
      orange4: '#F5C09A',
      white2: '#f5f5f5',
      twitter: '#4CABFA',
      discord: '#7289DA',
    },
    fontFamily: {
      alcxLogo: ['Reem Kufi', 'sans-serif'],
      alcxTitles: ['neue-kabel', 'Josefin Sans', 'sans-serif'],
      alcxFlow: ['Montserrat', 'sans-serif'],
    },
  },
  variants: {
    'flex-basis': ['responsive'],
    extend: {
      cursor: ['hover'],
      opacity: ['disabled'],
      block: ['group-hover'],
    },
  },
  plugins: [require('@tkh/tailwind-plugin-flex-basis')()],
};
