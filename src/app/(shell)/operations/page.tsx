'use client';

import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useThemeMode } from '@/theme-mode-context';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
  {
    path: '/operations/tickets',
    label: 'Tickets',
    description: 'Work orders, corrective and preventive tasks',
    icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#ff9800',
  },
  {
    path: '/operations/quotations',
    label: 'Quotations',
    description: 'Pending quotes, approvals and cost overviews',
    icon: <RequestQuoteOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#9c27b0',
  },
  {
    path: '/operations/documents',
    label: 'Documents',
    description: 'Contracts, reports, manuals and certificates',
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#2196f3',
  },
  {
    path: '/operations/maintenance',
    label: 'Maintenance',
    description: 'Scheduled maintenance plans and completion tracking',
    icon: <EngineeringOutlinedIcon sx={{ fontSize: 24 }} />,
    color: '#4caf50',
  },
];

export default function OperationsRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { themeColors: c } = useThemeMode();
  const router = useRouter();

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 }}>
            Operations
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
          {MENU_ITEMS.map((item) => (
            <Box
              key={item.path}
              component="button"
              onClick={() => router.push(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: '12px',
                bgcolor: c.bgPrimary,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: `0 2px 8px 0 ${c.shadow}`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 16px 0 ${c.shadow}`,
                  borderColor: `${item.color}60`,
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '10px',
                  bgcolor: `${item.color}14`,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 0.25 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.4 }}>
                  {item.description}
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
