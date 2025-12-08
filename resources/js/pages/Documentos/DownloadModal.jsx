import React from 'react';
import {
  Modal,
  ModalDialog,
  Typography,
  Stack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
} from '@mui/joy';

export default function DownloadModal({
  open,
  onClose,
  downloadForm,
  onChangeField,
  onSubmit,
  error,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 360 }}>
        <Typography level="title-md" mb={1}>Descarga general</Typography>
        <Typography level="body-sm" mb={1}>
          Selecciona el rango para generar el PDF combinado.
        </Typography>
        <Stack spacing={1.5} component="form" onSubmit={onSubmit}>
          <FormControl>
            <FormLabel>Modo</FormLabel>
            <Select
              value={downloadForm.modo}
              onChange={onChangeField('modo')}
            >
              <Option value="nlab">Por N° de Laboratorio</Option>
              <Option value="gestion">Por Año (gestión)</Option>
            </Select>
          </FormControl>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Desde</FormLabel>
              <Input
                type={downloadForm.modo === 'gestion' ? 'number' : 'text'}
                inputMode={downloadForm.modo === 'gestion' ? 'numeric' : 'text'}
                value={downloadForm.desde}
                onChange={onChangeField('desde')}
              />
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Hasta</FormLabel>
              <Input
                type={downloadForm.modo === 'gestion' ? 'number' : 'text'}
                inputMode={downloadForm.modo === 'gestion' ? 'numeric' : 'text'}
                value={downloadForm.hasta}
                onChange={onChangeField('hasta')}
              />
            </FormControl>
          </Stack>
          {error && (
            <Typography level="body-sm" color="danger">
              {error}
            </Typography>
          )}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="neutral"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="solid" color="primary">
              Descargar
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
