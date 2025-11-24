import React from 'react';
import { Typography, Stack, FormControl, FormLabel, Select, Option, Input, Button, Alert } from '@mui/joy';
import { usePage, Link } from '@inertiajs/react';

export default function DocumentosBulk() {
  const { props } = usePage();
  const { flash } = props;
  const [modo, setModo] = React.useState('nlab');
  const [desde, setDesde] = React.useState('');
  const [hasta, setHasta] = React.useState('');
  const csrfToken = React.useMemo(() => {
    if (typeof document === 'undefined') return '';
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
  }, []);

  return (
    <Stack spacing={2}>
      <Typography level="h4">Descarga general (merge de PDFs)</Typography>
      {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
      {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

      <form method="POST" action="/documentos/descarga-general" target="_blank">
        <input type="hidden" name="_token" value={csrfToken} />
        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Modo</FormLabel>
            <Select name="modo" value={modo} onChange={(_, v) => setModo(v || 'nlab')}>
              <Option value="nlab">Por N° de Laboratorio</Option>
              <Option value="gestion">Por Año (gestión)</Option>
            </Select>
          </FormControl>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl>
              <FormLabel>Desde</FormLabel>
              <Input name="desde" value={desde} onChange={(e) => setDesde(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel>Hasta</FormLabel>
              <Input name="hasta" value={hasta} onChange={(e) => setHasta(e.target.value)} required />
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="solid">Descargar</Button>
            <Button type="button" variant="outlined" color="neutral" component={Link} href="/ui/documentos">Volver</Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}
