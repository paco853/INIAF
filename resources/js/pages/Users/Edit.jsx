import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
  Box,
  Sheet,
  Typography,
  Stack,
  Input,
  Button,
  FormLabel,
  FormHelperText,
} from '@mui/joy';
import { ArrowLeft } from 'lucide-react';
import '../../../css/admin/users/edit.css';

export default function UsersEdit() {
  const { user } = usePage().props;
  const {
    data, setData, put, processing, errors,
  } = useForm({
    name: user?.name || '',
    email: user?.email || '',
  });

  const submit = (e) => {
    e.preventDefault();
    put(`/ui/usuarios/${user.id}`);
  };

  return (
    <Box className="admin-user-edit-page">
      <Head title="Editar usuario" />

      <Box className="admin-user-edit-header">
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="plain"
            color="neutral"
            component={Link}
            href="/ui/usuarios"
            startDecorator={<ArrowLeft size={16} />}
          >
            Volver
          </Button>
          <div>
            <Typography level="h3" fontWeight={800}>Editar usuario</Typography>
            <Typography level="body-md" color="neutral">
              Actualiza los datos del usuario seleccionado.
            </Typography>
          </div>
        </Stack>
      </Box>

      <Sheet variant="soft" className="admin-user-edit-sheet">
        <form onSubmit={submit}>
          <Stack spacing={2.5}>
            <div>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Nombre completo"
              />
              {errors.name && <FormHelperText color="danger">{errors.name}</FormHelperText>}
            </div>

            <div>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <FormHelperText color="danger">{errors.email}</FormHelperText>}
            </div>

            <Stack direction="row" spacing={1.25}>
              <Button type="submit" variant="solid" color="primary" loading={processing}>
                Guardar cambios
              </Button>
              <Button component={Link} href="/ui/usuarios" variant="plain" color="neutral">
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </form>
      </Sheet>
    </Box>
  );
}
