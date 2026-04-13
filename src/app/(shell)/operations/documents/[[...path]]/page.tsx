'use client';

import React, { use, useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
import DateRangeSelector, { parseDateRange, getDateRangeDisplayLabel } from '@/components/DateRangeSelector';
import PageHeader from '@/components/PageHeader';
import { documentFolders, documentFiles, allDocumentItems, resolveFolderPath, buildFolderPath } from '@/data/documents';
import type { DocumentFile, DocumentFolder, DocumentItem, DocumentCategory } from '@/data/documents';

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

type SortKey = 'modified_desc' | 'modified_asc' | 'name' | 'building' | 'category' | 'type';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'modified_desc', label: 'Modified (newest first)' },
  { value: 'modified_asc', label: 'Modified (oldest first)' },
  { value: 'name', label: 'Name (A \u2192 Z)' },
  { value: 'building', label: 'Building (A \u2192 Z)' },
  { value: 'category', label: 'Category' },
  { value: 'type', label: 'File type' },
];

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
      case 'building': {
        const ab = a.type === 'file' ? a.building : '';
        const bb = b.type === 'file' ? b.building : '';
        return ab.localeCompare(bb);
      }
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

function timeAgo(dateStr: string): string {
  const now = new Date('2024-01-24');
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

const DEFAULT_DATE_RANGE = `2023-01-01|${new Date().toISOString().split('T')[0]}`;

type GroupByKey = 'none' | 'building' | 'category';
const GROUP_BY_OPTIONS: { value: GroupByKey; label: string }[] = [
  { value: 'none', label: 'No grouping' },
  { value: 'building', label: 'Building' },
  { value: 'category', label: 'Category' },
];

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

// ── Main component ──

export default function OperationsDocumentsRoute({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path: pathSegments = [] } = use(params);
  const router = useRouter();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { themeColors: c } = useThemeMode();

  const { get, set, getList, setList, getNumber, setNumber } = useFilterParams();

  // Resolve current folder from URL path
  const currentFolder = useMemo(() => {
    if (pathSegments.length === 0) return null;
    return resolveFolderPath(pathSegments);
  }, [pathSegments]);
  const currentFolderId = currentFolder?.id ?? null;
  const isRoot = currentFolderId === null;

  // Page title
  const pageTitle = currentFolder ? currentFolder.name : 'Documents';

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
  const selectedFileTypes = getList('fileTypes');
  const [fileTypeAnchor, setFileTypeAnchor] = useState<HTMLElement | null>(null);
  const modifiedRange = get('modifiedRange', '');
  const [modifiedDialogOpen, setModifiedDialogOpen] = useState(false);

  // Derived option lists
  const allBuildings = useMemo(() => Array.from(new Set(documentFiles.map(d => d.building))).sort(), []);
  const allFileTypes = useMemo(() => Array.from(new Set(documentFiles.map(d => d.fileType))).sort(), []);

  // Items in current folder, filtered + searched + sorted
  const filtered = useMemo<DocumentItem[]>(() => {
    let items: DocumentItem[] = allDocumentItems.filter(item => item.parentId === currentFolderId);

    const hasFilters = selectedCategories.length > 0 || selectedBuildings.length > 0 || selectedFileTypes.length > 0 || modifiedRange || search.trim();

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
        if (selectedBuildings.length > 0 && !selectedBuildings.includes(item.building)) return false;
        if (selectedFileTypes.length > 0 && !selectedFileTypes.includes(item.fileType)) return false;
        if (modifiedRange) {
          const { from, to } = parseDateRange(modifiedRange);
          const fromStr = from.toISOString().split('T')[0];
          const toStr = to.toISOString().split('T')[0];
          if (item.modifiedDate < fromStr || item.modifiedDate > toStr) return false;
        }
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          if (
            !item.id.toLowerCase().includes(q) &&
            !item.title.toLowerCase().includes(q) &&
            !item.building.toLowerCase().includes(q) &&
            !item.author.toLowerCase().includes(q) &&
            !item.category.toLowerCase().includes(q)
          ) return false;
        }
        return true;
      });
    }

    return sortItems(items, sortBy);
  }, [currentFolderId, selectedCategories, selectedBuildings, selectedFileTypes, modifiedRange, search, sortBy]);

  // Reset page when filters/search/folder change
  const buildingsStr = get('buildings', '');
  const categoriesStr = get('categories', '');
  const fileTypesStr = get('fileTypes', '');
  useEffect(() => setNumber('page', 0, 0), [buildingsStr, categoriesStr, fileTypesStr, modifiedRange, search, sortBy, currentFolderId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const map = new Map<string, DocumentItem[]>();
    if (folders.length > 0) map.set('Folders', folders);
    for (const f of files) {
      const key = groupBy === 'building' ? f.building : f.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    return Array.from(map.entries())
      .sort((a, b) => {
        if (a[0] === 'Folders') return -1;
        if (b[0] === 'Folders') return 1;
        return a[0].localeCompare(b[0]);
      })
      .map(([key, items]) => ({ key, label: key, items }));
  }, [paginatedItems, groupBy]);

  // Chip value labels
  const categoryChipValue = selectedCategories.length === 0 ? null
    : selectedCategories.length === 1 ? selectedCategories[0]
    : `${selectedCategories.length} categories`;
  const buildingChipValue = selectedBuildings.length === 0 ? null
    : selectedBuildings.length === 1 ? selectedBuildings[0]
    : `${selectedBuildings.length} buildings`;
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
                  label="Group by"
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
                  label="Sort"
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
                    placeholder="Search documents..."
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
                Recently changed
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      {timeAgo(doc.modifiedDate)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      {doc.author}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── Filters ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <FilterChip label="Category" value={categoryChipValue} onClick={(e) => setCategoryAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={categoryAnchor} onClose={() => setCategoryAnchor(null)} options={CATEGORY_OPTIONS.map(ct => ({ value: ct }))} multiple value={selectedCategories} onChange={(v) => setList('categories', v as string[])} placeholder="Search categories..." />
          <FilterChip label="Building" value={buildingChipValue} onClick={(e) => setBuildingAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={buildingAnchor} onClose={() => setBuildingAnchor(null)} options={allBuildings.map(b => ({ value: b }))} multiple value={selectedBuildings} onChange={(v) => setList('buildings', v as string[])} placeholder="Search buildings..." />
          <FilterChip label="File type" value={fileTypeChipValue} onClick={(e) => setFileTypeAnchor(e.currentTarget)} />
          <FilterDropdown anchorEl={fileTypeAnchor} onClose={() => setFileTypeAnchor(null)} options={allFileTypes.map(t => ({ value: t }))} multiple value={selectedFileTypes} onChange={(v) => setList('fileTypes', v as string[])} placeholder="Search file types..." />
          <FilterChip label="Modified" value={modifiedRange ? getDateRangeDisplayLabel(modifiedRange) : null} onClick={() => setModifiedDialogOpen(true)} />
          <DateRangeSelector inline hideSlider dialogOpen={modifiedDialogOpen} onDialogOpenChange={setModifiedDialogOpen} value={modifiedRange || DEFAULT_DATE_RANGE} onChange={(v) => set('modifiedRange', v)} />
        </Box>

        {/* ── Content ── */}
        <Box>
          {filtered.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No documents match the current filters</Typography>
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
                    <col style={{ width: '35%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '8%' }} />
                  </colgroup>
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1, p: '8px 4px 8px 16px' }} />
                      {['Name', 'Building', 'Owner', 'Date modified', 'File type', 'File size'].map(h => (
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
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                    </colgroup>
                    <TableBody>
                      {group.items.map((item) => (
                        <TableRow
                          key={item.id}
                          onClick={() => item.type === 'folder' ? navigateToFolder(item.id) : undefined}
                          sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                        >
                          <TableCell sx={{ width: 44, p: '8px 4px 8px 16px' }}>
                            {item.type === 'folder' ? <FolderIcon size={32} /> : <FileIcon category={item.category} size={32} />}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
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
                              <Box component="span" onClick={(e: React.MouseEvent) => { e.stopPropagation(); }} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, fontSize: '0.8125rem', color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary', '& .building-arrow': { opacity: 1 } } }}>
                                {item.building}
                                <OpenInNewIcon className="building-arrow" sx={{ fontSize: 13, ml: 0.25, opacity: 0, transition: 'opacity 0.15s' }} />
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>&mdash;</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                              {item.type === 'file' ? item.author : '\u2014'}
                            </Typography>
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
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Results per page:</Typography>
                <Box onClick={(e) => setRowsPerPageAnchor(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', height: 28, borderRadius: '6px', border: '1px solid', borderColor: c.borderSecondary, bgcolor: c.bgPrimary, px: 1, gap: 0.5, cursor: 'pointer', '&:hover': { borderColor: c.borderSecondary }, transition: 'border-color 0.15s ease' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>{rowsPerPage}</Typography>
                </Box>
                <FilterDropdown anchorEl={rowsPerPageAnchor} onClose={() => setRowsPerPageAnchor(null)} options={ROWS_PER_PAGE_OPTIONS.map(n => ({ value: String(n), label: String(n) }))} value={String(rowsPerPage)} onChange={(val) => { if (val) { setNumber('rowsPerPage', Number(val), 50); setNumber('page', 0, 0); } }} hideSearch />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
