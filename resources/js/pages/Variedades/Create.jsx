import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import { Stack, Typography, Button, FormControl, FormLabel, Select, Option, Input, Alert, IconButton } from '@mui/joy';
import { Trash2 } from 'lucide-react';

export default function VariedadCreate() {
  const { props } = usePage();
  const { flash, cultivos, defaultCultivoId, usedCultivoIds, redirectTo } = props;
  const initialCultivoId = React.useMemo(
    () => (defaultCultivoId != null ? String(defaultCultivoId) : ''),
    [defaultCultivoId],
  );
  const usedSet = React.useMemo(() => {
    const list = Array.isArray(usedCultivoIds) ? usedCultivoIds : [];
    return new Set(list.map((id) => String(id)));
  }, [usedCultivoIds]);
  const { data, setData, post, processing, errors } = useForm({
    cultivo_id: initialCultivoId,
    variedad: [''],
    redirect_to: redirectTo ?? '',
  });
  const [speciesWarning, setSpeciesWarning] = React.useState('');

  React.useEffect(() => {
    if (initialCultivoId && usedSet.has(initialCultivoId)) {
      setSpeciesWarning('Esta especie ya se encuentra registrada. Usa la pantalla de edición para modificar sus variedades.');
    }
  }, [initialCultivoId, usedSet]);
  React.useEffect(() => {
    setData('redirect_to', redirectTo ?? '');
  }, [redirectTo, setData]);

  const addVar = () => setData('variedad', [...data.variedad, '']);
  const removeVar = (idx) => setData('variedad', data.variedad.filter((_, i) => i !== idx));

  const handleCultivoChange = React.useCallback((_, value) => {
    const next = value ? String(value) : '';
    setData((prev) => ({ ...prev, cultivo_id: next }));
    if (next && usedSet.has(next)) {
      setSpeciesWarning('Esta especie ya se encuentra registrada. Usa la pantalla de edición para modificar sus variedades.');
    } else {
      setSpeciesWarning('');
    }
  }, [setData, usedSet]);

  const specieAlreadyUsed = data.cultivo_id && usedSet.has(String(data.cultivo_id));

  const submit = (e) => {
    e.preventDefault();
    if (specieAlreadyUsed) return;
    post('/variedades');
  };

  const handleVariedadChange = React.useCallback((idx) => (event) => {
    const next = [...data.variedad];
    next[idx] = (event.target.value ?? '').toUpperCase();
    setData('variedad', next);
  }, [data.variedad, setData]);

  const commonInputProps = {
    size: 'md',
    variant: 'outlined',
    sx: { borderRadius: 2, minWidth: { xs: '100%', md: 220 } },
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Typography level="h4">Crear variedades</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

        <FormControl error={Boolean(speciesWarning) || Boolean(errors.cultivo_id)}>
          <FormLabel>Cultivo (especie)</FormLabel>
          <Select
            value={data.cultivo_id || null}
            onChange={handleCultivoChange}
            placeholder="Selecciona especie"
            size="md"
            variant="outlined"
            sx={{ maxWidth: 360 }}
          >
            {cultivos?.map((c) => (
              <Option
                key={c.id}
                value={String(c.id)}
                disabled={usedSet.has(String(c.id))}
              >
                {c.especie}{usedSet.has(String(c.id)) ? ' (registrada)' : ''}
              </Option>
            ))}
          </Select>
          {speciesWarning && (
            <Typography level="body-sm" color="danger">{speciesWarning}</Typography>
          )}
          {errors.cultivo_id && <Typography level="body-sm" color="danger">{errors.cultivo_id}</Typography>}
        </FormControl>

        <Typography level="title-md">Variedades</Typography>
        <Stack spacing={1.5}>
          {data.variedad.map((v, i) => (
            <Stack
              key={i}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ maxWidth: 480 }}
            >
              <Input
                placeholder={`Variedad #${i + 1}`}
                value={v}
                onChange={handleVariedadChange(i)}
                {...commonInputProps}
                sx={{ ...commonInputProps.sx, flex: 1 }}
              />
              <IconButton
                variant="soft"
                color="danger"
                onClick={() => removeVar(i)}
                disabled={data.variedad.length === 1}
                sx={{ borderRadius: '50%' }}
              >
                <Trash2 size={18} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
        {errors.variedad && <Typography level="body-sm" color="danger">{errors.variedad}</Typography>}
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={addVar}>
            Añadir variedad
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing || specieAlreadyUsed}>
            Guardar
          </Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/variedades">
            Cancelar
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
