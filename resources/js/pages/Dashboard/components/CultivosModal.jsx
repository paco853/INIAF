import React from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Sheet,
  Table,
  Stack,
} from '@mui/joy';
import { formatValidezLabel } from '../../Cultivos/validezUtils';

const CultivosModal = ({ open, onClose, cultivos = [] }) => {
  if (!open) return null;
  return (
    <Modal open onClose={onClose}>
      <ModalDialog layout="center" sx={{ minWidth: 480, maxWidth: 680, p: 0, overflow: 'hidden' }}>
        <Sheet variant="plain" sx={{ p: 2.5, borderRadius: 16, boxShadow: 'lg', bgcolor: 'background.body' }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography level="title-lg" sx={{ fontWeight: 700 }}>Cultivos registrados</Typography>
              <ModalClose sx={{ position: 'relative', top: 0, right: 0 }} />
            </Stack>
            <Typography level="body-sm" color="neutral">
              Lista de especies con sus variedades y validez registrada.
            </Typography>
            <Sheet
              variant="soft"
              sx={{
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'neutral.outlinedBorder',
              }}
            >
              <Table size="sm" borderAxis="both">
                <thead>
                  <tr>
                    <th>Especie</th>
                    <th>Variedades</th>
                    <th>Validez</th>
                    <th>Cert. inicial</th>
                    <th>Cert. final</th>
                  </tr>
                </thead>
                <tbody>
                  {cultivos.length > 0 ? cultivos.map((item) => (
                    <tr key={item.cultivo}>
                      <td>{item.especie ?? item.cultivo}</td>
                      <td>{Array.isArray(item.variedades) && item.variedades.length > 0 ? item.variedades.join(', ') : '—'}</td>
                      <td>{formatValidezLabel(item.validez) || (item.validez != null ? `${item.validez} días` : '—')}</td>
                      <td>{item.certificado_inicial ?? '—'}</td>
                      <td>{item.certificado_final ?? '—'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5}>
                        <Typography level="body-sm" textAlign="center" sx={{ py: 1 }}>
                          Sin cultivos registrados.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Sheet>
          </Stack>
        </Sheet>
      </ModalDialog>
    </Modal>
  );
};

export default CultivosModal;
