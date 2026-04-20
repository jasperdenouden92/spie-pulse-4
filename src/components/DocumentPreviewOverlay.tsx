'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import LaunchIcon from '@mui/icons-material/Launch';
import PrintIcon from '@mui/icons-material/Print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ArchitectureOutlinedIcon from '@mui/icons-material/ArchitectureOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

import type { DocumentCategory, DocumentFile } from '@/data/documents';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';
import { useAppState } from '@/context/AppStateContext';
import { handleSidePeekClick } from '@/components/SidePeekPanel';
import { buildings as allBuildings } from '@/data/buildings';
import { getAssetById } from '@/data/assetTree';
import { buildingToSlug } from '@/utils/slugs';
import { getOwnerAvatarColor, getFirstInitial } from '@/components/DocumentsList';

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export interface DocumentPreviewOverlayProps {
  file: DocumentFile | null;
  onClose: () => void;
}

export default function DocumentPreviewOverlay({ file, onClose }: DocumentPreviewOverlayProps) {
  const router = useRouter();
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const [detailsOpen, setDetailsOpen] = useState(true);
  const {
    setSidePeekBuilding, setSidePeekBuildingTab,
    setSidePeekZone,
    setSidePeekAsset, setSidePeekAssetTab,
  } = useAppState();

  useEffect(() => {
    if (!file) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [file, onClose]);

  if (!file) return null;

  const categoryColor = CATEGORY_COLORS[file.category];
  const fileName = `${file.title}.${file.fileType.toLowerCase()}`;

  const handleBuildingClick = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    handleSidePeekClick(e,
      () => {
        const b = allBuildings.find(x => x.name === name);
        if (b) { setSidePeekZone(null); setSidePeekBuilding(b); setSidePeekBuildingTab('overview'); onClose(); }
      },
      () => { onClose(); router.push(`/buildings/${buildingToSlug(name)}`); },
    );
  };

  const handleAssetClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleSidePeekClick(e,
      () => { const a = getAssetById(id); if (a) { setSidePeekAsset(a); setSidePeekAssetTab('overview'); onClose(); } },
      () => { onClose(); router.push(`/assets/${id}`); },
    );
  };

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label={fileName}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1600,
        bgcolor: 'rgba(32, 33, 36, 0.97)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top toolbar (dark) */}
      <Box sx={{
        flexShrink: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        color: '#e8eaed',
      }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px',
          bgcolor: `${categoryColor}33`,
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {CATEGORY_ICONS[file.category]}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#e8eaed', lineHeight: 1.2 }} noWrap>
            {fileName}
          </Typography>
          <Typography sx={{ color: '#9aa0a6', fontSize: '0.7rem', lineHeight: 1.2 }} noWrap>
            {file.category} &middot; {file.fileType} &middot; {file.fileSize}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Tooltip title={t('document.actionDetails')}>
            <IconButton
              size="small"
              onClick={() => setDetailsOpen(v => !v)}
              sx={{
                color: detailsOpen ? '#8ab4f8' : '#e8eaed',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('document.actionPrint')}>
            <IconButton
              size="small"
              sx={{ color: '#e8eaed', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('document.actionOpenSharePoint')}>
            <IconButton
              size="small"
              sx={{ color: '#e8eaed', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            disableElevation
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            sx={{
              ml: 0.5,
              bgcolor: c.brandSecondary,
              color: '#fff',
              textTransform: 'none',
              fontSize: '0.8125rem',
              fontWeight: 500,
              height: 32,
              px: 1.5,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              '&:hover': { bgcolor: c.brandSecondary, filter: 'brightness(1.1)' },
            }}
          >
            {t('document.actionDownload')}
          </Button>
          <Box sx={{ width: 1, height: 20, bgcolor: 'rgba(255,255,255,0.15)', mx: 1 }} />
          <Tooltip title={t('document.actionClose')}>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: '#e8eaed', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Body: preview + optional details panel */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Preview scroll area */}
        <Box
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 3,
            px: 2,
          }}
        >
          {[1, 2, 3].map(n => (
            <MockPage key={n} category={file.category} fileType={file.fileType} pageNumber={n} totalPages={3} />
          ))}
        </Box>

        {/* Details panel */}
        {detailsOpen && (
          <Box sx={{
            width: 360,
            flexShrink: 0,
            bgcolor: c.bgPrimary,
            borderLeft: `1px solid ${c.cardBorder}`,
            overflow: 'auto',
          }}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${c.cardBorder}` }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
                {t('document.detailsTitle')}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                {file.title}
              </Typography>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: categoryColor,
                bgcolor: `${categoryColor}14`,
                borderRadius: '6px',
                px: 1,
                py: 0.4,
                fontSize: '0.75rem',
                fontWeight: 500,
              }}>
                {CATEGORY_ICONS[file.category]} {file.category}
              </Box>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <MetaRow label={t('document.id')} value={file.id} monospace />
              <MetaRow label={t('document.version')} value={file.version} />
              <MetaRow label={t('document.fileType')} value={file.fileType} monospace />
              <MetaRow label={t('document.fileSize')} value={file.fileSize} />
              <MetaRow label={t('document.created')} value={formatDate(file.createdDate)} />
              <MetaRow label={t('document.modified')} value={formatDate(file.modifiedDate)} />
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block', mb: 0.75 }}>
                  {t('document.author')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: getOwnerAvatarColor(file.author), fontSize: '0.65rem', fontWeight: 600 }}>
                    {getFirstInitial(file.author)}
                  </Avatar>
                  <Typography sx={{ fontSize: '0.8125rem' }} noWrap>{file.author}</Typography>
                </Box>
              </Box>
            </Box>

            {(file.buildings.length > 0 || file.assets.length > 0) && (
              <Box sx={{ p: 2.5, borderTop: `1px solid ${c.cardBorder}` }}>
                {file.buildings.length > 0 && (
                  <Box sx={{ mb: file.assets.length > 0 ? 2 : 0 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block', mb: 1 }}>
                      {t('documents.linkedBuildings')} ({file.buildings.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {file.buildings.map(b => (
                        <Box
                          key={b}
                          onClick={(e) => handleBuildingClick(e, b)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            py: 0.75, px: 1, borderRadius: '6px', cursor: 'pointer',
                            '&:hover': { bgcolor: c.bgPrimaryHover, '& .linked-arrow': { opacity: 1 } },
                          }}
                        >
                          <ApartmentOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                          <Typography sx={{ flex: 1, minWidth: 0, fontSize: '0.8125rem' }} noWrap>{b}</Typography>
                          <OpenInNewIcon className="linked-arrow" sx={{ fontSize: 13, opacity: 0, transition: 'opacity 0.15s', color: 'text.disabled', flexShrink: 0 }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                {file.assets.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block', mb: 1 }}>
                      {t('documents.linkedAssets')} ({file.assets.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {file.assets.map(a => (
                        <Box
                          key={a.id}
                          onClick={(e) => handleAssetClick(e, a.id)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            py: 0.75, px: 1, borderRadius: '6px', cursor: 'pointer',
                            '&:hover': { bgcolor: c.bgPrimaryHover, '& .linked-arrow': { opacity: 1 } },
                          }}
                        >
                          <SettingsInputAntennaIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.8125rem' }} noWrap>{a.name}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }} noWrap>{a.building}</Typography>
                          </Box>
                          <OpenInNewIcon className="linked-arrow" sx={{ fontSize: 13, opacity: 0, transition: 'opacity 0.15s', color: 'text.disabled', flexShrink: 0 }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function MetaRow({ label, value, monospace }: { label: string; value: string; monospace?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.8125rem', fontFamily: monospace ? 'monospace' : undefined, textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}

/** Placeholder "document page" rendered in the preview area. Mimics a PDF/report page
 *  so the overlay feels real even though no actual file is loaded. */
function MockPage({ category, fileType, pageNumber, totalPages }: {
  category: DocumentCategory;
  fileType: string;
  pageNumber: number;
  totalPages: number;
}) {
  const color = CATEGORY_COLORS[category];
  return (
    <Box sx={{
      width: 'min(820px, 100%)',
      minHeight: 1060,
      bgcolor: '#fff',
      color: '#111',
      boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
      p: { xs: 4, md: 7 },
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
    }}>
      {pageNumber === 1 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ width: 120, height: 28, bgcolor: `${color}22`, borderRadius: 1 }} />
            <Box sx={{ width: 60, height: 14, bgcolor: '#eee', borderRadius: 0.5 }} />
          </Box>
          <Box sx={{ height: 3, bgcolor: color, width: '60%', mb: 2 }} />
          <Box sx={{ height: 18, bgcolor: '#eaeaea', borderRadius: 0.5, width: '75%' }} />
          <Box sx={{ height: 12, bgcolor: '#f0f0f0', borderRadius: 0.5, width: '45%', mb: 3 }} />
        </>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Box key={i} sx={{ height: 9, bgcolor: '#f0f0f0', borderRadius: 0.5, width: `${62 + ((i * 17) % 35)}%` }} />
        ))}
      </Box>
      <Box sx={{ height: 180, bgcolor: `${color}11`, borderRadius: 1, my: 2, border: `1px dashed ${color}33` }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} sx={{ height: 9, bgcolor: '#f0f0f0', borderRadius: 0.5, width: `${55 + ((i * 13) % 38)}%` }} />
        ))}
      </Box>
      <Box sx={{ mt: 'auto', pt: 5, display: 'flex', justifyContent: 'space-between', color: '#999' }}>
        <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{fileType}</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{pageNumber} / {totalPages}</Typography>
      </Box>
    </Box>
  );
}
