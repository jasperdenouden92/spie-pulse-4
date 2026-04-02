import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DateRangeSelector, {
  PRESETS,
  parseDateRange,
  dateRangeToString,
  getDateRangeDisplayLabel,
} from './DateRangeSelector';
import { useThemeMode } from '@/theme-mode-context';

interface InlinePeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function InlinePeriodSelector({ value, onChange }: InlinePeriodSelectorProps) {
  const { themeColors: c } = useThemeMode();
  const [customAnchor, setCustomAnchor] = useState<null | HTMLElement>(null);

  const { from: currentFrom, to: currentTo } = parseDateRange(value);

  // Determine which preset (if any) matches the current value
  const activePresetIndex = PRESETS.findIndex((preset) => {
    const { from, to } = preset.getRange();
    return from.getTime() === currentFrom.getTime() && to.getTime() === currentTo.getTime();
  });

  const isCustomRange = activePresetIndex === -1;
  const customLabel = isCustomRange ? getDateRangeDisplayLabel(value) : 'Custom';

  const handlePresetClick = (preset: (typeof PRESETS)[number]) => {
    const { from, to } = preset.getRange();
    onChange(dateRangeToString(from, to));
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
      {PRESETS.map((preset, i) => {
        const isActive = i === activePresetIndex;
        return (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            onClick={() => handlePresetClick(preset)}
            sx={{
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              bgcolor: isActive ? c.bgActive : 'transparent',
              color: isActive ? c.brand : c.textSecondary,
              border: '1px solid',
              borderColor: isActive ? c.brand : c.borderSecondary,
              '&:hover': { bgcolor: isActive ? c.bgActive : c.bgPrimaryHover },
            }}
          />
        );
      })}
      <Chip
        label={customLabel}
        size="small"
        deleteIcon={<ExpandMoreIcon sx={{ fontSize: '16px !important' }} />}
        onDelete={(e) => setCustomAnchor(e.currentTarget as HTMLElement)}
        onClick={(e) => setCustomAnchor(e.currentTarget)}
        sx={{
          fontWeight: isCustomRange ? 600 : 500,
          fontSize: '0.8rem',
          cursor: 'pointer',
          bgcolor: isCustomRange ? c.bgActive : 'transparent',
          color: isCustomRange ? c.brand : c.textSecondary,
          border: '1px solid',
          borderColor: isCustomRange ? c.brand : c.borderSecondary,
          '&:hover': { bgcolor: isCustomRange ? c.bgActive : c.bgPrimaryHover },
        }}
      />
      <DateRangeSelector
        anchorEl={customAnchor}
        onClose={() => setCustomAnchor(null)}
        value={value}
        onChange={(v) => { onChange(v); }}
      />
    </Box>
  );
}
