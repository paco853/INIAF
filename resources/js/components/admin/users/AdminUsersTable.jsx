import React from 'react';
import { Box, Sheet, Stack, Typography, Chip, Button, Switch } from '@mui/joy';
import { Link } from '@inertiajs/react';
import { ShieldCheck, UserRound } from 'lucide-react';
import '../../../../css/admin/users/table.css';

const badgeForRole = (user) => (
  <Chip
    size="sm"
    variant={user.is_admin ? 'solid' : 'soft'}
    color={user.is_admin ? 'neutral' : 'primary'}
    startDecorator={user.is_admin ? <ShieldCheck size={14} /> : null}
  >
    {user.role || (user.is_admin ? 'Administrador' : 'Usuario')}
  </Chip>
);

export default function AdminUsersTable({
  users,
  onToggle,
  onDelete,
  toggleProcessing,
  deleteProcessing,
  currentUserId,
}) {
  const handleDeleteClick = (userId) => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    onDelete(userId);
  };

  return (
    <Sheet className="admin-users-table" variant="soft">
      <Box className="admin-users-row admin-users-row--head">
        <span>Usuario</span>
        <span>Rol asignado</span>
        <span>Estado</span>
        <span>Último acceso</span>
        <span>Acciones</span>
      </Box>

      {users.map((user) => {
        const initials = (user.name || user.email || '?')
          .split(' ')
          .map((part) => part.charAt(0).toUpperCase())
          .join('')
          .slice(0, 2);
        const isAdmin = Boolean(user.is_admin);
        const isOn = Boolean(user.active);
        const isSelf = user.id === currentUserId;

        return (
          <Box key={user.id} className="admin-users-row">
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box className="admin-users-avatar">{initials || <UserRound size={16} />}</Box>
              <Box>
                <Typography level="title-sm" fontWeight={700}>{user.name || 'Sin nombre'}</Typography>
                <Typography level="body-xs" color="neutral">{user.email}</Typography>
              </Box>
            </Stack>

            <Box>{badgeForRole(user)}</Box>

            <Stack direction="row" spacing={0.75} alignItems="center">
              <Switch
                checked={isOn}
                loading={toggleProcessing}
                color={isSelf || !isOn ? 'neutral' : 'success'}
                disabled={isSelf}
                onChange={isSelf ? undefined : () => onToggle(user.id)}
                sx={{
                  '--Switch-trackBackground': isSelf || !isOn ? '#d1d5db' : '#16a34a',
                  '--Switch-thumbBackground': isSelf || !isOn ? '#9ca3af' : '#ecfdf3',
                  opacity: isSelf ? 0.6 : 1,
                }}
              />
              <Typography level="body-sm" color={isOn ? 'success' : 'neutral'}>
                {isOn ? 'Habilitado' : 'Deshabilitado'}
              </Typography>
            </Stack>

            <Typography level="body-sm" color="neutral">
              {user.last_seen ? user.last_seen : 'Sin acceso reciente'}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              {isAdmin ? (
                <Typography level="body-sm" color="neutral">—</Typography>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="soft"
                    color="primary"
                    component={Link}
                    href={`/ui/usuarios/${user.id}/edit`}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => handleDeleteClick(user.id)}
                    disabled={deleteProcessing}
                  >
                    Eliminar
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        );
      })}

      {users.length === 0 && (
        <Box className="admin-users-empty">
          <Typography level="body-sm" color="neutral">No hay usuarios que coincidan.</Typography>
        </Box>
      )}
    </Sheet>
  );
}
