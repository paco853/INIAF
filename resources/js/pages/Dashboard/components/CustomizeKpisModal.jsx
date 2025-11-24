import React from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Stack,
  Sheet,
  Switch,
  Button,
  Box,
} from '@mui/joy';

const iconMap = {
  cultivos: '🌱',
  certificados: '✅',
  totalHoy: '📄',
  rechazados: '⛔',
};

const CustomizeKpisModal = ({ open, onClose, kpiDefs = [], selectedKeys = [], onSave }) => {
  const [localSelected, setLocalSelected] = React.useState(new Set(selectedKeys));

  React.useEffect(() => {
    setLocalSelected(new Set(selectedKeys));
  }, [selectedKeys]);

  const toggle = (key) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(localSelected));
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open onClose={onClose}>
      <ModalDialog layout="center" sx={{ minWidth: 420 }}>
        <ModalClose />
        <Stack spacing={1.5}>
          <Typography level="title-lg">Personalizar Dashboard</Typography>
          <Typography level="body-sm" color="neutral">
            Selecciona las métricas que deseas ver en tu pantalla principal:
          </Typography>
          <Stack spacing={1}>
            {kpiDefs.map((kpi) => {
              const active = localSelected.has(kpi.key);
              const badgeIcon = iconMap[kpi.key] || '📊';
              return (
                <Sheet
                  key={kpi.key}
                  variant="soft"
                  sx={{
                    p: 1.25,
                    borderRadius: 12,
                    border: '1px solid',
                    borderColor: active ? 'primary.outlinedBorder' : 'neutral.outlinedBorder',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: 18,
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? 'primary.softHoverBg' : 'neutral.softBg',
                    }}
                  >
                    {badgeIcon}
                  </Box>
                  <Typography level="body-sm" sx={{ flex: 1, fontWeight: 700 }}>
                    {kpi.label}
                  </Typography>
                  <Switch checked={active} onChange={() => toggle(kpi.key)} />
                </Sheet>
              );
            })}
          </Stack>
          <Button variant="solid" color="primary" onClick={handleSave} sx={{ alignSelf: 'flex-end' }}>
            Guardar cambios
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default CustomizeKpisModal;
