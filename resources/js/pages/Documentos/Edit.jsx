import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import {
  Stack,
  Typography,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  RadioGroup,
  Radio,
  Modal,
  ModalDialog,
  Select,
  Option,
} from '@mui/joy';
import {
  Hash,
  Sprout,
  CalendarDays,
  BadgeCheck,
  Clock,
  StickyNote,
  Leaf,
  Tag,
  Building2,
  Handshake,
  Shield,
  Package,
  Scale,
  MapPin,
  Map as MapIcon,
  ShieldCheck,
  Thermometer,
  Activity,
} from 'lucide-react';

import FormField from '../../components/FormField';
import {
  DECIMAL_INPUT_SLOT_PROPS,
  NUMBER_INPUT_SLOT_PROPS,
  normalizeUpper,
  buildObservationText,
  toUpperValue,
  buildAutoLoteValue,
  calculateTotalKg,
  buildCultivosMetadata,
  getVariedadOptions,
} from './utils';

const AUTO_LOTE_UPPER_FIELDS = new Set(['nlab']);
const AUTO_LOTE_NO_TRIM_FIELDS = new Set(['cooperador']);
const AUTO_LOTE_PLAIN_FIELDS = new Set(['fecha_evaluacion']);

export default function DocumentoEdit() {
  const { props } = usePage();
  const { doc = {}, flash, loteSuggestions = [], cultivos = [] } = props;
  const initialTotal = React.useMemo(() => (
    doc?.total != null ? String(doc.total) : ''
  ), [doc]);
  const {
    data,
    setData,
    put,
    processing,
    errors,
  } = useForm({
    nlab: doc.nlab ?? '',
    especie: doc.especie ?? '',
    fecha_evaluacion: doc.fecha_evaluacion ?? '',
    estado: doc.estado ?? 'APROBADO',
    validez: doc.validez ?? '',
    observaciones: doc.observaciones ?? '',
    malezas_nocivas: (doc.malezas_nocivas && doc.malezas_nocivas !== '-') ? doc.malezas_nocivas : 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS',
    malezas_comunes: (doc.malezas_comunes && doc.malezas_comunes !== '-') ? doc.malezas_comunes : 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS COMUNES',
    variedad: doc.variedad ?? '',
    semillera: doc.semillera ?? '',
    cooperador: doc.cooperador ?? '',
    categoria_inicial: doc.categoria_inicial ?? '',
    categoria_final: doc.categoria_final ?? '',
    anio: doc.anio ?? '',
    lote: doc.lote ?? '',
    bolsas: doc.bolsas ?? '',
    kgbol: doc.kgbol ?? '',
    municipio: doc.municipio ?? '',
    comunidad: doc.comunidad ?? '',
    aut_import: doc.aut_import ?? '',
    resultado: doc.resultado ?? '',
    otros_sp_pct: doc.otros_sp_pct ?? '',
    otros_sp_kg: doc.otros_sp_kg ?? '',
    otros_cultivos_pct: doc.otros_cultivos_pct ?? '',
    otros_cultivos_kg: doc.otros_cultivos_kg ?? '',
    malezas_comunes_pct: doc.malezas_comunes_pct ?? '',
    malezas_comunes_kg: doc.malezas_comunes_kg ?? '',
    malezas_prohibidas_pct: doc.malezas_prohibidas_pct ?? '',
    malezas_prohibidas_kg: doc.malezas_prohibidas_kg ?? '',
    germinacion_pct: doc.germinacion_pct ?? '',
    viabilidad_pct: doc.viabilidad_pct ?? doc.variavilidad_pct ?? '',
  });
  const [loteDirty, setLoteDirty] = React.useState(Boolean(doc.lote));
  const [showMissingModal, setShowMissingModal] = React.useState(false);
  const [nlabClientError, setNlabClientError] = React.useState('');
  const [checkingNlab, setCheckingNlab] = React.useState(false);
  const autoObservationRef = React.useRef('');
  const REQUIRED_FIELDS = React.useMemo(() => ([
    'nlab',
    'especie',
    'fecha_evaluacion',
    'estado',
    'variedad',
    'categoria_inicial',
    'categoria_final',
    'lote',
    'aut_import',
  ]), []);

  const REQUIRED_LABELS = React.useMemo(() => ({
    nlab: 'N° Laboratorio',
    especie: 'Especie',
    fecha_evaluacion: 'Fecha evaluación',
    estado: 'Estado',
    validez: 'Validez',
    variedad: 'Variedad',
    semillera: 'Semillera',
    cooperador: 'Cooperador',
    categoria_inicial: 'Categoría inicial',
    categoria_final: 'Categoría final',
    lote: 'Lote',
    bolsas: 'Bolsas',
    kgbol: 'Kg/bolsa',
    aut_import: 'Aut. Importación',
  }), []);
  const cultivosMetadata = React.useMemo(
    () => buildCultivosMetadata(Array.isArray(cultivos) ? cultivos : []),
    [cultivos],
  );
  const {
    metaMap: cultivosMeta,
    especiesOptions,
    categoriaInicialOptions,
    categoriaFinalOptions,
    variedadGlobalOptions,
  } = cultivosMetadata;
  const variedadOptions = React.useMemo(
    () => getVariedadOptions(cultivosMeta, data.especie, data.variedad, variedadGlobalOptions),
    [cultivosMeta, data.especie, data.variedad, variedadGlobalOptions],
  );

  const missingRequired = React.useMemo(() => (
    REQUIRED_FIELDS.filter((f) => {
      const v = data[f];
      if (v === 0 || v === '0') return false;
      return (v ?? '').toString().trim() === '';
    })
  ), [REQUIRED_FIELDS, data]);
  const hasMissingRequired = missingRequired.length > 0;
  const missingRequiredLabels = React.useMemo(
    () => missingRequired.map((f) => REQUIRED_LABELS[f] ?? f),
    [REQUIRED_LABELS, missingRequired],
  );
  const missingMessage = hasMissingRequired
    ? `Completa los campos obligatorios: ${missingRequiredLabels.join(', ')}`
    : '';
  const serverErrors = React.useMemo(
    () => Object.values(errors || {}).filter(Boolean),
    [errors],
  );
  const nlabFieldError = errors.nlab ?? nlabClientError;

  const lotes = React.useMemo(() => {
    const base = Array.isArray(loteSuggestions) ? [...loteSuggestions] : [];
    if (doc.lote) {
      base.unshift(doc.lote);
    }
    return Array.from(new Set(base)).filter(Boolean);
  }, [doc.lote, loteSuggestions]);

  React.useEffect(() => {
    if (!hasMissingRequired) {
      setShowMissingModal(false);
    }
  }, [hasMissingRequired]);

  const handleUpperChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, toUpperValue(value));
      if (name === 'nlab') {
        setNlabClientError('');
      }
      if (AUTO_LOTE_UPPER_FIELDS.has(name)) {
        setLoteDirty(false);
      }
    },
    [setData, setLoteDirty, setNlabClientError],
  );
  const handleUpperNoTrimChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, toUpperValue(value, { trim: false }));
      if (AUTO_LOTE_NO_TRIM_FIELDS.has(name)) {
        setLoteDirty(false);
      }
    },
    [setData, setLoteDirty],
  );

  const handlePlainChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, value);
      if (AUTO_LOTE_PLAIN_FIELDS.has(name)) {
        setLoteDirty(false);
      }
    },
    [setData, setLoteDirty],
  );
  const handleEspecieSelect = React.useCallback(
    (_, value) => {
      const normalized = toUpperValue(value || '');
      setData('especie', normalized);
      if (!normalized) {
        setLoteDirty(false);
        return;
      }
      const meta = cultivosMeta.get(normalized);
      if (meta) {
        if (meta.categoria_inicial) {
          setData('categoria_inicial', meta.categoria_inicial);
        }
        if (meta.categoria_final) {
          setData('categoria_final', meta.categoria_final);
        }
        const currentVariedad = normalizeUpper(data.variedad);
        if (meta.variedades.length > 0) {
          const nextVariedad = meta.variedades.includes(currentVariedad)
            ? currentVariedad
            : meta.variedades[0];
          setData('variedad', nextVariedad);
        } else {
          setData('variedad', '');
        }
      }
      setLoteDirty(false);
    },
    [cultivosMeta, data.variedad, setData, setLoteDirty],
  );
  const handleObservacionesChange = React.useCallback(
    (event) => {
      autoObservationRef.current = null;
      const value = event.target.value ?? '';
      setData('observaciones', toUpperValue(value));
    },
    [setData],
  );
  const handleVariedadSelect = React.useCallback(
    (_, value) => {
      const normalized = toUpperValue(value || '');
      setData('variedad', normalized);
    },
    [setData],
  );

  const handleAnioChange = React.useCallback(
    (event) => {
      setLoteDirty(false);
      setNlabClientError('');
      setData('anio', event.target.value ?? '');
    },
    [setData, setNlabClientError, setLoteDirty],
  );

  const handleTextareaInput = React.useCallback((event) => {
    const target = event.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }, []);

  const generateObservation = React.useCallback(
    (
      nextEstado = data.estado,
      nextCategoria = data.categoria_final,
      nextEspecie = data.especie,
      nextAnio = data.anio,
    ) => buildObservationText(nextEstado, nextCategoria, nextEspecie, nextAnio),
    [data.anio, data.categoria_final, data.estado, data.especie],
  );

  const estadoValue = React.useMemo(() => data.estado || 'APROBADO', [data.estado]);

  const handleEstadoChange = React.useCallback(
    (event) => {
      const next = event.target.value;
      if (next === 'APROBADO') {
        setData('estado', 'APROBADO');
        const suggestion = generateObservation('APROBADO');
        if (suggestion) {
          setData('observaciones', suggestion);
          autoObservationRef.current = suggestion;
        } else {
          autoObservationRef.current = '';
        }
      } else if (next === 'RECHAZADO') {
        setData('estado', 'RECHAZADO');
        const suggestion = generateObservation('RECHAZADO');
        if (suggestion) {
          setData('observaciones', suggestion);
          autoObservationRef.current = suggestion;
        } else {
          autoObservationRef.current = '';
        }
      } else {
        setData('estado', '');
        autoObservationRef.current = '';
      }
    },
    [generateObservation, setData],
  );

  const totalKg = React.useMemo(
    () => calculateTotalKg(data.bolsas, data.kgbol),
    [data.bolsas, data.kgbol],
  );

  const buildAutoLote = React.useCallback(
    () => buildAutoLoteValue({
      cooperador: data.cooperador,
      nlab: data.nlab,
      especie: data.especie,
      fechaEvaluacion: data.fecha_evaluacion,
      anio: data.anio,
    }),
    [data.cooperador, data.nlab, data.especie, data.fecha_evaluacion, data.anio],
  );

  React.useEffect(() => {
    if (loteDirty) {
      return;
    }
    const nextLote = buildAutoLote();
    if (nextLote !== data.lote) {
      setData('lote', nextLote);
    }
  }, [buildAutoLote, data.lote, loteDirty, setData]);

  const handleLoteManualChange = React.useCallback(
    (event) => {
      const value = event.target.value ?? '';
      const normalized = toUpperValue(value);
      setData('lote', normalized);
      if (normalized === '') {
        setLoteDirty(false);
      } else {
        setLoteDirty(true);
      }
    },
    [setData, setLoteDirty],
  );

  React.useEffect(() => {
    if (autoObservationRef.current === null) {
      return;
    }
    if (data.estado !== 'APROBADO' && data.estado !== 'RECHAZADO') {
      autoObservationRef.current = '';
      return;
    }
    const suggestion = generateObservation();
    if (!suggestion) {
      return;
    }
    if (data.observaciones === suggestion) {
      autoObservationRef.current = suggestion;
      return;
    }
    setData('observaciones', suggestion);
    autoObservationRef.current = suggestion;
  }, [data.estado, data.categoria_final, data.especie, data.anio, data.observaciones, generateObservation, setData]);

  const checkNlabDuplicate = React.useCallback(async () => {
    const lab = (data.nlab || '').trim();
    if (lab === '') {
      return false;
    }
    const params = new URLSearchParams();
    params.set('nlab', lab);
    const anioValue = (data.anio || '').toString().trim();
    if (anioValue !== '') {
      params.set('anio', anioValue);
    }
    if (doc?.id) {
      params.set('ignore_id', String(doc.id));
    }
    try {
      const response = await fetch(`/documentos/check-nlab?${params.toString()}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!response.ok) {
        return false;
      }
      const payload = await response.json();
      return Boolean(payload.exists);
    } catch (error) {
      return false;
    }
  }, [data.anio, data.nlab, doc?.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (hasMissingRequired) {
      setShowMissingModal(true);
      return;
    }
    setShowMissingModal(false);
    setCheckingNlab(true);
    const existsDuplicate = await checkNlabDuplicate();
    setCheckingNlab(false);
    if (existsDuplicate) {
      setNlabClientError('Este número de laboratorio ya existe para la campaña seleccionada.');
      setShowMissingModal(false);
      return;
    }
    setNlabClientError('');
    put(`/documentos/${doc.id}`, {
      preserveScroll: true,
      preserveState: (page) => {
        const nextErrors = page?.props?.errors || {};
        return Object.keys(nextErrors).length === 0;
      },
      onError: () => setShowMissingModal(false),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="doc-form">
      <datalist id="lote-suggestions">
        {lotes.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
      <datalist id="documento-categorias-finales">
        {categoriaFinalOptions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
      <datalist id="documento-categorias-iniciales">
        {categoriaInicialOptions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
      <Stack spacing={2}>
        <Typography level="h4">Editar documento #{doc.id}</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}
        {missingMessage && <Alert color="warning" variant="soft">{missingMessage}</Alert>}
        {nlabClientError && (
          <Alert color="warning" variant="soft">
            {nlabClientError}
          </Alert>
        )}
        {serverErrors.length > 0 && (
          <Alert color="danger" variant="soft">
            <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
              Corrige los siguientes campos:
            </Typography>
            <ul className="list-compact">
              {serverErrors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </Alert>
        )}
        

        <Stack className="doc-sections" spacing={2}>
          {/* Datos generales */}
          <div className="doc-section doc-section--blue">
            <div className="doc-section__title">
              <BadgeCheck size={18} />
              <span>Datos generales</span>
            </div>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="N° Laboratorio"
                  value={data.nlab}
                  onChange={handleUpperChange('nlab')}
                  error={nlabFieldError}
                  required
                  startDecorator={<Hash size={16} />}
                />
                <FormControl error={Boolean(errors.especie)}>
                  <FormLabel>Especie</FormLabel>
                  <Select
                    value={data.especie || null}
                    onChange={handleEspecieSelect}
                    placeholder="Selecciona especie"
                    startDecorator={<Sprout size={16} />}
                    required
                    sx={{ minWidth: 200 }}
                  >
                    {especiesOptions.map((value) => (
                      <Option key={value} value={value}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                  {errors.especie && (
                    <Typography level="body-sm" color="danger" sx={{ mt: 0.25 }}>
                      {errors.especie}
                    </Typography>
                  )}
                </FormControl>
                <FormField
                  label="Fecha evaluación"
                  type="date"
                  value={data.fecha_evaluacion}
                  onChange={handlePlainChange('fecha_evaluacion')}
                  error={errors.fecha_evaluacion}
                  required
                  startDecorator={<CalendarDays size={16} />}
                />
              </Stack>
            </Stack>
          </div>

          {/* Ubicación */}
          <div className="doc-section doc-section--blue">
            <div className="doc-section__title">
              <MapIcon size={18} />
              <span>Ubicación</span>
            </div>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
              <FormField
                label="Municipio (opcional)"
                value={data.municipio}
                onChange={handleUpperChange('municipio')}
                error={errors.municipio}
                startDecorator={<MapPin size={16} />}
              />
              <FormField
                label="Comunidad (opcional)"
                value={data.comunidad}
                onChange={handleUpperChange('comunidad')}
                error={errors.comunidad}
                startDecorator={<MapIcon size={16} />}
              />
              <FormField
                label="Aut. Importación"
                value={data.aut_import}
                onChange={handleUpperChange('aut_import')}
                error={errors.aut_import}
                required
                startDecorator={<Shield size={16} />}
              />
            </Stack>
          </div>

          {/* Recepción */}
          <div className="doc-section doc-section--peach">
            <div className="doc-section__title">
              <Package size={18} />
              <span>Recepción</span>
            </div>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormControl error={Boolean(errors.variedad)}>
                  <FormLabel>Variedad</FormLabel>
                  <Select
                    value={data.variedad || null}
                    onChange={handleVariedadSelect}
                    placeholder="Selecciona variedad"
                    startDecorator={<Tag size={16} />}
                    required
                  >
                    {variedadOptions.map((value) => (
                      <Option key={value} value={value}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                  {errors.variedad && (
                    <Typography level="body-sm" color="danger" sx={{ mt: 0.25 }}>
                      {errors.variedad}
                    </Typography>
                  )}
                </FormControl>
                <FormField
                  label="Semillera (opcional)"
                  value={data.semillera}
                  onChange={handleUpperNoTrimChange('semillera')}
                  error={errors.semillera}
                  startDecorator={<Building2 size={16} />}
                />
                <FormField
                  label="Cooperador (opcional)"
                  value={data.cooperador}
                  onChange={handleUpperNoTrimChange('cooperador')}
                  error={errors.cooperador}
                  startDecorator={<Handshake size={16} />}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Categoría inicial"
                  value={data.categoria_inicial}
                  onChange={handleUpperChange('categoria_inicial')}
                  error={errors.categoria_inicial}
                  required
                  startDecorator={<Shield size={16} />}
                  slotProps={{
                    input: {
                      list: 'documento-categorias-iniciales',
                      autoComplete: 'on',
                    },
                  }}
                />
                <FormField
                  label="Categoría final"
                  value={data.categoria_final}
                  onChange={handleUpperChange('categoria_final')}
                  error={errors.categoria_final}
                  required
                  startDecorator={<ShieldCheck size={16} />}
                  slotProps={{
                    input: {
                      list: 'documento-categorias-finales',
                      autoComplete: 'on',
                    },
                  }}
                />
                <FormField
                  label="Año"
                  type="number"
                  min="1900"
                  max="2100"
                  value={data.anio}
                  onChange={handleAnioChange}
                  slotProps={NUMBER_INPUT_SLOT_PROPS}
                  error={errors.anio}
                  startDecorator={<Clock size={16} />}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Lote"
                  value={data.lote}
                  onChange={handleLoteManualChange}
                  error={errors.lote}
                  required
                  startDecorator={<Package size={16} />}
                  slotProps={{
                    input: {
                      list: 'lote-suggestions',
                      autoComplete: 'on',
                    },
                  }}
                />
                <FormField
                  label="Bolsas (opcional)"
                  type="number"
                  step="1"
                  min="0"
                  value={data.bolsas}
                  onChange={handlePlainChange('bolsas')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.bolsas}
                  startDecorator={<Scale size={16} />}
                />
                <FormField
                  label="Kg/bolsa (opcional)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.kgbol}
                  onChange={handlePlainChange('kgbol')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.kgbol}
                  startDecorator={<Scale size={16} />}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormControl>
                  <FormLabel>Total (kg)</FormLabel>
                  <Input value={totalKg || ''} readOnly startDecorator={<Scale size={16} />} />
                </FormControl>
              </Stack>
            </Stack>
          </div>

          {/* Análisis */}
          <div className="doc-section doc-section--mint">
            <div className="doc-section__title">
              <Thermometer size={18} />
              <span>Análisis de humedad y pureza</span>
            </div>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Humedad (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.resultado}
                  onChange={handlePlainChange('resultado')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.resultado}
                  startDecorator={<Thermometer size={16} />}
                />
                <FormField
                  label="Germinación (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.germinacion_pct}
                  onChange={handlePlainChange('germinacion_pct')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.germinacion_pct}
                  startDecorator={<Activity size={16} />}
                />
                <FormField
                  label="Viabilidad (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.viabilidad_pct}
                  onChange={handlePlainChange('viabilidad_pct')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.viabilidad_pct}
                  startDecorator={<Activity size={16} />}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Semilla pura (otros) %"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.otros_sp_pct}
                  onChange={handlePlainChange('otros_sp_pct')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.otros_sp_pct}
                />
                <FormField
                  label="Semilla pura (otros) kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.otros_sp_kg}
                  onChange={handlePlainChange('otros_sp_kg')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.otros_sp_kg}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Otros cultivos %"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.otros_cultivos_pct}
                  onChange={handlePlainChange('otros_cultivos_pct')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.otros_cultivos_pct}
                />
                <FormField
                  label="Otros cultivos kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.otros_cultivos_kg}
                  onChange={handlePlainChange('otros_cultivos_kg')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.otros_cultivos_kg}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Malezas comunes %"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.malezas_comunes_pct}
                  onChange={handlePlainChange('malezas_comunes_pct')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.malezas_comunes_pct}
                />
                <FormField
                  label="Malezas comunes kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.malezas_comunes_kg}
                  onChange={handlePlainChange('malezas_comunes_kg')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.malezas_comunes_kg}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Malezas prohibidas %"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.malezas_prohibidas_pct}
                  onChange={handlePlainChange('malezas_prohibidas_pct')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.malezas_prohibidas_pct}
                />
                <FormField
                  label="Malezas prohibidas kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.malezas_prohibidas_kg}
                  onChange={handlePlainChange('malezas_prohibidas_kg')}
                  slotProps={DECIMAL_INPUT_SLOT_PROPS}
                  error={errors.malezas_prohibidas_kg}
                />
              </Stack>
            </Stack>
          </div>

          {/* Estado y validez */}
          <div className="doc-section">
            <div className="doc-section__title">
              <ShieldCheck size={18} />
              <span>Estado y validez</span>
            </div>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
              <FormControl>
                <FormLabel>Estado</FormLabel>
                <RadioGroup
                  value={estadoValue}
                  onChange={handleEstadoChange}
                  orientation="horizontal"
                  sx={{ gap: 0.75, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}
                  required
                >
                  <Radio value="APROBADO" label="Aprobado" />
                  <Radio value="RECHAZADO" label="Rechazado" />
                </RadioGroup>
                {errors.estado && (
                  <Typography level="body-sm" color="danger">{errors.estado}</Typography>
                )}
              </FormControl>
              <FormField
                label="Validez"
                value={data.validez}
                onChange={handleUpperChange('validez')}
                error={errors.validez}
                startDecorator={<Clock size={16} />}
              />
            </Stack>
          </div>

          {/* Malezas */}
          <div className="doc-section doc-section--mint">
            <div className="doc-section__title">
              <Leaf size={18} />
              <span>Malezas</span>
            </div>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
              <FormField
                label="Malezas nocivas"
                value={data.malezas_nocivas}
                onChange={handleUpperChange('malezas_nocivas')}
                error={errors.malezas_nocivas}
                startDecorator={<Leaf size={16} />}
                textarea
                minRows={2}
                slotProps={{
                  input: {
                    onInput: handleTextareaInput,
                    style: { overflow: 'hidden' },
                  },
                }}
              />
              <FormField
                label="Malezas comunes"
                value={data.malezas_comunes}
                onChange={handleUpperChange('malezas_comunes')}
                error={errors.malezas_comunes}
                startDecorator={<Leaf size={16} />}
                textarea
                minRows={2}
                slotProps={{
                  input: {
                    onInput: handleTextareaInput,
                    style: { overflow: 'hidden' },
                  },
                }}
              />
            </Stack>
          </div>

          {/* Observaciones */}
          <div className="doc-section">
            <div className="doc-section__title">
              <StickyNote size={18} />
              <span>Observaciones</span>
            </div>
            <FormField
              label="Observaciones"
              value={data.observaciones}
              onChange={handleObservacionesChange}
              textarea
              minRows={3}
              error={errors.observaciones}
              startDecorator={<StickyNote size={16} />}
            />
          </div>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing || checkingNlab}>
            {checkingNlab ? 'Validando…' : 'Guardar'}
          </Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/documentos">Cancelar</Button>
        </Stack>
      </Stack>

      <Modal open={showMissingModal && hasMissingRequired} onClose={() => setShowMissingModal(false)}>
        <ModalDialog size="sm" variant="soft" color="warning">
          <Typography level="title-md" mb={1}>Campos obligatorios</Typography>
          <Typography level="body-sm">{missingMessage}</Typography>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button size="sm" variant="solid" onClick={() => setShowMissingModal(false)}>
              Entendido
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>  
    </form>
  );
}
