import { themeCssVariables } from 'twenty-ui/theme-constants';

export const PARKS_BRAND = {
  primary: '#006837',
  accent: '#8DC63F',
  text: '#333333',
  primarySoft: 'rgba(0, 104, 55, 0.12)',
  accentSoft: 'rgba(141, 198, 63, 0.14)',
  borderSoft: 'rgba(0, 104, 55, 0.22)',
} as const;

export type ParksVisualAccent =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'purple'
  | 'orange'
  | 'sky'
  | 'turquoise'
  | 'gray';

type ParksVisualAccentTokens = {
  background: string;
  backgroundGradient: string;
  border: string;
  accent: string;
  iconBackground: string;
};

export const PARKS_VISUAL_THEME = {
  pageBackgroundGradient: `
    radial-gradient(circle at 0% 0%, rgba(0, 104, 55, 0.08) 0%, transparent 42%),
    radial-gradient(circle at 100% 0%, rgba(141, 198, 63, 0.06) 0%, transparent 38%),
    radial-gradient(circle at 50% 100%, ${themeCssVariables.color.green1} 0%, transparent 34%),
    ${themeCssVariables.background.primary}
  `,
  accents: {
    blue: {
      background: themeCssVariables.color.blue2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.blue2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.blue6,
      accent: themeCssVariables.color.blue11,
      iconBackground: themeCssVariables.color.blue3,
    },
    green: {
      background: themeCssVariables.color.green2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.green2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.green6,
      accent: themeCssVariables.color.green11,
      iconBackground: themeCssVariables.color.green3,
    },
    yellow: {
      background: themeCssVariables.color.yellow2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.yellow2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.yellow6,
      accent: themeCssVariables.color.yellow11,
      iconBackground: themeCssVariables.color.yellow3,
    },
    red: {
      background: themeCssVariables.color.red2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.red2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.red6,
      accent: themeCssVariables.color.red11,
      iconBackground: themeCssVariables.color.red3,
    },
    purple: {
      background: themeCssVariables.color.purple2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.purple2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.purple6,
      accent: themeCssVariables.color.purple11,
      iconBackground: themeCssVariables.color.purple3,
    },
    orange: {
      background: themeCssVariables.color.orange2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.orange2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.orange6,
      accent: themeCssVariables.color.orange11,
      iconBackground: themeCssVariables.color.orange3,
    },
    sky: {
      background: themeCssVariables.color.sky2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.sky2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.sky6,
      accent: themeCssVariables.color.sky11,
      iconBackground: themeCssVariables.color.sky3,
    },
    turquoise: {
      background: themeCssVariables.color.turquoise2,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.turquoise2} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.turquoise6,
      accent: themeCssVariables.color.turquoise11,
      iconBackground: themeCssVariables.color.turquoise3,
    },
    gray: {
      background: themeCssVariables.background.secondary,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.background.secondary} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.border.color.medium,
      accent: themeCssVariables.font.color.secondary,
      iconBackground: themeCssVariables.background.transparent.medium,
    },
  } satisfies Record<ParksVisualAccent, ParksVisualAccentTokens>,
} as const;
