import React from 'react';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import Alert from '@mui/joy/Alert';
import Typography from '@mui/joy/Typography';
import { useBackupsForm } from './hooks/useBackupsForm';
import ExportPanel from '../../components/backups/ExportPanel';
import ImportPanel from '../../components/backups/ImportPanel';
import HistoryPanel from '../../components/backups/HistoryPanel';
import '../../../css/pages/modules/backups.css';

export default function BackupsIndex() {
  const {
    backups,
    flash,
    errorMessages,
    importData,
    importProcessing,
    importErrors,
    fileInputRef,
    chooserOpen,
    handleExport,
    handleImport,
    triggerFilePicker,
    handleFileDrag,
    handleFileSelect,
    openChooser,
    closeChooser,
    exportTarget,
    setExportTarget,
    downloadBackup,
    deleteBackup,
  } = useBackupsForm();

  return (
    <Stack spacing={2} className="backups-page">
      {flash?.error && (
        <Alert color="danger" variant="soft">
          {flash.error}
        </Alert>
      )}
      {flash?.status && (
        <Alert color="success" variant="soft">
          {flash.status}
        </Alert>
      )}
      {errorMessages.length > 0 && (
        <Alert color="danger" variant="soft">
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
            Corrige los siguientes campos:
          </Typography>
          <ul className="list-compact">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} className="backups-panels">
        <ExportPanel
          openChooser={openChooser}
          closeChooser={closeChooser}
          chooserOpen={chooserOpen}
          exportTarget={exportTarget}
          setExportTarget={setExportTarget}
          handleExport={handleExport}
        />
        <ImportPanel
          fileInputRef={fileInputRef}
          importData={importData}
          importErrors={importErrors}
          importProcessing={importProcessing}
          triggerFilePicker={triggerFilePicker}
          handleImport={handleImport}
          handleFileDrag={handleFileDrag}
          handleFileSelect={handleFileSelect}
        />
      </Stack>

      <HistoryPanel
        backups={backups}
        onDownload={downloadBackup}
        onDelete={deleteBackup}
      />
    </Stack>
  );
}
