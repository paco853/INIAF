import React from 'react';
import {
  Typography,
  Sheet,
  Table,
  Button,
  Chip,
  Input,
  Select,
  Option,
  Box,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
} from '@mui/joy';
import { Search } from 'lucide-react';
import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';
import Paginator from '../../components/Paginator.jsx';
import { Link, router, usePage } from '@inertiajs/react';
import { useDebouncedCallback } from '../../hooks/useDebounce.js';

export default function Documentos() {
  const { props } = usePage();
  const { docs, flash, filters = {} } = props;
  const [deletingId, setDeletingId] = React.useState(null);
  const printFrameRef = React.useRef(null);
  const [downloadModalOpen, setDownloadModalOpen] = React.useState(false);
  const [downloadForm, setDownloadForm] = React.useState({
    modo: 'nlab',
    desde: '',
    hasta: '',
  });
  const [downloadError, setDownloadError] = React.useState('');
  const [filterState, setFilterState] = React.useState({
    gestion: filters?.gestion ?? '',
    nlab: filters?.nlab ?? '',
    especie: filters?.especie ?? '',
    estado: filters?.estado ?? '',
    fecha_desde: filters?.fecha_desde ?? '',
    fecha_hasta: filters?.fecha_hasta ?? '',
  });

  React.useEffect(() => {
    setFilterState({
      gestion: filters?.gestion ?? '',
      nlab: filters?.nlab ?? '',
      especie: filters?.especie ?? '',
      estado: filters?.estado ?? '',
      fecha_desde: filters?.fecha_desde ?? '',
      fecha_hasta: filters?.fecha_hasta ?? '',
    });
  }, [filters]);

  const sendFilters = useDebouncedCallback((next) => {
    const payload = Object.fromEntries(
      Object.entries(next).filter(([, value]) => value != null && value !== ''),
    );
    router.get('/ui/documentos', payload, { preserveState: true, replace: true });
  }, 400);

  const updateFilter = React.useCallback((key, value) => {
    setFilterState((prev) => {
      const next = { ...prev, [key]: value };
      sendFilters(next);
      return next;
    });
  }, [sendFilters]);

  const clearFilters = React.useCallback(() => {
    const empty = {
      gestion: '',
      nlab: '',
      especie: '',
      estado: '',
      fecha_desde: '',
      fecha_hasta: '',
    };
    setFilterState(empty);
    router.get('/ui/documentos', {}, { preserveState: true, replace: true });
  }, []);

  const onDelete = async (id) => {
    if (!confirm('¿Desea eliminar este documento?')) return;
    setDeletingId(id);
    router.delete(`/documentos/${id}`, {
      preserveScroll: true,
      onFinish: () => setDeletingId(null),
    });
  };

  const renderEstadoBadge = (estado) => {
    const normalized = String(estado || '').toLowerCase();
    const modifier = normalized === 'aprobado' || normalized === 'finalizado'
      ? 'estado-badge--aprobado'
      : normalized === 'rechazado'
        ? 'estado-badge--rechazado'
        : 'estado-badge--pendiente';
    return (
      <Box component="span" className={`estado-badge ${modifier}`}>
        {estado || 'Pendiente'}
      </Box>
    );
  };

  const handlePrint = React.useCallback((docId) => {
    const frame = printFrameRef.current;
    if (!frame || !docId) return;
    const src = `/documentos/${docId}/imprimir?inline=1`;
    const onLoad = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } catch (e) {
        console.warn('print preview error', e);
      } finally {
        frame.removeEventListener('load', onLoad);
      }
    };
    frame.addEventListener('load', onLoad);
    frame.src = `${src}#toolbar=0`;
  }, []);

  const handleDownloadChange = React.useCallback(
    (field) => (event, valueProp) => {
      const value = typeof valueProp === 'string' ? valueProp : event?.target?.value ?? '';
      setDownloadForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleBulkDownload = React.useCallback(
    (event) => {
      event.preventDefault();
      const { modo, desde, hasta } = downloadForm;
      if (!modo || !desde || !hasta) {
        setDownloadError('Completa los tres campos para continuar.');
        return;
      }
      const params = new URLSearchParams({ modo, desde, hasta });
      const url = `/documentos/descarga-general?${params.toString()}`;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
      setDownloadModalOpen(false);
      setDownloadError('');
    },
    [downloadForm],
  );

  return (
    <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5 }}
        >
          <Typography level="h4" sx={{ fontWeight: 600 }}>Documentos</Typography>
          <Button
            size="sm"
            variant="soft"
            onClick={() => setDownloadModalOpen(true)}
          >
            Descargar
          </Button>
        </Stack>
      {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
      {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

      <Sheet
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 18,
        }}
      >
        <div className="filters-grid">
          <Input
            size="sm"
            className="filters-control"
            placeholder="Gestión (año)"
            value={filterState.gestion}
            onChange={(event) => updateFilter('gestion', event.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
          />
          <Input
            size="sm"
            className="filters-control"
            placeholder="N° Laboratorio"
            value={filterState.nlab}
            onChange={(event) => updateFilter('nlab', event.target.value)}
          />
          <Input
            size="sm"
            className="filters-control search-input"
            placeholder="Buscar especie..."
            startDecorator={<Search size={14} />}
            value={filterState.especie}
            onChange={(event) => updateFilter('especie', event.target.value)}
          />
          <Select
            size="sm"
            className="filters-control"
            value={filterState.estado || null}
            onChange={(_, value) => updateFilter('estado', value ?? '')}
            placeholder="Estado"
          >
            <Option value="APROBADO">Aprobado</Option>
            <Option value="RECHAZADO">Rechazado</Option>
          </Select>
          <Input
            size="sm"
            type="date"
            className="filters-control"
            value={filterState.fecha_desde}
            onChange={(event) => updateFilter('fecha_desde', event.target.value)}
          />
          <Input
            size="sm"
            type="date"
            className="filters-control"
            value={filterState.fecha_hasta}
            onChange={(event) => updateFilter('fecha_hasta', event.target.value)}
          />
          <Button
            size="sm"
            variant="plain"
            color="primary"
            onClick={clearFilters}
            className="filters__clear"
          >
            Limpiar filtros
          </Button>
        </div>
      </Sheet>

      <Modal open={downloadModalOpen} onClose={() => setDownloadModalOpen(false)}>
        <ModalDialog sx={{ minWidth: 360 }}>
          <DialogTitle>Descarga general</DialogTitle>
          <DialogContent>
            Selecciona el rango para generar el PDF combinado.
          </DialogContent>
          <Stack spacing={1.5} component="form" onSubmit={handleBulkDownload}>
            <FormControl>
              <FormLabel>Modo</FormLabel>
              <Select
                value={downloadForm.modo}
                onChange={handleDownloadChange('modo')}
              >
                <Option value="nlab">Por N° de Laboratorio</Option>
                <Option value="gestion">Por Año (gestión)</Option>
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Desde</FormLabel>
            <Input
                type={downloadForm.modo === 'gestion' ? 'number' : 'text'}
                inputMode={downloadForm.modo === 'gestion' ? 'numeric' : 'text'}
                value={downloadForm.desde}
                onChange={handleDownloadChange('desde')}
              />
            </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Hasta</FormLabel>
                <Input
                  type={downloadForm.modo === 'gestion' ? 'number' : 'text'}
                  inputMode={downloadForm.modo === 'gestion' ? 'numeric' : 'text'}
                  value={downloadForm.hasta}
                  onChange={handleDownloadChange('hasta')}
                />
              </FormControl>
            </Stack>
            {downloadError && (
              <Typography level="body-sm" color="danger">
                {downloadError}
              </Typography>
            )}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" color="neutral" onClick={() => setDownloadModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="solid" color="primary">
                Descargar
              </Button>
            </Stack>
          </Stack>
        </ModalDialog>
      </Modal>
      <Box component="iframe" ref={printFrameRef} title="print-frame" sx={{ width: 0, height: 0, border: 0, position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

      <Sheet
        variant="soft"
        sx={{
          p: 0,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: 'lg',
        }}
      >
        <Table
          stripe="odd"
          hoverRow
          stickyHeader
          sx={{
            '--Table-headerUnderlineThickness': '1px',
            display: { xs: 'none', lg: 'table' },
          }}
        >
          <thead>
            <tr>
              <th className="table-col--sm">N° Lab</th>
              <th>Especie</th>
              <th className="table-col--md">Fecha</th>
              <th className="table-col--sm">Estado</th>
              <th className="table-col--xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docs?.data?.map((d) => {
              return (
                <tr key={d.id}>
                  <td>{d.nlab ?? '-'}</td>
                  <td>{d.especie ?? '-'}</td>
                  <td>{d.fecha_evaluacion ?? '-'}</td>
                  <td>{renderEstadoBadge(d.estado)}</td>
                  <td>
                    <Stack spacing={0.75}>
                      <Stack direction="row" spacing={0.5}>
                        <Button
                        size="sm"
                        variant="solid"
                        color="primary"
                        component={Link}
                        href={`/ui/documentos/${d.id}/edit`}
                        className="action-btn action-btn--primary"
                        sx={{ flex: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        color="neutral"
                        component="a"
                        href={`/documentos/${d.id}/imprimir?inline=1`}
                        target="_blank"
                        className="action-btn action-btn--neutral"
                        sx={{ flex: 1 }}
                      >
                        Ver PDF
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        onClick={() => handlePrint(d.id)}
                        className="action-btn action-btn--neutral"
                        sx={{ flex: 1 }}
                      >
                        Imprimir
                      </Button>
                        <Button
                          size="sm"
                          variant="outlined"
                          color="danger"
                        loading={deletingId === d.id}
                        disabled={deletingId === d.id}
                        onClick={() => onDelete(d.id)}
                        className="action-btn action-btn--danger"
                        sx={{ flex: 1 }}
                      >
                          Eliminar
                        </Button>
                      </Stack>
                    </Stack>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Stack
          spacing={1}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            flexDirection: 'column',
            p: 1.5,
            gap: 1,
          }}
        >
          {docs?.data?.map((d) => {
            return (
              <Sheet
                key={d.id}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 0.75 }}
              >
                <Typography level="title-sm">ID {d.id}</Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>N° Laboratorio</Typography>
              <Typography level="title-sm">{d.nlab ?? '-'}</Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.5 }}>Especie</Typography>
              <Typography level="title-sm">{d.especie ?? '-'}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
                <Chip size="sm" variant="soft" color="neutral">Fecha: {d.fecha_evaluacion ?? '-'}</Chip>
                {renderEstadoBadge(d.estado)}
              </Stack>
              <Stack spacing={0.75} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="sm"
                    variant="solid"
                    color="primary"
                    component={Link}
                    href={`/ui/documentos/${d.id}/edit`}
                    className="action-btn action-btn--primary"
                    sx={{ flex: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    component="a"
                    href={`/documentos/${d.id}/imprimir?inline=1`}
                    target="_blank"
                    className="action-btn action-btn--neutral"
                    sx={{ flex: 1 }}
                  >
                    Ver PDF
                  </Button>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    onClick={() => handlePrint(d.id)}
                    className="action-btn action-btn--neutral"
                    sx={{ flex: 1 }}
                  >
                    Imprimir
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="danger"
                    loading={deletingId === d.id}
                    disabled={deletingId === d.id}
                    onClick={() => onDelete(d.id)}
                    className="action-btn action-btn--danger"
                    sx={{ flex: 1 }}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </Stack>
            </Sheet>
          );
          })}
        </Stack>
      </Sheet>

      <Paginator pagination={docs} />
    </Stack>
  );
}
