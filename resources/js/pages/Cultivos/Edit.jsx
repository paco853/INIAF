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

export default function CultivoEdit() {
  const { props } = usePage();
  const { cultivo, flash } = props;
  const initialValidez = React.useMemo(() => {
    if (cultivo.validez) {
      return {
        amount: cultivo.validez.cantidad ?? cultivo.validez.dias ?? '',
      };
    }
    return { amount: cultivo.dias ?? '' };
  }, [cultivo.validez, cultivo.dias]);
  const {
    data,
    setData,
    put,
    processing,
    errors,
  } = useForm({
    especie: cultivo.especie ?? '',
    categoria_inicial: cultivo.categoria_inicial ?? '',
    categoria_final: cultivo.categoria_final ?? '',
    dias: initialValidez.amount ?? cultivo.dias ?? '',
    validez_amount: initialValidez.amount ?? cultivo.dias ?? '',
    validez_unit: DEFAULT_VALIDEZ_UNIT,
  });
  const [validezDays, setValidezDays] = React.useState(initialValidez.amount ?? cultivo.dias ?? '');

  React.useEffect(() => {
    const value = initialValidez.amount ?? cultivo.dias ?? '';
    setValidezDays(value);
    setData('dias', value);
    setData('validez_amount', value);
    setData('validez_unit', DEFAULT_VALIDEZ_UNIT);
  }, [initialValidez.amount, cultivo.dias, setData]);

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
                value={validezDays}
                onChange={(event) => {
                  const next = event.target.value;
                  setValidezDays(next);
                  setData('dias', next);
                  setData('validez_amount', next);
                }}
                sx={{ flex: 1 }}
              />
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
