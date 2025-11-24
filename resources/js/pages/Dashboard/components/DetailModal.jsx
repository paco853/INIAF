import React from 'react';
import {
  Typography,
  Box,
  Stack,
  Grid,
  Sheet,
  Divider,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
} from '@mui/joy';
import { Package, User, Droplets, Sprout, Wheat } from 'lucide-react';
import EstadoBadge from './EstadoBadge.jsx';

const DetailModal = ({ detail, onClose }) => {
  if (!detail) return null;
  return (
    <Modal open onClose={onClose}>
      <ModalDialog layout="center" sx={{ maxWidth: 820, width: '90%', p: 0, overflow: 'hidden' }}>
        <ModalClose sx={{ m: 1 }} />
        <Box>
          <Box sx={{ px: 3, pt: 3, pb: 1.5 }}>
            <Typography level="title-lg" sx={{ fontWeight: 700 }}>Ficha Técnica de Análisis</Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Sheet variant="soft" sx={{ p: 2.5, borderRadius: 12, border: '1px solid', borderColor: 'neutral.outlinedBorder' }}>
              <Typography level="title-sm" sx={{ mb: 1.5, fontWeight: 800, textTransform: 'uppercase' }}>Datos de recepción y origen</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography level="body-xs" sx={{ fontWeight: 700, color: 'text.secondary' }}>Volumen total</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Package size={18} color="#f59e0b" />
                    <Typography level="h4" sx={{ fontWeight: 800 }}>
                      {detail.total ? `${detail.total.toLocaleString()} Kg` : '-'}
                    </Typography>
                  </Stack>
                  <Typography level="body-xs" color="neutral">
                    {detail.bolsas && detail.kgbol
                      ? `${detail.bolsas} bolsas x ${detail.kgbol} kg`
                      : 'Sin detalle de bolsas'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography level="body-xs" sx={{ fontWeight: 700, color: 'text.secondary' }}>Responsables</Typography>
                  <Stack spacing={0.25}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <User size={16} />
                      <Typography level="body-sm">{detail.cooperador || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Package size={16} />
                      <Typography level="body-sm">{detail.municipio || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Package size={16} />
                      <Typography level="body-sm">{detail.comunidad || '-'}</Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Sheet>

            <Sheet variant="soft" sx={{ p: 2.5, borderRadius: 12, border: '1px solid', borderColor: 'neutral.outlinedBorder' }}>
              <Typography level="title-sm" sx={{ mb: 1.5, fontWeight: 800, textTransform: 'uppercase' }}>Resultados de análisis</Typography>
              <Grid container spacing={1.5}>
                <Grid xs={12} sm={4}>
                  <Sheet variant="plain" sx={{ p: 2, borderRadius: 12, border: '1px solid', borderColor: 'primary.softHoverBg', textAlign: 'center' }}>
                    <Typography level="body-xs" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      <Sprout size={16} /> Germinación
                    </Typography>
                    <Typography level="h3" sx={{ fontWeight: 800, color: 'primary.700' }}>
                      {detail.germinacion ?? '—'}{detail.germinacion ? '%' : ''}
                    </Typography>
                  </Sheet>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Sheet variant="plain" sx={{ p: 2, borderRadius: 12, border: '1px solid', borderColor: 'success.softHoverBg', textAlign: 'center' }}>
                    <Typography level="body-xs" color="success" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      <Droplets size={16} /> Humedad
                    </Typography>
                    <Typography level="h3" sx={{ fontWeight: 800, color: 'success.700' }}>
                      {detail.humedad ?? '—'}{detail.humedad ? '%' : ''}
                    </Typography>
                  </Sheet>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Sheet variant="plain" sx={{ p: 2, borderRadius: 12, border: '1px solid', borderColor: 'warning.softHoverBg', textAlign: 'center' }}>
                    <Typography level="body-xs" color="warning" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      <Wheat size={16} /> Semilla pura
                    </Typography>
                    <Stack spacing={0.25} alignItems="center">
                      <Typography level="h3" sx={{ fontWeight: 800, color: 'warning.800' }}>
                        {detail.semillaPuraPct ?? '—'}{detail.semillaPuraPct ? '%' : ''}
                      </Typography>
                      {detail.semillaPuraKg
                        ? (
                          <Typography level="body-xs" color="neutral">
                            {detail.semillaPuraKg} kg
                          </Typography>
                        )
                        : null}
                    </Stack>
                  </Sheet>
                </Grid>
              </Grid>
            </Sheet>

            <Sheet variant="soft" sx={{ p: 2.5, borderRadius: 12, border: '1px solid', borderColor: 'neutral.outlinedBorder' }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography level="body-xs" sx={{ fontWeight: 700, color: 'text.secondary' }}>Dictamen</Typography>
                  <EstadoBadge estado={detail.estado} />
                </Grid>
                <Grid xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                  <Typography level="body-xs" sx={{ fontWeight: 700, color: 'text.secondary' }}>Validez</Typography>
                  <Typography level="body-md">{detail.validez ?? '—'}</Typography>
                </Grid>
              </Grid>
            </Sheet>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="solid"
                color="success"
                component="a"
                href={detail.id ? `/documentos/${detail.id}/imprimir?inline=1` : undefined}
                target="_blank"
                disabled={!detail.id}
              >
                Imprimir Certificado
              </Button>
              <Button variant="outlined" color="neutral" onClick={onClose}>
                Cerrar
              </Button>
            </Stack>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default DetailModal;
