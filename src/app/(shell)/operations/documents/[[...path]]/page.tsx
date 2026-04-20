'use client';

import React, { use, useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { useAppState } from '@/context/AppStateContext';
import { buildings as buildingsData } from '@/data/buildings';
import { getAssetById } from '@/data/assetTree';
import { buildingToSlug } from '@/utils/slugs';
import { useFilterParams } from '@/hooks/useFilterParams';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useThemeMode } from '@/theme-mode-context';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import ResetFiltersButton from '@/components/ResetFiltersButton';
import DateRangeSelector, { parseDateRange, getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import PageHeader from '@/components/PageHeader';
import { documentFiles, allDocumentItems, resolveFolderPath, buildFolderPath } from '@/data/documents';
import type { DocumentFile, DocumentItem, DocumentCategory } from '@/data/documents';
import { getOwnerAvatarColor, getFirstInitial } from '@/components/DocumentsList';
import { timeAgoDayParts } from '@/utils/timeAgo';
import { useLanguage } from '@/i18n';
import type { TranslationKey } from '@/i18n/translations/en';

type TFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

// ── Constants ──

const CATEGORY_OPTIONS: DocumentCategory[] = ['Contract', 'Report', 'Manual', 'Certificate', 'Drawing', 'Specification', 'Invoice', 'Permit'];

const CATEGORY_ICONS: Record<DocumentCategory, React.ReactNode> = {
  Contract: <GavelOutlinedIcon sx={{ fontSize: 16 }} />,
  Report: <AssignmentOutlinedIcon sx={{ fontSize: 16 }} />,
  Manual: <MenuBookOutlinedIcon sx={{ fontSize: 16 }} />,
  Certificate: <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />,
  Drawing: <ArchitectureOutlinedIcon sx={{ fontSize: 16 }} />,
  Specification: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
  Invoice: <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />,
  Permit: <ArticleOutlinedIcon sx={{ fontSize: 16 }} />,
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  Contract: '#1565c0',
  Report: '#2e7d32',
  Manual: '#6a1b9a',
  Certificate: '#00838f',
  Drawing: '#d84315',
  Specification: '#4527a0',
  Invoice: '#f57f17',
  Permit: '#37474f',
};

type SortKey = 'modified_desc' | 'modified_asc' | 'name' | 'category' | 'type';

function getItemName(item: DocumentItem): string {
  return item.type === 'folder' ? item.name : item.title;
}

function getItemModified(item: DocumentItem): string {
  return item.modifiedDate;
}

function sortItems(list: DocumentItem[], key: SortKey): DocumentItem[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    switch (key) {
      case 'modified_desc': return getItemModified(b).localeCompare(getItemModified(a));
      case 'modified_asc': return getItemModified(a).localeCompare(getItemModified(b));
      case 'name': return getItemName(a).localeCompare(getItemName(b));
      case 'category': {
        const ac = a.type === 'file' ? a.category : '';
        const bc = b.type === 'file' ? b.category : '';
        return ac.localeCompare(bc);
      }
      case 'type': {
        const at = a.type === 'file' ? a.fileType : '';
        const bt = b.type === 'file' ? b.fileType : '';
        return at.localeCompare(bt);
      }
    }
    return 0;
  });
  return sorted;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const DEFAULT_DATE_RANGE = `2023-01-01|${new Date().toISOString().split('T')[0]}`;

type GroupByKey = 'none' | 'category' | 'type' | 'modified';

/** Bucket label + sortable representative date for the "modified" grouping.
 *  Within the last 12 months → month bucket ("April 2026"); older → year bucket ("2024"). */
function modifiedBucket(dateStr: string, now: Date, locale: string): { key: string; label: string; sortDate: number } {
  const d = new Date(dateStr);
  const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (monthsDiff < 12) {
    const localeTag = locale === 'nl' ? 'nl-NL' : 'en-US';
    const raw = d.toLocaleDateString(localeTag, { month: 'long', year: 'numeric' });
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return {
      key: `m-${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`,
      label,
      sortDate: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
    };
  }
  return {
    key: `y-${d.getFullYear()}`,
    label: String(d.getFullYear()),
    sortDate: new Date(d.getFullYear(), 0, 1).getTime(),
  };
}

const recentlyChanged = [...documentFiles]
  .sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate))
  .slice(0, 5);

// ── Icons ──

function FileIcon({ category, size = 36 }: { category: DocumentCategory; size?: number }) {
  const bgColor = CATEGORY_COLORS[category];
  return (
    <Box
      sx={{
        width: size, height: size, borderRadius: '8px',
        bgcolor: `${bgColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: bgColor,
      }}
    >
      {CATEGORY_ICONS[category]}
    </Box>
  );
}

function FolderIcon({ size = 36 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size, height: size, borderRadius: '8px',
        bgcolor: 'rgba(158, 158, 158, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: '#78909c',
      }}
    >
      <FolderOutlinedIcon sx={{ fontSize: size * 0.5 }} />
    </Box>
  );
}

function buildingCountLabel(n: number, t: TFn): string {
  return n === 1 ? t('documents.oneBuilding') : t('documents.nBuildings', { n });
}

function assetCountLabel(n: number, t: TFn): string {
  return n === 1 ? t('documents.oneAsset') : t('documents.nAssets', { n });
}

/** Cell rendering for the "gebouwen/assets" column. Single linked building/asset is clickable
 *  directly; anything else opens a popover with the full list. */
function LinkedCell({
  file,
  onBuildingClick,
  onAssetClick,
  onOpenPopover,
  t,
}: {
  file: DocumentFile;
  onBuildingClick: (e: React.MouseEvent, buildingName: string) => void;
  onAssetClick: (e: React.MouseEvent, assetId: string) => void;
  onOpenPopover: (e: React.MouseEvent<HTMLElement>, file: DocumentFile) => void;
  t: TFn;
}) {
  const b = file.buildings.length;
  const a = file.assets.length;

  // Single building + no assets → direct link to building.
  if (b === 1 && a === 0) {
    return (
      <Box
        component="span"
        onClick={(e: React.MouseEvent) => onBuildingClick(e, file.buildings[0])}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.8125rem',
          color: 'text.secondary', cursor: 'pointer', minWidth: 0,
          '&:hover': { color: 'text.primary', '& .linked-arrow': { opacity: 1 } },
        }}
      >
        <ApartmentOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {file.buildings[0]}
        </Box>
        <OpenInNewIcon className="linked-arrow" sx={{ fontSize: 13, opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }} />
      </Box>
    );
  }

  // Single asset + no buildings → direct link to asset.
  if (b === 0 && a === 1) {
    const asset = file.assets[0];
    return (
      <Box
        component="span"
        onClick={(e: React.MouseEvent) => onAssetClick(e, asset.id)}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.8125rem',
          color: 'text.secondary', cursor: 'pointer', minWidth: 0,
          '&:hover': { color: 'text.primary', '& .linked-arrow': { opacity: 1 } },
        }}
      >
        <SettingsInputAntennaIcon sx={{ fontSize: 16, flexShrink: 0 }} />
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {asset.name}
        </Box>
        <OpenInNewIcon className="linked-arrow" sx={{ fontSize: 13, opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }} />
      </Box>
    );
  }

  if (b === 0 && a === 0) {
    return <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>&mdash;</Typography>;
  }

  // Mixed / multiple: clickable chips per kind, opens popover.
  return (
    <Box
      component="span"
      role="button"
      tabIndex={0}
      onClick={(e) => onOpenPopover(e, file)}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: '0.8125rem',
        color: 'text.secondary', cursor: 'pointer', minWidth: 0,
        '&:hover': { color: 'text.primary' },
      }}
    >
      {b > 0 && (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <ApartmentOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
          <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{buildingCountLabel(b, t)}</Box>
        </Box>
      )}
      {a > 0 && (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <SettingsInputAntennaIcon sx={{ fontSize: 16, flexShrink: 0 }} />
          <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{assetCountLabel(a, t)}</Box>
        </Box>
      )}
    </Box>
  );
}

// ── Main component ──

export default function OperationsDocumentsRoute({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path: pathSegments = [] } = use(params);
  const router = useRouter();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { themeColors: c } = useThemeMode();
  const { t, locale } = useLanguage();
  const { setSidePeekBuilding, setSidePeekBuildingTab, setSidePeekZone, setSidePeekAsset, setSidePeekAssetTab } = useAppState();

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'modified_desc', label: t('documents.sortModifiedNewest') },
    { value: 'modified_asc', label: t('documents.sortModifiedOldest') },
    { value: 'name', label: t('documents.sortNameAZ') },
    { value: 'category', label: t('documents.sortCategory') },
    { value: 'type', label: t('documents.sortFileType') },
  ];
  const GROUP_BY_OPTIONS: { value: GroupByKey; label: string }[] = [
    { value: 'none', label: t('common.noGrouping') },
    { value: 'category', label: t('common.category') },
    { value: 'type', label: t('common.type') },
    { value: 'modified', label: t('common.modified') },
  ];

  const handleBuildingClick = (e: React.MouseEvent, buildingName: string) => {
    e.stopPropagation();
    handleSidePeekClick(e,
      () => { const bld = buildingsData.find(x => x.name === buildingName); if (bld) { setSidePeekZone(null); setSidePeekBuilding(bld); setSidePeekBuildingTab('overview'); } },
      () => router.push(`/buildings/${buildingToSlug(buildingName)}`),
    );
  };

  const handleAssetClick = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    handleSidePeekClick(e,
      () => { const asset = getAssetById(assetId); if (asset) { setSidePeekAsset(asset); setSidePeekAssetTab('overview'); } },
      () => router.push(`/assets/${assetId}`),
    );
  };

  // Popover state for the gebouwen/assets cell
  const [linkedAnchor, setLinkedAnchor] = useState<HTMLElement | null>(null);
  const [linkedFile, setLinkedFile] = useState<DocumentFile | null>(null);
  const openLinkedPopover = (e: React.MouseEvent<HTMLElement>, file: DocumentFile) => {
    e.stopPropagation();
    setLinkedAnchor(e.currentTarget);
    setLinkedFile(file);
  };
  const closeLinkedPopover = () => { setLinkedAnchor(null); setLinkedFile(null); };

  const { get, set, getList, setList, getNumber, setNumber, clearKeys } = useFilterParams();

  const openDocument = (id: string) => set('doc', id);

  // Resolve current folder from URL path
  const currentFolder = useMemo(() => {
    if (pathSegments.length === 0) return null;
    return resolveFolderPath(pathSegments);
  }, [pathSegments]);
  const currentFolderId = currentFolder?.id ?? null;
  const isRoot = currentFolderId === null;

  // Page title
  const pageTitle = currentFolder ? currentFolder.name : t('documents.title');

  // Search, sort, pagination, grouping
  const search = get('search', '');
  const searchRef = useRef<HTMLInputElement>(null);
  const sortBy = get('sortBy', 'modified_desc') as SortKey;
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const page = getNumber('page', 0);
  const rowsPerPage = getNumber('rowsPerPage', 50);
  const [rowsPerPageAnchor, setRowsPerPageAnchor] = useState<HTMLElement | null>(null);
  const groupBy = get('groupBy', 'none') as GroupByKey;
  const [groupByMenuAnchor, setGroupByMenuAnchor] = useState<HTMLElement | null>(null);

  // Filters
  const selectedCategories = getList('categories');
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
  const selectedBuildings = getList('buildings');
  const [buildingAnchor, setBuildingAnchor] = useState<HTMLElement | null>(null);
  const selectedAssets = getList('assets');
  const [assetAnchor, setAssetAnchor] = useState<HTMLElement | null>(null);
  const selectedFileTypes = getList('fileTypes');
  const [fileTypeAnchor, setFileTypeAnchor] = useState<HTMLElement | null>(null);
  const modifiedRange = get('modifiedRange', '');
  const [modifiedDialogOpen, setModifiedDialogOpen] = useState(false);

  // Derived option lists — include all linked buildings across docs (flattened, deduped).
  const allBuildings = useMemo(
    () => Array.from(new Set(documentFiles.flatMap(d => [
      ...d.buildings,
      ...d.assets.map(a => a.building),
    ]))).sort(),
    [],
  );
  const allAssets = useMemo(() => {
    const map = new Map<string, { value: string; label: string; sublabel: string }>();
    for (const d of documentFiles) {
      for (const a of d.assets) {
        if (!map.has(a.id)) map.set(a.id, { value: a.id, label: a.name, sublabel: a.building });
      }
    }
    return Array.from(map.values()).sort((x, y) => x.label.localeCompare(y.label));
  }, []);
  const allFileTypes = useMemo(() => Array.from(new Set(documentFiles.map(d => d.fileType))).sort(), []);

  // Items in current folder, filtered + searched + sorted
  const filtered = useMemo<DocumentItem[]>(() => {
    let items: DocumentItem[] = allDocumentItems.filter(item => item.parentId === currentFolderId);

    const hasFilters = selectedCategories.length > 0 || selectedBuildings.length > 0 || selectedAssets.length > 0 || selectedFileTypes.length > 0 || modifiedRange || search.trim();

    if (hasFilters) {
      items = items.filter(item => {
        if (item.type === 'folder') {
          if (search.trim()) {
            const q = search.trim().toLowerCase();
            return item.name.toLowerCase().includes(q);
          }
          return true;
        }
        if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;
        if (selectedBuildings.length > 0) {
          const docBuildings = new Set<string>([
            ...item.buildings,
            ...item.assets.map(a => a.building),
          ]);
          if (!selectedBuildings.some(b => docBuildings.has(b))) return false;
        }
        if (selectedAssets.length > 0) {
          const docAssetIds = new Set<string>(item.assets.map(a => a.id));
          if (!selectedAssets.some(id => docAssetIds.has(id))) return false;
        }
        if (selectedFileTypes.length > 0 && !selectedFileTypes.includes(item.fileType)) return false;
        if (modifiedRange) {
          const { from, to } = parseDateRange(modifiedRange);
          const fromStr = from.toISOString().split('T')[0];
          const toStr = to.toISOString().split('T')[0];
          if (item.modifiedDate < fromStr || item.modifiedDate > toStr) return false;
        }
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const buildingMatch = item.buildings.some(b => b.toLowerCase().includes(q));
          const assetMatch = item.assets.some(a => a.name.toLowerCase().includes(q) || a.building.toLowerCase().includes(q));
          if (
            !item.id.toLowerCase().includes(q) &&
            !item.title.toLowerCase().includes(q) &&
            !buildingMatch &&
            !assetMatch &&
            !item.author.toLowerCase().includes(q) &&
            !item.category.toLowerCase().includes(q)
          ) return false;
        }
        return true;
      });
    }

    return sortItems(items, sortBy);
  }, [currentFolderId, selectedCategories, selectedBuildings, selectedAssets, selectedFileTypes, modifiedRange, search, sortBy]);

  // Reset page when filters/search/folder change
  const buildingsStr = get('buildings', '');
  const categoriesStr = get('categories', '');
  const assetsStr = get('assets', '');
  const fileTypesStr = get('fileTypes', '');
  useEffect(() => setNumber('page', 0, 0), [buildingsStr, categoriesStr, assetsStr, fileTypesStr, modifiedRange, search, sortBy, currentFolderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const ROWS_PER_PAGE_OPTIONS = [15, 30, 50, 100];

  // Grouped output
  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '__all__', label: '', items: paginatedItems }];
    const folders = paginatedItems.filter(i => i.type === 'folder');
    const files = paginatedItems.filter(i => i.type === 'file') as DocumentFile[];
    const now = new Date('2024-01-24');
    type Bucket = { key: string; label: string; items: DocumentItem[]; sortDate?: number };
    const buckets = new Map<string, Bucket>();
    if (folders.length > 0) buckets.set('__folders__', { key: '__folders__', label: t('documents.folders'), items: folders });
    for (const f of files) {
      let key: string;
      let label: string;
      let sortDate: number | undefined;
      if (groupBy === 'category') { key = f.category; label = f.category; }
      else if (groupBy === 'type') { key = f.fileType; label = f.fileType; }
      else { const b = modifiedBucket(f.modifiedDate, now, locale); key = b.key; label = b.label; sortDate = b.sortDate; }
      const existing = buckets.get(key);
      if (existing) existing.items.push(f);
      else buckets.set(key, { key, label, items: [f], sortDate });
    }
    return Array.from(buckets.values())
      .sort((a, b) => {
        if (a.key === '__folders__') return -1;
        if (b.key === '__folders__') return 1;
        if (groupBy === 'modified') return (b.sortDate ?? 0) - (a.sortDate ?? 0);
        return a.label.localeCompare(b.label);
      });
  }, [paginatedItems, groupBy, locale, t]);

  // Chip value labels
  const categoryChipValue = selectedCategories.length === 0 ? null
    : selectedCategories.length === 1 ? selectedCategories[0]
    : `${selectedCategories.length} categories`;
  const buildingChipValue = selectedBuildings.length === 0 ? null
    : selectedBuildings.length === 1 ? selectedBuildings[0]
    : `${selectedBuildings.length} buildings`;
  const assetChipValue = selectedAssets.length === 0 ? null
    : selectedAssets.length === 1 ? (allAssets.find(a => a.value === selectedAssets[0])?.label ?? selectedAssets[0])
    : t('documents.nAssets', { n: selectedAssets.length });
  const fileTypeChipValue = selectedFileTypes.length === 0 ? null
    : selectedFileTypes.length === 1 ? selectedFileTypes[0]
    : `${selectedFileTypes.length} types`;

  const fileCount = filtered.filter(i => i.type === 'file').length;
  const folderCount = filtered.filter(i => i.type === 'folder').length;

  const navigateToFolder = (folderId: string) => {
    const folderPath = buildFolderPath(folderId);
    router.push(`/operations/documents/${folderPath}`);
  };

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
                  {pageTitle}
                </Typography>
                <Typography component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '1.25rem', flexShrink: 0 }}>
                  {fileCount}{folderCount > 0 ? ` files, ${folderCount} folders` : ' files'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Group by */}
                <FilterChip
                  label={t('common.groupBy')}
                  value={GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label}
                  onClick={(e) => setGroupByMenuAnchor(e.currentTarget)}
                  neutral
                />
                <FilterDropdown
                  anchorEl={groupByMenuAnchor}
                  onClose={() => setGroupByMenuAnchor(null)}
                  options={GROUP_BY_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  value={groupBy}
                  onChange={(val) => { if (val) set('groupBy', val); }}
                  hideSearch
                />
                {/* Sort */}
                <FilterChip
                  label={t('common.sortBy')}
                  value={SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  onClick={(e) => setSortAnchor(e.currentTarget)}
                  neutral
                />
                <FilterDropdown
                  anchorEl={sortAnchor}
                  onClose={() => setSortAnchor(null)}
                  options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                  value={sortBy}
                  onChange={(val) => { if (val) set('sortBy', val); }}
                  hideSearch
                />
                {/* Search */}
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', height: 30, borderRadius: '6px',
                    border: '1px solid', borderColor: c.borderSecondary, bgcolor: c.bgPrimary,
                    px: 1, gap: 0.5,
                    '&:focus-within': { borderColor: c.brandSecondary },
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                  <InputBase
                    inputRef={searchRef}
                    value={search}
                    onChange={(e) => set('search', e.target.value)}
                    placeholder={t('documents.searchDocuments')}
                    sx={{ fontSize: '0.8rem', minWidth: 160, '& input': { p: 0, lineHeight: 1 } }}
                    endAdornment={
                      search ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => set('search', '')} sx={{ p: 0.25 }}>
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

        {/* ── Recently changed tiles (only on root) ── */}
        {isRoot && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>
                {t('documents.recentlyChanged')}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: isNarrow ? 'repeat(2, 1fr)' : `repeat(${recentlyChanged.length}, 1fr)`,
                gap: 1.5,
              }}
            >
              {recentlyChanged.map((doc) => (
                <Box
                  key={doc.id}
                  onClick={() => openDocument(doc.id)}
                  sx={{
                    border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary,
                    boxShadow: c.cardShadow, p: 2, cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: c.shadowMedium ? `0 4px 16px 0 ${c.shadowMedium}` : undefined },
                    display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, overflow: 'hidden',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <FileIcon category={doc.category} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3 }} noWrap>
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {doc.fileType} &middot; {doc.fileSize}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 'auto', minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', flexShrink: 0 }}>
                      {(() => {
                        const parts = timeAgoDayParts(doc.modifiedDate);
                        return parts.count !== undefined ? t(parts.key, { count: parts.count }) : t(parts.key);
                      })()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                      <Avatar
                        sx={{ width: 20, height: 20, bgcolor: getOwnerAvatarColor(doc.author), fontSize: '0.6rem', fontWeight: 600, flexShrink: 0 }}
                      >
                        {getFirstInitial(doc.author)}
                      </Avatar>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', minWidth: 0 }} noWrap>
                        {doc.author}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── Filters ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <FilterChip label={t('common.category')} value={categoryChipValue} onClick={(e) => setCategoryAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={categoryAnchor} onClose={() => setCategoryAnchor(null)} options={CATEGORY_OPTIONS.map(ct => ({ value: ct }))} multiple value={selectedCategories} onChange={(v) => setList('categories', v as string[])} placeholder={t('documents.searchCategories')} />
          <FilterChip label={t('common.building')} value={buildingChipValue} onClick={(e) => setBuildingAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={buildingAnchor} onClose={() => setBuildingAnchor(null)} options={allBuildings.map(b => ({ value: b }))} multiple value={selectedBuildings} onChange={(v) => setList('buildings', v as string[])} placeholder={t('documents.searchBuildings')} />
          <FilterChip label={t('assets.asset')} value={assetChipValue} onClick={(e) => setAssetAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={assetAnchor} onClose={() => setAssetAnchor(null)} options={allAssets.map(a => ({ value: a.value, label: `${a.label} · ${a.sublabel}` }))} multiple value={selectedAssets} onChange={(v) => setList('assets', v as string[])} placeholder={t('documents.searchAssets')} />
          <FilterChip label={t('documents.fileType')} value={fileTypeChipValue} onClick={(e) => setFileTypeAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={fileTypeAnchor} onClose={() => setFileTypeAnchor(null)} options={allFileTypes.map(ft => ({ value: ft }))} multiple value={selectedFileTypes} onChange={(v) => setList('fileTypes', v as string[])} placeholder={t('documents.searchFileTypes')} />
          <FilterChip label={t('common.modified')} value={modifiedRange ? getDateRangeDisplayLabel(modifiedRange) : null} onClick={() => setModifiedDialogOpen(true)} />
          <DateRangeSelector inline hideSlider dialogOpen={modifiedDialogOpen} onDialogOpenChange={setModifiedDialogOpen} value={modifiedRange || DEFAULT_DATE_RANGE} onChange={(v) => set('modifiedRange', v)} />
          <ResetFiltersButton
            show={selectedCategories.length > 0 || selectedBuildings.length > 0 || selectedAssets.length > 0 || selectedFileTypes.length > 0 || Boolean(modifiedRange)}
            onReset={() => clearKeys(['categories', 'buildings', 'assets', 'fileTypes', 'modifiedRange'])}
            sx={{ ml: 'auto' }}
          />
        </Box>

        {/* ── Content ── */}
        <Box>
          {filtered.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">{t('documents.noDocumentsFound')}</Typography>
            </Box>
          ) : (
            grouped.map((group) => (
              <Box key={group.key} sx={{ mb: groupBy !== 'none' ? 4 : 0 }}>
                {groupBy !== 'none' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }}>{group.label}</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>{group.items.length}</Typography>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                  </Box>
                )}
                <Table sx={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 44 }} />
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '8%' }} />
                  </colgroup>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, p: '8px 4px 8px 16px' }} />
                      {[t('documents.name'), t('documents.buildingsAndAssets'), t('documents.owner'), t('documents.dateModified'), t('documents.fileType'), t('documents.fileSize')].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                </Table>
                <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
                <TableContainer>
                  <Table sx={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: 44 }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                    </colgroup>
                    <TableBody>
                      {group.items.map((item) => (
                        <TableRow
                          key={item.id}
                          onClick={() => item.type === 'folder' ? navigateToFolder(item.id) : openDocument(item.id)}
                          sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                        >
                          <TableCell sx={{ width: 44, p: '8px 4px 8px 16px' }}>
                            {item.type === 'folder' ? <FolderIcon size={32} /> : <FileIcon category={item.category} size={32} />}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 320 }}>
                            <Typography variant="body2" sx={{ fontWeight: item.type === 'folder' ? 600 : 500, fontSize: '0.8125rem' }} noWrap>
                              {item.type === 'folder' ? item.name : item.title}
                            </Typography>
                            {item.type === 'file' && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.2 }}>
                                {item.category}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.type === 'file' ? (
                              <LinkedCell
                                file={item}
                                onBuildingClick={handleBuildingClick}
                                onAssetClick={handleAssetClick}
                                onOpenPopover={openLinkedPopover}
                                t={t}
                              />
                            ) : (
                              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>&mdash;</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.type === 'file' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                <Avatar
                                  sx={{ width: 24, height: 24, bgcolor: getOwnerAvatarColor(item.author), fontSize: '0.65rem', fontWeight: 600, flexShrink: 0 }}
                                >
                                  {getFirstInitial(item.author)}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', minWidth: 0 }} noWrap>
                                  {item.author}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>&mdash;</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                              {formatDate(item.modifiedDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                              {item.type === 'file' ? item.fileType : '\u2014'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                              {item.type === 'file' ? item.fileSize : `${item.itemCount} items`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Box>
              </Box>
            ))
          )}

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" disabled={page === 0} onClick={() => setNumber('page', 0, 0)} sx={{ color: 'text.secondary' }}><FirstPageIcon sx={{ fontSize: 18 }} /></IconButton>
                <IconButton size="small" disabled={page === 0} onClick={() => setNumber('page', page - 1, 0)} sx={{ color: 'text.secondary' }}><ChevronLeftIcon sx={{ fontSize: 18 }} /></IconButton>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', mx: 1 }}>
                  {page * rowsPerPage + 1} &ndash; {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length}
                </Typography>
                <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setNumber('page', page + 1, 0)} sx={{ color: 'text.secondary' }}><ChevronRightIcon sx={{ fontSize: 18 }} /></IconButton>
                <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setNumber('page', totalPages - 1, 0)} sx={{ color: 'text.secondary' }}><LastPageIcon sx={{ fontSize: 18 }} /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{t('operations.resultsPerPage')}</Typography>
                <Box onClick={(e) => setRowsPerPageAnchor(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', height: 28, borderRadius: '6px', border: '1px solid', borderColor: c.borderSecondary, bgcolor: c.bgPrimary, px: 1, gap: 0.5, cursor: 'pointer', '&:hover': { borderColor: c.borderSecondary }, transition: 'border-color 0.15s ease' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{rowsPerPage}</Typography>
                </Box>
                <FilterDropdown anchorEl={rowsPerPageAnchor} onClose={() => setRowsPerPageAnchor(null)} options={ROWS_PER_PAGE_OPTIONS.map(n => ({ value: String(n), label: String(n) }))} value={String(rowsPerPage)} onChange={(val) => { if (val) { setNumber('rowsPerPage', Number(val), 50); setNumber('page', 0, 0); } }} hideSearch />
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Linked buildings / assets popover ── */}
      <Popover
        open={Boolean(linkedAnchor && linkedFile)}
        anchorEl={linkedAnchor}
        onClose={closeLinkedPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5, minWidth: 280, maxWidth: 360, maxHeight: 420,
              border: `1px solid ${c.cardBorder}`, borderRadius: '10px',
              boxShadow: c.cardShadow, overflow: 'auto',
            },
          },
        }}
      >
        {linkedFile && (
          <Box sx={{ py: 1 }}>
            {linkedFile.buildings.length > 0 && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block', px: 1.5, py: 0.5,
                    fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: 'text.disabled',
                  }}
                >
                  {t('documents.linkedBuildings')} ({linkedFile.buildings.length})
                </Typography>
                {linkedFile.buildings.map((name) => (
                  <Box
                    key={`b-${name}`}
                    onClick={(e: React.MouseEvent) => { handleBuildingClick(e, name); closeLinkedPopover(); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                      cursor: 'pointer', '&:hover': { bgcolor: c.bgPrimaryHover },
                    }}
                  >
                    <ApartmentOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', flex: 1, minWidth: 0 }} noWrap>
                      {name}
                    </Typography>
                    <OpenInNewIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  </Box>
                ))}
              </>
            )}

            {linkedFile.assets.length > 0 && (
              <>
                {linkedFile.buildings.length > 0 && <Box sx={{ borderTop: `1px solid ${c.cardBorder}`, my: 0.5 }} />}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block', px: 1.5, py: 0.5,
                    fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: 'text.disabled',
                  }}
                >
                  {t('documents.linkedAssets')} ({linkedFile.assets.length})
                </Typography>
                {linkedFile.assets.map((a) => (
                  <Box
                    key={`a-${a.id}`}
                    onClick={(e: React.MouseEvent) => { handleAssetClick(e, a.id); closeLinkedPopover(); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                      cursor: 'pointer', '&:hover': { bgcolor: c.bgPrimaryHover },
                    }}
                  >
                    <SettingsInputAntennaIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem' }} noWrap>{a.name}</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }} noWrap>{a.building}</Typography>
                    </Box>
                    <OpenInNewIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                  </Box>
                ))}
              </>
            )}

            {linkedFile.buildings.length === 0 && linkedFile.assets.length === 0 && (
              <Typography variant="body2" sx={{ px: 1.5, py: 1, fontSize: '0.8125rem', color: 'text.disabled' }}>
                {t('documents.noLinkedItems')}
              </Typography>
            )}
          </Box>
        )}
      </Popover>
    </Container>
  );
}
