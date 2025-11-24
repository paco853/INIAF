import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  Typography,
  Alert,
} from '@mui/joy';
import { router, useForm, usePage } from '@inertiajs/react';

const toNumericInputValue = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (str === '') return '';
  const asNumber = Number(str);
  return Number.isFinite(asNumber) ? str : '';
};

const textKeys = [
  'validez',
  'observaciones',
  'malezas_nocivas',
  'malezas_comunes',
];

const numericKeys = [
  'resultado',
  'otros_sp_pct',
  'otros_sp_kg',
  'otros_cultivos_pct',
  'otros_cultivos_kg',
  'malezas_comunes_pct',
  'malezas_comunes_kg',
  'malezas_prohibidas_pct',
  'malezas_prohibidas_kg',
  'germinacion_pct',
  'viabilidad_pct',
];

export default function AnalisisHumedad() {
  const { props } = usePage();
  const humidity = props?.humedad || {};
  const validezDefault = props?.validezDefault || '';
  const today = props?.today || new Date().toISOString().slice(0, 10);
  const errors = props?.errors || {};
  const HUMEDAD_STORAGE_KEY = 'analisis-humedad-form';

  const numericKeysSet = React.useMemo(() => new Set(numericKeys), []);

  const baseHumedadData = React.useMemo(() => {
    const base = {
      resultado: humidity.resultado ?? '',
      otros_sp_pct: humidity.otros_sp_pct ?? '',
      otros_sp_kg: humidity.otros_sp_kg ?? '',
      otros_cultivos_pct: humidity.otros_cultivos_pct ?? '',
      otros_cultivos_kg: humidity.otros_cultivos_kg ?? '',
      malezas_comunes_pct: humidity.malezas_comunes_pct ?? '',
      malezas_comunes_kg: humidity.malezas_comunes_kg ?? '',
      malezas_prohibidas_pct: humidity.malezas_prohibidas_pct ?? '',
      malezas_prohibidas_kg: humidity.malezas_prohibidas_kg ?? '',
      germinacion_pct: humidity.germinacion_pct ?? '',
      viabilidad_pct: humidity.viabilidad_pct ?? humidity.variavilidad_pct ?? '',
      estado: humidity.estado ?? '',
      validez: humidity.validez ?? validezDefault,
      fecha: humidity.fecha ?? today,
      observaciones: humidity.observaciones ?? '',
      malezas_nocivas: humidity.malezas_nocivas ?? '',
      malezas_comunes: humidity.malezas_comunes ?? '',
    };
    numericKeys.forEach((key) => {
      base[key] = toNumericInputValue(base[key]);
    });
    return base;
  }, [humidity, validezDefault, today]);

  const mergeStoredHumedadData = React.useCallback((base, stored) => {
    if (!stored || typeof stored !== 'object') {
      return base;
    }
    const normalizedStored = { ...stored };
    if (normalizedStored.viabilidad_pct === undefined && normalizedStored.variavilidad_pct !== undefined) {
      normalizedStored.viabilidad_pct = normalizedStored.variavilidad_pct;
    }
    delete normalizedStored.variavilidad_pct;
    const result = { ...base };
    Object.entries(normalizedStored).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      const sanitizedValue = numericKeysSet.has(key)
        ? toNumericInputValue(value)
        : value;
      if (numericKeysSet.has(key) && sanitizedValue === '') {
        return;
      }
      const current = result[key];
      if (current === undefined || current === null || current === '') {
        result[key] = sanitizedValue;
      }
    });
    return result;
  }, [numericKeysSet]);

  const initialHumedadData = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return baseHumedadData;
    }
    try {
      const raw = window.sessionStorage.getItem(HUMEDAD_STORAGE_KEY);
      if (!raw) {
        return baseHumedadData;
      }
      const parsed = JSON.parse(raw);
      return mergeStoredHumedadData(baseHumedadData, parsed);
    } catch (error) {
      console.warn('Humedad storage parse error', error);
      return baseHumedadData;
    }
  }, [baseHumedadData, mergeStoredHumedadData]);

  const normalizeValidez = React.useCallback(
    (value) => (value ?? '').toString().trim().toUpperCase(),
    [],
  );

  const [validezEdited, setValidezEdited] = React.useState(() => {
    const initialValidez = normalizeValidez(initialHumedadData.validez);
    const defaultVal = normalizeValidez(validezDefault);
    if (!initialValidez) return false;
    return initialValidez !== defaultVal;
  });
  const lastValidezDefaultRef = React.useRef(normalizeValidez(validezDefault));

  const { data, setData, post, processing, transform } = useForm('analisisHumedad', initialHumedadData);

  const handleTextChange = React.useCallback(
    (key) => (event) => setData(key, (event.target.value || '').toUpperCase()),
    [setData],
  );

  const handleNumberChange = React.useCallback(
    (key) => (event) => {
      setData(key, toNumericInputValue(event.target.value));
    },
    [setData],
  );

  const handleValidezChange = React.useCallback(
    (event) => {
      setValidezEdited(true);
      const value = event.target.value;
      setData('validez', normalizeValidez(value));
    },
    [normalizeValidez, setData],
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(HUMEDAD_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Humedad storage write error', error);
    }
  }, [data]);

  transform((curr) => {
    const next = { ...curr };
    textKeys.forEach((key) => {
      const value = next[key];
      if (typeof value === 'string') {
        next[key] = value.toUpperCase();
      }
    });
    numericKeys.forEach((key) => {
      next[key] = toNumericInputValue(next[key]);
    });
    return next;
  });

  React.useEffect(() => {
    const defaultVal = normalizeValidez(validezDefault);
    const lastDefault = lastValidezDefaultRef.current;
    const currentValidez = normalizeValidez(data.validez);
    const defaultChanged = defaultVal !== lastDefault;
    const matchesLastDefault = currentValidez === lastDefault || currentValidez === '';

    if (defaultChanged && (!validezEdited || matchesLastDefault)) {
      if (currentValidez !== defaultVal) {
        setData('validez', defaultVal);
      }
      setValidezEdited(false);
    }
    lastValidezDefaultRef.current = defaultVal;
  }, [validezDefault, validezEdited, data.validez, normalizeValidez, setData]);

  const errorList = React.useMemo(
    () => Object.values(errors).filter(Boolean),
    [errors],
  );

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

  const numberInputProps = {
    slotProps: {
      input: {
        inputMode: 'decimal',   
      },
    },
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="h4" sx={{ mb: 1 }}>
        REGISTRO_SEMILLAS
      </Typography>

      {props?.flash?.error && (
        <Alert color="danger" variant="soft" sx={{ mb: 1 }}>
          {props.flash.error}
        </Alert>
      )}
      {props?.flash?.status && (
        <Alert color="success" variant="soft" sx={{ mb: 1 }}>
          {props.flash.status}
        </Alert>
      )}
      {errorList.length > 0 && (
        <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
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

      <form onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <FormControl>
              <FormLabel>Humedad (%)</FormLabel>
              <Input
                type="number"
                placeholder="Opcional"
                step="0.01"
                value={toNumericInputValue(data.resultado)}
                onChange={handleNumberChange('resultado')}
                {...numberInputProps}
              />
            </FormControl>

            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Semilla pura (otros)
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
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

            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Otros cultivos
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
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

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Semillas de malezas comunes
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
                <FormControl>
                  <FormLabel>Porcentaje %</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={toNumericInputValue(data.malezas_comunes_pct)}
                    onChange={handleNumberChange('malezas_comunes_pct')}
                    {...numberInputProps}
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
                    {...numberInputProps}
                  />
                </FormControl>
              </Box>
            </Box>

            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Semillas de malezas prohibidas
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                }}
              >
                <FormControl>
                  <FormLabel>Porcentaje %</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={toNumericInputValue(data.malezas_prohibidas_pct)}
                    onChange={handleNumberChange('malezas_prohibidas_pct')}
                    {...numberInputProps}
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
                    {...numberInputProps}
                  />
                </FormControl>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                md: 'repeat(5, minmax(0, 1fr))',
              },
            }}
          >
            <Box>
              
              
              
              <FormControl>
                <FormLabel>Germinación %</FormLabel>
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
              </FormControl>
            </Box>

            <Box>
              
              
              
              <FormControl>
                <FormLabel>Viabilidad %</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={toNumericInputValue(data.viabilidad_pct)}
                  onChange={handleNumberChange('viabilidad_pct')}
                  {...numberInputProps}
                />
              </FormControl>
            </Box>

            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Estado
              </Typography>
              <FormControl>
                <RadioGroup
                  name="estado"
                  value={data.estado || null}
                  onChange={(event) => setData('estado', event.target.value)}
                  sx={{ gap: 1 }}
                >
                  <Radio value="APROBADO" label="Aprobado" required />
                  <Radio value="RECHAZADO" label="Rechazado" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box>
              
              
              
              <FormControl>
                <FormLabel>Validez del análisis</FormLabel>
                <Input
                  placeholder={validezDefault || 'Ej. 6 meses'}
                  value={data.validez}
                  onChange={handleValidezChange}
                />
              </FormControl>
            </Box>

            <Box>
             
             
             
              <FormControl>
                <FormLabel>Fecha de evaluación</FormLabel>
                <Input
                  type="date"
                  value={data.fecha}
                  onChange={(e) => setData('fecha', e.target.value)}
                />
              </FormControl>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '2fr 3fr' },
            }}
          >
            <FormControl>
              <FormLabel>Observaciones</FormLabel>
              <Textarea
                minRows={6}
                value={data.observaciones}
                onChange={handleTextChange('observaciones')}
              />
            </FormControl>

            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Malezas
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                <FormControl>
                  <FormLabel>Semillas de malezas nocivas o prohibidas</FormLabel>
                  <Input
                    value={data.malezas_nocivas}
                    onChange={handleTextChange('malezas_nocivas')}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Semillas de malezas comunes</FormLabel>
                  <Input
                    value={data.malezas_comunes}
                    onChange={handleTextChange('malezas_comunes')}
                  />
                </FormControl>
              </Box>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'flex-end' }}>
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
        </Stack>
      </form>
    </Box>
  );
}
