import React from 'react';
import { Box, Stack, Typography } from '@mui/joy';
import { Doughnut } from 'react-chartjs-2';

export default function DocumentosCharts({
  totalDocuments,
  chartData,
  chartOptions,
  speciesData,
  speciesDonutData,
  speciesDonutOptions,
  onSpeciesHover,
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
      <Box
        sx={{
          flex: 1,
          borderRadius: 2,
          background: '#f8f9fd',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>Total Documentos</Typography>
        <Typography level="h3" sx={{ fontWeight: 700 }}>
          {totalDocuments.toLocaleString()}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          borderRadius: 2,
          background: '#f8f9fd',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 1 }}>
          Estado de análisis
        </Typography>
        <Box sx={{ position: 'relative', width: '100%', height: 150 }}>
          <Doughnut data={chartData} options={chartOptions} />
        </Box>
        <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 2 }}>
          <Typography level="body-xs" sx={{ color: '#34c759' }}>Aprobado</Typography>
          <Typography level="body-xs" sx={{ color: '#f24d4d' }}>Rechazado</Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          borderRadius: 2,
          background: '#f8f9fd',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
          Selecciona un segmento para ver la especie más analizada
        </Typography>
        <Box sx={{ width: 200, height: 200 }}>
          {speciesData.length === 0 ? (
            <Typography level="body-xs" sx={{ color: 'text.secondary' }}>Sin datos</Typography>
          ) : (
            <Doughnut
              data={speciesDonutData}
              options={speciesDonutOptions}
              onHover={onSpeciesHover}
            />
          )}
        </Box>
      </Box>
    </Stack>
  );
}
