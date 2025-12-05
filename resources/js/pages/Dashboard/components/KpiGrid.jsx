import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
} from '@mui/joy';

const addAlpha = (hex, opacity) => {
  if (!hex) return hex;
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;
  const alphaHex = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${expanded}${alphaHex}`;
};

const KpiGrid = ({ items }) => (
  <Grid container spacing={2}>
    {items.map((item) => (
      <Grid xs={12} sm={6} key={item.key}>
        <Card
          className="dashboard-card"
          variant="soft"
          color="neutral"
          sx={{
            height: '100%',
            cursor: item.onClick && !item.disabled ? 'pointer' : 'default',
            opacity: item.disabled ? 0.6 : 1,
            position: 'relative',
            background: addAlpha(item.color || '#1f2937', 0.08),
            border: `1px solid ${addAlpha(item.color || '#1f2937', 0.3)}`,
          }}
          onClick={item.disabled ? undefined : item.onClick}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography level="body-sm" sx={{ color: '#6b7280' }}>
                {item.label}
              </Typography>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.iconBg || 'neutral.softBg',
                  color: item.iconColor || 'inherit',
                  fontSize: 18,
                }}
              >
                {item.iconNode ?? item.icon}
              </Box>
            </Stack>
            <Typography level="h2" sx={{ color: item.color, mt: 1 }}>
              {item.value}
            </Typography>
            {item.subtitle && (
              <Typography level="body-xs" sx={{ color: '#047857', mt: 0.5 }}>
                {item.subtitle}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default KpiGrid;
