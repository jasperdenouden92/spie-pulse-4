import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SecurityIcon from '@mui/icons-material/Security';
import NatureIcon from '@mui/icons-material/Nature';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { colors } from '@/colors';

interface Theme {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  metrics: {
    label: string;
    value: string;
    target?: string;
    progress?: number;
  }[];
  alerts: number;
  buildings: number;
}

export default function Themes() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const themes: Theme[] = [
    {
      id: 'energy',
      name: 'Energy',
      icon: <BoltIcon sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      bgColor: '#fff3e0',
      description: 'Energy consumption, efficiency, and sustainability metrics across your portfolio',
      metrics: [
        { label: 'Total Consumption', value: '2.4M kWh', target: '2.2M kWh', progress: 85 },
        { label: 'Cost This Month', value: '€342K', target: '€320K', progress: 88 },
        { label: 'Efficiency Score', value: '87%', progress: 87 },
        { label: 'Carbon Footprint', value: '1,240 tons', target: '1,100 tons', progress: 82 },
      ],
      alerts: 3,
      buildings: 156,
    },
    {
      id: 'access',
      name: 'Access Control',
      icon: <LockIcon sx={{ fontSize: 40 }} />,
      color: colors.brand,
      bgColor: colors.bgActive,
      description: 'Physical access, security systems, and entry management',
      metrics: [
        { label: 'Active Cards', value: '12,453' },
        { label: 'Access Points', value: '847' },
        { label: 'Unauthorized Attempts', value: '12', progress: 98 },
        { label: 'System Uptime', value: '99.8%', progress: 99.8 },
      ],
      alerts: 1,
      buildings: 134,
    },
    {
      id: 'water',
      name: 'Water Management',
      icon: <WaterDropIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe',
      description: 'Water consumption, leak detection, and conservation initiatives',
      metrics: [
        { label: 'Monthly Usage', value: '142K m³', target: '135K m³', progress: 92 },
        { label: 'Cost This Month', value: '€68K', target: '€65K', progress: 90 },
        { label: 'Active Leaks', value: '2', progress: 97 },
        { label: 'Conservation Rate', value: '15%', progress: 75 },
      ],
      alerts: 2,
      buildings: 156,
    },
    {
      id: 'climate',
      name: 'Climate Control',
      icon: <ThermostatIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      bgColor: '#ffebee',
      description: 'HVAC systems, temperature management, and indoor air quality',
      metrics: [
        { label: 'Avg Temperature', value: '21.5°C', target: '21°C', progress: 95 },
        { label: 'Air Quality Index', value: '92', progress: 92 },
        { label: 'System Efficiency', value: '84%', progress: 84 },
        { label: 'Maintenance Due', value: '8 units', progress: 90 },
      ],
      alerts: 5,
      buildings: 156,
    },
    {
      id: 'security',
      name: 'Security Systems',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
      description: 'Surveillance, alarms, and integrated security monitoring',
      metrics: [
        { label: 'Active Cameras', value: '2,341' },
        { label: 'Coverage', value: '96%', progress: 96 },
        { label: 'Incidents (7d)', value: '4' },
        { label: 'Response Time', value: '2.3 min', progress: 92 },
      ],
      alerts: 0,
      buildings: 143,
    },
    {
      id: 'sustainability',
      name: 'Sustainability',
      icon: <NatureIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      description: 'Environmental impact, green initiatives, and ESG compliance',
      metrics: [
        { label: 'ESG Score', value: '78/100', progress: 78 },
        { label: 'Renewable Energy', value: '32%', progress: 32 },
        { label: 'Waste Diverted', value: '67%', progress: 67 },
        { label: 'Green Certifications', value: '42 buildings' },
      ],
      alerts: 1,
      buildings: 156,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Themes Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 3
      }}>
        {themes.map((theme) => (
          <Card
            key={theme.id}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedTheme === theme.id ? `2px solid ${theme.color}` : `1px solid ${colors.borderSecondary}`,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                }
              }}
              onClick={() => setSelectedTheme(theme.id === selectedTheme ? null : theme.id)}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 2,
                        bgcolor: theme.bgColor,
                        color: theme.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {theme.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {theme.name}
                        </Typography>
                        {theme.alerts > 0 && (
                          <Chip
                            label={`${theme.alerts} alert${theme.alerts > 1 ? 's' : ''}`}
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.688rem' }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {theme.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {theme.buildings} buildings
                      </Typography>
                    </Box>
                  </Box>

                  {/* Metrics Grid */}
                  <Grid container spacing={2}>
                    {theme.metrics.map((metric, index) => (
                      <Grid size={6} key={index}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {metric.label}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: metric.progress ? 0.5 : 0 }}>
                            {metric.value}
                          </Typography>
                          {metric.target && (
                            <Typography variant="caption" color="text.secondary">
                              Target: {metric.target}
                            </Typography>
                          )}
                          {metric.progress !== undefined && (
                            <LinearProgress
                              variant="determinate"
                              value={metric.progress}
                              sx={{
                                mt: 1,
                                height: 6,
                                borderRadius: 1,
                                bgcolor: colors.bgSecondaryHover,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: theme.color,
                                  borderRadius: 1,
                                }
                              }}
                            />
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  sx={{
                    mt: 5,
                    borderColor: theme.color,
                    color: theme.color,
                    '&:hover': {
                      borderColor: theme.color,
                      bgcolor: theme.bgColor,
                    }
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
        ))}

        {/* Add New Theme Card */}
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px dashed',
            borderColor: colors.borderPrimary,
            bgcolor: 'rgba(250, 250, 250, 0.5)',
            '&:hover': {
              borderColor: colors.brand,
              bgcolor: 'rgba(25, 118, 210, 0.02)',
              transform: 'translateY(-4px)',
            }
          }}
          onClick={() => console.log('Create new theme')}
        >
          <CardContent sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: colors.bgPrimaryHover,
                color: '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <AddCircleOutlineIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
              Create Custom Theme
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Configure a new theme tailored to your specific operational needs and metrics
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Selected Theme Detail */}
      {selectedTheme && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Detailed View
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click on a theme card to see more detailed analytics and breakdowns here.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
