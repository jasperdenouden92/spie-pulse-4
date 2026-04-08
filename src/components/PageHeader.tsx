'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TopBar, { type TopBarProps } from '@/components/TopBar';
import { useThemeMode } from '@/theme-mode-context';

interface TabItem {
  value: string;
  label: string;
}

interface PageHeaderProps {
  variant?: 'default' | 'hero';

  /** When provided, renders the TopBar with these props (default variant only). */
  topBar?: TopBarProps;

  // Default variant
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;

  // Hero variant
  image?: string;
  subtitle?: string;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Breadcrumb content rendered in the hero top bar overlay. */
  breadcrumb?: React.ReactNode;
  /** Actions rendered on the right of the hero top bar overlay (e.g. star icon). */
  heroActions?: React.ReactNode;
}

function DefaultHeader({ topBar, title, children, actions, c }: {
  topBar?: TopBarProps;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  c: ReturnType<typeof useThemeMode>['themeColors'];
}) {
  return (
    <>
      {topBar && <TopBar {...topBar} />}
      {title && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
            {title}
          </Typography>
        </Box>
      )}
      {(children || actions) && (
        <Box
          sx={{
            position: 'sticky',
            top: 56,
            zIndex: 100,
            bgcolor: c.bgSecondary,
            py: 1.25,
            mx: -3,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {children && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
              {children}
            </Box>
          )}
          {actions && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              {actions}
            </Box>
          )}
        </Box>
      )}
    </>
  );
}

function HeroHeader({
  image,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  breadcrumb,
  heroActions,
}: PageHeaderProps) {
  const isNarrow = useMediaQuery('(max-width:960px)');

  return (
    <Box
      sx={{
        mx: isNarrow ? -0.5 : -3,
        width: isNarrow ? 'calc(100% + 8px)' : 'calc(100% + 48px)',
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', height: 240 }}>
        {/* Image or fallback */}
        {image ? (
          <Box
            component="img"
            src={image}
            alt={title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'grey.800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ApartmentOutlinedIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }} />
          </Box>
        )}

        {/* Dark gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.65) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top bar overlay: collapse toggle + breadcrumb + actions */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            px: isNarrow ? 1 : 1.5,
            gap: 0.5,
            zIndex: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={onToggleCollapse}
            sx={{
              color: 'rgba(255,255,255,0.85)',
              flexShrink: 0,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
            }}
          >
            <MenuIcon sx={{ display: 'none', fontSize: 20, '@media (max-width: 926px)': { display: 'block' } }} />
            <MenuOpenIcon
              sx={{
                display: 'block',
                fontSize: 20,
                '@media (max-width: 926px)': { display: 'none' },
                transform: isCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease',
              }}
            />
          </IconButton>

          {!isNarrow && breadcrumb && (
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              {breadcrumb}
            </Box>
          )}
          {isNarrow && <Box sx={{ flex: 1 }} />}

          {heroActions && (
            <Box sx={{ flexShrink: 0 }}>
              {heroActions}
            </Box>
          )}
        </Box>

        {/* Title + subtitle */}
        {(title || subtitle) && (
          <Box
            sx={{
              position: 'absolute',
              bottom: tabs && tabs.length > 0 ? 52 : 16,
              left: isNarrow ? 16 : 20,
              right: isNarrow ? 16 : 20,
              zIndex: 2,
            }}
          >
            {title && (
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: isNarrow ? '1.1rem' : '1.375rem',
                  fontFamily: '"Inter", sans-serif',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  mb: subtitle ? 0.5 : 0,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />
                <Typography
                  noWrap
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.8125rem',
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                    lineHeight: 1.4,
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              px: isNarrow ? 0.5 : 1,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => onTabChange?.(v)}
              variant={isNarrow ? 'scrollable' : 'standard'}
              scrollButtons={false}
              TabIndicatorProps={{ style: { backgroundColor: '#fff', height: 2 } }}
              sx={{
                minHeight: 44,
                '& .MuiTabs-flexContainer': { gap: 0 },
                '& .MuiTab-root': {
                  minHeight: 44,
                  minWidth: 'unset',
                  py: 0,
                  px: isNarrow ? 1.5 : 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.65)',
                  letterSpacing: 0,
                  transition: 'color 0.15s',
                  '&:hover': { color: 'rgba(255,255,255,0.9)' },
                  '&.Mui-selected': { color: '#fff', fontWeight: 600 },
                },
              }}
            >
              {tabs.map(t => (
                <Tab key={t.value} value={t.value} label={t.label} />
              ))}
            </Tabs>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function PageHeader(props: PageHeaderProps) {
  const { themeColors: c } = useThemeMode();
  const { variant = 'default' } = props;

  if (variant === 'hero') {
    return <HeroHeader {...props} />;
  }

  return <DefaultHeader {...props} c={c} />;
}

export default PageHeader;
