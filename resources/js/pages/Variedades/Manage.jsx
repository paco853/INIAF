import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Sheet,
  Input,
  Alert,
  IconButton,
} from '@mui/joy';

export default function ManageVariedades() {
  const { props } = usePage();
  const { cultivo, variedades = [], flash, errors } = props;

  const initialRows = React.useMemo(() => {
    if (Array.isArray(variedades) && variedades.length > 0) {
      return [...variedades];
    }
    return [''];
  }, [variedades]);

  const { data, setData, processing, put } = useForm({
    variedad: initialRows,
  });

  React.useEffect(() => {
    setData('variedad', initialRows);
  }, [initialRows, setData]);

  const handleChange = (index, value) => {
    const next = [...data.variedad];
    next[index] = value;
    setData('variedad', next);
  };

  const addRow = () => {
    setData('variedad', [...data.variedad, '']);
  };

  const removeRow = (index) => {
    if (data.variedad.length <= 1) {
      return;
    }
    const next = data.variedad.filter((_, idx) => idx !== index);
    setData('variedad', next.length ? next : ['']);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    put(`/variedades/cultivo/${cultivo.id}`, {
      preserveScroll: true,
    });
  };

  const rowErrors = React.useMemo(() => {
    const base = [];
    if (errors?.variedad) {
      base.push(errors.variedad);
    }
    Object.keys(errors || {}).forEach((key) => {
      if (key.startsWith('variedad.')) {
        base.push(errors[key]);
      }
    });
    return Array.from(new Set(base));
  }, [errors]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography level="h4">Gestionar variedades</Typography>
          <Typography level="body-sm" color="neutral">
            Cultivo: {cultivo?.especie}
          </Typography>
        </Box>
        <Button component={Link} href="/ui/variedades" variant="outlined">
          Volver
        </Button>
      </Stack>

      {flash?.status && (
        <Alert color="success" variant="soft">
          {flash.status}
        </Alert>
      )}
      {flash?.error && (
        <Alert color="danger" variant="soft">
          {flash.error}
        </Alert>
      )}

      {rowErrors.length > 0 && (
        <Alert color="danger" variant="soft">
          <Typography level="title-sm" sx={{ mb: 0.5 }}>
            Corrige los siguientes campos:
          </Typography>
          <ul style={{ margin: 0, paddingInlineStart: '18px' }}>
            {rowErrors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Sheet
        component="form"
        onSubmit={handleSubmit}
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 16 }}
      >
        <Stack spacing={1.5}>
          {data.variedad.map((value, index) => (
            <Stack
              key={`variedad-${index}`}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Input
                name={`variedad[${index}]`}
                value={value}
                onChange={(event) => handleChange(index, event.target.value)}
                placeholder="Ej. Hibrido A"
                required
                sx={{ flex: 1 }}
              />
              <IconButton
                color="danger"
                variant="soft"
                size="sm"
                onClick={() => removeRow(index)}
                disabled={data.variedad.length <= 1}
              >
                -
              </IconButton>
            </Stack>
          ))}
          <Button onClick={addRow} type="button" variant="outlined" color="neutral">
            Añadir otra
          </Button>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" color="neutral" component={Link} href="/ui/variedades">
              Cancelar
            </Button>
            <Button type="submit" loading={processing}>
              Actualizar
            </Button>
          </Stack>
        </Stack>
      </Sheet>
    </Stack>
  );
}
