import React from 'react';
import { Typography, Sheet, Table, Button, Input, Stack as JoyStack, Chip, IconButton } from '@mui/joy';
import { Search } from 'lucide-react';
import Stack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';
import { Link, router, usePage } from '@inertiajs/react';
import Paginator from '../../components/Paginator.jsx';
import { useDebouncedCallback } from '../../hooks/useDebounce.js';

export default function Cultivos() {
  const { props } = usePage();
  const { cultivos, q, flash } = props;
  const [query, setQuery] = React.useState(q || '');
  const debouncedSearch = useDebouncedCallback((value) => {
    router.get('/ui/cultivos', { q: value }, { preserveState: true, replace: true });
  }, 400, []);
  const [deletingId, setDeletingId] = React.useState(null);

  const onSearch = (value) => debouncedSearch(value);

  const handleDelete = React.useCallback((id, especie) => {
    if (!id) return;
    const confirmed = window.confirm(`¿Eliminar la especie "${especie ?? ''}"?`);
    if (!confirmed) return;
    setDeletingId(id);
    router.delete(`/cultivos/${id}`, {
      preserveScroll: true,
      onFinish: () => setDeletingId(null),
    });
  }, []);

  return (
    <Stack spacing={1}>
      <Stack direction="row" className="section-header">
        <Typography level="h4" className="section-header__title">Cultivos</Typography>
        <Button
          size="md"
          variant="solid"
          component={Link}
          href="/ui/cultivos/create"
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
          placeholder="Buscar especie..."
          value={query}
          startDecorator={<Search size={14} />}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="search-input"
          sx={{
            maxWidth: { xs: '100%', md: 320 },
          }}
        />
      </Stack>

      <Sheet variant="outlined" sx={{ p: 0 }}>
        <Table
          stripe="odd"
          hoverRow
          sx={{
            display: { xs: 'none', md: 'table' },
          }}
        >
          <thead>
            <tr>
              <th className="table-col--xs">#</th>
              <th>Especie</th>
              <th>Cat. Inicial</th>
              <th>Cat. Final</th>
              <th className="table-col--lg">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cultivos?.data?.map((c, idx) => {
              const offset = (cultivos?.current_page ? (cultivos.current_page - 1) : 0) * (cultivos?.per_page ?? cultivos?.data?.length ?? 0);
              const rowNumber = offset + idx + 1;
              return (
              <tr key={c.id}>
                <td>{rowNumber}</td>
                <td>{c.especie}</td>
                <td>{c.categoria_inicial ?? '-'}</td>
                <td>{c.categoria_final ?? '-'}</td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <Button size="sm" variant="outlined" component={Link} href={`/ui/cultivos/${c.id}/edit`}>Editar</Button>
                    <Button
                      size="sm"
                      variant="soft"
                      color="danger"
                      loading={deletingId === c.id}
                      onClick={() => handleDelete(c.id, c.especie)}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </td>
              </tr>
              );
            })}
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
          {cultivos?.data?.map((c, idx) => {
            const offset = (cultivos?.current_page ? (cultivos.current_page - 1) : 0) * (cultivos?.per_page ?? cultivos?.data?.length ?? 0);
            const rowNumber = offset + idx + 1;
            return (
              <Sheet
                key={c.id}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 0.75 }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography level="title-sm">#{rowNumber}</Typography>
                  <JoyStack direction="row" spacing={0.5}>
                    <Button size="sm" variant="outlined" component={Link} href={`/ui/cultivos/${c.id}/edit`}>
                      Editar
                    </Button>
                    <IconButton
                      size="sm"
                      color="danger"
                      variant="outlined"
                      loading={deletingId === c.id}
                      onClick={() => handleDelete(c.id, c.especie)}
                    >
                      ✕
                    </IconButton>
                  </JoyStack>
                </Stack>
                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>Especie</Typography>
                <Typography level="title-sm">{c.especie}</Typography>
                <JoyStack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip size="sm" variant="soft" color="primary">Cat. Inicial: {c.categoria_inicial ?? '-'}</Chip>
                  <Chip size="sm" variant="soft" color="primary">Cat. Final: {c.categoria_final ?? '-'}</Chip>
                </JoyStack>
              </Sheet>
            );
          })}
        </JoyStack>
      </Sheet>

      <Paginator pagination={cultivos} />
    </Stack>
  );
}
