import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import {
  Stack,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
} from '@mui/joy';

const createInitialVariedades = (items) => {
  if (Array.isArray(items) && items.length > 0) {
    return items.map((item) => {
      if (item == null) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && 'nombre' in item) return item.nombre ?? '';
      return String(item ?? '');
    });
  }
  return [''];
};

export default function VariedadEdit() {
  const { props } = usePage();
  const { flash, cultivo, variedades = [], variedadId } = props;

  const initialVariedades = React.useMemo(
    () => createInitialVariedades(variedades),
    [variedades],
  );

  const { data, setData, put, processing, errors } = useForm({
    variedades: initialVariedades,
  });

  React.useEffect(() => {
    setData((prev) => ({
      ...prev,
      variedades: createInitialVariedades(variedades),
    }));
  }, [setData, variedades]);

  const handleNombreChange = React.useCallback((idx, value) => {
    const upper = (value ?? '').toUpperCase();
    setData((prev) => {
      const list = [...(prev.variedades || [])];
      list[idx] = upper;
      return { ...prev, variedades: list };
    });
  }, [setData]);

  const handleRemove = React.useCallback((idx) => {
    setData((prev) => {
      const list = (prev.variedades || []).filter((_, index) => index !== idx);
      return { ...prev, variedades: list.length ? list : [''] };
    });
  }, [setData]);

  const handleAdd = React.useCallback(() => {
    setData((prev) => ({
      ...prev,
      variedades: [...(prev.variedades || []), ''],
    }));
  }, [setData]);

  const submit = (event) => {
    event.preventDefault();
    put(`/variedades/${variedadId}`);
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Typography level="h4">Editar variedades</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

        <FormControl>
          <FormLabel>Cultivo (especie)</FormLabel>
          <Input value={cultivo?.especie ?? ''} readOnly sx={{ pointerEvents: 'none' }} />
        </FormControl>

        <Typography level="title-md">Variedades</Typography>
        <Stack spacing={1}>
          {(data.variedades || []).map((nombre, idx) => {
            const fieldKey = `variedades.${idx}`;
            return (
              <Stack key={`variedad-${idx}`} spacing={0.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', md: 'center' }}
                >
                  <Input
                    placeholder={`Variedad #${idx + 1}`}
                    value={nombre ?? ''}
                    onChange={(e) => handleNombreChange(idx, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    color="danger"
                    onClick={() => handleRemove(idx)}
                    disabled={(data.variedades || []).length === 1}
                    sx={{ minWidth: 120 }}
                  >
                    Quitar
                  </Button>
                </Stack>
                {errors[fieldKey] && (
                  <Typography level="body-sm" color="danger">{errors[fieldKey]}</Typography>
                )}
              </Stack>
            );
          })}
        </Stack>
        {errors.variedades && (
          <Typography level="body-sm" color="danger">{errors.variedades}</Typography>
        )}
        <Button type="button" variant="outlined" color="primary" onClick={handleAdd} fullWidth>
          Añadir variedad
        </Button>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing}>Guardar</Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/variedades">Cancelar</Button>
        </Stack>
      </Stack>
    </form>
  );
}
