// Light mode colors
const lightColors = {
  // Brand
  brand: '#0F1E5A',
  brandSecondary: '#2598D5',
  brandRed: '#CC0000',
  brandGreen: '#8DBE23',

  // Brand shades
  brandLight: '#3D4D7D',
  brandLighter: '#E8EAF0',
  secondaryLight: '#5FB5E1',
  secondaryLighter: '#C0E3F5',

  // Text
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9e9e9e',
  textDisabled: '#bdbdbd',
  textBrand: '#0F1E5A',

  // Backgrounds
  bgPrimary: '#ffffff',
  bgPrimaryHover: '#f5f5f5',
  bgSecondary: '#fafafa',
  bgSecondaryHover: '#f0f0f0',
  bgActive: '#E6F4FB',
  bgActiveHover: '#C0E3F5',
  bgBrand: '#0F1E5A',

  // Borders
  borderPrimary: '#bdbdbd',
  borderSecondary: '#e0e0e0',
  borderTertiary: '#f0f0f0',
  borderActive: '#2598D5',

  // Semantic status
  statusGood: '#4caf50',
  statusModerate: '#ff9800',
  statusPoor: '#f44336',
  statusOffline: '#9e9e9e',

  // Chart
  chartAxisText: '#888888',
  chartGridLine: '#e8e8e8',
  chartPointBorder: '#ffffff',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  cardShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',

  // Card
  cardBorder: 'transparent',
} as const;

// Dark mode colors
const darkColors: { [K in keyof typeof lightColors]: string } = {
  // Brand — lightened for dark bg readability & WCAG AA contrast
  brand: '#7B9CFF',
  brandSecondary: '#5FC8F7',
  brandRed: '#FF6B6B',
  brandGreen: '#B8E85A',

  // Brand shades
  brandLight: '#96A8D4',
  brandLighter: '#2A2E3D',
  secondaryLight: '#7CC8EB',
  secondaryLighter: '#1A3A4D',

  // Text
  textPrimary: '#ECECEC',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textDisabled: '#5A5A5A',
  textBrand: '#8AACFF',

  // Backgrounds
  bgPrimary: '#121212',
  bgPrimaryHover: '#1E1E1E',
  bgSecondary: '#181818',
  bgSecondaryHover: '#252525',
  bgActive: '#1A2D3D',
  bgActiveHover: '#1E3A4F',
  bgBrand: '#0F1E5A',

  // Borders
  borderPrimary: '#444444',
  borderSecondary: '#333333',
  borderTertiary: '#252525',
  borderActive: '#3DB8F5',

  // Semantic status
  statusGood: '#66bb6a',
  statusModerate: '#ffa726',
  statusPoor: '#ef5350',
  statusOffline: '#757575',

  // Chart
  chartAxisText: '#888888',
  chartGridLine: '#333333',
  chartPointBorder: '#121212',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  cardShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.3)',

  // Card
  cardBorder: '#333333',
};

// Type uses string so dark colors with different hex values are assignable
export type ColorTokens = { [K in keyof typeof lightColors]: string };

// Backward-compatible default export (light)
export const colors: ColorTokens = lightColors;

export function getColors(mode: 'light' | 'dark'): ColorTokens {
  return mode === 'dark' ? darkColors : lightColors;
}

// Alpha helpers for rgba usage
export const brandAlpha = (a: number) => `rgba(15, 30, 90, ${a})`;
export const secondaryAlpha = (a: number) => `rgba(37, 152, 213, ${a})`;
