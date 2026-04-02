'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppTabs from './AppTabs';

function BmsPage() {
  const [tab, setTab] = useState('access');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'access', label: 'Access' },
          { value: 'logging', label: 'Logging' },
        ]}
      />

      {tab === 'access' && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Access
          </Typography>
        </Box>
      )}

      {tab === 'logging' && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Logging
          </Typography>
        </Box>
      )}
    </Box>
  );
}


export default React.memo(BmsPage);
