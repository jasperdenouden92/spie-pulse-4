'use client';

import React, { useState, useMemo } from 'react';
import { useFilterParams } from '@/hooks/useFilterParams';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@/components/Button';
import { useThemeMode } from '@/theme-mode-context';
import { type AssetNode } from '@/data/assetTree';

import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import SecurityIcon from '@mui/icons-material/Security';
import ElevatorIcon from '@mui/icons-material/Elevator';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';

// ── Category config ──
const CATEGORY_CONFIG: Record<string, { Icon: React.ElementType; color: string }> = {
  'HVAC':        { Icon: AcUnitIcon,              color: '#2196F3' },
  'Lighting':    { Icon: LightbulbIcon,           color: '#FF9800' },
  'Fire Safety': { Icon: LocalFireDepartmentIcon, color: '#F44336' },
  'Electrical':  { Icon: ElectricalServicesIcon,  color: '#9C27B0' },
  'Plumbing':    { Icon: PlumbingIcon,            color: '#00BCD4' },
  'Security':    { Icon: SecurityIcon,            color: '#4CAF50' },
  'Elevator':    { Icon: ElevatorIcon,            color: '#795548' },
};

const DEFAULT_CAT_CONFIG = { Icon: SettingsInputAntennaIcon, color: '#607D8B' };

function getCatConfig(category?: string) {
  if (!category) return DEFAULT_CAT_CONFIG;
  return CATEGORY_CONFIG[category] ?? DEFAULT_CAT_CONFIG;
}

// ── Status config ──
const STATUS_COLOR: Record<string, string> = {
  'operational': '#4CAF50',
  'maintenance': '#FF9800',
  'offline':     '#9E9E9E',
  'failed':      '#F44336',
};

// ── Enriched asset type ──
export interface EnrichedAsset extends AssetNode {
  building: string;
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
          <Box key={i} component="mark" sx={{ bgcolor: `color-mix(in srgb, ${c.brandSecondary} 22%, transparent)`, color: 'inherit', borderRadius: '2px', px: '1px' }}>
            {part}
          </Box>
        ) : part
      )}
    </>
  );
}

// ── Status cell ──
function StatusCell({ status }: { status?: string }) {
  const { themeColors: c } = useThemeMode();
  const s = status ?? 'operational';
  const color = STATUS_COLOR[s] ?? STATUS_COLOR.operational;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, bgcolor: c.bgPrimaryHover, borderRadius: '6px' }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{s}</Typography>
    </Box>
  );
}

// ── Category pill ──
function CategoryCell({ category }: { category?: string }) {
  const { Icon, color } = getCatConfig(category);
  if (!category) return <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '999px', bgcolor: `${color}1A`, border: `1px solid ${color}33` }}>
      <Icon sx={{ fontSize: 12, color }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color, lineHeight: 1 }}>{category}</Typography>
    </Box>
  );
}

// ── Sortable columns ──
type SortKey = 'name' | 'building' | 'category' | 'manufacturer' | 'model' | 'zone' | 'installDate' | 'status';

const COLUMNS: { key: SortKey; label: string; width?: string }[] = [
  { key: 'name',         label: 'Asset',        width: '18%' },
  { key: 'building',     label: 'Building',     width: '16%' },
  { key: 'category',     label: 'Category',     width: '13%' },
  { key: 'manufacturer', label: 'Manufacturer', width: '12%' },
  { key: 'model',        label: 'Model',        width: '12%' },
  { key: 'zone',         label: 'Zone',         width: '13%' },
  { key: 'installDate',  label: 'Installation date', width: '11%' },
  { key: 'status',       label: 'Status',       width: '8%'  },
];

function getSortValue(asset: EnrichedAsset, key: SortKey): string {
  switch (key) {
    case 'name':         return asset.name;
    case 'building':     return asset.building;
    case 'category':     return asset.metadata?.category ?? '';
    case 'manufacturer': return asset.metadata?.manufacturer ?? '';
    case 'model':        return asset.metadata?.model ?? '';
    case 'zone':         return asset.metadata?.zone ?? '';
    case 'installDate':  return asset.metadata?.installDate ?? '';
    case 'status':       return asset.metadata?.status ?? '';
  }
}

// ── Types ──
type GroupBy = 'none' | 'building' | 'category' | 'status';

// ── Section header (matches Zones pattern) ──
function SectionHeader({ label, count, onClick }: { label: string; count: number; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
      <Typography
        variant="body2"
        onClick={onClick}
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: onClick ? 'text.primary' : 'text.secondary',
          textTransform: 'capitalize',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { textDecoration: 'underline' } : {},
        }}
      >
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
        {count}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  );
}

// ── Asset table (flat — grouping handled by parent) ──
function AssetTable({ assets, query = '', hiddenCols = [], onAssetClick }: { assets: EnrichedAsset[]; query?: string; hiddenCols?: SortKey[]; onAssetClick?: (assetId: string, e: React.MouseEvent) => void }) {
  const { themeColors: c } = useThemeMode();
  const { get, set } = useFilterParams();
  const sortKey = get('sortKey', 'name') as SortKey;
  const sortDir = get('sortDir', 'asc') as 'asc' | 'desc';

  const visibleColumns = useMemo(() => hiddenCols.length ? COLUMNS.filter(col => !hiddenCols.includes(col.key)) : COLUMNS, [hiddenCols]);

  function handleSort(key: SortKey) {
    if (sortKey === key) set('sortDir', sortDir === 'asc' ? 'desc' : 'asc');
    else { set('sortKey', key); set('sortDir', 'asc'); }
  }

  const sorted = useMemo(() =>
    [...assets].sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }),
    [assets, sortKey, sortDir]
  );

  const colgroup = (
    <colgroup>
      {visibleColumns.map(col => (
        <col key={col.key} style={{ width: col.width }} />
      ))}
    </colgroup>
  );

  return (
    <Box>
      {/* Header row outside the card */}
      <Table sx={{ tableLayout: 'fixed' }}>
        {colgroup}
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
            {visibleColumns.map(col => (
              <TableCell
                key={col.key}
                sortDirection={sortKey === col.key ? sortDir : false}
                sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, whiteSpace: 'nowrap' }}
              >
                <TableSortLabel
                  active={sortKey === col.key}
                  direction={sortKey === col.key ? sortDir : 'asc'}
                  onClick={() => handleSort(col.key)}
                  sx={{ fontSize: 'inherit', color: 'inherit', '&.Mui-active': { color: c.brandSecondary }, '& .MuiTableSortLabel-icon': { fontSize: 14 } }}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      </Table>
      {/* Table body inside the card */}
      <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            {colgroup}
            <TableBody>
              {sorted.map(asset => (
                <TableRow key={asset.id} onClick={(e) => onAssetClick?.(asset.id, e)} sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <HighlightText text={asset.name} query={query} />
                    </Typography>
                  </TableCell>
                  {!hiddenCols.includes('building') && (
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <HighlightText text={asset.building} query={query} />
                      </Typography>
                    </TableCell>
                  )}
                  {!hiddenCols.includes('category') && (
                    <TableCell sx={{ py: 1.25 }}>
                      <CategoryCell category={asset.metadata?.category} />
                    </TableCell>
                  )}
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.manufacturer
                        ? <HighlightText text={asset.metadata.manufacturer} query={query} />
                        : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.model
                        ? <HighlightText text={asset.metadata.model} query={query} />
                        : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.zone
                        ? <HighlightText text={asset.metadata.zone} query={query} />
                        : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {asset.metadata?.installDate ?? <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
                    </Typography>
                  </TableCell>
                  {!hiddenCols.includes('status') && (
                    <TableCell sx={{ py: 1.25 }}>
                      <StatusCell status={asset.metadata?.status} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

// ── Main exported component ──
export default function AssetsList({ assets, onAssetClick, onBuildingLabelClick, groupBy: groupByProp = 'none', search: searchProp = '', hideBuildingColumn, showFilters }: {
  assets: EnrichedAsset[];
  onAssetClick?: (assetId: string, e: React.MouseEvent) => void;
  onBuildingLabelClick?: (buildingName: string, e?: React.MouseEvent) => void;
  groupBy?: string;
  search?: string;
  hideBuildingColumn?: boolean;
  showFilters?: boolean;
}) {
  const { themeColors: c } = useThemeMode();

  // Internal filter state (used when showFilters is true)
  const [internalSearch, setInternalSearch] = useState('');
  const [internalGroupBy, setInternalGroupBy] = useState<GroupBy>('none');
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<null | HTMLElement>(null);

  const search = showFilters ? internalSearch : searchProp;
  const groupBy = showFilters ? internalGroupBy : groupByProp;
  const castGroupBy = groupBy as GroupBy;

  // Filter assets by internal search when showFilters is enabled
  const filteredAssets = useMemo(() => {
    if (!showFilters || !internalSearch.trim()) return assets;
    const q = internalSearch.trim().toLowerCase();
    return assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.building.toLowerCase().includes(q) ||
      a.metadata?.category?.toLowerCase().includes(q) ||
      a.metadata?.manufacturer?.toLowerCase().includes(q)
    );
  }, [assets, showFilters, internalSearch]);

  const filterBar = showFilters ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', height: 30, borderRadius: '6px', border: '1px solid', borderColor: c.borderPrimary, bgcolor: c.bgPrimary, px: 1, gap: 0.5, '&:focus-within': { borderColor: c.brandSecondary }, transition: 'border-color 0.15s ease' }}>
        <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
        <InputBase
          value={internalSearch}
          onChange={(e) => setInternalSearch(e.target.value)}
          placeholder="Search assets…"
          sx={{ fontSize: '0.8rem', minWidth: 140, '& input': { p: 0, lineHeight: 1 } }}
          endAdornment={internalSearch ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setInternalSearch('')} sx={{ p: 0.25 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </InputAdornment>
          ) : null}
        />
      </Box>
      <Button variant="secondary" size="sm" endIcon={<ExpandMoreIcon />} onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}>
        Group by
      </Button>
      <Menu anchorEl={groupByMenuAnchor} open={Boolean(groupByMenuAnchor)} onClose={() => setGroupByMenuAnchor(null)} slotProps={{ paper: { sx: { borderRadius: '8px', mt: 0.5, minWidth: 140 } } }}>
        <MenuItem selected={internalGroupBy === 'none'} onClick={() => { setInternalGroupBy('none'); setGroupByMenuAnchor(null); }}><ListItemText>No grouping</ListItemText></MenuItem>
        <Divider />
        <MenuItem selected={internalGroupBy === 'category'} onClick={() => { setInternalGroupBy('category'); setGroupByMenuAnchor(null); }}><ListItemText>Category</ListItemText></MenuItem>
        <MenuItem selected={internalGroupBy === 'status'} onClick={() => { setInternalGroupBy('status'); setGroupByMenuAnchor(null); }}><ListItemText>Status</ListItemText></MenuItem>
      </Menu>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}</Typography>
    </Box>
  ) : null;

  // Grouped output
  const grouped = useMemo(() => {
    if (castGroupBy === 'none') return null;
    const map = new Map<string, EnrichedAsset[]>();
    for (const a of filteredAssets) {
      const key = castGroupBy === 'building' ? a.building :
                  castGroupBy === 'category' ? (a.metadata?.category ?? 'Other') :
                  (a.metadata?.status ?? 'unknown');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, items]) => ({ key, label: key, items }));
  }, [filteredAssets, castGroupBy]);

  return (
    <Box sx={{ pt: 3 }}>
      {filterBar}
      {filteredAssets.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No assets match your filters.</Typography>
        </Box>
      ) : grouped ? (
        grouped.map(({ key, label, items }) => (
          <Box key={key} sx={{ mb: 4 }}>
            <SectionHeader
              label={label}
              count={items.length}
              onClick={castGroupBy === 'building' && onBuildingLabelClick ? (e) => onBuildingLabelClick(key, e) : undefined}
            />
            <AssetTable assets={items} query={search} hiddenCols={[
              ...(hideBuildingColumn || castGroupBy === 'building' ? ['building' as SortKey] : []),
              ...(castGroupBy === 'category' ? ['category' as SortKey] : []),
              ...(castGroupBy === 'status' ? ['status' as SortKey] : []),
            ]} onAssetClick={onAssetClick} />
          </Box>
        ))
      ) : (
        <AssetTable assets={filteredAssets} query={search} hiddenCols={hideBuildingColumn ? ['building'] : []} onAssetClick={onAssetClick} />
      )}
    </Box>
  );
}
