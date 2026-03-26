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
import { colors } from '@/colors';

interface InlinePeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function InlinePeriodSelector({ value, onChange }: InlinePeriodSelectorProps) {
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
              bgcolor: isActive ? colors.bgActive : 'transparent',
              color: isActive ? colors.brand : colors.textSecondary,
              border: '1px solid',
              borderColor: isActive ? colors.brand : colors.borderSecondary,
              '&:hover': { bgcolor: isActive ? colors.bgActive : colors.bgPrimaryHover },
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
          bgcolor: isCustomRange ? colors.bgActive : 'transparent',
          color: isCustomRange ? colors.brand : colors.textSecondary,
          border: '1px solid',
          borderColor: isCustomRange ? colors.brand : colors.borderSecondary,
          '&:hover': { bgcolor: isCustomRange ? colors.bgActive : colors.bgPrimaryHover },
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
