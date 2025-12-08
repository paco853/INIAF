import React from 'react';
import { Sheet, Table, Box, Stack, Button, Chip, Typography } from '@mui/joy';
import { Link } from '@inertiajs/react';

export default function DocumentosTable({ docs, onDelete, onPrint, renderEstadoBadge, deletingId }) {
  return (
    <Sheet
      variant="soft"
      sx={{
        p: 0,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: 'lg',
      }}
    >
      <Box
        sx={{
          maxHeight: 520,
          overflowY: 'auto',
        }}
      >
        <Table
          stripe="odd"
          hoverRow
          stickyHeader
          sx={{
            '--Table-headerUnderlineThickness': '1px',
            display: { xs: 'none', lg: 'table' },
          }}
        >
          <thead>
            <tr>
              <th className="table-col--sm">N° Lab</th>
              <th>Especie</th>
              <th className="table-col--sm">Año campaña</th>
              <th className="table-col--md">Fecha de Evaluacion</th>
              <th className="table-col--sm">Estado</th>
              <th className="table-col--xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docs?.data?.map((d) => (
              <tr key={d.id}>
                <td>{d.nlab ?? '-'}</td>
                <td>{d.especie ?? '-'}</td>
                <td>{d.recepcion?.anio ?? '-'}</td>
                <td>{d.fecha_evaluacion ?? '-'}</td>
                <td>{renderEstadoBadge(d.estado)}</td>
                <td>
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="sm"
                        variant="solid"
                        color="primary"
                        component={Link}
                        href={`/ui/documentos/${d.id}/edit`}
                        className="action-btn action-btn--primary"
                        sx={{ flex: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        color="neutral"
                        component="a"
                        href={`/documentos/${d.id}/imprimir?inline=1`}
                        target="_blank"
                        className="action-btn action-btn--neutral"
                        sx={{ flex: 1 }}
                      >
                        Ver PDF
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        onClick={() => onPrint(d.id)}
                        className="action-btn action-btn--neutral"
                        sx={{ flex: 1 }}
                      >
                        Imprimir
                      </Button>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="danger"
                        loading={deletingId === d.id}
                        disabled={deletingId === d.id}
                        onClick={() => onDelete(d.id)}
                        className="action-btn action-btn--danger"
                        sx={{ flex: 1 }}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>

      {/* Mobile cards */}
      <Stack
        spacing={1}
        sx={{
          display: { xs: 'flex', lg: 'none' },
          flexDirection: 'column',
          p: 1.5,
          gap: 1,
        }}
      >
        {docs?.data?.map((d) => (
          <Sheet
            key={d.id}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <Typography level="title-sm">ID {d.id}</Typography>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              N° Laboratorio
            </Typography>
            <Typography level="title-sm">{d.nlab ?? '-'}</Typography>

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.5 }}>
              Especie
            </Typography>
            <Typography level="title-sm">{d.especie ?? '-'}</Typography>

            <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.5 }}>
              Año campaña
            </Typography>
            <Typography level="title-sm">{d.recepcion?.anio ?? '-'}</Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
              <Chip size="sm" variant="soft" color="neutral">
                Fecha: {d.fecha_evaluacion ?? '-'}
              </Chip>
              {renderEstadoBadge(d.estado)}
            </Stack>

            <Stack spacing={0.75} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="sm"
                  variant="solid"
                  color="primary"
                  component={Link}
                  href={`/ui/documentos/${d.id}/edit`}
                  className="action-btn action-btn--primary"
                  sx={{ flex: 1 }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  component="a"
                  href={`/documentos/${d.id}/imprimir?inline=1`}
                  target="_blank"
                  className="action-btn action-btn--neutral"
                  sx={{ flex: 1 }}
                >
                  Ver PDF
                </Button>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={() => onPrint(d.id)}
                  className="action-btn action-btn--neutral"
                  sx={{ flex: 1 }}
                >
                  Imprimir
                </Button>
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  loading={deletingId === d.id}
                  disabled={deletingId === d.id}
                  onClick={() => onDelete(d.id)}
                  className="action-btn action-btn--danger"
                  sx={{ flex: 1 }}
                >
                  Eliminar
                </Button>
              </Stack>
            </Stack>
          </Sheet>
        ))}
      </Stack>
    </Sheet>
  );
}
