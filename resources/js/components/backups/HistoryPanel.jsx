import React from 'react';
import { Box, Sheet, Stack, Typography, Divider, Button, Chip } from '@mui/joy';
import { RotateCw, Download, Trash2 } from 'lucide-react';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
  return new Intl.DateTimeFormat('es-BO', opts).format(date);
};

export default function HistoryPanel({ backups, onDownload, onDelete }) {
  return (
    <Sheet variant="outlined" className="backup-history">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <RotateCw size={18} />
        <Typography level="title-md">Historial de Backups</Typography>
      </Stack>
      <Divider />
      <Box className="history-list-wrapper">
        {backups.map((backup) => (
          <Box key={backup.nombre} className="history-item">
            <Box className="history-item-info">
              <Typography level="body-md" className="history-item-name">
                {backup.nombre ?? '—'}
              </Typography>
              <Stack direction="row" spacing={2} className="history-item-details">
                <Typography level="body-xs" className="history-item-detail">
                  {formatDateTime(backup.creado)}
                </Typography>
                <Typography level="body-xs" className="history-item-detail">
                  Tamaño: {backup.size || '—'}
                </Typography>
                <Typography level="body-xs" className="history-item-detail">
                  Usuario: {backup.usuario || '—'}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" className="history-item-actions">
              <Button
                variant="soft"
                size="sm"
                color="primary"
                startDecorator={<Download size={16} />}
                component={backup.nombre ? 'a' : 'button'}
                href={backup.nombre ? `/backups/download?file=${encodeURIComponent(backup.nombre)}` : undefined}
                download={backup.nombre || undefined}
                aria-label={`Descargar ${backup.nombre || 'backup'}`}
                onClick={() => onDownload?.(backup.nombre)}
                disabled={!backup.nombre}
                className="history-action-btn history-action-btn--download"
              >
                Descargar
              </Button>
              <Button
                variant="plain"
                size="sm"
                startDecorator={<Trash2 size={16} />}
                color="danger"
                onClick={() => onDelete(backup.nombre)}
                className="history-action-btn history-action-btn--delete"
              >
                Eliminar
              </Button>
              <Chip
                size="sm"
                variant="soft"
                color={backup.estado === 'completado' ? 'success' : 'warning'}
                className="history-item-status"
              >
                {backup.estado || 'pendiente'}
              </Chip>
            </Stack>
          </Box>
        ))}
      </Box>
    </Sheet>
  );
}
