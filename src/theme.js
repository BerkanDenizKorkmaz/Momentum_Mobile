// Central design tokens for MOMENTUM.
// Two palettes (light / dark) plus shared spacing, radii and the routine
// accent colors taken from the paper prototype (orange / green / purple).

export const ROUTINE_COLORS = [
  '#F4622E', // orange
  '#3FA34D', // green
  '#6B4FBB', // purple
  '#2E86DE', // blue
  '#E0457B', // pink
  '#F5A623', // amber
];

const lightColors = {
  mode: 'light',
  primary: '#F4622E',
  primaryDark: '#D74E1F',
  primarySoft: '#FEE9E0',
  flame: '#F4622E',
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F0F0F3',
  text: '#16161A',
  textMuted: '#8A8A8E',
  textFaint: '#B5B5BB',
  border: '#E4E4E9',
  inputBg: '#F2F2F5',
  success: '#3FA34D',
  danger: '#E03B45',
  overlay: 'rgba(0,0,0,0.45)',
  shadow: '#000000',
  white: '#FFFFFF',
};

const darkColors = {
  mode: 'dark',
  primary: '#FF7A45',
  primaryDark: '#F4622E',
  primarySoft: '#3A241C',
  flame: '#FF7A45',
  bg: '#0E0E11',
  surface: '#17171C',
  card: '#1C1C22',
  cardAlt: '#24242B',
  text: '#F4F4F6',
  textMuted: '#9A9AA2',
  textFaint: '#6A6A72',
  border: '#2C2C34',
  inputBg: '#23232A',
  success: '#4CB85C',
  danger: '#FF5A63',
  overlay: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
  white: '#FFFFFF',
};

export const palettes = { light: lightColors, dark: darkColors };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
};

export const font = {
  h1: 30,
  h2: 24,
  h3: 20,
  title: 17,
  body: 15,
  small: 13,
  tiny: 11,
};
