import React from 'react';
import { Typography, Sheet, Table, Button, Input, Chip } from '@mui/joy';
import Stack from '@mui/joy/Stack';
import JoyStack from '@mui/joy/Stack';
import Alert from '@mui/joy/Alert';
import { Link, router, usePage } from '@inertiajs/react';
import Paginator from '../../components/Paginator.jsx';
import { useDebouncedCallback } from '../../hooks/useDebounce.js';
import { Search } from 'lucide-react';

export default function Validez() {
  const { props } = usePage();
  const { items, q, flash, allCovered } = props;
  const [query, setQuery] = React.useState(q || '');
  const debouncedSearch = useDebouncedCallback((value) => {
    router.get('/ui/validez', { q: value }, { preserveState: true, replace: true });
  }, 400, []);

  const onSearch = (value) => debouncedSearch(value);

  return (
    <Stack spacing={1}>
      <Stack direction="row" className="section-header">
        <Typography level="h4" className="section-header__title">Validez</Typography>
        <Button
          size="md"
          variant="solid"
          color={allCovered ? 'danger' : 'primary'}
          component={Link}
          href="/ui/validez/create"
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
          className="search-input"
          sx={{
            maxWidth: { xs: '100%', md: 320 },
          }}
          onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value); }}
        />
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
              <th>Especie</th>
              <th className="table-col--sm">Días</th>
              <th className="table-col--sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items?.data?.map((v, idx) => {
              const offset = (items?.current_page ? (items.current_page - 1) : 0) * (items?.per_page ?? items?.data?.length ?? 0);
              const rowNumber = offset + idx + 1;
              return (
                <tr key={v.id}>
                  <td>{rowNumber}</td>
                  <td>{v.cultivo?.especie ?? '-'}</td>
                  <td>{v.dias}</td>
                  <td>
                    <Stack direction="row" spacing={1}>
                      <Button size="sm" variant="outlined" component={Link} href={`/ui/validez/${v.id}/edit`}>Editar</Button>
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
          {items?.data?.map((v, idx) => {
            const offset = (items?.current_page ? (items.current_page - 1) : 0) * (items?.per_page ?? items?.data?.length ?? 0);
            const rowNumber = offset + idx + 1;
            return (
              <Sheet
                key={v.id}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 0.75 }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography level="title-sm">#{rowNumber}</Typography>
                  <Button size="sm" variant="outlined" component={Link} href={`/ui/validez/${v.id}/edit`}>
                    Editar
                  </Button>
                </Stack>
                <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>Especie</Typography>
                <Typography level="title-sm">{v.cultivo?.especie ?? '-'}</Typography>
                <Chip size="sm" variant="soft" color="primary" sx={{ alignSelf: 'flex-start' }}>
                  Días: {v.dias}
                </Chip>
              </Sheet>
            );
          })}
        </JoyStack>
      </Sheet>

      <Paginator pagination={items} />
    </Stack>
  );
}
