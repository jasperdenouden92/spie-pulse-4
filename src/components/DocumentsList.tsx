'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import FilterChip from '@/components/FilterChip';
import FilterDropdown from '@/components/FilterDropdown';
import ResetFiltersButton from '@/components/ResetFiltersButton';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import type { DocumentFile, DocumentCategory } from '@/data/documents';

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

function FileIcon({ category, size = 32 }: { category: DocumentCategory; size?: number }) {
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const OWNER_AVATAR_COLORS = ['#c084fc', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#2dd4bf'];

export function getOwnerAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return OWNER_AVATAR_COLORS[Math.abs(hash) % OWNER_AVATAR_COLORS.length];
}

export function getFirstInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export interface DocumentsListProps {
  documents: DocumentFile[];
  hideBuildingColumn?: boolean;
  showFilters?: boolean;
  onDocumentClick?: (id: string, e?: React.MouseEvent) => void;
}

export default function DocumentsList({ documents, hideBuildingColumn, showFilters, onDocumentClick }: DocumentsListProps) {
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [fileTypeAnchor, setFileTypeAnchor] = useState<HTMLElement | null>(null);

  const allFileTypes = useMemo(() => Array.from(new Set(documents.map(d => d.fileType))).sort(), [documents]);

  const filtered = useMemo(() => {
    let list = documents;
    if (selectedCategories.length > 0) list = list.filter(d => selectedCategories.includes(d.category));
    if (selectedFileTypes.length > 0) list = list.filter(d => selectedFileTypes.includes(d.fileType));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (!hideBuildingColumn && d.buildings.some(b => b.toLowerCase().includes(q)))
      );
    }
    // Sort by modified date, newest first
    return [...list].sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate));
  }, [documents, search, selectedCategories, selectedFileTypes, hideBuildingColumn]);

  const categoryChipValue = selectedCategories.length === 0 ? null
    : selectedCategories.length === 1 ? selectedCategories[0]
    : `${selectedCategories.length} categories`;
  const fileTypeChipValue = selectedFileTypes.length === 0 ? null
    : selectedFileTypes.length === 1 ? selectedFileTypes[0]
    : `${selectedFileTypes.length} types`;

  const filterBar = showFilters ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1, flexWrap: 'wrap' }}>
      <FilterChip
        label={t('common.category')}
        value={categoryChipValue}
        onClick={(e) => setCategoryAnchor(e.currentTarget)}
        onClear={selectedCategories.length > 0 ? () => setSelectedCategories([]) : undefined}
      />
      <FilterDropdown
        anchorEl={categoryAnchor}
        onClose={() => setCategoryAnchor(null)}
        options={CATEGORY_OPTIONS.map(ct => ({ value: ct }))}
        multiple
        value={selectedCategories}
        onChange={(v) => setSelectedCategories(v as string[])}
        placeholder={t('documents.searchCategories')}
      />
      <FilterChip
        label={t('documents.fileType')}
        value={fileTypeChipValue}
        onClick={(e) => setFileTypeAnchor(e.currentTarget)}
        onClear={selectedFileTypes.length > 0 ? () => setSelectedFileTypes([]) : undefined}
      />
      <FilterDropdown
        anchorEl={fileTypeAnchor}
        onClose={() => setFileTypeAnchor(null)}
        options={allFileTypes.map(ft => ({ value: ft }))}
        multiple
        value={selectedFileTypes}
        onChange={(v) => setSelectedFileTypes(v as string[])}
        placeholder={t('documents.searchFileTypes')}
      />

      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ResetFiltersButton
          show={selectedCategories.length > 0 || selectedFileTypes.length > 0}
          onReset={() => { setSelectedCategories([]); setSelectedFileTypes([]); }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', height: 30, borderRadius: '6px', border: '1px solid', borderColor: c.borderPrimary, bgcolor: c.bgPrimary, px: 1, gap: 0.5, '&:focus-within': { borderColor: c.brandSecondary }, transition: 'border-color 0.15s ease' }}>
          <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
          <InputBase
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('documents.searchDocuments')}
            sx={{ fontSize: '0.8rem', minWidth: 140, '& input': { p: 0, lineHeight: 1 } }}
            endAdornment={search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null}
          />
        </Box>
      </Box>
    </Box>
  ) : null;

  if (filtered.length === 0) {
    return (
      <>
        {filterBar}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">{t('documents.noDocumentsFound')}</Typography>
        </Box>
      </>
    );
  }

  const colWidths = hideBuildingColumn
    ? [44, '32%', '22%', '22%', '10%', '14%']
    : [44, '35%', '18%', '14%', '14%', '8%', '11%'];

  const colgroup = (
    <colgroup>
      {colWidths.map((w, i) => (
        <col key={i} style={{ width: typeof w === 'number' ? `${w}px` : w }} />
      ))}
    </colgroup>
  );

  const headers = hideBuildingColumn
    ? [t('documents.name'), t('documents.owner'), t('documents.dateModified'), t('documents.fileType'), t('documents.fileSize')]
    : [t('documents.name'), t('common.building'), t('documents.owner'), t('documents.dateModified'), t('documents.fileType'), t('documents.fileSize')];

  return (
    <>
      {filterBar}
      <Table sx={{ tableLayout: 'fixed' }}>
        {colgroup}
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
            <TableCell sx={{ py: 1, p: '8px 4px 8px 16px' }} />
            {headers.map(h => (
              <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
      </Table>
      <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            {colgroup}
            <TableBody>
              {filtered.map((doc) => (
                <TableRow
                  key={doc.id}
                  onClick={(e) => onDocumentClick?.(doc.id, e)}
                  sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: onDocumentClick ? 'pointer' : 'default' }}
                >
                  <TableCell sx={{ width: 44, p: '8px 4px 8px 16px' }}>
                    <FileIcon category={doc.category} size={32} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
                      {doc.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.2 }}>
                      {doc.category}
                    </Typography>
                  </TableCell>
                  {!hideBuildingColumn && (
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }} noWrap>
                        {doc.buildings.join(', ')}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Avatar
                        sx={{ width: 24, height: 24, bgcolor: getOwnerAvatarColor(doc.author), fontSize: '0.65rem', fontWeight: 600, flexShrink: 0 }}
                      >
                        {getFirstInitial(doc.author)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary', minWidth: 0 }} noWrap>
                        {doc.author}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                      {formatDate(doc.modifiedDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                      {doc.fileType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {doc.fileSize}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}
