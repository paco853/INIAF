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
} from '@mui/joy';
import {
  DEFAULT_VALIDEZ_UNIT,
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
  const [validezValue, setValidezValue] = React.useState('');

  const updateDias = React.useCallback((value) => {
    const next = value ?? '';
    setValidezValue(next);
    setData('dias', next);
    setData('validez_amount', next);
    setData('validez_unit', DEFAULT_VALIDEZ_UNIT);
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
      onSuccess: () => {
        reset();
        setValidezValue('');
      },
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
                (Ingresa la cantidad en días)
              </Typography>
            </FormLabel>
            <Input
              type="number"
              min={0}
              value={validezValue}
              onChange={(event) => {
                updateDias(event.target.value);
              }}
            />
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
