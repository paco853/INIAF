import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Alert, Box, Stack, Typography, Input, Button } from '@mui/joy';
import { Search, Plus } from 'lucide-react';
import AdminUsersTable from '../../components/admin/users/AdminUsersTable';
import NewUserModal from '../../components/admin/users/NewUserModal';
import '../../../css/admin/users/button.css';
import '../../../css/admin/users/index.css';

export default function UsersIndex() {
  const { users = [], auth } = usePage().props;
  const [query, setQuery] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [localUsers, setLocalUsers] = React.useState([]);
  const [successMessage, setSuccessMessage] = React.useState('');

  const sortedUsers = React.useMemo(() => {
    const registry = new Map();
    [...localUsers, ...users].forEach((user) => {
      if (!user?.id) return;
      registry.set(user.id, user);
    });
    return Array.from(registry.values()).sort((a, b) => {
      if (a.is_admin !== b.is_admin) return a.is_admin ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [users, localUsers]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedUsers;
    return sortedUsers.filter((u) => (
      u.name?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q)
      || u.role?.toLowerCase().includes(q)
    ));
  }, [sortedUsers, query]);

  const toggleForm = useForm({});
  const deleteForm = useForm({});

  const handleToggle = (id) => {
    toggleForm.post(`/ui/usuarios/${id}/toggle`, { preserveScroll: true });
  };

  const handleDelete = (id) => {
    deleteForm.delete(`/ui/usuarios/${id}`, { preserveScroll: true });
  };

  const handleUserCreated = React.useCallback((user) => {
    if (!user?.id) return;
    setLocalUsers((prev) => {
      if (prev.some((existing) => existing.id === user.id)) {
        return prev;
      }
      return [...prev, user];
    });
    setSuccessMessage('Usuario creado correctamente.');
    setTimeout(() => setSuccessMessage(''), 3200);
  }, []);

  return (
    <Box className="admin-users-page">
      <Head title="Usuarios" />

      <Box className="admin-users-header">
        <div>
          <Typography level="h3" fontWeight={800}>Directorio de Usuarios</Typography>
          <Typography level="body-md" color="neutral">
            Gestiona el acceso, roles y estado de los usuarios del sistema.
          </Typography>
        </div>
        <Stack direction="row" spacing={1.25}>
          <Input
            placeholder="Buscar por nombre o email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            startDecorator={<Search size={16} />}
            className="admin-users-search"
          />
          <Button
            variant="solid"
            color="primary"
            startDecorator={<Plus size={16} />}
            className="admin-users-primary-btn"
            onClick={() => setModalOpen(true)}
          >
            Nuevo Usuario
          </Button>
        </Stack>
      </Box>

      {successMessage && (
        <Alert color="success" variant="solid" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}

      <AdminUsersTable
        users={filtered}
        onToggle={handleToggle}
        onDelete={handleDelete}
        toggleProcessing={toggleForm.processing}
        deleteProcessing={deleteForm.processing}
        currentUserId={auth?.user?.id}
      />

      <NewUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUserCreated}
        existingUsers={[...sortedUsers]}
      />
    </Box>
  );
}
