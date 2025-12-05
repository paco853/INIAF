import React from 'react';
import { useForm, router } from '@inertiajs/react';
import { Box, Button, Input, Alert, Stack, Sheet, Typography } from '@mui/joy';
import { Lock } from 'lucide-react';

export default function ChangePasswordModal({ open, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  React.useEffect(() => {
    if (!open) return undefined;
    return () => {
      reset('current_password', 'password', 'password_confirmation');
    };
  }, [open, reset]);

  const handleSubmit = (event) => {
    event.preventDefault();
    post('/ui/password', {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        router.visit('/ui');
      },
    });
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15,23,42,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1400,
      }}
      onClick={onClose}
    >
      <Sheet
        component="form"
        onSubmit={handleSubmit}
        variant="soft"
        sx={{
          width: 360,
          p: 3,
          borderRadius: 2,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <Typography level="h6" fontWeight="600" sx={{ mb: 1 }}>
          Cambiar contraseña
        </Typography>
        <Typography level="body-sm" color="neutral.500" sx={{ mb: 2 }}>
          Actualiza tu clave de acceso para mantener tu cuenta segura.
        </Typography>
          <Stack spacing={1.5}>
            {(errors.current_password || errors.password) && (
              <Alert color="danger" variant="soft">
                {errors.current_password || errors.password}
              </Alert>
            )}
            <Input
              label="Contraseña actual"
              type="password"
              value={data.current_password}
              onChange={(event) => setData('current_password', event.target.value)}
              required
              startDecorator={<Lock />}
              placeholder="Ingresa tu contraseña actual"
            />
            <Input
              label="Nueva contraseña"
              type="password"
              value={data.password}
              onChange={(event) => setData('password', event.target.value)}
              required
              startDecorator={<Lock />}
              placeholder="Elige una nueva contraseña"
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              value={data.password_confirmation}
              onChange={(event) => setData('password_confirmation', event.target.value)}
              required
              startDecorator={<Lock />}
              placeholder="Repite la nueva contraseña"
            />
          </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="button" variant="plain" color="neutral" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth loading={processing}>
            {processing ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Stack>
      </Sheet>
    </Box>
  );
}
