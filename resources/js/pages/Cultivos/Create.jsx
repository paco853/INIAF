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
  Select,
  Option,
} from '@mui/joy';
import {
  convertAmountToDias,
  DEFAULT_VALIDEZ_UNIT,
  VALIDEZ_UNITS,
} from './validezUtils';

export default function CultivoCreate() {
  const { flash } = usePage().props;
  const {
    data,
    setData,
    post,
    processing,
    errors,
    reset,
  } = useForm({
    especie: '',
    categoria_inicial: '',
    categoria_final: '',
    dias: '',
    validez_amount: '',
    validez_unit: DEFAULT_VALIDEZ_UNIT,
  });
  const [validezUnit, setValidezUnit] = React.useState(DEFAULT_VALIDEZ_UNIT);
  const [validezValue, setValidezValue] = React.useState('');

  const updateDias = React.useCallback((amount, unit) => {
    const next = convertAmountToDias(amount, unit);
    setData('dias', next);
    setData('validez_amount', amount);
    setData('validez_unit', unit);
  }, [setData]);

  const handleChange = React.useCallback(
    (field) => (event) => {
      const next = event.target.value ?? '';
      setData(field, next.toUpperCase());
    },
    [setData],
  );

  const submit = React.useCallback((event) => {
    event.preventDefault();
    post('/cultivos', {
      onSuccess: () => reset(),
    });
  }, [post, reset]);

  return (
    <form onSubmit={submit}>
      <Stack spacing={2} className="cultivos-form-card">
        <Typography level="h4">Crear especie</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

        <Stack spacing={2} className="cultivos-grid">
          <FormControl>
            <FormLabel>Especie</FormLabel>
            <Input value={data.especie} onChange={handleChange('especie')} />
            {errors.especie && (
              <Typography level="body-sm" color="danger">{errors.especie}</Typography>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>Categoría inicial</FormLabel>
            <Input value={data.categoria_inicial} onChange={handleChange('categoria_inicial')} />
            {errors.categoria_inicial && (
              <Typography level="body-sm" color="danger">{errors.categoria_inicial}</Typography>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>Categoría final</FormLabel>
            <Input value={data.categoria_final} onChange={handleChange('categoria_final')} />
            {errors.categoria_final && (
              <Typography level="body-sm" color="danger">{errors.categoria_final}</Typography>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>
              Validez de análisis{' '}
              <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary' }}>
                (Selecciona cantidad y unidad)
              </Typography>
            </FormLabel>
                <Stack direction="row" spacing={1}>
                  <Input
                    type="number"
                    min={0}
                    value={validezValue}
                    onChange={(event) => {
                      const next = event.target.value;
                      setValidezValue(next);
                      updateDias(next, validezUnit);
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Select
                    value={validezUnit}
                    onChange={(_, value) => {
                      const nextUnit = value || DEFAULT_VALIDEZ_UNIT;
                      setValidezUnit(nextUnit);
                      updateDias(validezValue, nextUnit);
                    }}
                    sx={{ minWidth: 110 }}
                  >
                    {VALIDEZ_UNITS.map((unit) => (
                      <Option key={unit.value} value={unit.value}>{unit.label}</Option>
                    ))}
                  </Select>
                </Stack>
            {errors.dias && (
              <Typography level="body-sm" color="danger">{errors.dias}</Typography>
            )}
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing}>Crear</Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/cultivos">Cancelar</Button>
        </Stack>
      </Stack>
    </form>
  );
}
