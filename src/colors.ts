// Brand colors
export const colors = {
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
} as const;

// Alpha helpers for rgba usage
export const brandAlpha = (a: number) => `rgba(15, 30, 90, ${a})`;
export const secondaryAlpha = (a: number) => `rgba(37, 152, 213, ${a})`;
