import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Sheet,
  Modal,
  ModalDialog,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/joy';
import { DatabaseBackup } from 'lucide-react';

export default function ExportPanel({
  openChooser,
  closeChooser,
  chooserOpen,
  exportTarget,
  setExportTarget,
  handleExport,
}) {
  return (
    <Sheet variant="outlined" className="backup-card backup-card--export">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          variant="soft"
          color="primary"
          size="sm"
          startDecorator={<DatabaseBackup size={16} />}
          className="badge-btn"
        >
          Base de Datos
        </Button>
      </Stack>
      <Stack spacing={0.5} sx={{ mt: 2 }}>
        <Typography level="h4">Exportar Base de Datos</Typography>
        <Typography level="body-sm" color="neutral">
          Genera un archivo .json con la información seleccionada del sistema.
        </Typography>
        <Typography level="body-sm" color="neutral" fontWeight={600}>
          Opciones: Cultivos y Variedades, Documentos registrados
        </Typography>
      </Stack>
      <Button
        className="backup-primary-btn"
        startDecorator={<DatabaseBackup size={18} />}
        color="primary"
        variant="solid"
        size="lg"
        onClick={openChooser}
      >
        Generar Nuevo Backup
      </Button>
      <Modal open={chooserOpen} onClose={closeChooser}>
        <ModalDialog>
          <Stack spacing={2}>
            <Typography level="h5">Selecciona qué exportar</Typography>
            <FormControl>
              <RadioGroup
                name="backup-target"
                value={exportTarget}
                onChange={(event) => setExportTarget(event.target.value)}
              >
                <Radio label="Cultivos y Variedades" value="cultivos" />
                <Radio label="Documentos registrados" value="documentos" />
              </RadioGroup>
            </FormControl>
            <Typography level="body-sm" color="neutral">
              Se generará un archivo JSON descargable una vez confirmado.
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="plain" onClick={closeChooser}>
                Cancelar
              </Button>
              <Button variant="solid" onClick={handleExport}>
                Confirmar exportación
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
}
