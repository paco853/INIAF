import React from 'react';
import { useForm, usePage, router } from '@inertiajs/react';

const COMPUTE_URL = '/backups/generate';
const IMPORT_URL = '/backups/import';
const RESET_URL = '/backups/reset';
const DOWNLOAD_URL = '/backups/download';
const DELETE_URL = '/backups/delete';

export function useBackupsForm() {
  const { props } = usePage();
  const backups = props?.backups || [];
  const flash = props?.flash || {};
  const errorMessages = React.useMemo(
    () => Object.values(props?.errors || {}).filter(Boolean),
    [props?.errors],
  );
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

  const [chooserOpen, setChooserOpen] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleExport = React.useCallback(() => {
    exportForm.post(COMPUTE_URL, {
      onSuccess: () => setChooserOpen(false),
    });
  }, [exportForm]);

  const handleImport = React.useCallback(() => {
    if (!importData.file) return;
    postImport(IMPORT_URL, {
      forceFormData: true,
      onSuccess: () => {
        resetImport('file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  }, [importData.file, postImport, resetImport]);

  const handleFileSelect = React.useCallback(
    (file) => {
      setImportData('file', file || null);
    },
    [setImportData],
  );

  const triggerFilePicker = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileDrag = React.useCallback(
    (event) => {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];
      if (file && file.type === 'application/json') {
        setImportData('file', file);
      }
    },
    [setImportData],
  );

  const openChooser = React.useCallback(() => setChooserOpen(true), []);

  const closeChooser = React.useCallback(() => setChooserOpen(false), []);

  const downloadBackup = React.useCallback((file) => {
    if (!file) return;
    const url = new URL(DOWNLOAD_URL, window.location.origin);
    url.searchParams.set('file', file);
    window.location.href = url.toString();
  }, []);

  const deleteBackup = React.useCallback(
    async (file) => {
      if (!file) return;
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.content || '';
      await fetch(DELETE_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({ file }),
      });
      router.reload();
    },
    [],
  );

  return {
    backups,
    exportForm,
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
    exportTarget: exportForm.data.target,
    setExportTarget: (value) => exportForm.setData('target', value),
    handleReset: () => postImport(RESET_URL),
    flash,
    errorMessages,
    downloadBackup,
    deleteBackup,
  };
}
