import React from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Stack,
  Button,
  Sheet,
} from '@mui/joy';

const KpiPickerModal = ({ open, onClose, options = [], onSelect }) => {
  if (!open) return null;
  return (
    <Modal open onClose={onClose}>
      <ModalDialog layout="center" sx={{ minWidth: 340 }}>
        <ModalClose />
        <Stack spacing={1.5}>
          <Typography level="title-md">Agregar KPI</Typography>
          <Typography level="body-sm" color="neutral">
            Selecciona cuál KPI quieres mostrar.
          </Typography>
          <Sheet
            variant="soft"
            sx={{
              borderRadius: 12,
              p: 1.5,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 1,
            }}
          >
            {options.length > 0 ? options.map((opt) => (
              <Button
                key={opt.key}
                variant="outlined"
                color="neutral"
                onClick={() => onSelect(opt.key)}
                sx={{ justifyContent: 'flex-start' }}
              >
                {opt.label}
              </Button>
            )) : (
              <Typography level="body-sm" color="neutral" textAlign="center">
                No hay KPIs disponibles.
              </Typography>
            )}
          </Sheet>
          <Button variant="outlined" color="neutral" onClick={onClose}>
            Cancelar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default KpiPickerModal;
