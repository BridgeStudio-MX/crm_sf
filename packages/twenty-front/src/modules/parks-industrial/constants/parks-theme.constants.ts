import { themeCssVariables } from 'twenty-ui/theme-constants';

export const PARKS_BRAND = {
  primary: '#006837',
  accent: '#8DC63F',
  text: '#333333',
  primarySoft: 'rgba(0, 104, 55, 0.12)',
  accentSoft: 'rgba(141, 198, 63, 0.14)',
  borderSoft: 'rgba(0, 104, 55, 0.22)',
} as const;

// Monday.com Vibe-inspired surface language (radius/shadow/spacing)
// Brand stays Parks green — no Monday purple. See https://vibe.monday.com/
export const PARKS_VIBE = {
  fontFamily: "'Kumbh Sans', Inter, sans-serif",
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  radiusPill: '999px',
  shadowSoft: '0 4px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  shadowCard:
    '0 6px 16px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
  shadowHover:
    '0 10px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)',
  surface: '#ffffff',
  surfaceMuted: '#f6f7fb',
  border: 'rgba(50, 51, 56, 0.12)',
  borderStrong: 'rgba(50, 51, 56, 0.18)',
  textPrimary: '#323338',
  textSecondary: '#676879',
  textMuted: '#9699a6',
  chipRadius: '4px',
  accentBarHeight: '4px',
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
} as const;

// Shared visual tokens for command-center heroes across CEO, comercial, legal, CxC, etc.
// Light board header (Vibe) with Parks green accents — demo-ready for Parks owner.
export const PARKS_COMMAND_CENTER = {
  background: `linear-gradient(160deg, #ffffff 0%, ${PARKS_VIBE.surfaceMuted} 55%, #eef6ea 100%)`,
  boxShadow: PARKS_VIBE.shadowCard,
  glowOrb:
    'radial-gradient(circle, rgba(0, 104, 55, 0.14) 0%, transparent 68%)',
  text: PARKS_VIBE.textPrimary,
  textMuted: PARKS_VIBE.textMuted,
  textSecondary: PARKS_VIBE.textSecondary,
  panelBackground: 'rgba(255, 255, 255, 0.78)',
  panelBorder: PARKS_VIBE.border,
  actionBackground: PARKS_BRAND.primarySoft,
  actionBorder: PARKS_BRAND.borderSoft,
  actionHoverBackground: 'rgba(0, 104, 55, 0.18)',
  actionText: PARKS_BRAND.primary,
  statHint: PARKS_BRAND.primary,
  accentBar: PARKS_BRAND.primary,
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
    linear-gradient(180deg, ${PARKS_VIBE.surfaceMuted} 0%, ${themeCssVariables.background.primary} 38%),
    radial-gradient(circle at 0% 0%, rgba(0, 104, 55, 0.06) 0%, transparent 42%),
    radial-gradient(circle at 100% 0%, rgba(141, 198, 63, 0.05) 0%, transparent 38%)
  `,
  accents: {
    blue: {
      background: themeCssVariables.color.blue2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.blue1} 100%)`,
      border: themeCssVariables.color.blue4,
      accent: themeCssVariables.color.blue11,
      iconBackground: themeCssVariables.color.blue3,
    },
    green: {
      background: themeCssVariables.color.green2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.green1} 100%)`,
      border: themeCssVariables.color.green4,
      accent: themeCssVariables.color.green11,
      iconBackground: themeCssVariables.color.green3,
    },
    yellow: {
      background: themeCssVariables.color.yellow2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.yellow1} 100%)`,
      border: themeCssVariables.color.yellow4,
      accent: themeCssVariables.color.yellow11,
      iconBackground: themeCssVariables.color.yellow3,
    },
    red: {
      background: themeCssVariables.color.red2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.red1} 100%)`,
      border: themeCssVariables.color.red4,
      accent: themeCssVariables.color.red11,
      iconBackground: themeCssVariables.color.red3,
    },
    purple: {
      background: themeCssVariables.color.purple2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.purple1} 100%)`,
      border: themeCssVariables.color.purple4,
      accent: themeCssVariables.color.purple11,
      iconBackground: themeCssVariables.color.purple3,
    },
    orange: {
      background: themeCssVariables.color.orange2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.orange1} 100%)`,
      border: themeCssVariables.color.orange4,
      accent: themeCssVariables.color.orange11,
      iconBackground: themeCssVariables.color.orange3,
    },
    sky: {
      background: themeCssVariables.color.sky2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.sky1} 100%)`,
      border: themeCssVariables.color.sky4,
      accent: themeCssVariables.color.sky11,
      iconBackground: themeCssVariables.color.sky3,
    },
    turquoise: {
      background: themeCssVariables.color.turquoise2,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${themeCssVariables.color.turquoise1} 100%)`,
      border: themeCssVariables.color.turquoise4,
      accent: themeCssVariables.color.turquoise11,
      iconBackground: themeCssVariables.color.turquoise3,
    },
    gray: {
      background: PARKS_VIBE.surfaceMuted,
      backgroundGradient: `linear-gradient(180deg, ${PARKS_VIBE.surface} 0%, ${PARKS_VIBE.surfaceMuted} 100%)`,
      border: PARKS_VIBE.border,
      accent: PARKS_VIBE.textSecondary,
      iconBackground: 'rgba(50, 51, 56, 0.06)',
    },
  } satisfies Record<ParksVisualAccent, ParksVisualAccentTokens>,
} as const;
