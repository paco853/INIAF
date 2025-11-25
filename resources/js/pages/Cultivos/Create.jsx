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

export default function CultivoCreate() {
  const { flash } = usePage().props;
  const { data, setData, post, processing, errors, reset } = useForm({
    especie: '',
    categoria_inicial: '',
    categoria_final: '',
    dias: '',
  });

  const handleChange = React.useCallback(
    (field) => (event) => {
      const next = event.target.value ?? '';
      setData(field, next.toUpperCase());
    },
    [setData],
  );

  const submit = React.useCallback((event) => {
    event.preventDefault();
    post('/cultivos', { onSuccess: () => reset() });
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
            <FormLabel>Validez de análisis (días)</FormLabel>
            <Input
              type="number"
              value={data.dias}
              onChange={(e) => setData('dias', e.target.value)}
              min={0}
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
