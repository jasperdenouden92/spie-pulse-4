'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import PageHeader from '@/components/PageHeader';
import { useLanguage, type TranslationKey } from '@/i18n';
import { useThemeMode } from '@/theme-mode-context';
import { timeAgoParts } from '@/utils/timeAgo';
import type { PlaceholderPeek, PlaceholderPeekKind } from '@/context/AppStateContext';

const KIND_COLOR: Record<PlaceholderPeekKind, string> = {
  insight: '#1565c0',
  mutation: '#6a1b9a',
  maintenance: '#2e7d32',
  document: '#78716c',
};

const KIND_LABEL_KEY: Record<PlaceholderPeekKind, TranslationKey> = {
  insight: 'home.placeholderKindInsight',
  mutation: 'home.placeholderKindMutation',
  maintenance: 'home.placeholderKindMaintenance',
  document: 'home.placeholderKindDocument',
};

function renderKindIcon(kind: PlaceholderPeekKind) {
  const sx = { fontSize: 20, color: '#fff' };
  switch (kind) {
    case 'insight': return <VisibilityOutlinedIcon sx={sx} />;
    case 'mutation': return <SettingsInputAntennaIcon sx={sx} />;
    case 'maintenance': return <BuildOutlinedIcon sx={sx} />;
    case 'document': return <DescriptionOutlinedIcon sx={sx} />;
  }
}

export interface PlaceholderSidePeekProps {
  peek: PlaceholderPeek;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

/**
 * Generic side-peek body used by entity kinds that don't have a dedicated
 * template yet (insights, asset mutations, maintenance, documents). Matches
 * the visual language of the real templates so users experience a consistent
 * peek interaction even when the deep-dive view is still to be built.
 */
export default function PlaceholderSidePeek({
  peek,
  onPanelClose,
  onPanelFullscreen,
}: PlaceholderSidePeekProps) {
  const { t } = useLanguage();
  const { themeColors: c } = useThemeMode();
  const color = KIND_COLOR[peek.kind];
  const kindLabel = t(KIND_LABEL_KEY[peek.kind]);

  const panelActions = (onPanelClose || onPanelFullscreen) ? (
    <>
      {onPanelClose && (
        <Tooltip title={t('building.closePanel')}>
          <IconButton size="small" onClick={onPanelClose} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {onPanelFullscreen && (
        <Tooltip title={t('building.openFullscreen')}>
          <IconButton size="small" onClick={onPanelFullscreen} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <OpenInFullIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </>
  ) : undefined;

  const timestampLabel = (() => {
    if (!peek.timestamp) return null;
    const parts = timeAgoParts(peek.timestamp);
    return parts.count !== undefined ? t(parts.key, { count: parts.count }) : t(parts.key);
  })();

  return (
    <>
      <PageHeader
        variant="entity"
        entityIcon={renderKindIcon(peek.kind)}
        entityIconBgColor={color}
        entityType={kindLabel}
        title={peek.title}
        subtitle={peek.subtitle}
        panelActions={panelActions}
      />

      <Box sx={{ px: 3, pb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {timestampLabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {timestampLabel}
          </Typography>
        )}

        {peek.description && (
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
            {peek.description}
          </Typography>
        )}

        {peek.metadata && peek.metadata.length > 0 && (
          <Box
            sx={{
              border: `1px solid ${c.cardBorder}`,
              borderRadius: '12px',
              bgcolor: c.bgPrimary,
              p: 2,
              display: 'grid',
              gridTemplateColumns: 'max-content 1fr',
              columnGap: 3,
              rowGap: 1,
            }}
          >
            {peek.metadata.map(row => (
              <React.Fragment key={row.label}>
                <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  {row.value}
                </Typography>
              </React.Fragment>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            border: `1px dashed ${c.cardBorder}`,
            borderRadius: '12px',
            p: 2,
            color: 'text.secondary',
          }}
        >
          <HourglassTopOutlinedIcon sx={{ fontSize: 20, mt: 0.25 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              {t('home.placeholderComingSoon')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {t('home.placeholderBody')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
