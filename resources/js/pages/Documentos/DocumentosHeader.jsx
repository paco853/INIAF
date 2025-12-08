import React from 'react';
import { Typography, Button, Stack, Box } from '@mui/joy';
import { Eye, Download } from 'lucide-react';

export default function DocumentosHeader({ showCharts, onToggleCharts, onOpenDownload }) {
  return (
    <Box
      sx={{
        px: { xs: 2.5, md: 4 },
        py: 3,
        background: 'transparent',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography level="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Documentos</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Gestión de análisis de semillas</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="plain"
            color="neutral"
            startDecorator={<Eye size={16} />}
            onClick={onToggleCharts}
          >
            {showCharts ? 'Ocultar Gráficas' : 'Mostrar Gráficas'}
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="primary"
            startDecorator={<Download size={16} />}
            onClick={onOpenDownload}
          >
            Descargar Reporte
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
