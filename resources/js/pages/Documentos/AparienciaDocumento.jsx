import React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';

const LOGO_ACCEPT = 'image/png,image/jpeg';
const MAX_IMAGE_SIZE_MB = 4;
const RECOMMENDED_SIZE = '400x150 px';

function LogoUploadSlot({
  label,
  preview,
  onChange,
  note,
  error,
  validationError,
  onRemove,
  onImageError,
  inputRef,
}) {
  const hasPreview = Boolean(preview);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-emerald-800">{label}</p>
      <div
        className="relative h-36 w-full rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-center text-sm text-slate-500 bg-white/70 overflow-hidden"
      >
        {hasPreview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className="absolute inset-0 h-full w-full object-contain"
            onError={onImageError}
          />
        ) : (
          <div className="space-y-1 pointer-events-none">
            <span className="text-3xl">⤴︎</span>
            <p>Subir imagen</p>
            <p className="text-xs text-slate-400">{RECOMMENDED_SIZE} (PNG/JPG)</p>
          </div>
        )}
        <input
          type="file"
          accept={LOGO_ACCEPT}
          ref={inputRef}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={onChange}
        />
        {hasPreview && (
          <button
            type="button"
            className="absolute top-2 right-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-xs font-bold text-rose-600 shadow-sm backdrop-blur hover:bg-white"
            onClick={(event) => {
              event.stopPropagation();
              if (onRemove) {
                onRemove();
              }
            }}
            aria-label={`Quitar ${label}`}
          >
            ×
          </button>
        )}
        <span className="pointer-events-none absolute top-2 left-2 text-xs font-semibold text-slate-400 tracking-wide">
          ✎
        </span>
      </div>
      {note && <p className="text-xs text-slate-400">{note}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {validationError && <p className="text-xs text-rose-500">{validationError}</p>}
    </div>
  );
}

export default function AparienciaDocumento() {
  const { props } = usePage();
  const { flash } = props;
  const appearance = props.appearance ?? {};
  const savedAppearances = props.savedAppearances ?? [];
  const availableLaboratorios = props.availableLaboratorios ?? [];

  const {
    setData,
    post,
    put,
    processing,
    errors,
  } = useForm({});

  const [laboratoriosModal, setLaboratoriosModal] = React.useState(null);
  const [selectedLaboratorios, setSelectedLaboratorios] = React.useState([]);
  const [laboratoriosProcessing, setLaboratoriosProcessing] = React.useState(false);
  const [fechaModal, setFechaModal] = React.useState(null);
  const [fechaRange, setFechaRange] = React.useState({
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [fechaProcessing, setFechaProcessing] = React.useState(false);
  const [modalErrorMessage, setModalErrorMessage] = React.useState('');

  const [logoLeftRemoteUrl, setLogoLeftRemoteUrl] = React.useState(appearance.logoLeftUrl ?? null);
  const [logoRightRemoteUrl, setLogoRightRemoteUrl] = React.useState(appearance.logoRightUrl ?? null);
  const [logoLeftLocalPreview, setLogoLeftLocalPreview] = React.useState(null);
  const [logoRightLocalPreview, setLogoRightLocalPreview] = React.useState(null);
  const displayedLogoLeft = logoLeftLocalPreview ?? logoLeftRemoteUrl;
  const displayedLogoRight = logoRightLocalPreview ?? logoRightRemoteUrl;
  const logoLeftBlob = React.useRef(null);
  const logoRightBlob = React.useRef(null);
  const logoLeftInputRef = React.useRef(null);
  const logoRightInputRef = React.useRef(null);
  const [editingAppearance, setEditingAppearance] = React.useState(null);
  const [deletingAppearanceId, setDeletingAppearanceId] = React.useState(null);
  const [logoLeftDirty, setLogoLeftDirty] = React.useState(false);
  const [logoRightDirty, setLogoRightDirty] = React.useState(false);
  const [logoLeftValidationError, setLogoLeftValidationError] = React.useState('');
  const [logoRightValidationError, setLogoRightValidationError] = React.useState('');
  const [formErrorMessage, setFormErrorMessage] = React.useState('');

  const reclaimObjectUrl = React.useCallback((ref) => {
    if (ref.current) {
      URL.revokeObjectURL(ref.current);
      ref.current = null;
    }
  }, []);

  const replenishBlobRef = React.useCallback((ref) => {
    if (ref.current && ref.current.startsWith('blob:')) {
      reclaimObjectUrl(ref);
    }
  }, [reclaimObjectUrl]);

  const validateLogoFile = React.useCallback((file) => {
    if (!file) {
      return null;
    }
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se admiten PNG o JPG.';
    }
    const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Máx ${MAX_IMAGE_SIZE_MB}MB por archivo.`;
    }
    return null;
  }, []);

  React.useEffect(() => {
    if (editingAppearance) {
      return;
    }
    replenishBlobRef(logoLeftBlob);
    setLogoLeftRemoteUrl(appearance.logoLeftUrl ?? null);
    setLogoLeftLocalPreview(null);
    setLogoLeftValidationError('');
  }, [appearance.logoLeftUrl, replenishBlobRef, editingAppearance]);

  React.useEffect(() => {
    if (editingAppearance) {
      return;
    }
    replenishBlobRef(logoRightBlob);
    setLogoRightRemoteUrl(appearance.logoRightUrl ?? null);
    setLogoRightLocalPreview(null);
    setLogoRightValidationError('');
  }, [appearance.logoRightUrl, replenishBlobRef, editingAppearance]);

  React.useEffect(() => {
    return () => {
      reclaimObjectUrl(logoLeftBlob);
      reclaimObjectUrl(logoRightBlob);
    };
  }, [reclaimObjectUrl]);

  const handleLogoChange = React.useCallback((field, setLocalPreview, setRemoteUrl, ref, setDirty, setValidationError) => (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      return;
    }
    const validationMessage = validateLogoFile(file);
    if (validationMessage) {
      setValidationError(validationMessage);
      setData(field, null);
      setLocalPreview(null);
      setRemoteUrl(null);
      replenishBlobRef(ref);
      if (ref.current) {
        URL.revokeObjectURL(ref.current);
        ref.current = null;
      }
      event.target.value = '';
      return;
    }
    setValidationError('');
    setData(field, file);
    const objectUrl = URL.createObjectURL(file);
    replenishBlobRef(ref);
    ref.current = objectUrl;
    setLocalPreview(objectUrl);
    setRemoteUrl(null);
    setDirty(true);
    setFormErrorMessage('');
  }, [setData, replenishBlobRef, validateLogoFile]);

  const handleLogoRemove = React.useCallback((field, setLocalPreview, setRemoteUrl, ref, setDirty, setValidationError, inputRef) => () => {
    if (ref.current) {
      reclaimObjectUrl(ref);
    }
    setLocalPreview(null);
    setRemoteUrl(null);
    setDirty(true);
    setData(field, null);
    setValidationError('');
    if (inputRef?.current) {
      inputRef.current.value = '';
    }
  }, [reclaimObjectUrl, setData]);

  const handlePreviewError = React.useCallback((setLocalPreview, setRemoteUrl) => () => {
    setLocalPreview(null);
    setRemoteUrl(null);
  }, []);

  const formatSavedDate = React.useCallback((value) => {
    if (!value) {
      return 'Sin fecha';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Sin fecha';
    }
    return parsed.toLocaleString('es-ES', { hour12: false });
  }, []);

  const formatSavedDateRange = React.useCallback((start, end) => {
    if (!start || !end) {
      return null;
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return null;
    }
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${startDate.toLocaleDateString('es-ES', options)} → ${endDate.toLocaleDateString('es-ES', options)}`;
  }, []);

  const handleOpenLaboratoriosModal = React.useCallback((version) => {
    setLaboratoriosModal(version);
    setSelectedLaboratorios(version?.laboratorios ?? []);
    setModalErrorMessage('');
  }, []);

  const handleToggleLaboratorio = React.useCallback((value) => {
    setSelectedLaboratorios((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }
      return [...current, value];
    });
  }, []);

  const closeLaboratoriosModal = React.useCallback(() => {
    setLaboratoriosModal(null);
    setSelectedLaboratorios([]);
    setLaboratoriosProcessing(false);
    setModalErrorMessage('');
  }, []);

  const handleSaveLaboratorios = React.useCallback(() => {
    if (!laboratoriosModal) {
      return;
    }
    setLaboratoriosProcessing(true);
    router.post(
      `/ui/documentos/apariencia/${laboratoriosModal.id}/laboratorios`,
      { laboratorios: selectedLaboratorios },
      {
        preserveScroll: true,
        onFinish: () => {
          setLaboratoriosProcessing(false);
          closeLaboratoriosModal();
        },
        onError: () => {
          setLaboratoriosProcessing(false);
        },
      },
    );
  }, [laboratoriosModal, selectedLaboratorios, closeLaboratoriosModal]);

  const handleOpenFechaModal = React.useCallback((version) => {
    setFechaModal(version);
    setFechaRange({
      fecha_inicio: version?.fechaInicio ?? '',
      fecha_fin: version?.fechaFin ?? '',
    });
    setModalErrorMessage('');
  }, []);

  const handleFechaInputChange = React.useCallback((field) => (event) => {
    setFechaRange((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  }, []);

  const closeFechaModal = React.useCallback(() => {
    setFechaModal(null);
    setFechaProcessing(false);
    setModalErrorMessage('');
  }, []);

  const handleSaveFecha = React.useCallback(() => {
    if (!fechaModal) {
      return;
    }
    if (fechaRange.fecha_inicio && fechaRange.fecha_fin && fechaRange.fecha_inicio > fechaRange.fecha_fin) {
      setModalErrorMessage('La fecha de fin debe ser igual o posterior a la de inicio.');
      return;
    }
    setFechaProcessing(true);
    const payload = {
      fecha_inicio: fechaRange.fecha_inicio || null,
      fecha_fin: fechaRange.fecha_fin || null,
    };
    router.post(
      `/ui/documentos/apariencia/${fechaModal.id}/fechas`,
      payload,
      {
        preserveScroll: true,
        onFinish: () => {
          setFechaProcessing(false);
          closeFechaModal();
        },
        onError: () => {
          setFechaProcessing(false);
        },
      },
    );
  }, [fechaModal, fechaRange, closeFechaModal]);

  const handleEditSavedAppearance = React.useCallback((version) => {
    setEditingAppearance(version);
    setLogoLeftRemoteUrl(version.logoLeftUrl ?? null);
    setLogoRightRemoteUrl(version.logoRightUrl ?? null);
    setLogoLeftLocalPreview(null);
    setLogoRightLocalPreview(null);
    setData('logo_left', null);
    setData('logo_right', null);
  }, [setData]);

  const handleCancelEdit = React.useCallback(() => {
    setEditingAppearance(null);
    setLogoLeftRemoteUrl(appearance.logoLeftUrl ?? null);
    setLogoRightRemoteUrl(appearance.logoRightUrl ?? null);
    setLogoLeftLocalPreview(null);
    setLogoRightLocalPreview(null);
    setData('logo_left', null);
    setData('logo_right', null);
    setLogoLeftDirty(false);
    setLogoRightDirty(false);
    setFormErrorMessage('');
    if (logoLeftInputRef.current) {
      logoLeftInputRef.current.value = '';
    }
    if (logoRightInputRef.current) {
      logoRightInputRef.current.value = '';
    }
  }, [appearance.logoLeftUrl, appearance.logoRightUrl, setData]);

  const handleDeleteSavedAppearance = React.useCallback((version) => {
    if (!window.confirm('¿Eliminar esta apariencia guardada?')) {
      return;
    }
    setDeletingAppearanceId(version.id);
    router.delete(
      `/ui/documentos/apariencia/${version.id}`,
      {},
      {
        preserveScroll: true,
        onFinish: () => setDeletingAppearanceId(null),
      },
    );
  }, []);

  const handleSubmit = React.useCallback((event) => {
    event.preventDefault();
    if (!logoLeftDirty && !logoRightDirty) {
      setFormErrorMessage('Debes subir al menos un logo.');
      return;
    }
    setFormErrorMessage('');
    const isEditing = Boolean(editingAppearance);
    const targetUrl = isEditing
      ? `/ui/documentos/apariencia/${editingAppearance.id}`
      : '/ui/documentos/apariencia';
    const submitAction = isEditing ? put : post;

    submitAction(targetUrl, {
      forceFormData: true,
      preserveScroll: true,
      onError: () => {
        reclaimObjectUrl(logoLeftBlob);
        reclaimObjectUrl(logoRightBlob);
      },
      onSuccess: (page) => {
        const savedAppearance = page.props?.appearance ?? {};
        setLogoLeftRemoteUrl(savedAppearance.logoLeftUrl ?? null);
        setLogoRightRemoteUrl(savedAppearance.logoRightUrl ?? null);
        setLogoLeftLocalPreview(null);
        setLogoRightLocalPreview(null);
        setLogoLeftValidationError('');
        setLogoRightValidationError('');
      },
      onFinish: () => {
        if (editingAppearance) {
          setEditingAppearance(null);
        }
        if (logoLeftInputRef.current) {
          logoLeftInputRef.current.value = '';
        }
        if (logoRightInputRef.current) {
          logoRightInputRef.current.value = '';
        }
        setData('logo_left', null);
        setData('logo_right', null);
        setLogoLeftDirty(false);
        setLogoRightDirty(false);
      },
    });
  }, [
    editingAppearance,
    post,
    put,
    reclaimObjectUrl,
    setData,
    logoLeftDirty,
    logoRightDirty,
    setLogoLeftValidationError,
    setLogoRightValidationError,
    setLogoLeftRemoteUrl,
    setLogoRightRemoteUrl,
    setLogoLeftLocalPreview,
    setLogoRightLocalPreview,
  ]);

  return (
    <div className="flex justify-center w-full">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl">
        <div
          className="w-full bg-white/90 backdrop-blur shadow-xl rounded-3xl px-1 py-5 border border-white/60 pb-16"
        >
          <header className="flex flex-col gap-1 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Apariencia de Documentos</p>
              </div>
              {flash?.status && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  {flash.status}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-slate-900">Configura los logotipos</p>
          </header>
          {editingAppearance && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div>
                <p className="font-semibold">Editando apariencia guardada</p>
                <p className="text-xs text-emerald-800/80">
                  Guardada {formatSavedDate(editingAppearance.createdAt)}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
                onClick={handleCancelEdit}
              >
                Cancelar edición
              </button>
            </div>
          )}
          <section className="grid gap-6">
            <div className="space-y-6">
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200 bg-white">
                <h2 className="text-lg font-semibold text-slate-800">1. Encabezados Superiores</h2>
                <div className="grid gap-4 lg:grid-cols-2 mt-4">
                  <LogoUploadSlot
                    label="Logo Izquierdo"
                    preview={displayedLogoLeft}
                    onChange={handleLogoChange(
                      'logo_left',
                      setLogoLeftLocalPreview,
                      setLogoLeftRemoteUrl,
                      logoLeftBlob,
                      setLogoLeftDirty,
                      setLogoLeftValidationError,
                    )}
                    validationError={logoLeftValidationError}
                    onRemove={handleLogoRemove(
                      'logo_left',
                      setLogoLeftLocalPreview,
                      setLogoLeftRemoteUrl,
                      logoLeftBlob,
                      setLogoLeftDirty,
                      setLogoLeftValidationError,
                      logoLeftInputRef,
                    )}
                    onImageError={handlePreviewError(setLogoLeftLocalPreview, setLogoLeftRemoteUrl)}
                    note={`Recomendado ${RECOMMENDED_SIZE}. Máx ${MAX_IMAGE_SIZE_MB}MB.`}
                    error={errors.logo_left}
                    inputRef={logoLeftInputRef}
                  />
                  <LogoUploadSlot
                    label="Logo Derecho"
                    preview={displayedLogoRight}
                    onChange={handleLogoChange(
                      'logo_right',
                      setLogoRightLocalPreview,
                      setLogoRightRemoteUrl,
                      logoRightBlob,
                      setLogoRightDirty,
                      setLogoRightValidationError,
                    )}
                    validationError={logoRightValidationError}
                    onRemove={handleLogoRemove(
                      'logo_right',
                      setLogoRightLocalPreview,
                      setLogoRightRemoteUrl,
                      logoRightBlob,
                      setLogoRightDirty,
                      setLogoRightValidationError,
                      logoRightInputRef,
                    )}
                    onImageError={handlePreviewError(setLogoRightLocalPreview, setLogoRightRemoteUrl)}
                    note={`Recomendado ${RECOMMENDED_SIZE}. Máx ${MAX_IMAGE_SIZE_MB}MB.`}
                    error={errors.logo_right}
                    inputRef={logoRightInputRef}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <button
                  type="submit"
                  className="inline-flex min-w-[220px] items-center justify-center gap-2 px-6 py-2 rounded-2xl bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-200/80 hover:bg-emerald-500 transition-colors disabled:opacity-60"
                  disabled={processing || (!logoLeftDirty && !logoRightDirty)}
                >
                  {processing ? 'Guardando...' : 'Guardar cambios'}
                </button>
                {formErrorMessage && (
                  <p className="text-xs text-rose-500">{formErrorMessage}</p>
                )}
              </div>
            </div>
          </section>
          <section className="mt-8 space-y-4 w-full">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-800">Apariencias guardadas</p>
              <p className="text-sm text-slate-500">Reutiliza o modifica versiones anteriores de tus documentos.</p>
            </div>
            {savedAppearances.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Aún no hay apariencias guardadas. Guarda una nueva configuración para que aparezca aquí.
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full px-2">
                {savedAppearances.map((item) => (
                  <article
                    key={item.id}
                  className={`w-full max-w-full flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-8 py-5 shadow-[0_18px_30px_rgba(15,23,42,0.09)] ${
                    item.id === appearance.id ? 'border-emerald-500/60' : ''
                  }`}
                >
                    <header className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-lg">📅</span>
                        <span className="font-semibold text-slate-700">{formatSavedDate(item.createdAt)}</span>
                      </div>
                      {item.id === appearance.id && (
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-0.5 text-[11px] font-semibold text-emerald-700 tracking-wide">
                          ACTIVO
                        </span>
                      )}
                    </header>
                    <div className="flex flex-wrap items-center gap-3 text-sm border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-700 transition hover:border-sky-300"
                        onClick={() => handleEditSavedAppearance(item)}
                      >
                        <span className="text-sm leading-none">✏️</span>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                        onClick={() => handleDeleteSavedAppearance(item)}
                        disabled={deletingAppearanceId === item.id}
                      >
                        <span className="text-sm leading-none">🗑️</span>
                        {deletingAppearanceId === item.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                        onClick={() => handleOpenLaboratoriosModal(item)}
                      >
                        <span className="text-sm leading-none">🧪</span>
                        Usar en laboratorios
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
                        onClick={() => handleOpenFechaModal(item)}
                      >
                        <span className="text-sm leading-none">📆</span>
                        Usar entre fechas
                      </button>
                      <div className="ml-auto flex items-center gap-2">
                        {item.blankTemplateUrl && (
                          <a
                            href={item.blankTemplateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:text-slate-900"
                          >
                            Ver plantilla ↗
                          </a>
                        )}
                      </div>
                    </div>
                    {(item.laboratorios?.length || (item.fechaInicio && item.fechaFin)) && (
                      <div className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        {item.laboratorios?.length ? (
                          <p>
                            <span className="font-semibold text-slate-700">Laboratorios:</span>{' '}
                            {item.laboratorios.join(', ')}
                          </p>
                        ) : null}
                        {item.fechaInicio && item.fechaFin ? (
                          <p>
                            <span className="font-semibold text-slate-700">Vigencia:</span>{' '}
                            {formatSavedDateRange(item.fechaInicio, item.fechaFin) ?? 'Rango inválido'}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </form>
      {laboratoriosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.4em]">Laboratorios</p>
                <h3 className="text-xl font-semibold text-slate-900">Usar para laboratorios específicos</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                onClick={closeLaboratoriosModal}
              >
                Cerrar
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Selecciona uno o varios números de laboratorio a los que quieras aplicar esta apariencia.
            </p>
            <div className="mt-4 max-h-[320px] overflow-y-auto">
              {availableLaboratorios.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No hay laboratorios registrados todavía.
                </p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {availableLaboratorios.map((laboratorio) => {
                    const checked = selectedLaboratorios.includes(laboratorio);
                    return (
                      <label
                        key={laboratorio}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:border-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleLaboratorio(laboratorio)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold">{laboratorio}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-slate-500 hover:bg-slate-50"
                onClick={() => setSelectedLaboratorios([])}
              >
                Limpiar selección
              </button>
              <button
                type="button"
                className="ml-auto rounded-2xl bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-500 disabled:opacity-60"
                onClick={handleSaveLaboratorios}
                disabled={laboratoriosProcessing}
              >
                {laboratoriosProcessing ? 'Guardando...' : 'Guardar laboratorios'}
              </button>
            </div>
          </div>
        </div>
      )}
      {fechaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.4em]">Fechas</p>
                <h3 className="text-xl font-semibold text-slate-900">Usar apariencia entre fechas</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                onClick={closeFechaModal}
              >
                Cerrar
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Define un rango de fechas durante el cual esta apariencia reemplazará a la predeterminada.
            </p>
            <div className="mt-4 grid gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-500">
                Fecha de inicio
                <input
                  type="date"
                  value={fechaRange.fecha_inicio}
                  onChange={handleFechaInputChange('fecha_inicio')}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-500">
                Fecha de fin
                <input
                  type="date"
                  value={fechaRange.fecha_fin}
                  onChange={handleFechaInputChange('fecha_fin')}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
                />
              </label>
            </div>
            {modalErrorMessage && (
              <p className="mt-4 text-xs text-rose-500">{modalErrorMessage}</p>
            )}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm text-slate-500 hover:bg-slate-50"
                onClick={closeFechaModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ml-auto rounded-2xl bg-indigo-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 disabled:opacity-60"
                onClick={handleSaveFecha}
                disabled={fechaProcessing}
              >
                {fechaProcessing ? 'Guardando...' : 'Guardar fechas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
