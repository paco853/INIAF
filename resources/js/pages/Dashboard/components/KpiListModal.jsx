import React from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Sheet,
  Table,
  Box,
  FormControl,
  FormLabel,
  Input,
} from '@mui/joy';
import EstadoBadge from './EstadoBadge.jsx';

const KpiListModal = ({ open, title, rows = [], onClose }) => {
  if (!open) return null;
  const [search, setSearch] = React.useState('');

  const filteredRows = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => (row.especie || '').toLowerCase().includes(term));
  }, [rows, search]);
  return (
    <Modal open onClose={onClose}>
      <ModalDialog layout="center" sx={{ width: '90%', maxWidth: 720, p: 0, overflow: 'hidden' }}>
        <ModalClose sx={{ m: 1 }} />
        <Box sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 1.5 }}>
            <Typography level="title-lg" sx={{ fontWeight: 700 }}>{title}</Typography>
          </Box>
          <Sheet variant="soft" sx={{ p: 0 }}>
            <Box sx={{ px: 3, py: 1 }}>
              <FormControl>
                <FormLabel>Buscar especie</FormLabel>
                <Input
                  placeholder="e.g. Maíz"
                  size="sm"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  autoComplete="off"
                />
              </FormControl>
            </Box>
            <Box sx={{ height: '60vh', overflowY: 'auto' }}>
              <Table size="sm" borderAxis="both" className="kpi-list-table">
              <thead>
                <tr>
                  <th>N° Lab</th>
                  <th>Especie</th>
                  <th>Cooperador</th>
                  <th>Municipio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.nlab}</td>
                    <td>{row.especie}</td>
                    <td>{row.cooperador}</td>
                    <td>{row.municipio || '-'}</td>
                    <td><EstadoBadge estado={row.estado} /></td>
                    <td>{row.fecha}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6}>
                      <Typography level="body-sm" textAlign="center" sx={{ py: 2 }}>
                        No se encontraron registros.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
              </Table>
            </Box>
          </Sheet>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default KpiListModal;
