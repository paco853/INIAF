import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import { Stack, Typography, Button, FormControl, FormLabel, Select, Option, Input, Alert } from '@mui/joy';

export default function ValidezEdit() {
  const { props } = usePage();
  const { flash, cultivos, validez } = props;
  const { data, setData, put, processing, errors } = useForm({
    cultivo_id: validez.cultivo_id ?? '',
    dias: validez.dias ?? ''
  });

  const submit = (e) => {
    e.preventDefault();
    put(`/validez/${validez.id}`);
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Typography level="h4">Editar validez #{validez.id}</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

        <FormControl>
          <FormLabel>Cultivo (especie)</FormLabel>
          <Select value={data.cultivo_id || null} onChange={(_, v) => setData('cultivo_id', v || '')}>
            {cultivos?.map((c) => (
              <Option key={c.id} value={c.id}>{c.especie}</Option>
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
