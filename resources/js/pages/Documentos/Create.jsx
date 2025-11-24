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
} from '@mui/joy';

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
        />
      ) : (
        <Input
          type={type}
          value={value ?? ''}
          onChange={onChange}
          slotProps={slotProps}
          required={required}
        />
      )}
      {error && (
        <Typography level="body-sm" color="danger">{error}</Typography>
      )}
    </FormControl>
  );
});

export default function DocumentoCreate() {
  const { props } = usePage();
  const { flash } = props;
  const {
    data,
    setData,
    post,
    processing,
    errors,
    reset,
  } = useForm({
    nlab: '',
    especie: '',
    fecha_evaluacion: '',
    estado: 'APROBADO',
    validez: '',
    observaciones: '',
    malezas_nocivas: '',
    malezas_comunes: '',
    variedad: '',
    semillera: '',
    cooperador: '',
    categoria_inicial: '',
    categoria_final: '',
    lote: '',
    bolsas: '',
    kgbol: '',
    municipio: '',
    comunidad: '',
    aut_import: '',
    resultado: '',
    otros_sp_pct: '',
    otros_sp_kg: '',
    otros_cultivos_pct: '',
    otros_cultivos_kg: '',
    malezas_comunes_pct: '',
    malezas_comunes_kg: '',
    malezas_prohibidas_pct: '',
    malezas_prohibidas_kg: '',
    germinacion_pct: '',
    viabilidad_pct: '',
  });
  const [loteDirty, setLoteDirty] = React.useState(false);

  const REQUIRED_FIELDS = React.useMemo(() => ([
    'nlab',
    'especie',
    'fecha_evaluacion',
    'estado',
    'validez',
    'variedad',
    'categoria_inicial',
    'categoria_final',
    'lote',
    'bolsas',
    'kgbol',
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
    const bolsasNum = parseFloat(data.bolsas);
    const kgbolNum = parseFloat(data.kgbol);
    if (!Number.isNaN(bolsasNum) && !Number.isNaN(kgbolNum) && Number.isFinite(bolsasNum) && Number.isFinite(kgbolNum)) {
      const total = bolsasNum * kgbolNum;
      if (Number.isFinite(total)) {
        return total.toFixed(2);
      }
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
    if (hasMissingRequired) { return; }
    post('/documentos', { onSuccess: () => reset(), preserveScroll: true });
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Typography level="h4">Crear documento</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}
        {missingMessage && <Alert color="warning" variant="soft">{missingMessage}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormField
            label="N° Laboratorio"
            value={data.nlab}
            onChange={handleUpperChange('nlab')}
            error={errors.nlab}
            required
          />
          <FormField
            label="Especie"
            value={data.especie}
            onChange={handleUpperChange('especie')}
            error={errors.especie}
            required
          />
          <FormField
            label="Fecha evaluación"
            type="date"
            value={data.fecha_evaluacion}
            onChange={handlePlainChange('fecha_evaluacion')}
            error={errors.fecha_evaluacion}
            required
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
            required
          />
        </Stack>

        <FormField
          label="Observaciones"
          value={data.observaciones}
          onChange={handleUpperChange('observaciones')}
          textarea
          minRows={3}
          error={errors.observaciones}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormField
            label="Malezas nocivas"
            value={data.malezas_nocivas}
            onChange={handleUpperChange('malezas_nocivas')}
            error={errors.malezas_nocivas}
          />
          <FormField
            label="Malezas comunes"
            value={data.malezas_comunes}
            onChange={handleUpperChange('malezas_comunes')}
            error={errors.malezas_comunes}
          />
        </Stack>

        <Typography level="title-md">Recepción</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormField
            label="Variedad"
            value={data.variedad}
            onChange={handleUpperChange('variedad')}
            error={errors.variedad}
            required
          />
          <FormField
            label="Semillera (opcional)"
            value={data.semillera}
            onChange={handleUpperChange('semillera')}
            error={errors.semillera}
          />
          <FormField
            label="Cooperador (opcional)"
            value={data.cooperador}
            onChange={handleUpperChange('cooperador')}
            error={errors.cooperador}
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormField
            label="Categoría inicial"
            value={data.categoria_inicial}
            onChange={handleUpperChange('categoria_inicial')}
            error={errors.categoria_inicial}
            required
          />
          <FormField
            label="Categoría final"
            value={data.categoria_final}
            onChange={handleUpperChange('categoria_final')}
            error={errors.categoria_final}
            required
          />
          <FormField
            label="Lote"
            value={data.lote}
            onChange={handleLoteManualChange}
            error={errors.lote}
            required
          />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormField
            label="Bolsas"
            type="number"
            step="1"
            min="0"
            value={data.bolsas}
            onChange={handlePlainChange('bolsas')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.bolsas}
            required
          />
          <FormField
            label="Kg/bolsa"
            type="number"
            step="0.01"
            min="0"
            value={data.kgbol}
            onChange={handlePlainChange('kgbol')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.kgbol}
            required
          />
          <FormControl>
            <FormLabel>Total (kg)</FormLabel>
            <Input value={totalKg} readOnly />
          </FormControl>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormField
            label="Municipio (opcional)"
            value={data.municipio}
            onChange={handleUpperChange('municipio')}
            error={errors.municipio}
          />
          <FormField
            label="Comunidad (opcional)"
            value={data.comunidad}
            onChange={handleUpperChange('comunidad')}
            error={errors.comunidad}
          />
          <FormField
            label="Aut. Importación"
            value={data.aut_import}
            onChange={handleUpperChange('aut_import')}
            error={errors.aut_import}
            required
          />
        </Stack>

        <Typography level="title-md">Análisis de humedad y pureza</Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing || hasMissingRequired}>Crear</Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/documentos">Cancelar</Button>
        </Stack>
      </Stack>
    </form>
  );
}
