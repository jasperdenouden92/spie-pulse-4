'use client';

import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/i18n';
import { useAppState } from '@/context/AppStateContext';
import { useThemeMode } from '@/theme-mode-context';
import { buildings } from '@/data/buildings';
import type { ServiceOrder, ServiceOrderObservation } from '@/data/processOrders';
import type { AssetNode } from '@/data/assetTree';

interface ServiceOrderDetailPageProps {
  order: ServiceOrder;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onBackToOrders?: () => void;
  onPanelClose?: () => void;
  onPanelFullscreen?: () => void;
}

const STATUS_COLORS: Record<ServiceOrder['status'], string> = {
  planned: '#3b82f6',
  executed: '#10b981',
};

function Field({
  icon,
  label,
  children,
  fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const { themeColors: c } = useThemeMode();
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.75, gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <Box sx={{ color: c.textSecondary, mt: '2px', '& svg': { fontSize: 16 } }}>{icon}</Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '0.7rem', color: c.textSecondary, lineHeight: 1.3, mb: 0.25 }}>
          {label}
        </Typography>
        <Box sx={{ fontSize: '0.85rem', color: c.textPrimary, lineHeight: 1.4, wordBreak: 'break-word' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function MetaChip({
  icon,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  onClick?: () => void;
}) {
  const { themeColors: c } = useThemeMode();
  const interactive = !!onClick;
  const color = interactive ? c.brandSecondary : c.textSecondary;
  return (
    <Box
      component={interactive ? 'button' : 'div'}
      onClick={onClick}
      sx={{
        appearance: 'none', background: 'none', border: 'none', p: 0, m: 0,
        font: 'inherit', textAlign: 'left',
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        color,
        cursor: interactive ? 'pointer' : 'default',
        minWidth: 0,
        ...(interactive && {
          '&:hover': { textDecoration: 'underline' },
        }),
      }}
    >
      <Box sx={{ display: 'inline-flex', '& svg': { fontSize: 16 } }}>{icon}</Box>
      <Typography
        component="span"
        noWrap
        sx={{ fontSize: '0.8125rem', color, fontFamily: '"Inter", sans-serif' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ObservationCard({ obs }: { obs: ServiceOrderObservation }) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const statusKey = obs.followUpStatus;
  const statusColor =
    statusKey === 'closed' ? c.statusGood
    : statusKey === 'pending' ? c.brandSecondary
    : c.statusModerate;

  return (
    <Box sx={{
      border: `1px solid ${c.borderTertiary}`,
      borderRadius: '8px',
      px: 1.25,
      py: 1,
      bgcolor: c.bgPrimary,
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      columnGap: 1.5,
      rowGap: 0.5,
      alignItems: 'center',
    }}>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: c.textPrimary, minWidth: 0 }}>
        {obs.title}
      </Typography>
      {obs.hasFollowUp ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: c.statusGood }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: '0.75rem', color: c.statusGood, fontWeight: 500 }}>
            {t('serviceOrder.followUp')}
          </Typography>
        </Box>
      ) : (
        <Box />
      )}
      <Box sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: statusColor + '22',
        color: statusColor,
        borderRadius: '999px',
        px: 0.875,
        py: 0.125,
        fontSize: '0.7rem',
        fontWeight: 600,
        lineHeight: 1.4,
      }}>
        {t(`serviceOrder.followUpStatus.${statusKey}` as const)}
      </Box>
      {obs.body && (
        <Typography sx={{
          gridColumn: '1 / -1',
          fontSize: '0.8rem', color: c.textSecondary, lineHeight: 1.5,
        }}>
          {obs.body}
        </Typography>
      )}
    </Box>
  );
}

function ServiceOrderBody({
  order,
}: {
  order: ServiceOrder;
}) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();

  return (
    <Box sx={{ pt: 0, pb: 4 }}>
      {/* Details grid */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 2,
          rowGap: 0.5,
        }}>
          {order.plannedWeek && (
            <Field icon={<CalendarMonthOutlinedIcon />} label={t('serviceOrder.plannedWeek')}>
              {`W${order.plannedWeek.week} ${order.plannedWeek.year}`}
            </Field>
          )}
          <Field icon={<BuildOutlinedIcon />} label={t('serviceOrder.techniqueType')}>
            {order.techniqueType ?? '—'}
          </Field>
          <Field icon={<GavelOutlinedIcon />} label={t('serviceOrder.compliance')}>
            {order.compliance}
          </Field>
          <Field icon={<BadgeOutlinedIcon />} label={t('serviceOrder.customerNumber')}>
            {order.customerNumber}
          </Field>
          <Field icon={<LocationOnOutlinedIcon />} label={t('serviceOrder.workAddress')} fullWidth>
            {order.workAddress}
          </Field>
        </Box>
      </Box>

      {/* Observations */}
      {order.observations.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{
              fontSize: '0.78rem', fontWeight: 700, color: c.textSecondary,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {t('serviceOrder.observations')}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: c.textSecondary }}>
              {t('serviceOrder.attachmentsCount', { count: order.observations.length })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {order.observations.map((obs, i) => (
              <ObservationCard key={i} obs={obs} />
            ))}
          </Box>
        </Box>
      )}

      {/* Attachments */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography sx={{
            fontSize: '0.78rem', fontWeight: 700, color: c.textSecondary,
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            {t('serviceOrder.attachments')}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: c.textSecondary }}>
            {t('serviceOrder.attachmentsCount', { count: order.attachments.length })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {order.attachments.map((att, i) => (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              border: `1px solid ${c.borderTertiary}`,
              borderRadius: '8px',
              px: 1, py: 0.75,
              bgcolor: c.bgPrimary,
            }}>
              <Box sx={{ color: c.textSecondary, '& svg': { fontSize: 18 } }}>
                <InsertDriveFileOutlinedIcon />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ fontSize: '0.82rem', color: c.textPrimary }}>
                  {att.name}
                </Typography>
                {att.date && (
                  <Typography sx={{ fontSize: '0.7rem', color: c.textSecondary }}>
                    {att.date}
                  </Typography>
                )}
              </Box>
              <IconButton size="small" sx={{ color: c.textSecondary }}>
                <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: c.textSecondary }}>
                <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default function ServiceOrderDetailPage({
  order,
  isCollapsed = false,
  onToggleCollapse,
  onBackToOrders,
  onPanelClose,
  onPanelFullscreen,
}: ServiceOrderDetailPageProps) {
  const { t } = useLanguage();
  const { addRecentlyVisited, setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekAsset, setSidePeekAssetTab, hasPeekHistory, goBackPeek } = useAppState();
  const statusColor = STATUS_COLORS[order.status];

  useEffect(() => {
    // Recent items don't yet include service orders as a distinct kind; skip for now.
  }, [order.id, addRecentlyVisited]);

  const onClickBuilding = () => {
    const b = buildings.find(x => x.id === order.buildingId);
    if (!b) return;
    setSidePeekBuilding(b);
    setSidePeekBuildingTab('overview');
  };

  const onClickInstallation = order.installation
    ? () => {
        const inst = order.installation!;
        const synthetic: AssetNode = {
          id: inst.assetId ?? `inst-${inst.code}`,
          name: inst.name,
          type: 'asset',
          metadata: {
            category: inst.category,
            location: order.buildingName,
            status: 'operational',
          },
        };
        setSidePeekAsset(synthetic);
        setSidePeekAssetTab('overview');
      }
    : undefined;

  const showBack = !!onPanelClose && hasPeekHistory;
  const panelActions = (onPanelClose || showBack) ? (
    <>
      {onPanelClose && (
        <Tooltip title={t('building.closePanel')}>
          <IconButton size="small" onClick={onPanelClose} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {showBack && (
        <Tooltip title={t('common.back')}>
          <IconButton size="small" onClick={goBackPeek} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </>
  ) : undefined;

  const statusLabel = t(`maintenance.processOrders.status.${order.status}` as const);
  const statusWeek = order.status === 'executed' ? order.executedWeek : order.plannedWeek;
  const statusBadge = statusWeek
    ? `${statusLabel} (W${statusWeek.week})`
    : statusLabel;

  const entityMeta = (
    <>
      <MetaChip icon={<ApartmentOutlinedIcon />} value={order.buildingCode} onClick={onClickBuilding} />
      {order.installation && (
        <MetaChip
          icon={<SettingsOutlinedIcon />}
          value={`${order.installation.code} — ${order.installation.name}`}
          onClick={onClickInstallation}
        />
      )}
    </>
  );

  const heroActions = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: statusColor + '22',
        color: statusColor,
        borderRadius: '999px',
        px: 1,
        py: 0.25,
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
        fontFamily: '"Inter", sans-serif',
      }}>
        {statusBadge}
      </Box>
      {onPanelFullscreen && (
        <Tooltip title={t('building.openFullscreen')}>
          <IconButton
            size="small"
            onClick={onPanelFullscreen}
            sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}
          >
            <OpenInFullIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      <IconButton
        size="small"
        sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}
      >
        <StarOutlineIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <PageHeader
        variant="entity"
        entityIcon={<AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />}
        entityIconBgColor={statusColor}
        title={order.title}
        subtitle={order.number}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        panelActions={panelActions}
        breadcrumb={
          <>
            <Typography
              sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500, fontFamily: '"Inter", sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { color: 'text.primary' } }}
              onClick={onBackToOrders}
            >
              {t('operations.maintenance.processOrders')}
            </Typography>
            <KeyboardArrowRightIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
            <Typography noWrap sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
              {order.number}
            </Typography>
          </>
        }
        heroActions={heroActions}
        entityMeta={entityMeta}
      />
      <ServiceOrderBody order={order} />
    </>
  );
}
