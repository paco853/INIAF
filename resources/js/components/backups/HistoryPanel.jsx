import React from 'react';
import { Box, Sheet, Stack, Typography, Divider, Button, Chip, Table } from '@mui/joy';
import { RotateCw, Download, Trash2 } from 'lucide-react';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
  return new Intl.DateTimeFormat('es-BO', opts).format(date);
};

const statusColor = (estado) => {
  if (estado === 'completado') return 'success';
  if (estado === 'error') return 'danger';
  return 'neutral';
};

export default function HistoryPanel({ backups, onDownload, onDelete }) {
  return (
    <Sheet variant="outlined" className="backup-history">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <RotateCw size={18} />
        <Typography level="title-md">Historial de Backups</Typography>
      </Stack>
      <Divider />
      <Box className="history-table-wrapper">
        <Table className="history-table">
          <thead>
            <tr>
              <th>NOMBRE DE ARCHIVO</th>
              <th>FECHA DE CREACIÓN</th>
              <th>TAMAÑO</th>
              <th>USUARIO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup) => (
              <tr key={backup.nombre} className="history-row">
                <td className="history-col history-col--name">{backup.nombre ?? '—'}</td>
                <td className="history-col history-col--date">{formatDateTime(backup.creado)}</td>
                <td className="history-col history-col--size">{backup.size || '—'}</td>
                <td className="history-col history-col--user">{backup.usuario || '—'}</td>
                <td className="history-col history-col--status">
                  <Chip color={statusColor(backup.estado)} size="sm" variant="soft">
                    {backup.estado || 'pendiente'}
                  </Chip>
                </td>
                <td className="history-col history-col--actions">
                  <Button
                    variant="plain"
                    size="sm"
                    startDecorator={<Download size={16} />}
                    onClick={() => onDownload(backup.nombre)}
                  >
                    Descargar
                  </Button>
                  <Button
                    variant="plain"
                    size="sm"
                    startDecorator={<Trash2 size={16} />}
                    color="danger"
                    onClick={() => onDelete(backup.nombre)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Sheet>
  );
}
