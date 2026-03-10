import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import SearchModal from '@/components/SearchModal';

interface HeaderProps {
  hasRightSidebar?: boolean;
  leftSidebarWidth?: number;
  rightSidebarWidth?: number;
  onPageChange?: (page: string) => void;
}

export default function Header({ hasRightSidebar = false, leftSidebarWidth = 280, rightSidebarWidth = 64, onPageChange }: HeaderProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        height: 56,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        zIndex: 1200,
        left: leftSidebarWidth,
        width: `calc(100% - ${leftSidebarWidth}px - ${rightSidebarWidth}px)`,
        transition: 'left 0.3s ease, width 0.3s ease'
      }}
    >
      <Toolbar sx={{
        minHeight: '56px !important',
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}>
        {/* Left spacer to balance layout */}
        <Box sx={{ width: 120 }} />

        {/* Center search bar */}
        <TextField
          placeholder="Search..."
          size="small"
          onClick={() => setSearchModalOpen(true)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
            readOnly: true
          }}
          sx={{
            width: '100%',
            maxWidth: 400,
            cursor: 'pointer',
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f5f5f5',
              cursor: 'pointer',
              '& fieldset': {
                borderColor: 'transparent'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.23)'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main'
              }
            },
            '& input': {
              cursor: 'pointer',
              paddingLeft: '2px'
            }
          }}
        />

        {/* Right spacer to balance layout */}
        <Box sx={{ width: 120 }} />
      </Toolbar>

      {/* Search Modal */}
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} onNavigate={onPageChange} />
    </AppBar>
  );
}
