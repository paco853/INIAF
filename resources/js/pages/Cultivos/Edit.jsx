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

export default function CultivoEdit() {
  const { props } = usePage();
  const { cultivo, flash } = props;
  const { data, setData, put, processing, errors } = useForm({
    especie: cultivo.especie ?? '',
    categoria_inicial: cultivo.categoria_inicial ?? '',
    categoria_final: cultivo.categoria_final ?? '',
  });

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
      <Stack spacing={2}>
        <Typography level="h4">Editar especie #{cultivo.id}</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing}>Guardar</Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/cultivos">Cancelar</Button>
        </Stack>
      </Stack>
    </form>
  );
}
