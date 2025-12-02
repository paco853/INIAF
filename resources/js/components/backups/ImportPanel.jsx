import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Sheet,
} from '@mui/joy';
import { UploadCloud, AlertTriangle } from 'lucide-react';

export default function ImportPanel({
  fileInputRef,
  importData,
  importErrors,
  importProcessing,
  triggerFilePicker,
  handleImport,
  handleFileDrag,
  handleFileSelect,
}) {
  return (
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
        onClick={triggerFilePicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFilePicker();
          }
        }}
        onDrop={handleFileDrag}
        onDragOver={(e) => e.preventDefault()}
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
            handleFileSelect(file);
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
        onClick={handleImport}
      >
        Restaurar desde JSON
      </Button>
    </Sheet>
  );
}
