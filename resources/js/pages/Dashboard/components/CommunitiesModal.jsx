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
} from '@mui/joy';
import { router } from '@inertiajs/react';

const CommunitiesModal = ({ open, onClose, comunidades = [], municipiosCount = 0 }) => {
  const [editingId, setEditingId] = React.useState(null);
  const [form, setForm] = React.useState({ comunidad: '', municipio: '' });
  const [newForm, setNewForm] = React.useState({ comunidad: '', municipio: '' });

  React.useEffect(() => {
    if (!open) {
      setEditingId(null);
      setForm({ comunidad: '', municipio: '' });
      setNewForm({ comunidad: '', municipio: '' });
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
            }}
          >
            <Table
              size="sm"
              borderAxis="both"
              stickyHeader
              sx={{
                '--TableCell-headBackground': '#0ea5e9',
                '--TableCell-headColor': '#fdfefe',
                '--TableCell-borderColor': '#e2e8f0',
                '& thead th': { bgcolor: 'var(--TableCell-headBackground)', color: 'var(--TableCell-headColor)' },
                '& tbody tr:nth-of-type(odd)': { bgcolor: 'rgba(14,165,233,0.06)' },
                '& tbody tr:nth-of-type(even)': { bgcolor: 'rgba(255,255,255,0.9)' },
                '& tbody tr:hover': { bgcolor: 'rgba(14,165,233,0.12)' },
                display: 'block',
                overflow: 'auto',
                maxHeight: '60vh',
              }}
            >
              <thead style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                <tr>
                  <th style={{ width: '60%' }}>Comunidad</th>
                  <th style={{ width: '40%' }}>Municipio</th>
                </tr>
              </thead>
              <tbody style={{ display: 'block', overflow: 'auto', maxHeight: '56vh' }}>
                {Array.isArray(comunidades) && comunidades.length > 0 ? comunidades.map((item, idx) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={`${item.municipio}-${item.comunidad}-${item.id || idx}`} style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                      <td style={{ width: '45%' }}>
                        {isEditing ? (
                          <Input
                            size="sm"
                            value={form.comunidad}
                            onChange={handleChange('comunidad')}
                          />
                        ) : (
                          item.comunidad || '—'
                        )}
                      </td>
                      <td style={{ width: '35%' }}>
                        {isEditing ? (
                          <Input
                            size="sm"
                            value={form.municipio}
                            onChange={handleChange('municipio')}
                          />
                        ) : (
                          item.municipio || '—'
                        )}
                      </td>
                      <td style={{ width: '20%', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
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
                      </td>
                    </tr>
                  );
                }) : (
                  <tr style={{ display: 'table', width: '100%' }}>
                    <td colSpan={3}>
                      <Typography level="body-sm" textAlign="center" sx={{ py: 1 }}>
                        Sin comunidades registradas.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Sheet>
        </Sheet>
      </ModalDialog>
    </Modal>
  );
};

export default CommunitiesModal;
