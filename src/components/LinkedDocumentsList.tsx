'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Popover from '@mui/material/Popover';
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

import { documentFiles, type DocumentCategory, type DocumentFile } from '@/data/documents';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { buildings as allBuildings } from '@/data/buildings';
import { getAssetById } from '@/data/assetTree';
import { buildingToSlug } from '@/utils/slugs';
import { useURLState } from '@/hooks/useURLState';

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

export interface LinkedDocumentsListProps {
  /** Filter scope: show documents linked to this asset id. */
  assetId?: string;
  /** Filter scope: show documents linked to this building name (directly, or via one of its assets). */
  buildingName?: string;
  /** Optional: override documents list (for tests or custom scoping). */
  docs?: DocumentFile[];
  /** Hide the "other linked items" summary cell. */
  hideOtherLinks?: boolean;
}

/**
 * Reusable table of documents filtered by an asset or a building.
 * Opens linked buildings/assets via side-peek like the main documents page.
 */
export default function LinkedDocumentsList({
  assetId,
  buildingName,
  docs,
  hideOtherLinks,
}: LinkedDocumentsListProps) {
  const router = useRouter();
  const { setURLParams } = useURLState();
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const {
    setSidePeekBuilding, setSidePeekBuildingTab,
    setSidePeekZone,
    setSidePeekAsset, setSidePeekAssetTab,
  } = useAppState();

  const scoped = useMemo<DocumentFile[]>(() => {
    const source = docs ?? documentFiles;
    let filtered = source;
    if (assetId) {
      filtered = filtered.filter(d => d.assets.some(a => a.id === assetId));
    }
    if (buildingName) {
      filtered = filtered.filter(d =>
        d.buildings.includes(buildingName) || d.assets.some(a => a.building === buildingName)
      );
    }
    return [...filtered].sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate));
  }, [docs, assetId, buildingName]);

  const handleBuildingClick = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    handleSidePeekClick(e,
      () => {
        const b = allBuildings.find(x => x.name === name);
        if (b) { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); }
      },
      () => router.push(`/buildings/${buildingToSlug(name)}`),
    );
  };

  const handleAssetClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleSidePeekClick(e,
      () => { const a = getAssetById(id); if (a) { setSidePeekAsset(a); setSidePeekAssetTab('overview'); } },
      () => router.push(`/assets/${id}`),
    );
  };

  const [otherAnchor, setOtherAnchor] = useState<HTMLElement | null>(null);
  const [otherFile, setOtherFile] = useState<DocumentFile | null>(null);
  const openOther = (e: React.MouseEvent<HTMLElement>, file: DocumentFile) => {
    e.stopPropagation();
    setOtherAnchor(e.currentTarget);
    setOtherFile(file);
  };
  const closeOther = () => { setOtherAnchor(null); setOtherFile(null); };

  const rowClick = (file: DocumentFile) => setURLParams({ doc: file.id });

  if (scoped.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('documents.noDocumentsFound')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Table sx={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 44 }} />
          <col style={{ width: '34%' }} />
          {!hideOtherLinks && <col style={{ width: '32%' }} />}
          <col style={{ width: '14%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
            <TableCell sx={{ py: 1, p: '8px 4px 8px 16px' }} />
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>
              {t('documents.name')}
            </TableCell>
            {!hideOtherLinks && (
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>
                {t('documents.buildingsAndAssets')}
              </TableCell>
            )}
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>
              {t('documents.dateModified')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>
              {t('documents.fileType')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'text.secondary', py: 1 }}>
              {t('documents.fileSize')}
            </TableCell>
          </TableRow>
        </TableHead>
      </Table>
      <Box sx={{ border: `1px solid ${c.cardBorder}`, borderRadius: '12px', bgcolor: c.bgPrimary, boxShadow: c.cardShadow, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 44 }} />
              <col style={{ width: '40%' }} />
              {!hideOtherLinks && <col style={{ width: '20%' }} />}
              <col style={{ width: '16%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <TableBody>
              {scoped.map(file => {
                // Build "other linked items" list — everything minus the current scope.
                const otherBuildings = assetId
                  ? file.buildings
                  : file.buildings.filter(b => b !== buildingName);
                const otherAssets = assetId
                  ? file.assets.filter(a => a.id !== assetId)
                  : buildingName
                    ? file.assets.filter(a => a.building !== buildingName)
                    : file.assets;
                const otherCount = otherBuildings.length + otherAssets.length;

                return (
                  <TableRow
                    key={file.id}
                    onClick={() => rowClick(file)}
                    sx={{ '&:hover': { bgcolor: c.bgPrimaryHover }, cursor: 'pointer' }}
                  >
                    <TableCell sx={{ width: 44, p: '8px 4px 8px 16px' }}>
                      <FileIcon category={file.category} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
                        {file.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1.2 }}>
                        {file.category}
                      </Typography>
                    </TableCell>
                    {!hideOtherLinks && (
                      <TableCell>
                        {otherCount === 0 ? (
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>&mdash;</Typography>
                        ) : otherCount === 1 ? (
                          <Box
                            component="span"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => openOther(e, file)}
                            sx={{
                              display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.8125rem',
                              color: 'text.secondary', cursor: 'pointer', minWidth: 0,
                              '&:hover': { color: 'text.primary' },
                            }}
                          >
                            {otherBuildings.length > 0
                              ? <ApartmentOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                              : <SettingsInputAntennaIcon sx={{ fontSize: 16, flexShrink: 0 }} />}
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                              {otherBuildings[0] ?? otherAssets[0]?.name ?? ''}
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            component="span"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => openOther(e, file)}
                            sx={{
                              display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: '0.8125rem',
                              color: 'text.secondary', cursor: 'pointer', minWidth: 0,
                              '&:hover': { color: 'text.primary' },
                            }}
                          >
                            {otherBuildings.length > 0 && (
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                <ApartmentOutlinedIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                                <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                                  {otherBuildings.length === 1
                                    ? t('documents.oneBuilding')
                                    : t('documents.nBuildings', { n: otherBuildings.length })}
                                </Box>
                              </Box>
                            )}
                            {otherAssets.length > 0 && (
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                <SettingsInputAntennaIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                                <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                                  {otherAssets.length === 1
                                    ? t('documents.oneAsset')
                                    : t('documents.nAssets', { n: otherAssets.length })}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                        {formatDate(file.modifiedDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                        {file.fileType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {file.fileSize}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Popover
        open={Boolean(otherAnchor && otherFile)}
        anchorEl={otherAnchor}
        onClose={closeOther}
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
        {otherFile && (() => {
          const shownBuildings = assetId
            ? otherFile.buildings
            : otherFile.buildings.filter(b => b !== buildingName);
          const shownAssets = assetId
            ? otherFile.assets.filter(a => a.id !== assetId)
            : buildingName
              ? otherFile.assets.filter(a => a.building !== buildingName)
              : otherFile.assets;
          return (
            <Box sx={{ py: 1 }}>
              {shownBuildings.length > 0 && (
                <>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block', px: 1.5, py: 0.5,
                      fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                      color: 'text.disabled',
                    }}
                  >
                    {t('documents.linkedBuildings')} ({shownBuildings.length})
                  </Typography>
                  {shownBuildings.map(name => (
                    <Box
                      key={`b-${name}`}
                      onClick={(e: React.MouseEvent) => { handleBuildingClick(e, name); closeOther(); }}
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

              {shownAssets.length > 0 && (
                <>
                  {shownBuildings.length > 0 && <Box sx={{ borderTop: `1px solid ${c.cardBorder}`, my: 0.5 }} />}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block', px: 1.5, py: 0.5,
                      fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                      color: 'text.disabled',
                    }}
                  >
                    {t('documents.linkedAssets')} ({shownAssets.length})
                  </Typography>
                  {shownAssets.map(a => (
                    <Box
                      key={`a-${a.id}`}
                      onClick={(e: React.MouseEvent) => { handleAssetClick(e, a.id); closeOther(); }}
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
            </Box>
          );
        })()}
      </Popover>
    </Box>
  );
}
