import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Typography,
  Alert,
} from '@mui/joy';
import { router, usePage } from '@inertiajs/react';
import {
  Droplets,
  Sprout,
  AlertTriangle,
  ClipboardCheck,
  Gauge,
  Shield,
} from 'lucide-react';
import { HUMEDAD_STORAGE_KEY, useHumedadForm } from './hooks/useHumedadForm';

const toNumericInputValue = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (str === '') return '';
  const asNumber = Number(str);
  return Number.isFinite(asNumber) ? str : '';
};

const SectionHeader = ({ number, label, color, Icon }) => (
  <Box className="humedad-section__title">
    <span className={`pill pill--${color}`}>
      <Icon size={16} />
      {number}
    </span>
    <Typography level="title-md">{label}</Typography>
    <Box className="section-spacer" />
  </Box>
);

const VitalidadSection = ({ data, handleNumberChange, numberInputProps }) => (
  <Box className="humedad-section">
    <SectionHeader number="1" label="Análisis de vitalidad" color="green" Icon={Gauge} />
    <Box className="humedad-cards humedad-cards--trio">
      <Box className="humedad-card-mini card--blue">
        <div className="mini-card__top">
          <Droplets size={18} />
          <Typography level="title-sm">Humedad (%)</Typography>
        </div>
        <Input
          type="number"
          placeholder="Opcional"
          step="0.01"
          value={toNumericInputValue(data.resultado)}
          onChange={handleNumberChange('resultado')}
          {...numberInputProps}
        />
      </Box>
      <Box className="humedad-card-mini card--green">
        <div className="mini-card__top">
          <Sprout size={18} />
          <Typography level="title-sm">Germinación %</Typography>
        </div>
        <Input
          type="number"
          placeholder="Opcional"
          step="0.01"
          min="0"
          max="100"
          value={toNumericInputValue(data.germinacion_pct)}
          onChange={handleNumberChange('germinacion_pct')}
          {...numberInputProps}
        />
      </Box>
      <Box className="humedad-card-mini card--amber">
        <div className="mini-card__top">
          <ClipboardCheck size={18} />
          <Typography level="title-sm">Viabilidad %</Typography>
        </div>
        <Input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={toNumericInputValue(data.viabilidad_pct)}
          onChange={handleNumberChange('viabilidad_pct')}
          {...numberInputProps}
        />
      </Box>
    </Box>
  </Box>
);

const PurezaSection = ({ data, handleNumberChange, numberInputProps }) => (
  <Box className="humedad-section">
    <SectionHeader number="2" label="Análisis de pureza" color="orange" Icon={Gauge} />
    <Box className="humedad-cards humedad-cards--double">
      <Box className="humedad-card-mini card--soft">
        <Typography level="title-sm">Semilla pura (otros)</Typography>
        <Box className="humedad-grid humed-grid--pair">
          <FormControl>
            <FormLabel>Porcentaje %</FormLabel>
            <Input
              type="number"
              placeholder="Opcional"
              step="0.01"
              min="0"
              max="100"
              value={toNumericInputValue(data.otros_sp_pct)}
              onChange={handleNumberChange('otros_sp_pct')}
              {...numberInputProps}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Nº/KG</FormLabel>
            <Input
              type="number"
              placeholder="Opcional"
              step="1"
              min="0"
              value={toNumericInputValue(data.otros_sp_kg)}
              onChange={handleNumberChange('otros_sp_kg')}
              {...numberInputProps}
            />
          </FormControl>
        </Box>
      </Box>
      <Box className="humedad-card-mini card--soft">
        <Typography level="title-sm">Otros cultivos</Typography>
        <Box className="humedad-grid humed-grid--pair">
          <FormControl>
            <FormLabel>Porcentaje %</FormLabel>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={toNumericInputValue(data.otros_cultivos_pct)}
              onChange={handleNumberChange('otros_cultivos_pct')}
              {...numberInputProps}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Nº/KG</FormLabel>
            <Input
              type="number"
              step="1"
              min="0"
              value={toNumericInputValue(data.otros_cultivos_kg)}
              onChange={handleNumberChange('otros_cultivos_kg')}
              {...numberInputProps}
            />
          </FormControl>
        </Box>
      </Box>
    </Box>
  </Box>
);

const ControlMalezaSection = ({
  data,
  handleNumberChange,
  handleTextChange,
}) => (
  <Box className="humedad-section">
    <SectionHeader
      number="3"
      label="Control de malezas"
      color="red"
      Icon={AlertTriangle}
    />
    <Box className="humedad-cards humedad-cards--double">
      <Box className="humedad-card-mini card--green-light">
        <Typography level="title-sm">Semillas de malezas comunes</Typography>
        <Box className="humedad-grid humed-grid--pair">
          <FormControl>
            <FormLabel>Porcentaje %</FormLabel>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={toNumericInputValue(data.malezas_comunes_pct)}
              onChange={handleNumberChange('malezas_comunes_pct')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Nº/KG</FormLabel>
            <Input
              type="number"
              step="1"
              min="0"
              value={toNumericInputValue(data.malezas_comunes_kg)}
              onChange={handleNumberChange('malezas_comunes_kg')}
            />
          </FormControl>
        </Box>
        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Semillas de malezas comunes</FormLabel>
          <Textarea
            minRows={2}
            maxRows={4}
            className="malezas-textarea"
            value={data.malezas_comunes}
            onChange={handleTextChange('malezas_comunes')}
          />
        </FormControl>
      </Box>
      <Box className="humedad-card-mini card--red-light">
        <Typography level="title-sm">Semillas de malezas prohibidas</Typography>
        <Box className="humedad-grid humed-grid--pair">
          <FormControl>
            <FormLabel>Porcentaje %</FormLabel>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={toNumericInputValue(data.malezas_prohibidas_pct)}
              onChange={handleNumberChange('malezas_prohibidas_pct')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Nº/KG</FormLabel>
            <Input
              type="number"
              step="1"
              min="0"
              value={toNumericInputValue(data.malezas_prohibidas_kg)}
              onChange={handleNumberChange('malezas_prohibidas_kg')}
            />
          </FormControl>
        </Box>
        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Semillas de malezas nocivas o prohibidas</FormLabel>
          <Textarea
            minRows={2}
            maxRows={4}
            className="malezas-textarea"
            value={data.malezas_nocivas}
            onChange={handleTextChange('malezas_nocivas')}
          />
        </FormControl>
      </Box>
    </Box>
  </Box>
);

const DictamenSection = ({
  data,
  handleTextChange,
  handleValidezChange,
  numberInputProps,
  validezDefault,
  setData,
}) => (
  <Box className="humedad-section">
    <SectionHeader
      number="4"
      label="Dictamen técnico"
      color="blue"
      Icon={ClipboardCheck}
    />
    <Box className="humedad-cards humedad-cards--notes">
      <FormControl className="card--soft">
        <FormLabel>Observaciones</FormLabel>
        <Textarea
          minRows={6}
          value={data.observaciones}
          onChange={handleTextChange('observaciones')}
        />
      </FormControl>
      <Box className="humedad-card-mini card--soft state-card">
        <Typography level="title-sm" className="state-title">
          Estado
        </Typography>
        <Box className="state-options">
          <label
            className={`state-chip ${
              data.estado === 'APROBADO' ? 'state-chip--active' : ''
            }`}
          >
            <input
              type="radio"
              name="estado"
              value="APROBADO"
              checked={data.estado === 'APROBADO'}
              onChange={(e) => setData('estado', e.target.value)}
              required
            />
            <span className="state-icon success">✓</span>
            <span className="state-label">Aprobado</span>
          </label>
          <label
            className={`state-chip ${
              data.estado === 'RECHAZADO' ? 'state-chip--active' : ''
            }`}
          >
            <input
              type="radio"
              name="estado"
              value="RECHAZADO"
              checked={data.estado === 'RECHAZADO'}
              onChange={(e) => setData('estado', e.target.value)}
            />
            <span className="state-icon danger">✕</span>
            <span className="state-label">Rechazado</span>
          </label>
        </Box>
        <Box className="state-footer">
          <FormControl>
            <FormLabel className="muted-label">Validez del análisis</FormLabel>
            <Input
              placeholder={validezDefault || 'Ej. 6 meses'}
              value={data.validez}
              onChange={handleValidezChange}
              {...numberInputProps}
            />
          </FormControl>
          <FormControl>
            <FormLabel className="muted-label">Fecha de evaluación</FormLabel>
            <Input
              type="date"
              value={data.fecha}
              onChange={(e) => setData('fecha', e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>
    </Box>
  </Box>
);

export default function AnalisisHumedad() {
  const { props } = usePage();
  const {
    data,
    setData,
    post,
    processing,
    handleTextChange,
    handleNumberChange,
    handleValidezChange,
    errorList,
    numberInputProps,
    validezDefault,
  } = useHumedadForm(props);

  const onSubmit = (event) => {
    event.preventDefault();
    post('/analisis/pureza/finalizar', {
      onSuccess: () => {
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.removeItem(HUMEDAD_STORAGE_KEY);
            window.sessionStorage.removeItem('analisis-recepcion-form');
          } catch (error) {
            console.warn('Humedad storage remove error', error);
          }
        }
      },
    });
  };

  const handleBack = () => {
    if (document.referrer) {
      window.history.back();
      return;
    }
    router.visit('/ui/analisis/semillas');
  };

  return (
    <Box className="humedad-page">
      <Box className="humedad-header">
        <Box className="humedad-header__left">
          <span className="header-icon">
            <Shield size={18} />
          </span>
          <Typography level="h4" className="humedad-heading">
            REGISTRO_SEMILLAS
          </Typography>
        </Box>
      </Box>
      <Box className="humedad-card">
        {props?.flash?.error && (
          <Alert color="danger" variant="soft" className="humedad-alert">
            {props.flash.error}
          </Alert>
        )}
        {props?.flash?.status && (
          <Alert color="success" variant="soft" className="humedad-alert">
            {props.flash.status}
          </Alert>
        )}
        {errorList.length > 0 && (
          <Alert color="danger" variant="soft" className="humedad-alert">
            <Typography level="title-sm" sx={{ mb: 0.5 }}>
              Corrige los siguientes campos:
            </Typography>
            <ul className="list-compact-lg">
              {errorList.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </Alert>
        )}
        <form onSubmit={onSubmit} className="humedad-form">
          <VitalidadSection
            data={data}
            handleNumberChange={handleNumberChange}
            numberInputProps={numberInputProps}
          />
          <PurezaSection
            data={data}
            handleNumberChange={handleNumberChange}
            numberInputProps={numberInputProps}
          />
          <ControlMalezaSection
            data={data}
            handleNumberChange={handleNumberChange}
            handleTextChange={handleTextChange}
          />
          <DictamenSection
            data={data}
            handleTextChange={handleTextChange}
            handleValidezChange={handleValidezChange}
            numberInputProps={numberInputProps}
            validezDefault={validezDefault}
            setData={setData}
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            className="humedad-actions"
          >
            <Button
              type="button"
              variant="outlined"
              color="neutral"
              onClick={handleBack}
            >
              Anterior
            </Button>
            <Button type="submit" variant="solid" disabled={processing}>
              Finalizar
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
