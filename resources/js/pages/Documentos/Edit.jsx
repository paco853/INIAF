import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import {
  Stack,
  Typography,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Alert,
  RadioGroup,
  Radio,
  Modal,
  ModalDialog,
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
  Map,
  ShieldCheck,
  Thermometer,
  Activity,
} from 'lucide-react';

const DECIMAL_INPUT_SLOT_PROPS = Object.freeze({ input: { inputMode: 'decimal' } });

const FormField = React.memo(function FormField({
  label,
  value,
  onChange,
  type = 'text',
  textarea = false,
  error,
  minRows = 3,
  slotProps,
  required = false,
  startDecorator,
}) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      {textarea ? (
        <Textarea
          minRows={minRows}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          startDecorator={startDecorator}
        />
      ) : (
        <Input
          type={type}
          value={value ?? ''}
          onChange={onChange}
          slotProps={slotProps}
          required={required}
          startDecorator={startDecorator}
        />
      )}
      {error && (
        <Typography level="body-sm" color="danger">{error}</Typography>
      )}
    </FormControl>
  );
});

export default function DocumentoEdit() {
  const { props } = usePage();
  const { doc = {}, flash } = props;
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

  React.useEffect(() => {
    if (!hasMissingRequired) {
      setShowMissingModal(false);
    }
  }, [hasMissingRequired]);

  const toUpper = React.useCallback((value) => (
    typeof value === 'string' ? value.toUpperCase() : value
  ), []);

  const handleUpperChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, toUpper(value));
    },
    [setData, toUpper],
  );

  const handlePlainChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, value);
    },
    [setData],
  );

  const estadoValue = React.useMemo(() => data.estado || 'APROBADO', [data.estado]);

  const handleEstadoChange = React.useCallback(
    (event) => {
      const next = event.target.value;
      if (next === 'APROBADO') {
        setData('estado', 'APROBADO');
      } else if (next === 'RECHAZADO') {
        setData('estado', 'RECHAZADO');
      } else {
        setData('estado', '');
      }
    },
    [setData],
  );

  const totalKg = React.useMemo(() => {
    const bolsasNum = Number(data.bolsas);
    const kgbolNum = Number(data.kgbol);
    if (Number.isFinite(bolsasNum) && Number.isFinite(kgbolNum) && data.bolsas !== '' && data.kgbol !== '') {
      const total = bolsasNum * kgbolNum;
      return Number.isFinite(total) ? total.toFixed(2) : '';
    }
    return '';
  }, [data.bolsas, data.kgbol]);

  const buildAutoLote = React.useCallback(() => {
    const initials = (data.cooperador || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('');
    const lab = (data.nlab || '').trim();
    const especieInitial = ((data.especie || '').trim().charAt(0) || '').toUpperCase();
    let year = new Date().getFullYear();
    if (data.fecha_evaluacion) {
      const parsed = new Date(data.fecha_evaluacion);
      if (!Number.isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
      }
    }
    const parts = [initials, lab, especieInitial, String(year)];
    return parts
      .filter((segment) => segment && segment.length > 0)
      .join('-')
      .toUpperCase();
  }, [data.cooperador, data.nlab, data.especie, data.fecha_evaluacion]);

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
      setLoteDirty(true);
      const value = event.target.value ?? '';
      setData('lote', toUpper(value));
    },
    [setData, toUpper],
  );

  const submit = (e) => {
    e.preventDefault();
    if (hasMissingRequired) {
      setShowMissingModal(true);
      return;
    }
    setShowMissingModal(false);
    put(`/documentos/${doc.id}`);
  };

  return (
    <form onSubmit={submit} noValidate className="doc-form">
      <Stack spacing={2}>
        <Typography level="h4">Editar documento #{doc.id}</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}
        {missingMessage && <Alert color="warning" variant="soft">{missingMessage}</Alert>}

        <Stack className="doc-sections" spacing={2}>
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
                  error={errors.nlab}
                  required
                  startDecorator={<Hash size={16} />}
                />
                <FormField
                  label="Especie"
                  value={data.especie}
                  onChange={handleUpperChange('especie')}
                  error={errors.especie}
                  required
                  startDecorator={<Sprout size={16} />}
                />
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

              <FormField
                label="Observaciones"
                value={data.observaciones}
                onChange={handleUpperChange('observaciones')}
                textarea
                minRows={3}
                error={errors.observaciones}
                startDecorator={<StickyNote size={16} />}
              />
            </Stack>
          </div>

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
              />
              <FormField
                label="Malezas comunes"
                value={data.malezas_comunes}
                onChange={handleUpperChange('malezas_comunes')}
                error={errors.malezas_comunes}
                startDecorator={<Leaf size={16} />}
              />
            </Stack>
          </div>

          <div className="doc-section doc-section--peach">
            <div className="doc-section__title">
              <Package size={18} />
              <span>Recepción</span>
            </div>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <FormField
                  label="Variedad"
                  value={data.variedad}
                  onChange={handleUpperChange('variedad')}
                  error={errors.variedad}
                  required
                  startDecorator={<Tag size={16} />}
                />
                <FormField
                  label="Semillera (opcional)"
                  value={data.semillera}
                  onChange={handleUpperChange('semillera')}
                  error={errors.semillera}
                  startDecorator={<Building2 size={16} />}
                />
                <FormField
                  label="Cooperador (opcional)"
                  value={data.cooperador}
                  onChange={handleUpperChange('cooperador')}
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
                />
                <FormField
                  label="Categoría final"
                  value={data.categoria_final}
                  onChange={handleUpperChange('categoria_final')}
                  error={errors.categoria_final}
                  required
                  startDecorator={<ShieldCheck size={16} />}
                />
                <FormField
                  label="Lote"
                  value={data.lote}
                  onChange={handleLoteManualChange}
                  error={errors.lote}
                  required
                  startDecorator={<Package size={16} />}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
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
                <FormControl>
                  <FormLabel>Total (kg)</FormLabel>
                  <Input value={totalKg || ''} readOnly startDecorator={<Scale size={16} />} />
                </FormControl>
              </Stack>
            </Stack>
          </div>

          <div className="doc-section doc-section--blue">
            <div className="doc-section__title">
              <Map size={18} />
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
                startDecorator={<Map size={16} />}
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
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing}>Guardar</Button>
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
