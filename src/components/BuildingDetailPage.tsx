'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useMediaQuery from '@mui/material/useMediaQuery';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import type { Building } from '@/data/buildings';

export type BuildingDetailTab = 'overview' | 'performance' | 'assets' | 'tickets' | 'quotations';

const TABS: { value: BuildingDetailTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'performance', label: 'Performance' },
  { value: 'assets', label: 'Assets' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'quotations', label: 'Quotations' },
];

interface BuildingDetailPageProps {
  building: Building;
  tab: BuildingDetailTab;
  onTabChange: (tab: BuildingDetailTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBreadcrumbBack?: () => void;
}

export default function BuildingDetailPage({
  building,
  tab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  onBreadcrumbBack,
}: BuildingDetailPageProps) {
  const isNarrow = useMediaQuery('(max-width:960px)');

  return (
    <Box
      sx={{
        // Bleed past the Container's horizontal padding to reach full content-area width
        mx: isNarrow ? -0.5 : -3,
        width: isNarrow ? 'calc(100% + 8px)' : 'calc(100% + 48px)',
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', height: 240 }}>
        {building.image ? (
          <Box
            component="img"
            src={building.image}
            alt={building.name}
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

        {/* ── Top bar: collapse toggle + breadcrumb + star ── */}
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
          {/* Sidebar collapse / expand */}
          <IconButton
            size="small"
            onClick={onToggleCollapse}
            sx={{
              color: 'rgba(255,255,255,0.85)',
              flexShrink: 0,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
            }}
          >
            <MenuIcon
              sx={{
                display: 'none',
                fontSize: 20,
                '@media (max-width: 926px)': { display: 'block' },
              }}
            />
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

          {/* Breadcrumb */}
          {!isNarrow && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  fontFamily: '"Inter", sans-serif',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: '#fff' },
                }}
                onClick={onBreadcrumbBack}
              >
                Portfolio
              </Typography>
              <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  fontFamily: '"Inter", sans-serif',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: '#fff' },
                }}
                onClick={onBreadcrumbBack}
              >
                Buildings
              </Typography>
              <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <Typography
                noWrap
                sx={{
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {building.name}
              </Typography>
            </Box>
          )}

          {/* Spacer when narrow (no breadcrumb) */}
          {isNarrow && <Box sx={{ flex: 1 }} />}

          {/* Favorite star */}
          <IconButton
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              flexShrink: 0,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
            }}
          >
            <StarOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Building name + address ── */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 52,
            left: isNarrow ? 16 : 20,
            right: isNarrow ? 16 : 20,
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: isNarrow ? '1.1rem' : '1.375rem',
              fontFamily: '"Inter", sans-serif',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              mb: 0.5,
              lineHeight: 1.2,
            }}
          >
            {building.name}
          </Typography>
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
              {building.address}
            </Typography>
          </Box>
        </Box>

        {/* ── Underline tabs at the bottom ── */}
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
            value={tab}
            onChange={(_, v) => onTabChange(v as BuildingDetailTab)}
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
            {TABS.map(t => (
              <Tab key={t.value} value={t.value} label={t.label} />
            ))}
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
}
