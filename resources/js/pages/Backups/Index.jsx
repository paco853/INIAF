import React from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Sheet,
  Divider,
  Chip,
  IconButton,
  Modal,
  ModalDialog,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/joy';
import {
  DatabaseBackup,
  UploadCloud,
  AlertTriangle,
  RotateCw,
  Download,
  Trash2,
  FileText,
} from 'lucide-react';
import '../../../css/pages/modules/backups.css';

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

export default function BackupsIndex() {
  const { props } = usePage();
  const backups = props?.backups || [];
  const exportForm = useForm({
    target: 'cultivos',
  });
  const {
    data: importData,
    setData: setImportData,
    post: postImport,
    processing: importProcessing,
    errors: importErrors,
    reset: resetImport,
  } = useForm({
    file: null,
  });
  const fileInputRef = React.useRef(null);
  const [chooserOpen, setChooserOpen] = React.useState(false);
  const backupTarget = exportForm.data.target;

  const handleExport = React.useCallback(() => {
    exportForm.post('/backups/generate', {
      onSuccess: () => setChooserOpen(false),
    });
  }, [exportForm]);

  return (
    <Stack spacing={2} className="backups-page">
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} className="backups-panels">
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
            onClick={() => setChooserOpen(true)}
          >
            Generar Nuevo Backup
          </Button>
        </Sheet>

        <Sheet variant="outlined" className="backup-card backup-card--import">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              variant="soft"
              color="danger"
              size="sm"
              startDecorator={<AlertTriangle size={16} />}
              className="badge-btn badge-btn--danger"
            >
              Zona de Peligro
            </Button>
          </Stack>

          <Stack spacing={0.5} sx={{ mt: 2 }}>
            <Typography level="h4">Restaurar Base de Datos</Typography>
            <Typography level="body-sm" color="neutral">
              Sube un archivo .json para restaurar el sistema.
            </Typography>
            <Typography level="body-sm" color="danger">
              Advertencia: Esto reemplazará los datos actuales.
            </Typography>
          </Stack>

          <Box
            className="upload-dropzone"
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <UploadCloud size={28} />
            <Typography level="body-sm" sx={{ mt: 0.5 }}>
              {importData.file ? importData.file.name : 'Click o arrastra archivo aquí'}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setImportData('file', file || null);
              }}
            />
          </Box>
          {importErrors.file && (
            <Typography level="body-sm" color="danger">
              {importErrors.file}
            </Typography>
          )}
          <Button
            variant="solid"
            color="danger"
            startDecorator={<UploadCloud size={18} />}
            disabled={!importData.file || importProcessing}
            onClick={() => {
              postImport('/backups/import', {
                forceFormData: true,
                onSuccess: () => {
                  resetImport('file');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                },
              });
            }}
          >
            Restaurar desde JSON
          </Button>
        </Sheet>
      </Stack>

      <Sheet variant="outlined" className="backup-history">
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <RotateCw size={18} />
          <Typography level="title-md">Historial de Backups</Typography>
        </Stack>
        <Divider />

        <Box className="history-header">
          <Typography level="body-xs" className="history-col">NOMBRE DE ARCHIVO</Typography>
          <Typography level="body-xs" className="history-col">FECHA DE CREACIÓN</Typography>
          <Typography level="body-xs" className="history-col">TAMAÑO</Typography>
          <Typography level="body-xs" className="history-col">USUARIO</Typography>
          <Typography level="body-xs" className="history-col">ESTADO</Typography>
          <Typography level="body-xs" className="history-col history-col--actions">ACCIONES</Typography>
        </Box>

        <Stack spacing={1}>
          {backups.map((item, idx) => (
            <Box key={idx} className="history-row">
              <Box className="history-col history-col--file">
                <FileText size={18} />
                <Typography level="body-sm">{item.nombre}</Typography>
              </Box>
              <Typography level="body-sm" className="history-col">
                {formatDateTime(item.creado)}
              </Typography>
              <Typography level="body-sm" className="history-col">
                {item.size ?? '—'}
              </Typography>
              <Typography level="body-sm" className="history-col">
                {item.usuario ?? '—'}
              </Typography>
              <Box className="history-col">
                <Chip size="sm" variant="soft" color={statusColor(item.estado)}>
                  {item.estado ?? '—'}
                </Chip>
              </Box>
              <Box className="history-col history-col--actions">
                <Button
                  size="sm"
                  variant="outlined"
                  color="primary"
                  startDecorator={<Download size={16} />}
                  component="a"
                  href={`/backups/download?file=${encodeURIComponent(item.nombre)}`}
                >
                  Descargar
                </Button>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={() => {
                    if (confirm(`¿Eliminar backup "${item.nombre}"?`)) {
                      router.delete('/backups/delete', {
                        data: { file: item.nombre },
                      });
                    }
                  }}
                  sx={{ ml: 0.5 }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            </Box>
          ))}
          {backups.length === 0 && (
            <Typography level="body-sm" color="neutral" sx={{ mt: 1 }}>
              Aún no hay backups registrados.
            </Typography>
          )}
        </Stack>
      </Sheet>

      <Modal open={chooserOpen} onClose={() => setChooserOpen(false)}>
        <ModalDialog sx={{ minWidth: 360 }}>
          <Stack spacing={1.5}>
            <Typography level="title-lg">Seleccionar tipo de backup</Typography>
            <Typography level="body-sm" color="neutral">
              ¿Qué deseas exportar?
            </Typography>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>Opciones</FormLabel>
              <RadioGroup
                value={backupTarget}
                onChange={(e) => exportForm.setData('target', e.target.value)}
                sx={{ gap: 1 }}
              >
                <Radio value="cultivos" label="Cultivos y Variedades" variant="soft" />
                <Radio
                  value="documentos"
                  label="Documentos registrados"
                  variant="soft"
                />
              </RadioGroup>
            </FormControl>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" color="neutral" onClick={() => setChooserOpen(false)}>
                Cancelar
              </Button>
              <Button variant="solid" color="primary" onClick={handleExport} disabled={exportForm.processing}>
                Continuar
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
