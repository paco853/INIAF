import React from 'react';
import { Typography, Sheet, Table, Button, Input, Chip } from '@mui/joy';
import Stack from '@mui/joy/Stack';
import JoyStack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';
import { Link, router, usePage } from '@inertiajs/react';
import Paginator from '../../components/Paginator.jsx';
import { useDebouncedCallback } from '../../hooks/useDebounce.js';
import { Search } from 'lucide-react';

export default function Variedades() {
  const { props } = usePage();
  const { variedades, q, flash, allCovered } = props;
  const [query, setQuery] = React.useState(q || '');

  const handleSearchChange = (event) => {
    const newQuery = (event.target.value ?? '').toUpperCase();
    setQuery(newQuery);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    router.get('/ui/variedades', { q: query }, { preserveState: true, replace: true });
  };

  const handleClearFilters = React.useCallback(() => {
    setQuery('');
    router.get('/ui/variedades', {}, { preserveState: true, replace: true });
  }, [router]);

  return (
    <Stack spacing={1}>
      <Stack direction="row" className="section-header">
        <Typography level="h4" className="section-header__title">Variedades</Typography>
        <Button
          size="md"
          variant="solid"
          color={allCovered ? 'danger' : 'primary'}
          component={Link}
          href="/ui/variedades/create"
          sx={{
            px: 2.5,
            boxShadow: 'md',
            borderRadius: 12,
          }}
        >
          Nuevo
        </Button>
      </Stack>
      {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
      {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

      <Stack
        component="form"
        onSubmit={handleSearchSubmit}
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        sx={{
          mb: 1,
          justifyContent: 'flex-end',
          alignItems: { xs: 'stretch', md: 'center' },
        }}
      >
        <Input
          size="sm"
          placeholder="Buscar variedad o especie..."
          value={query}
          onChange={handleSearchChange}
          name="q"
          startDecorator={<Search size={14} />}
          className="search-input"
          sx={{
            maxWidth: { xs: '100%', md: 320 },
          }}
        />
        <Button type="submit" size="sm" variant="solid">
          Buscar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="plain"
          color="primary"
          onClick={handleClearFilters}
        >
          Limpiar filtros
        </Button>
      </Stack>

      <Sheet variant="outlined" sx={{ p: 0 }}>
        <Table
          stripe="odd"
          hoverRow
          sx={{ display: { xs: 'none', md: 'table' } }}
        >
          <thead>
            <tr>
              <th className="table-col--xs">#</th>
              <th>Variedad</th>
              <th>Especie</th>
              <th className="table-col--sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {variedades?.data?.length > 0 ? (
              variedades.data.map((v, idx) => {
                const offset = (variedades?.current_page ? (variedades.current_page - 1) : 0) * (variedades?.per_page ?? variedades?.data?.length ?? 0);
                const rowNumber = offset + idx + 1;
                const nombres = Array.isArray(v.nombre)
                  ? v.nombre
                  : String(v.nombre ?? '')
                      .split(/\r?\n/)
                      .map((n) => n.trim())
                      .filter(Boolean);
                return (
                  <tr key={v.id}>
                    <td>{rowNumber}</td>
                    <td>{nombres.join(', ') || '-'}</td>
                    <td>{v.cultivo?.especie ?? '-'}</td>
                    <td>
                      <Stack direction="row" spacing={1}>
                        <Button size="sm" variant="outlined" component={Link} href={`/ui/variedades/${v.id}/edit`}>Editar</Button>
                      </Stack>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No se encontraron variedades.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <JoyStack
          spacing={1}
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            p: 1.5,
            gap: 1,
          }}
        >
          {variedades?.data?.map((v, idx) => {
            const offset = (variedades?.current_page ? (variedades.current_page - 1) : 0) * (variedades?.per_page ?? variedades?.data?.length ?? 0);
            const rowNumber = offset + idx + 1;
            const nombres = Array.isArray(v.nombre)
              ? v.nombre
              : String(v.nombre ?? '')
                  .split(/\r?\n/)
                  .map((n) => n.trim())
                  .filter(Boolean);
            return (
              <Sheet
                key={v.id}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 0.75 }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography level="title-sm">#{rowNumber}</Typography>
                  <Button size="sm" variant="outlined" component={Link} href={`/ui/variedades/${v.id}/edit`}>
                    Editar
                  </Button>
                </Stack>
                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>Especie</Typography>
                <Typography level="title-sm">{v.cultivo?.especie ?? '-'}</Typography>
                <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.5 }}>Variedades</Typography>
                <JoyStack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                  {nombres.length ? nombres.map((nombre, index) => (
                    <Chip key={index} size="sm" variant="soft">
                      {nombre}
                    </Chip>
                  )) : (
                    <Chip size="sm" variant="soft" color="neutral">Sin registrar</Chip>
                  )}
                </JoyStack>
              </Sheet>
            );
          })}
        </JoyStack>
      </Sheet>

      <Paginator pagination={variedades} />
    </Stack>
  );
}
