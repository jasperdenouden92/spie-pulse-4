'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface HomeSectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  /** Shows an info icon after the label; on hover reveals this text as a tooltip. */
  infoTooltip?: string;
  action?: React.ReactNode;
}

export default function HomeSectionHeader({ icon, label, sublabel, infoTooltip, action }: HomeSectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, minHeight: 28 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', '& .MuiSvgIcon-root': { fontSize: 16 } }}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary' }} noWrap>
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }} noWrap>
            {sublabel}
          </Typography>
        )}
        {infoTooltip && (
          <Tooltip title={infoTooltip} arrow>
            <InfoOutlinedIcon
              sx={{
                fontSize: 14,
                color: 'text.disabled',
                cursor: 'help',
                '&:hover': { color: 'text.secondary' },
              }}
            />
          </Tooltip>
        )}
      </Box>
      {action}
    </Box>
  );
}
