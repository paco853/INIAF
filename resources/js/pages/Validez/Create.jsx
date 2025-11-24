import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import { Stack, Typography, Button, FormControl, FormLabel, Select, Option, Input, Alert } from '@mui/joy';

export default function ValidezCreate() {
  const { props } = usePage();
  const { flash, cultivos } = props;
  const { data, setData, post, processing, errors } = useForm({
    cultivo_id: '',
    dias: ''
  });

  const submit = (e) => {
    e.preventDefault();
    post('/validez');
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Typography level="h4">Crear validez</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

        <FormControl>
          <FormLabel>Cultivo (especie)</FormLabel>
          <Select value={data.cultivo_id || null} onChange={(_, v) => setData('cultivo_id', v || '')} placeholder="Selecciona especie">
            {cultivos?.map((c) => (
              <Option key={c.id} value={c.id} disabled={c.disabled}>{c.especie}</Option>
            ))}
          </Select>
          {errors.cultivo_id && <Typography level="body-sm" color="danger">{errors.cultivo_id}</Typography>}
        </FormControl>

        <FormControl>
          <FormLabel>Días</FormLabel>
          <Input type="number" value={data.dias} onChange={(e) => setData('dias', e.target.value)} />
          {errors.dias && <Typography level="body-sm" color="danger">{errors.dias}</Typography>}
        </FormControl>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing}>Guardar</Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/validez">Cancelar</Button>
        </Stack>
      </Stack>
    </form>
  );
}
