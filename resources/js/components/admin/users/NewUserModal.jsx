import React from 'react';
import { useForm } from '@inertiajs/react';
import {
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
  Typography,
  FormLabel,
  FormHelperText,
  Input,
  Button,
} from '@mui/joy';
import '../../../../css/admin/users/modal.css';
import '../../../../css/admin/users/button.css';
import '../../../../css/admin/users/alert.css';

export default function NewUserModal({ open, onClose, onSuccess, existingUsers = [] }) {
  const [toast, setToast] = React.useState(null);
  const [confirmTouched, setConfirmTouched] = React.useState(false);
  const createForm = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  React.useEffect(() => {
    if (!open) {
      setConfirmTouched(false);
      setToast(null);
    }
  }, [open]);

  const emailValue = createForm.data.email.trim();
  const nameValue = createForm.data.name.trim();
  const hasEmptyField = !nameValue
    || !emailValue
    || !createForm.data.password
    || !createForm.data.password_confirmation;
  const passwordTooShort = createForm.data.password.length > 0 && createForm.data.password.length < 8;
  const passwordsMismatch = confirmTouched && createForm.data.password !== createForm.data.password_confirmation;
  const invalidEmailFormat = emailValue && !/^[^\s@]+@[^\s@]+\.(?:com|bo|org|net)$/i.test(emailValue);
  const nameExists = nameValue
    && existingUsers.some((user) => (user.name || '').trim().toLowerCase() === nameValue.toLowerCase());
  const emailExists = emailValue
    && existingUsers.some((user) => (user.email || '').trim().toLowerCase() === emailValue.toLowerCase());

  const handleSubmit = (event) => {
    event.preventDefault();
    if (createForm.processing) return;

    createForm.post('/ui/usuarios', {
      preserveScroll: true,
      onSuccess: () => {
        createForm.reset();
        createForm.clearErrors();
        onSuccess?.();
        setToast({ color: 'success', message: 'Usuario creado correctamente.' });
        setTimeout(() => setToast(null), 3200);
      },
      onError: () => {
        setToast({ color: 'danger', message: 'Corrige los errores del formulario.' });
      },
    });
  };

  const handleClose = () => {
    createForm.reset();
    createForm.clearErrors();
    setConfirmTouched(false);
    setToast(null);
    onClose();
  };

  const showAlert = Boolean(toast) || Object.keys(createForm.errors).length > 0;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog className="admin-users-dialog" variant="outlined">
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={0.25}>
                <Typography level="h5" fontWeight={700}>Registrar Nuevo Usuario</Typography>
                <Typography level="body-xs" color="neutral">
                  Ingresa los datos para crear una nueva cuenta.
                </Typography>
              </Stack>
              <ModalClose onClick={handleClose} />
            </Stack>

            {showAlert && (
              <Alert
                className="admin-users-alert"
                color={toast?.color || 'danger'}
                variant="soft"
              >
                {toast?.message || 'Corrige los errores del formulario antes de continuar.'}
              </Alert>
            )}

            <Stack spacing={2}>
              <div>
                <FormLabel>Nombre completo</FormLabel>
                <Input
                  fullWidth
                  value={createForm.data.name}
                  onChange={(event) => createForm.setData('name', event.target.value)}
                  placeholder="Ej. Juan Pérez"
                />
                {createForm.errors.name && (
                  <FormHelperText color="danger">{createForm.errors.name}</FormHelperText>
                )}
                {!createForm.errors.name && nameExists && (
                  <FormHelperText color="danger">Ese nombre ya existe.</FormHelperText>
                )}
              </div>

              <div>
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  fullWidth
                  type="email"
                  value={createForm.data.email}
                  onChange={(event) => createForm.setData('email', event.target.value)}
                  placeholder="nombre@gmail.com"
                />
                {createForm.errors.email && (
                  <FormHelperText color="danger">{createForm.errors.email}</FormHelperText>
                )}
                {!createForm.errors.email && emailExists && (
                  <FormHelperText color="danger">Ese correo ya está registrado.</FormHelperText>
                )}
                {!createForm.errors.email && invalidEmailFormat && (
                  <FormHelperText color="neutral">
                    Usa un correo válido que termine en .com, .bo, .org o .net.
                  </FormHelperText>
                )}
              </div>

              <Stack direction="row" spacing={1.5}>
                <div style={{ flex: 1 }}>
                  <FormLabel>Contraseña</FormLabel>
                  <Input
                    fullWidth
                    type="password"
                    value={createForm.data.password}
                    onChange={(event) => createForm.setData('password', event.target.value)}
                    placeholder="Contraseña"
                  />
                  {createForm.errors.password && (
                    <FormHelperText color="danger">{createForm.errors.password}</FormHelperText>
                  )}
                  {!createForm.errors.password && passwordTooShort && (
                    <FormHelperText color="neutral">
                      La contraseña debe tener mínimo 8 caracteres.
                    </FormHelperText>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <Input
                    fullWidth
                    type="password"
                    value={createForm.data.password_confirmation}
                    onChange={(event) => {
                      createForm.setData('password_confirmation', event.target.value);
                      setConfirmTouched(true);
                    }}
                    placeholder="Confirmar"
                  />
                  {createForm.errors.password_confirmation && (
                    <FormHelperText color="danger">{createForm.errors.password_confirmation}</FormHelperText>
                  )}
                  {!createForm.errors.password_confirmation && passwordsMismatch && (
                    <FormHelperText color="neutral">Las contraseñas no coinciden.</FormHelperText>
                  )}
                </div>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1.25} justifyContent="flex-end" className="admin-users-dialog-actions">
              <Button variant="plain" color="neutral" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="solid"
                color="primary"
                className="admin-users-primary-btn"
                loading={createForm.processing}
                disabled={hasEmptyField
                  || passwordTooShort
                  || passwordsMismatch
                  || invalidEmailFormat
                  || nameExists
                  || emailExists}
              >
                Crear Usuario
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
