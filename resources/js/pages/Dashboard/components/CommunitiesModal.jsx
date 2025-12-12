import React from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Sheet,
  Table,
  Stack,
  Button,
  Input,
  Box,
} from '@mui/joy';
import { router } from '@inertiajs/react';

const CommunitiesModal = ({ open, onClose, comunidades = [], municipiosCount = 0 }) => {
  const [editingId, setEditingId] = React.useState(null);
  const [form, setForm] = React.useState({ comunidad: '', municipio: '' });
  const [newForm, setNewForm] = React.useState({ comunidad: '', municipio: '' });
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setEditingId(null);
      setForm({ comunidad: '', municipio: '' });
      setNewForm({ comunidad: '', municipio: '' });
      setSearchTerm('');
    }
  }, [open]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ comunidad: item.comunidad || '', municipio: item.municipio || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ comunidad: '', municipio: '' });
  };

  const handleSave = () => {
    if (!editingId) return;
    router.put(`/comunidades/${editingId}`, form, {
      preserveScroll: true,
      onFinish: cancelEdit,
    });
  };

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar esta comunidad?')) return;
    router.delete(`/comunidades/${id}`, { preserveScroll: true });
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleNewChange = (field) => (event) => {
    setNewForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreate = () => {
    if (!newForm.comunidad || !newForm.municipio) return;
    router.post('/comunidades', newForm, {
      preserveScroll: true,
      onSuccess: () => setNewForm({ comunidad: '', municipio: '' }),
    });
  };

  const filteredComunidades = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return comunidades;
    return comunidades.filter((item) => (item.comunidad || '').toLowerCase().includes(term));
  }, [comunidades, searchTerm]);

  if (!open) return null;
  return (
    <Modal open onClose={onClose}>
      <ModalDialog
        layout="center"
        sx={{
          minWidth: 520,
          maxWidth: 780,
          p: 0,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'neutral.outlinedBorder',
        }}
      >
        <Sheet
          variant="plain"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 16,
            boxShadow: 'lg',
            bgcolor: 'linear-gradient(180deg, #f7fbff 0%, #eef3f8 100%)',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Comunidades registradas
            </Typography>
            <ModalClose sx={{ position: 'relative', top: 0, right: 0 }} />
          </Stack>
          <Typography level="body-sm" color="neutral">
            Lista de comunidades y sus municipios. Municipios únicos: {municipiosCount}
          </Typography>

          <Sheet
            variant="soft"
            sx={{
              borderRadius: 12,
              border: '1px solid',
              borderColor: 'neutral.outlinedBorder',
              p: 1.5,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
              bgcolor: 'rgba(14,165,233,0.06)',
            }}
          >
            <Input
              size="sm"
              placeholder="Comunidad"
              value={newForm.comunidad}
              onChange={handleNewChange('comunidad')}
              sx={{ flex: 1, minWidth: 180 }}
            />
            <Input
              size="sm"
              placeholder="Municipio"
              value={newForm.municipio}
              onChange={handleNewChange('municipio')}
              sx={{ flex: 1, minWidth: 160 }}
            />
            <Button size="sm" color="primary" onClick={handleCreate}>
              Agregar
            </Button>
          </Sheet>

          <Sheet
            variant="soft"
            sx={{
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'neutral.outlinedBorder',
              maxHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.85)',
              gap: 1,
            }}
          >
            <Box sx={{ px: 2, pt: 1 }}>
              <Input
                size="sm"
                placeholder="Buscar comunidad"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Buscar comunidad"
              />
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <Table
                size="sm"
                borderAxis="both"
                stickyHeader
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                  '--TableCell-headBackground': '#0ea5e9',
                  '--TableCell-headColor': '#fdfefe',
                  '--TableCell-borderColor': '#e2e8f0',
                  '& th, & td': { padding: '0.5rem 0.75rem' },
                  '& thead th': { bgcolor: 'var(--TableCell-headBackground)', color: 'var(--TableCell-headColor)', textAlign: 'left' },
                  '& tbody tr:nth-of-type(odd)': { bgcolor: 'rgba(14,165,233,0.06)' },
                  '& tbody tr:nth-of-type(even)': { bgcolor: 'rgba(255,255,255,0.9)' },
                  '& tbody tr:hover': { bgcolor: 'rgba(14,165,233,0.12)' },
                }}
              >
                <colgroup>
                  <col style={{ width: '50%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Comunidad</th>
                    <th>Municipio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredComunidades) && filteredComunidades.length > 0 ? filteredComunidades.map((item, idx) => {
                    const isEditing = editingId === item.id;
                    return (
                      <tr key={`${item.municipio}-${item.comunidad}-${item.id || idx}`}>
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={form.comunidad}
                              onChange={handleChange('comunidad')}
                              fullWidth
                            />
                          ) : (
                            item.comunidad || '—'
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input
                              size="sm"
                              value={form.municipio}
                              onChange={handleChange('municipio')}
                              fullWidth
                            />
                          ) : (
                            item.municipio || '—'
                          )}
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'nowrap' }}>
                            {isEditing ? (
                              <>
                                <Button size="sm" color="success" onClick={handleSave}>Guardar</Button>
                                <Button size="sm" variant="outlined" color="neutral" onClick={cancelEdit}>Cancelar</Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outlined" onClick={() => startEdit(item)}>Editar</Button>
                                <Button size="sm" variant="plain" color="danger" onClick={() => handleDelete(item.id)}>Borrar</Button>
                              </>
                            )}
                          </Box>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3}>
                        <Typography level="body-sm" textAlign="center" sx={{ py: 2 }}>
                          Sin comunidades registradas.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Box>
          </Sheet>
        </Sheet>
      </ModalDialog>
    </Modal>
  );
};

export default CommunitiesModal;
