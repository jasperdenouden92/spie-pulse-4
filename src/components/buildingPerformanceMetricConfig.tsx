'use client';

import React from 'react';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SolarPowerOutlinedIcon from '@mui/icons-material/SolarPowerOutlined';
import FilterDramaOutlinedIcon from '@mui/icons-material/FilterDramaOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import DirectionsRunOutlinedIcon from '@mui/icons-material/DirectionsRunOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import type { TranslationKey } from '@/i18n';
import type { TopicDef } from '@/components/performance';

export type BuildingMetricKey =
  | 'sustainability' | 'comfort' | 'asset_monitoring' | 'compliance'
  | 'tickets' | 'quotations' | 'maintenance';

export const THEME_METRIC_KEYS: BuildingMetricKey[] = ['sustainability', 'comfort', 'asset_monitoring', 'compliance'];
export const OPERATIONAL_METRIC_KEYS: BuildingMetricKey[] = ['tickets', 'quotations', 'maintenance'];

interface TopicSpec {
  key: string;
  labelKey: TranslationKey;
  icon: React.ReactNode;
  offset: number;
  trend: number;
  chartColor: string;
  goodAbove: number;
  moderateAbove: number;
}

interface MetricSpec {
  icon: React.ReactNode;
  titleKey: TranslationKey;
  kpiLabelKey: TranslationKey;
  metricLabelKey: TranslationKey;
  themeGoodAbove: number;
  themeModerateAbove: number;
  topics: TopicSpec[];
}

const ICON_SIZE_TOPIC = { fontSize: 20 } as const;

const METRIC_SPECS: Record<BuildingMetricKey, MetricSpec> = {
  sustainability: {
    icon: <NatureOutlinedIcon />,
    titleKey: 'performance.sustainabilityPerformance',
    kpiLabelKey: 'performance.sustainabilityKpi',
    metricLabelKey: 'metric.sustainability',
    themeGoodAbove: 75,
    themeModerateAbove: 55,
    topics: [
      { key: 'consumption', labelKey: 'topic.consumption', icon: <BoltOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 5, trend: 4, chartColor: '#f57c00', goodAbove: 75, moderateAbove: 55 },
      { key: 'generation', labelKey: 'topic.generation', icon: <SolarPowerOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -8, trend: 6, chartColor: '#66bb6a', goodAbove: 70, moderateAbove: 50 },
      { key: 'emissions', labelKey: 'topic.emissions', icon: <FilterDramaOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -3, trend: -2, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
      { key: 'cost', labelKey: 'topic.cost', icon: <PaidOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 6, trend: 3, chartColor: '#0288d1', goodAbove: 75, moderateAbove: 55 },
    ],
  },
  comfort: {
    icon: <SpaOutlinedIcon />,
    titleKey: 'performance.comfortPerformance',
    kpiLabelKey: 'performance.comfortKpi',
    metricLabelKey: 'metric.comfort',
    themeGoodAbove: 75,
    themeModerateAbove: 55,
    topics: [
      { key: 'temperature', labelKey: 'topic.temperature', icon: <ThermostatOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 7, trend: 3, chartColor: '#e91e63', goodAbove: 80, moderateAbove: 60 },
      { key: 'humidity', labelKey: 'topic.relativeHumidity', icon: <WaterDropOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -13, trend: -4, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 55 },
      { key: 'air_quality', labelKey: 'topic.airQuality', icon: <AirOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 6, trend: 7, chartColor: '#00bcd4', goodAbove: 85, moderateAbove: 65 },
    ],
  },
  asset_monitoring: {
    icon: <MonitorHeartOutlinedIcon />,
    titleKey: 'performance.assetMonitoringPerformance',
    kpiLabelKey: 'performance.assetMonitoringKpi',
    metricLabelKey: 'metric.assetMonitoring',
    themeGoodAbove: 75,
    themeModerateAbove: 55,
    topics: [
      { key: 'heating', labelKey: 'topic.heating', icon: <ThermostatOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 4, trend: 3, chartColor: '#e91e63', goodAbove: 75, moderateAbove: 55 },
      { key: 'cooling', labelKey: 'topic.cooling', icon: <AcUnitOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -6, trend: -2, chartColor: '#00bcd4', goodAbove: 70, moderateAbove: 50 },
      { key: 'ventilation', labelKey: 'topic.ventilation', icon: <AirOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 2, trend: 5, chartColor: '#9c27b0', goodAbove: 75, moderateAbove: 55 },
      { key: 'distribution', labelKey: 'topic.distribution', icon: <AccountTreeOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -3, trend: -1, chartColor: '#ff9800', goodAbove: 70, moderateAbove: 50 },
      { key: 'lighting', labelKey: 'topic.lighting', icon: <LightbulbOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 7, trend: 4, chartColor: '#ffc107', goodAbove: 80, moderateAbove: 60 },
      { key: 'transport', labelKey: 'topic.transport', icon: <ElevatorOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -8, trend: -3, chartColor: '#0288d1', goodAbove: 70, moderateAbove: 50 },
    ],
  },
  compliance: {
    icon: <GavelOutlinedIcon />,
    titleKey: 'performance.compliancePerformance',
    kpiLabelKey: 'performance.complianceKpi',
    metricLabelKey: 'metric.compliance',
    themeGoodAbove: 75,
    themeModerateAbove: 55,
    topics: [
      { key: 'bacs', labelKey: 'topic.bacs', icon: <SensorsOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 5, trend: 3, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
      { key: 'escape_routes', labelKey: 'topic.escapeRoutes', icon: <DirectionsRunOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -4, trend: -2, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
      { key: 'fire_safety', labelKey: 'topic.fireSafety', icon: <LocalFireDepartmentOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 3, trend: 5, chartColor: '#f44336', goodAbove: 80, moderateAbove: 60 },
      { key: 'legionella_prevention', labelKey: 'topic.legionellaPrevention', icon: <VaccinesOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -6, trend: -1, chartColor: '#9c27b0', goodAbove: 75, moderateAbove: 55 },
      { key: 'maintenance_inspection', labelKey: 'topic.maintenanceInspection', icon: <HandymanOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 2, trend: 4, chartColor: '#00bcd4', goodAbove: 75, moderateAbove: 55 },
      { key: 'permits', labelKey: 'topic.permits', icon: <DescriptionOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 7, trend: 2, chartColor: '#4caf50', goodAbove: 80, moderateAbove: 60 },
    ],
  },
  tickets: {
    icon: <ConfirmationNumberOutlinedIcon />,
    titleKey: 'performance.ticketsPerformance',
    kpiLabelKey: 'performance.ticketsKpi',
    metricLabelKey: 'metric.tickets',
    themeGoodAbove: 80,
    themeModerateAbove: 60,
    topics: [
      { key: 'respond_time', labelKey: 'topic.responseTime', icon: <QuickreplyOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 3, trend: 4, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
      { key: 'restore_time', labelKey: 'topic.restoreTime', icon: <SettingsBackupRestoreOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -5, trend: -2, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
    ],
  },
  quotations: {
    icon: <RequestQuoteOutlinedIcon />,
    titleKey: 'performance.quotationsPerformance',
    kpiLabelKey: 'performance.quotationsKpi',
    metricLabelKey: 'metric.quotations',
    themeGoodAbove: 80,
    themeModerateAbove: 60,
    topics: [
      { key: 'run_time', labelKey: 'topic.runTime', icon: <TimerOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 5, trend: 3, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
      { key: 'response_time', labelKey: 'topic.responseTime', icon: <QuickreplyOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -8, trend: -3, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
      { key: 'approval_time', labelKey: 'topic.approvalTime', icon: <ThumbUpAltOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 3, trend: 6, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
    ],
  },
  maintenance: {
    icon: <BuildOutlinedIcon />,
    titleKey: 'performance.maintenancePerformance',
    kpiLabelKey: 'performance.maintenanceKpi',
    metricLabelKey: 'metric.maintenance',
    themeGoodAbove: 80,
    themeModerateAbove: 60,
    topics: [
      { key: 'progress', labelKey: 'topic.progress', icon: <TaskAltOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 4, trend: 5, chartColor: '#2196f3', goodAbove: 80, moderateAbove: 60 },
      { key: 'timeliness', labelKey: 'topic.timeliness', icon: <ScheduleOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: -7, trend: -2, chartColor: '#ff9800', goodAbove: 75, moderateAbove: 55 },
      { key: 'reporting', labelKey: 'topic.reporting', icon: <AssessmentOutlinedIcon sx={ICON_SIZE_TOPIC} />, offset: 3, trend: 8, chartColor: '#9c27b0', goodAbove: 80, moderateAbove: 60 },
    ],
  },
};

export function getMetricSpec(key: BuildingMetricKey): MetricSpec {
  return METRIC_SPECS[key];
}

export function computeAverageTopicScore(metricKey: BuildingMetricKey, baseScore: number): number {
  const spec = METRIC_SPECS[metricKey];
  const scores = spec.topics.map(topic => Math.max(0, Math.min(100, Math.round(baseScore + topic.offset))));
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

const MONTHS_LEN = 12;

function seededRandom(seed: number): () => number {
  let s = seed ^ 0xDEADBEEF;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 13), 0x45d9f3b);
  s = (s ^ (s >>> 16)) >>> 0;
  if (s === 0) s = 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export function generateKpiTimeSeries(seriesKey: string, baseScore: number, volatility = 1): number[] {
  const rng = seededRandom(seriesKey.length * 1337 + baseScore);
  const result: number[] = [];
  for (let i = 0; i < MONTHS_LEN; i++) {
    const progress = i / (MONTHS_LEN - 1);
    const target = baseScore;
    const start = target - 8 * volatility + rng() * 6 * volatility;
    const val = start + (target - start) * progress + (rng() - 0.5) * 4 * volatility;
    result.push(Math.round(Math.max(0, Math.min(100, val)) * 10) / 10);
  }
  return result;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

export interface BuiltTopic extends TopicDef {
  goodAbove: number;
  moderateAbove: number;
}

export function buildTopicsForMetric(
  metricKey: BuildingMetricKey,
  buildingScopeKey: string,
  themeScore: number,
  t: (key: TranslationKey) => string,
): BuiltTopic[] {
  const spec = METRIC_SPECS[metricKey];
  return spec.topics.map(topic => {
    const score = Math.round(clamp(themeScore + topic.offset));
    const sparkline = generateKpiTimeSeries(`${buildingScopeKey}-${metricKey}-${topic.key}`, score, 1).slice(-10);
    return {
      key: topic.key,
      label: t(topic.labelKey),
      icon: topic.icon,
      color: topic.chartColor,
      chartColor: topic.chartColor,
      score,
      trend: topic.trend,
      sparkline,
      goodAbove: topic.goodAbove,
      moderateAbove: topic.moderateAbove,
    };
  });
}
