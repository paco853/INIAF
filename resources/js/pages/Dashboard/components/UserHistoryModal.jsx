import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Table from '@mui/joy/Table';
import Box from '@mui/joy/Box';
import { X } from 'lucide-react';

export default function UserHistoryModal({ open, onClose, entries = [] }) {
  const hasEntries = Array.isArray(entries) && entries.length > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="plain"
        size="lg"
        sx={{ minWidth: 360, maxWidth: '90vw' }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <div>
            <Typography level="h6" fontWeight="700">Historial de usuarios</Typography>
            <Typography level="body-sm" color="neutral">Últimas conexiones registradas</Typography>
          </div>
          <IconButton onClick={onClose} size="sm" variant="plain" color="neutral">
            <X size={16} />
          </IconButton>
        </Stack>
        <Box mt={2} maxHeight="60vh" sx={{ overflowY: 'auto' }}>
          <Table size="sm" aria-label="Historial de usuarios">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Tiempo Conexión</th>
                <th>Cambios Realizados (Detalle)</th>
                <th>Hora/Fecha</th>
              </tr>
            </thead>
            <tbody>
              {hasEntries ? entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <Typography fontWeight="600">{entry.user}</Typography>
                    {entry.email && (
                      <Typography level="body-xs" color="neutral">
                        {entry.email}
                      </Typography>
                    )}
                  </td>
                  <td>
                    <Typography level="body-sm">{entry.connection}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{entry.details}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{entry.timestamp}</Typography>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4}>
                    <Typography level="body-sm" textAlign="center" color="neutral">
                      No hay registros recientes.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
