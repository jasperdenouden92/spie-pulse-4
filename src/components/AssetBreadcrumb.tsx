"use client";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AssetNode, getPathToAsset, getFirstAsset } from '@/data/assetTree';

interface AssetBreadcrumbProps {
  asset: AssetNode;
  onAssetSelect: (asset: AssetNode) => void;
}

export default function AssetBreadcrumb({ asset, onAssetSelect }: AssetBreadcrumbProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  const path = getPathToAsset(asset.id);

  // Fallback if asset isn't found in the tree (e.g. system-view duplicate)
  if (!path || path.length === 0) {
    return (
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
        {asset.name}
      </Typography>
    );
  }

  const handleSegmentClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuAnchor(event.currentTarget);
    setActiveSegmentIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setActiveSegmentIndex(null);
  };

  const handleSiblingSelect = (sibling: AssetNode) => {
    handleMenuClose();
    if (sibling.type === 'asset') {
      onAssetSelect(sibling);
    } else {
      const first = getFirstAsset(sibling);
      if (first) onAssetSelect(first);
    }
  };

  const activeSiblings =
    activeSegmentIndex !== null ? path[activeSegmentIndex].siblings : [];
  const activeNodeId =
    activeSegmentIndex !== null ? path[activeSegmentIndex].node.id : null;

  const isLastSegment = (i: number) => i === path.length - 1;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
        {path.map((segment, i) => (
          <React.Fragment key={segment.node.id}>
            {i > 0 && (
              <KeyboardArrowRightIcon
                sx={{ fontSize: 14, color: 'text.disabled', mx: 0.25, flexShrink: 0 }}
              />
            )}

            <Box
              component="button"
              onClick={(e) => handleSegmentClick(e, i)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <Typography
                variant={isLastSegment(i) ? 'h6' : 'body2'}
                component="span"
                sx={{
                  fontWeight: isLastSegment(i) ? 600 : 400,
                  fontSize: isLastSegment(i) ? '0.8rem' : '0.7rem',
                  color: isLastSegment(i) ? 'text.primary' : 'text.secondary',
                  lineHeight: 1.4,
                }}
              >
                {segment.node.name}
              </Typography>
              <UnfoldMoreIcon
                sx={{
                  fontSize: 13,
                  color: 'text.disabled',
                  flexShrink: 0,
                  mt: '1px',
                }}
              />
            </Box>
          </React.Fragment>
        ))}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        PaperProps={{
          sx: { maxHeight: 320, minWidth: 200 },
        }}
      >
        {activeSiblings.map((sibling) => {
          const isCurrent = sibling.id === activeNodeId;
          return (
            <MenuItem
              key={sibling.id}
              selected={isCurrent}
              onClick={() => handleSiblingSelect(sibling)}
              dense
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {isCurrent && <CheckIcon sx={{ fontSize: 16 }} />}
              </ListItemIcon>
              <ListItemText
                primary={sibling.name}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
