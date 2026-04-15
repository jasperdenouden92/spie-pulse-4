'use client';

import React, { useState } from 'react';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AppTabs from '@/components/AppTabs';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import { useThemeMode } from '@/theme-mode-context';
import { useLanguage } from '@/i18n';

export default function HomeRoute() {
  const isNarrow = useMediaQuery('(max-width:960px)');
  const { themeColors: c } = useThemeMode();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState(0);
  const [buildingFilter, setBuildingFilter] = useState<null | HTMLElement>(null);
  const [ticketsFilter, setTicketsFilter] = useState<null | HTMLElement>(null);
  const [quotationsFilter, setQuotationsFilter] = useState<null | HTMLElement>(null);

  const userName = 'Marc';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? t('home.goodMorning') : currentHour < 18 ? t('home.goodAfternoon') : t('home.goodEvening');

  const recentlyVisited = [
    { id: 1, name: 'Downtown Arts Center', type: 'building', timestamp: 'Today', icon: BusinessIcon },
    { id: 2, name: 'HVAC malfunction in main office and maintenance ro...', type: 'ticket', timestamp: 'Yesterday', icon: AssignmentIcon },
    { id: 3, name: 'Leaky faucet in conference room A', type: 'ticket', timestamp: 'Yesterday', icon: AssignmentIcon },
    { id: 4, name: 'Painting of the lobby area', type: 'quotation', timestamp: 'This week', icon: DescriptionIcon },
  ];

  const metrics = [
    {
      label: t('metric.comfort'),
      icon: <SpaOutlinedIcon sx={{ fontSize: 20 }} />,
      good: 3,
      poor: 5,
      bad: 2,
      color: c.brand
    },
    {
      label: t('metric.sustainability'),
      icon: <NatureOutlinedIcon sx={{ fontSize: 20 }} />,
      good: 3,
      poor: 5,
      bad: 2,
      color: '#2e7d32'
    },
    {
      label: t('metric.maintenance'),
      icon: <BuildOutlinedIcon sx={{ fontSize: 20 }} />,
      good: 3,
      poor: 5,
      bad: 2,
      color: '#f57c00'
    },
    {
      label: t('metric.assetMonitoring'),
      icon: <SpeedOutlinedIcon sx={{ fontSize: 20 }} />,
      good: 3,
      poor: 5,
      bad: 2,
      color: '#7b1fa2'
    },
  ];

  const tickets = [
    { id: 1, title: 'HVAC malfunction in main office', status: 'Incident', date: 'Aug 9' },
    { id: 2, title: 'Leaky faucet in conference room A', status: 'Incident', date: 'Aug 9' },
    { id: 3, title: 'Broken window in the west wing', status: 'Incident', date: 'Aug 9' },
    { id: 4, title: 'Power outage in server room', status: 'Incident', date: 'Aug 9' },
  ];

  const quotations = [
    { id: 1, title: 'New lighting installation', dateRange: 'Aug 9 to Dec 10' },
    { id: 2, title: 'Roof inspection and repair', dateRange: 'Aug 9 to Dec 10' },
    { id: 3, title: 'Painting of the lobby area', dateRange: 'Aug 9 to Dec 10' },
    { id: 4, title: 'Plumbing upgrade in restrooms', dateRange: 'Aug 9 to Dec 10' },
  ];

  return (
    <Container maxWidth={false} sx={{ pb: 3, flex: 1, mt: '56px', pt: 2, px: isNarrow ? 0.5 : 3 }}>
      <Box>
        {/* Greeting Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <WbSunnyOutlinedIcon sx={{ fontSize: 24, color: '#f57c00' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {greeting}, {userName}.
            </Typography>
          </Box>
        </Box>

        {/* Recently Visited Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t('home.recentlyVisited')}
            </Typography>
            <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {recentlyVisited.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: c.brand
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: c.bgPrimaryHover,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <item.icon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {item.timestamp}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Metrics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          {metrics.map((metric, index) => (
            <Paper
              key={index}
              sx={{
                p: 2.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: metric.color
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {metric.label}
                </Typography>
                <NorthEastIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Good
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {metric.good}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Poor
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {metric.poor}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Bad
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {metric.bad}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Chart Section */}
        <Paper sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
          {/* Chart Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button
                size="small"
                startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: c.bgPrimary
                }}
              >
                {t('common.thisWeek')}
              </Button>
              <Button
                size="small"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => setBuildingFilter(e.currentTarget)}
                sx={{
                  textTransform: 'none',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: c.bgPrimary
                }}
              >
                {t('common.allBuildings')}
              </Button>
              <Menu
                anchorEl={buildingFilter}
                open={Boolean(buildingFilter)}
                onClose={() => setBuildingFilter(null)}
              >
                <MenuItem onClick={() => setBuildingFilter(null)}>{t('common.allBuildings')}</MenuItem>
                <MenuItem onClick={() => setBuildingFilter(null)}>Skyline Plaza</MenuItem>
                <MenuItem onClick={() => setBuildingFilter(null)}>Innovation Hub</MenuItem>
              </Menu>
            </Box>
            <AppTabs
              value={selectedTab}
              onChange={setSelectedTab}
              size="small"
              tabs={[
                { label: 'Building trend' },
                { label: 'Comfort trend' },
                { label: 'Asset trend' },
              ]}
            />
          </Box>

          {/* Chart Area */}
          <Box sx={{ p: 3, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: c.bgSecondary }}>
            <Typography variant="body2" color="text.secondary">
              Chart visualization would appear here
            </Typography>
          </Box>
        </Paper>

        {/* Tickets and Quotations Lists */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Tickets */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('nav.tickets')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => setTicketsFilter(e.currentTarget)}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: '0.813rem'
                  }}
                >
                  {t('common.allBuildings')}
                </Button>
                <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Box>
              <Menu
                anchorEl={ticketsFilter}
                open={Boolean(ticketsFilter)}
                onClose={() => setTicketsFilter(null)}
              >
                <MenuItem onClick={() => setTicketsFilter(null)}>{t('common.allBuildings')}</MenuItem>
                <MenuItem onClick={() => setTicketsFilter(null)}>Skyline Plaza</MenuItem>
              </Menu>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tickets.map((ticket) => (
                <Paper
                  key={ticket.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 1,
                      borderColor: c.brand
                    }
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticket.title}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: c.bgPrimaryHover,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.688rem' }}>
                      {ticket.status}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50, textAlign: 'right' }}>
                    {ticket.date}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Quotations */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('nav.quotations')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => setQuotationsFilter(e.currentTarget)}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: '0.813rem'
                  }}
                >
                  {t('common.allBuildings')}
                </Button>
                <IconButton size="small" sx={{ borderRadius: "50%", aspectRatio: 1 }}>
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Box>
              <Menu
                anchorEl={quotationsFilter}
                open={Boolean(quotationsFilter)}
                onClose={() => setQuotationsFilter(null)}
              >
                <MenuItem onClick={() => setQuotationsFilter(null)}>{t('common.allBuildings')}</MenuItem>
                <MenuItem onClick={() => setQuotationsFilter(null)}>Skyline Plaza</MenuItem>
              </Menu>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quotations.map((quotation) => (
                <Paper
                  key={quotation.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 1,
                      borderColor: c.brand
                    }
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {quotation.title}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, textAlign: 'right' }}>
                    {quotation.dateRange}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
