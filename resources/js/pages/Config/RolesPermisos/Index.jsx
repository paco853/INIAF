import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Typography,
  Switch,
  Sheet,
  Divider,
  Button,
  Alert,
} from '@mui/joy';
import {
  FileText,
  BookOpen,
  Shield,
  Trash2,
  KeyRound,
  Settings,
  Save,
} from 'lucide-react';
import '../../../../css/pages/roles-permisos.css';

const CARDS = [
  {
    id: 'docs',
    title: 'Documentos & PDF',
    controller: 'DocumentosController.php',
    badge: 'Browsershot',
    icon: <FileText size={24} />,
    actions: [
      {
        id: 'deleteDocs',
        label: 'Eliminar Documentos',
        description: 'Eliminar registros permanentemente (Solo Admin).',
        danger: true,
      },
    ],
  },
  {
    id: 'catalogos',
    title: 'Catálogos Base',
    controller: 'Cultivos/VariedadesController',
    badge: 'ABM',
    icon: <BookOpen size={24} />,
    actions: [
      {
        id: 'manageCatalogs',
        label: 'Gestión ABM (Crear/Editar)',
        description: 'Modificar cultivos, categorías o validez.',
      },
    ],
  },
  {
    id: 'seguridad',
    title: 'Seguridad & Datos',
    controller: 'BackupsController.php',
    badge: 'JSON',
    icon: <Shield size={24} />,
    actions: [
      {
        id: 'exportData',
        label: 'Exportar Data',
        description: 'Descargar JSON de catálogos o documentos.',
      },
      {
        id: 'restoreData',
        label: 'Restaurar / Importar',
        description: 'Sobrescribir base de datos (Solo Admin).',
      },
      {
        id: 'deleteBackups',
        label: 'Eliminar Backups',
        description: 'Borrar historial de respaldos (Solo Admin).',
      },
    ],
  },
];

export default function RolesPermisos() {
  const { auth, flash, toggles: serverToggles = {}, roleLabel = 'Usuario' } = usePage().props;
  const user = auth?.user;
  const form = useForm({
    toggles: {
      deleteDocs: false,
      manageCatalogs: false,
      exportData: false,
      restoreData: false,
      deleteBackups: false,
      ...serverToggles,
    },
  });

  const handleToggle = React.useCallback(
    (id) => (event) => {
      form.setData('toggles', { ...form.data.toggles, [id]: event.target.checked });
    },
    [form],
  );

  const submit = (e) => {
    e.preventDefault();
    form.post('/ui/roles-permisos');
  };

  return (
    <Box className="roles-permisos">
      <Head title="Roles y permisos" />
      <form onSubmit={submit}>
        <Box className="roles-permisos__header">
          <Box>
            <Typography level="h3" fontWeight={800}>Configuración de Accesos</Typography>
            <Typography level="body-md" color="neutral">
              Define qué controladores y rutas están disponibles para cada perfil.
            </Typography>
          </Box>
          <Chip variant="soft" color="success" startDecorator={<KeyRound size={16} />}>
            {roleLabel || 'Usuario'}
          </Chip>
        </Box>

        {flash?.status && (
          <Alert color="success" variant="soft" sx={{ mb: 1.5 }}>
            {flash.status}
          </Alert>
        )}

        <Grid container spacing={2} columns={{ xs: 1, md: 2 }}>
          {CARDS.map((card) => (
            <Grid xs={1} md={1} key={card.id}>
              <Sheet className="roles-card" variant="soft">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box className="roles-card__icon">{card.icon}</Box>
                    <Box>
                      <Typography level="title-lg" fontWeight={800}>{card.title}</Typography>
                      <Typography level="body-sm" color="neutral">{card.controller}</Typography>
                    </Box>
                  </Stack>
                  <Chip size="sm" color="primary" variant="soft">{card.badge}</Chip>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1.25}>
                  {card.actions.map((action) => {
                    const isOn = Boolean(form.data.toggles[action.id]);
                    return (
                    <Stack
                      key={action.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      className={[
                        'roles-card__item',
                        action.muted ? 'is-muted' : '',
                        isOn ? 'is-on' : 'is-off',
                      ].filter(Boolean).join(' ')}
                    >
                      <Box>
                        <Typography
                          level="title-sm"
                          fontWeight={800}
                          color={action.danger ? 'danger' : 'neutral'}
                          className="roles-card__title"
                          startDecorator={action.danger ? <Trash2 size={16} /> : undefined}
                        >
                          {action.label}
                        </Typography>
                        <Typography level="body-sm" color="neutral" className="roles-card__desc">
                          {action.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={isOn}
                        onChange={handleToggle(action.id)}
                        color={action.danger ? 'danger' : 'primary'}
                        disabled={action.muted}
                        sx={{
                          '--Switch-trackBackground': isOn ? undefined : '#6b7280',
                          '--Switch-thumbBackground': isOn ? undefined : '#e5e7eb',
                        }}
                      />
                    </Stack>
                  );})}
                </Stack>
              </Sheet>
            </Grid>
          ))}

          <Grid xs={1} md={1}>
            <Sheet className="roles-card roles-card--users" variant="soft">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box className="roles-card__icon roles-card__icon--accent">
                    <Settings size={24} />
                  </Box>
                  <Box>
                    <Typography level="title-lg" fontWeight={800}>Perfiles y usuarios</Typography>
                    <Typography level="body-sm" color="neutral">Administra perfiles y asigna permisos.</Typography>
                  </Box>
                </Stack>
                <Chip size="sm" color="success" variant="solid">Admin</Chip>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Typography level="body-sm" color="neutral">
                Configura roles adicionales (operador, invitado, etc.) y ajusta qué módulos puede ver cada uno.
              </Typography>
            </Sheet>
          </Grid>
        </Grid>

        <Box className="roles-actions">
          <Button type="submit" startDecorator={<Save size={16} />} loading={form.processing}>
            Guardar permisos
          </Button>
        </Box>
      </form>
    </Box>
  );
}
