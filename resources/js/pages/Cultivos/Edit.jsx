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
  DEFAULT_VALIDEZ_UNIT,
  VALIDEZ_UNITS,
  convertAmountToDias,
  splitDiasIntoAmountUnit,
} from './validezUtils';

export default function CultivoEdit() {
  const { props } = usePage();
  const { cultivo, flash } = props;
  const { data, setData, put, processing, errors } = useForm({
    especie: cultivo.especie ?? '',
    categoria_inicial: cultivo.categoria_inicial ?? '',
    categoria_final: cultivo.categoria_final ?? '',
    dias: cultivo.dias ?? '',
  });
  const initialValidez = React.useMemo(
    () => splitDiasIntoAmountUnit(cultivo.dias),
    [cultivo.dias],
  );
  const [validezUnit, setValidezUnit] = React.useState(initialValidez.unit || DEFAULT_VALIDEZ_UNIT);
  const [validezValue, setValidezValue] = React.useState(initialValidez.amount || '');

  React.useEffect(() => {
    setValidezUnit(initialValidez.unit || DEFAULT_VALIDEZ_UNIT);
    setValidezValue(initialValidez.amount || '');
  }, [initialValidez.amount, initialValidez.unit]);

  const updateDias = React.useCallback(
    (amount, unit) => {
      const next = convertAmountToDias(amount, unit);
      setData('dias', next);
    },
    [setData],
  );

  const handleTextChange = React.useCallback(
    (field) => (event) => {
      const next = event.target.value ?? '';
      setData(field, next.toUpperCase());
    },
    [setData],
  );

  const submit = React.useCallback((event) => {
    event.preventDefault();
    put(`/cultivos/${cultivo.id}`);
  }, [cultivo.id, put]);

  return (
    <form onSubmit={submit}>
      <Stack spacing={2} className="cultivos-form-card">
        <Typography level="h4">Editar especie #{cultivo.id}</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

        <Stack spacing={2} className="cultivos-grid">
          <FormControl>
            <FormLabel>Especie</FormLabel>
            <Input
              value={data.especie ?? ''}
              onChange={handleTextChange('especie')}
            />
            {errors.especie && (
              <Typography level="body-sm" color="danger">{errors.especie}</Typography>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>Categoría inicial</FormLabel>
            <Input
              value={data.categoria_inicial ?? ''}
              onChange={handleTextChange('categoria_inicial')}
            />
            {errors.categoria_inicial && (
              <Typography level="body-sm" color="danger">{errors.categoria_inicial}</Typography>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>Categoría final</FormLabel>
            <Input
              value={data.categoria_final ?? ''}
              onChange={handleTextChange('categoria_final')}
            />
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
          <Button type="submit" variant="solid" disabled={processing}>Guardar</Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/cultivos">Cancelar</Button>
        </Stack>
      </Stack>
    </form>
  );
}
