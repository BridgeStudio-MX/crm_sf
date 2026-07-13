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
      background: themeCssVariables.color.blue1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.blue1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.blue3,
      accent: themeCssVariables.color.blue,
      iconBackground: themeCssVariables.background.transparent.blue,
    },
    green: {
      background: themeCssVariables.color.green1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.green1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.green3,
      accent: themeCssVariables.color.green,
      iconBackground: themeCssVariables.background.transparent.success,
    },
    yellow: {
      background: themeCssVariables.color.yellow1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.yellow1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.yellow3,
      accent: themeCssVariables.color.yellow,
      iconBackground: themeCssVariables.background.transparent.orange,
    },
    red: {
      background: themeCssVariables.color.red1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.red1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.red3,
      accent: themeCssVariables.color.red,
      iconBackground: themeCssVariables.background.transparent.danger,
    },
    purple: {
      background: themeCssVariables.color.purple1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.purple1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.purple3,
      accent: themeCssVariables.color.purple,
      iconBackground: themeCssVariables.background.transparent.blue,
    },
    orange: {
      background: themeCssVariables.color.orange1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.orange1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.orange3,
      accent: themeCssVariables.color.orange,
      iconBackground: themeCssVariables.background.transparent.orange,
    },
    sky: {
      background: themeCssVariables.color.sky1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.sky1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.sky3,
      accent: themeCssVariables.color.sky,
      iconBackground: themeCssVariables.background.transparent.blue,
    },
    turquoise: {
      background: themeCssVariables.color.turquoise1,
      backgroundGradient: `linear-gradient(145deg, ${themeCssVariables.color.turquoise1} 0%, ${themeCssVariables.background.primary} 72%)`,
      border: themeCssVariables.color.turquoise3,
      accent: themeCssVariables.color.turquoise,
      iconBackground: themeCssVariables.background.transparent.blue,
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
