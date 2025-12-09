import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Sheet,
  Box,
} from '@mui/joy';

const WeeklySummary = ({ data = [], colors, activeSlice, setActiveSlice }) => {
  const totalSamples = React.useMemo(
    () => data.reduce((sum, item) => sum + (item.total || 0), 0) || 0,
    [data],
  );

  const palette = React.useMemo(() => (
    data.map((_, idx) => {
      if (Array.isArray(colors) && colors[idx]) {
        return colors[idx];
      }
      const hue = (idx * 137.508) % 360;
      return `hsl(${hue} 70% 55%)`;
    })
  ), [data.length, colors]);

  if (!data.length) {
    return (
      <Card variant="outlined" sx={{ height: '100%', width: '100%' }}>
        <CardContent>
          <Typography level="title-md" sx={{ mb: 1 }}>Resumen semanal de análisis</Typography>
          <Sheet variant="soft" sx={{ p: 2, borderRadius: 12, textAlign: 'center' }}>
            <Typography level="body-sm" color="neutral">Sin datos para el filtro seleccionado.</Typography>
          </Sheet>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', width: '100%' }}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="title-md">Resumen semanal de análisis</Typography>
          <Typography level="body-sm" color="neutral">
            {totalSamples} muestras
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flex: 1, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Box className="dashboard-chart" sx={{ position: 'relative', width: 180, height: 180 }}>
            {(() => {
              const total = totalSamples || 0;
              let offset = 0;
              return (
                <svg width="180" height="180" viewBox="0 0 36 36">
                  {data.map((item, idx) => {
                    const value = item.total || 0;
                    const dash = total > 0 ? (value / total) * 100 : 0;
                    const handleSelect = () => {
                      setActiveSlice((prev) => (prev?.cultivo === item.cultivo ? null : item));
                    };
                    const circle = (
                      <circle
                        key={item.cultivo}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke={palette[idx]}
                        strokeWidth="4"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={offset}
                        onClick={handleSelect}
                        onMouseEnter={() => setActiveSlice(item)}
                        onMouseLeave={() => setActiveSlice((prev) => (prev?.cultivo === item.cultivo ? prev : null))}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                    offset -= dash;
                    return circle;
                  })}
                </svg>
              );
            })()}
            <Sheet
              variant="soft"
              sx={{
                position: 'absolute',
                inset: '32%',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: 1,
              }}
            >
              {activeSlice ? (
                <>
                  <Typography level="body-xs" color="neutral">
                    {activeSlice.cultivo}
                  </Typography>
                  <Typography level="h4" sx={{ fontWeight: 800 }}>
                    {activeSlice.total ?? 0}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography level="body-xs" color="neutral">Total</Typography>
                  <Typography level="h4" sx={{ fontWeight: 800 }}>
                    {totalSamples}
                  </Typography>
                </>
              )}
            </Sheet>
          </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 180,
                maxWidth: 240,
                maxHeight: 260,
                overflowY: data.length > 5 ? 'auto' : 'visible',
                pr: data.length > 5 ? 1 : 0,
              }}
            >
              <Stack spacing={0.75}>
                {data.map((item, idx) => {
                  const color = palette[idx];
                  const selected = activeSlice?.cultivo === item.cultivo;
                  const percent = totalSamples > 0 ? Math.round(((item.total || 0) / totalSamples) * 100) : 0;
                  return (
                    <Sheet
                      className="dashboard-species"
                      key={item.cultivo}
                      variant={selected ? 'soft' : 'plain'}
                      color={selected ? 'primary' : 'neutral'}
                      sx={{
                        p: 0.75,
                        borderRadius: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid',
                        borderColor: selected ? 'primary.softHoverBg' : 'neutral.outlinedBorder',
                      }}
                      onClick={() => setActiveSlice((prev) => (prev?.cultivo === item.cultivo ? null : item))}
                      onMouseEnter={() => setActiveSlice(item)}
                      onMouseLeave={() => setActiveSlice((prev) => (prev?.cultivo === item.cultivo ? prev : null))}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography level="body-sm" sx={{ flex: 1, fontWeight: 600 }}>
                        {item.cultivo}
                      </Typography>
                      <Typography level="body-sm" color="neutral">{percent}%</Typography>
                      <Typography level="title-sm" sx={{ fontWeight: 800 }}>
                        {item.total}
                      </Typography>
                    </Sheet>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
    </Card>
  );
};

export default WeeklySummary;
