import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Tooltip from '@mui/material/Tooltip';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { colors } from '@/colors';

// ── Shared types ──

export type TopicScore = {
  label: string;
  score: number;
  trend: number;
  icon: React.ReactNode;
  color: string;
};

type OperationalStats = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

type PerformanceMetric = {
  green: number;
  yellow: number;
  red: number;
};

// ── Variant-specific props ──

type BuildingProps = {
  variant: 'building';
  image?: string;
  address?: string;
  energyRating?: string;
  alertCount?: number;
};

type ClusterProps = {
  variant: 'cluster';
  images: string[];
  buildingCount: number;
};

// ── Common props ──

type CommonProps = {
  title: string;
  performance?: PerformanceMetric;
  metricTitle?: string;
  metricIcon?: React.ReactNode;
  overallPerformance?: PerformanceMetric;
  showOverall?: boolean;
  operationalStats?: OperationalStats[];
  trend?: number;
  periodLabel?: string | null;
  topics?: TopicScore[];
};

export type PropertyCardProps = CommonProps & (BuildingProps | ClusterProps);

// ── Helpers ──

function getScoreColor(score: number): string {
  if (score >= 75) return '#4caf50';
  if (score >= 50) return '#ffc107';
  return '#f44336';
}

const energyLabelColors: Record<string, string> = {
  'A+': '#00602b',
  A: '#00843d',
  'B+': '#4cb848',
  B: '#8cc63f',
  C: '#d4e34a',
  D: '#ffd500',
  E: '#f5a623',
  F: '#e8601c',
  G: '#d0021b',
};

export function EnergyLabel({ rating, size = 'default' }: { rating: string; size?: 'default' | 'small' }) {
  const color = energyLabelColors[rating] || '#999';
  const isSmall = size === 'small';
  const w = isSmall ? 24 : 32;
  const h = isSmall ? 14 : 18;
  const textW = isSmall ? 18 : 24;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', position: 'relative', height: h, minWidth: isSmall ? 22 : 28 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={`M0 2C0 0.9 0.9 0 2 0H${w - 10}L${w} ${h / 2}L${w - 10} ${h}H2C0.9 ${h} 0 ${h - 0.9} 0 ${h - 2}V2Z`} fill={color} />
      </svg>
      <Typography sx={{ position: 'absolute', left: 0, width: textW, textAlign: 'center', fontWeight: 700, fontSize: isSmall ? '0.5625rem' : '0.6875rem', lineHeight: 1, color: 'white' }}>
        {rating}
      </Typography>
    </Box>
  );
}

// ── Score badge (shared between variants, positioned differently) ──

function ScoreBadge({
  performance,
  metricIcon,
  trend,
  periodLabel,
  overallPerformance,
}: {
  performance: PerformanceMetric;
  metricIcon?: React.ReactNode;
  trend?: number;
  periodLabel?: string | null;
  overallPerformance?: PerformanceMetric;
}) {
  const scoreColor = getScoreColor(performance.green);
  return (
    <>
      {metricIcon && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: scoreColor, '& .MuiSvgIcon-root': { color: `${scoreColor} !important` } }}>
          {metricIcon}
        </Box>
      )}
      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', lineHeight: 1, color: scoreColor }}>
        {performance.green}%
      </Typography>
      {trend !== undefined && periodLabel !== null && (
        <Tooltip title={periodLabel ? `Compared to ${periodLabel}` : ''} arrow placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
            {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1 }}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        </Tooltip>
      )}
      {overallPerformance && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.5, pl: 0.75, borderLeft: '1px solid', borderColor: 'divider' }}>
          <SpeedOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1, color: 'text.secondary' }}>
            {overallPerformance.green}%
          </Typography>
        </Box>
      )}
    </>
  );
}

// ── Topics grid ──

function TopicsGrid({ topics }: { topics: TopicScore[] }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${topics.length <= 4 ? topics.length : 3}, 1fr)`, gap: 1.5 }}>
      {topics.map((topic) => (
        <Box key={topic.label}>
          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', mb: 0.25 }}>
            {topic.label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            {topic.score}%
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ── Performance bars ──

function PerformanceBars({
  performance,
  metricTitle,
  metricIcon,
  overallPerformance,
  showOverall,
  trend,
  periodLabel,
}: {
  performance: PerformanceMetric;
  metricTitle: string;
  metricIcon?: React.ReactNode;
  overallPerformance?: PerformanceMetric;
  showOverall: boolean;
  trend?: number;
  periodLabel?: string | null;
}) {
  return (
    <Box sx={{ position: 'relative', minHeight: showOverall ? 76 : 'auto' }}>
      {/* Overall Performance - base layer */}
      {showOverall && (
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0, right: 0,
          opacity: 0.4,
          transition: 'opacity 0.3s ease',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Overall Performance</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{overallPerformance?.green}%</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', height: 6, borderRadius: '2px', overflow: 'hidden', bgcolor: colors.bgPrimaryHover }}>
            <Box sx={{ width: `${overallPerformance?.green || 0}%`, bgcolor: '#4caf50', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            <Box sx={{ width: `${overallPerformance?.yellow || 0}%`, bgcolor: '#ffc107', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            <Box sx={{ width: `${overallPerformance?.red || 0}%`, bgcolor: '#f44336', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </Box>
        </Box>
      )}

      {/* Selected Metric - toast layer */}
      <Box sx={{
        position: showOverall ? 'absolute' : 'relative',
        bottom: showOverall ? 0 : 'auto',
        left: 0, right: 0,
        transform: showOverall ? 'translateY(-40px)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        opacity: 1, zIndex: 1,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.3s ease' }}>{metricTitle}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, transition: 'all 0.3s ease' }}>
            {metricIcon ? (
              <Box sx={{ display: 'flex', alignItems: 'center', color: getScoreColor(performance.green), '& .MuiSvgIcon-root': { color: `${getScoreColor(performance.green)} !important` } }}>
                {metricIcon}
              </Box>
            ) : <SpeedOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.3s ease' }}>{performance.green}%</Typography>
            {trend !== undefined && periodLabel !== null && (
              <Tooltip title={periodLabel ? `Compared to ${periodLabel}` : ''} arrow placement="top">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? 'success.main' : 'error.main' }}>
                  {trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1 }}>{Math.abs(trend)}%</Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', height: 8, borderRadius: '2px', overflow: 'hidden', bgcolor: colors.bgPrimaryHover, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <Box sx={{ width: `${performance.green}%`, bgcolor: '#4caf50', borderTop: '2px solid rgba(76, 175, 80, 0.4)', borderBottom: '2px solid rgba(76, 175, 80, 0.4)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          <Box sx={{ width: `${performance.yellow}%`, bgcolor: '#ffc107', borderTop: '2px solid rgba(255, 193, 7, 0.4)', borderBottom: '2px solid rgba(255, 193, 7, 0.4)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          <Box sx={{ width: `${performance.red}%`, bgcolor: '#f44336', borderTop: '2px solid rgba(244, 67, 54, 0.4)', borderBottom: '2px solid rgba(244, 67, 54, 0.4)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </Box>
      </Box>
    </Box>
  );
}

// ── Operational stats ──

function OperationalStatsRow({ stats }: { stats: OperationalStats[] }) {
  return (
    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between' }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {stat.icon && (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontSize: 16 }}>
                {stat.icon}
              </Box>
            )}
            <Box>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.625rem', lineHeight: 1.3 }}>{stat.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3 }}>{stat.value}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Stacked image thumbnails (cluster header) ──

function StackedThumbnails({ images }: { images: string[] }) {
  const stack = images.slice(0, 3);
  const BASE = 40;
  const SCALE_STEP = 0.8;
  const PEEK = 6;

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
              width: size, height: size,
              borderRadius: '6px',
              objectFit: 'cover',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              zIndex: stack.length - i,
            }}
          />
        );
      })}
    </Box>
  );
}

// ── Main component ──

export default function PropertyCard(props: PropertyCardProps) {
  const {
    variant,
    title,
    performance = { green: 50, yellow: 30, red: 20 },
    metricTitle = 'Overall Performance',
    metricIcon,
    overallPerformance,
    showOverall = false,
    operationalStats,
    trend,
    periodLabel,
    topics,
  } = props;

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const hasTopics = topics && topics.length > 0;
  const isBuilding = variant === 'building';

  const menuButton = (
    <IconButton
      className="more-options-btn"
      size="small"
      onClick={(e) => { e.stopPropagation(); setMenuAnchorEl(e.currentTarget); }}
      sx={{
        opacity: menuAnchorEl ? 1 : 0,
        transition: 'opacity 0.2s ease',
        flexShrink: 0,
        ...(isBuilding ? {
          position: 'absolute',
          top: 12, right: 12,
          borderRadius: '50%',
          aspectRatio: 1,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
        } : {}),
      }}
    >
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  );

  const menu = (
    <Menu
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={() => setMenuAnchorEl(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={() => setMenuAnchorEl(null)}>View Details</MenuItem>
      <MenuItem onClick={() => setMenuAnchorEl(null)}>Edit</MenuItem>
      {isBuilding && <MenuItem onClick={() => setMenuAnchorEl(null)}>Delete</MenuItem>}
    </Menu>
  );

  return (
    <Card sx={{
      borderRadius: '12px',
      boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
        '& .more-options-btn': { opacity: 1 },
      },
    }}>
      {/* ── Building: hero image with overlays ── */}
      {isBuilding && (
        <Box sx={{ position: 'relative', mb: hasTopics ? 0.5 : 0 }}>
          {props.image && (
            <CardMedia component="img" sx={{ height: 96 }} image={props.image} alt={title} />
          )}
          {menuButton}
          {menu}

          {/* Alert badge */}
          {hasTopics && props.alertCount !== undefined && props.alertCount > 0 && (
            <Box sx={{
              position: 'absolute', top: 10, left: 10,
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px',
              px: 1, py: 0.5, color: 'text.secondary',
            }}>
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1 }}>{props.alertCount}</Typography>
            </Box>
          )}

          {/* Score badge (floating on image) */}
          {hasTopics && (
            <Box sx={{
              position: 'absolute', bottom: -14, right: 12,
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: 'white', borderRadius: '10px',
              px: 1.5, py: 0.5, border: '2px solid white',
              color: getScoreColor(performance.green),
            }}>
              <ScoreBadge performance={performance} metricIcon={metricIcon} trend={trend} periodLabel={periodLabel} overallPerformance={overallPerformance} />
            </Box>
          )}
        </Box>
      )}

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* ── Cluster: inline header with stacked images ── */}
        {!isBuilding && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: hasTopics ? 1.5 : 1 }}>
            <StackedThumbnails images={props.images} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.3 }}>{title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {props.buildingCount} building{props.buildingCount !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Score badge (inline) */}
            {hasTopics && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                bgcolor: 'white', borderRadius: '10px',
                px: 1.5, py: 0.5,
                border: '1px solid', borderColor: 'divider',
                color: getScoreColor(performance.green),
                flexShrink: 0,
              }}>
                <ScoreBadge performance={performance} metricIcon={metricIcon} trend={trend} periodLabel={periodLabel} overallPerformance={overallPerformance} />
              </Box>
            )}

            {menuButton}
            {menu}
          </Box>
        )}

        {/* ── Building: title row ── */}
        {isBuilding && (
          <Box sx={{ mb: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0, fontSize: '0.9375rem' }}>{title}</Typography>
              {props.energyRating && <EnergyLabel rating={props.energyRating} />}
            </Box>
            {props.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0, fontSize: '0.75rem' }}>{props.address}</Typography>
            )}
          </Box>
        )}

        {/* ── Content: topics or bars ── */}
        {hasTopics ? (
          <TopicsGrid topics={topics} />
        ) : (
          <>
            <PerformanceBars
              performance={performance}
              metricTitle={metricTitle}
              metricIcon={metricIcon}
              overallPerformance={overallPerformance}
              showOverall={showOverall}
              trend={trend}
              periodLabel={periodLabel}
            />
            {operationalStats && operationalStats.length > 0 && (
              <OperationalStatsRow stats={operationalStats} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
