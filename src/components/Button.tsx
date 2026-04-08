'use client';

import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useThemeMode } from '@/theme-mode-context';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const sizeTokens: Record<ButtonSize, { height: number; px: number; fontSize: string; iconSize: number; gap: number }> = {
  sm: { height: 28, px: 12, fontSize: '0.75rem',   iconSize: 14, gap: 4 },
  md: { height: 34, px: 14, fontSize: '0.8125rem', iconSize: 16, gap: 6 },
  lg: { height: 40, px: 18, fontSize: '0.875rem',  iconSize: 18, gap: 6 },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const { themeColors: c } = useThemeMode();
  const { height, px, fontSize, iconSize, gap } = sizeTokens[size];
  const isDisabled = disabled || loading;

  const styles: Record<ButtonVariant, React.CSSProperties & Record<string, unknown>> = {
    primary: {
      backgroundColor: c.brand,
      color: '#ffffff',
      border: '1px solid transparent',
      '--hover-bg': c.brandLight,
      '--active-bg': `color-mix(in srgb, ${c.brand} 80%, black)`,
    },
    secondary: {
      backgroundColor: c.bgPrimary,
      color: c.textPrimary,
      border: `1px solid ${c.borderPrimary}`,
      '--hover-bg': c.bgPrimaryHover,
      '--active-bg': c.bgSecondaryHover,
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: c.textPrimary,
      border: '1px solid transparent',
      '--hover-bg': c.bgPrimaryHover,
      '--active-bg': c.bgSecondaryHover,
    },
  };

  const variantStyle = styles[variant];

  return (
    <Box
      component="button"
      disabled={isDisabled}
      {...rest}
      sx={{
        // Layout
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${gap}px`,
        width: fullWidth ? '100%' : 'auto',
        height,
        px: `${px}px`,

        // Typography
        fontSize,
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
        lineHeight: 1,
        whiteSpace: 'nowrap',

        // Appearance
        borderRadius: '7px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        userSelect: 'none',
        transition: 'background-color 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease',

        // Variant-specific
        bgcolor: variantStyle.backgroundColor as string,
        color: variantStyle.color as string,
        border: variantStyle.border as string,

        // States
        opacity: isDisabled ? 0.45 : 1,
        '&:hover:not(:disabled)': {
          bgcolor: variantStyle['--hover-bg'] as string,
        },
        '&:active:not(:disabled)': {
          bgcolor: variantStyle['--active-bg'] as string,
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 3px color-mix(in srgb, ${c.brandSecondary} 35%, transparent)`,
        },

        // Icon sizing
        '& .btn-icon': {
          fontSize: iconSize,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          '& .MuiSvgIcon-root': { fontSize: `${iconSize}px !important` },
        },
      }}
    >
      {loading ? (
        <Box className="btn-icon">
          <CircularProgress
            size={iconSize}
            sx={{ color: variantStyle.color as string }}
          />
        </Box>
      ) : startIcon ? (
        <Box className="btn-icon">{startIcon}</Box>
      ) : null}

      {children}

      {!loading && endIcon && (
        <Box className="btn-icon">{endIcon}</Box>
      )}
    </Box>
  );
}
