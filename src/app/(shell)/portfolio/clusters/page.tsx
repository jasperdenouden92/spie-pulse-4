'use client';

import React, { useState, useMemo } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { buildings } from '@/data/buildings';
import PageHeader from '@/components/PageHeader';
import { useThemeMode } from '@/theme-mode-context';
import { useURLState } from '@/hooks/useURLState';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';

// ── Stacked image thumbnails ──

function StackedThumbnails({ images, bgColor }: { images: string[]; bgColor: string }) {
  const stack = images.slice(0, 3);
  const BASE = 52;
  const SCALE_STEP = 0.8;
  const PEEK = 7;

  if (stack.length === 0) {
    return (
      <Box
        sx={{
          width: BASE,
          height: BASE,
          borderRadius: '6px',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AccountBalanceOutlinedIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: BASE + PEEK * (stack.length - 1), height: BASE, flexShrink: 0 }}>
      {stack.map((img, i) => {
        const size = Math.round(BASE * Math.pow(SCALE_STEP, i));
        const reverseI = stack.length - 1 - i;
        return (
          <Box
            key={i}
            component="img"
            src={img}
            alt=""
            sx={{
              position: 'absolute',
              right: reverseI * PEEK,
              bottom: 0,
              width: size,
              height: size,
              borderRadius: '6px',
              objectFit: 'cover',
              border: `2px solid ${bgColor}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              zIndex: stack.length - i,
            }}
          />
        );
      })}
    </Box>
  );
}

// ── Highlight matching text ──

function HighlightText({ text, query }: { text: string; query: string }) {
  const { themeColors: c } = useThemeMode();
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Box
            key={i}
            component="mark"
            sx={{
              bgcolor: `color-mix(in srgb, ${c.brandSecondary} 22%, transparent)`,
              color: 'inherit',
              borderRadius: '2px',
              px: '1px',
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
}

// ── Cluster tile ──

interface Cluster {
  name: string;
  images: string[];
  buildingCount: number;
  cities: string[];
}

function ClusterTile({ cluster, query = '' }: { cluster: Cluster; query?: string }) {
  const { themeColors: c } = useThemeMode();
  const cityLabel = cluster.cities.length === 0
    ? null
    : cluster.cities.length === 1
    ? cluster.cities[0]
    : cluster.cities.length === 2
    ? cluster.cities.join(' & ')
    : `${cluster.cities[0]} +${cluster.cities.length - 1}`;

  return (
    <Card
      sx={{
        borderRadius: '6px',
        border: `1px solid ${c.cardBorder}`,
        boxShadow: `0 2px 12px 0 ${c.shadow}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <StackedThumbnails images={cluster.images} bgColor={c.bgPrimary} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            <HighlightText text={cluster.name} query={query} />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <ApartmentOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1 }}>
                {cluster.buildingCount} building{cluster.buildingCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
            {cityLabel && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                <Tooltip title={cluster.cities.length > 2 ? cluster.cities.join(', ') : ''} placement="top">
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1 }}>
                    <HighlightText text={cityLabel} query={query} />
                  </Typography>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Main component ──

export default function PortfolioClustersRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { themeColors: c } = useThemeMode();
  const { selectedTenant: tenant } = useURLState();
  const [search, setSearch] = useState('');

  const tenantBuildings = useMemo(() => buildings.filter(b => b.tenant === tenant), [tenant]);

  const clusters = useMemo<Cluster[]>(() => {
    const map = new Map<string, typeof buildings>();
    for (const b of tenantBuildings) {
      if (!map.has(b.group)) map.set(b.group, []);
      map.get(b.group)!.push(b);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, blds]) => ({
        name,
        images: blds.filter(b => b.image && !b.image.endsWith('placeholder.png')).slice(0, 3).map(b => b.image),
        buildingCount: blds.length,
        cities: Array.from(new Set(blds.map(b => b.city).filter(Boolean))).sort(),
      }));
  }, [tenantBuildings]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clusters;
    const q = search.trim().toLowerCase();
    return clusters.filter(
      cl =>
        cl.name.toLowerCase().includes(q) ||
        cl.cities.some(city => city.toLowerCase().includes(q))
    );
  }, [clusters, search]);

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
                Clusters <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem' }}>{filtered.length}</Typography>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 30,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: c.borderPrimary,
                    bgcolor: c.bgPrimary,
                    px: 1,
                    gap: 0.5,
                    '&:focus-within': { borderColor: c.brandSecondary },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                  <InputBase
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clusters..."
                    sx={{ fontSize: '0.8rem', minWidth: 160, '& input': { p: 0, lineHeight: 1 } }}
                    endAdornment={
                      search ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }
                  />
                </Box>
              </Box>
            </Box>
          }
        />

        <Box sx={{ pt: 3 }}>
          {filtered.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">No clusters match your search.</Typography>
            </Box>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={search}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 2,
                  }}
                >
                  {filtered.map((cluster) => (
                    <motion.div
                      key={cluster.name}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ClusterTile cluster={cluster} query={search} />
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </AnimatePresence>
          )}
        </Box>
      </Box>
    </Container>
  );
}
