import React from 'react';
import { Sheet, Table, Box, Stack, Button, Chip, Typography } from '@mui/joy';
import { Link } from '@inertiajs/react';

export default function DocumentosTable({ docs, onDelete, onPrint, renderEstadoBadge, deletingId }) {
  return (
    <Sheet
      variant="soft"
      className="glass-table-panel"
      sx={{
        p: 0,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 10px 35px rgba(15, 23, 42, 0.12)',
        backgroundColor: 'rgba(236, 236, 240, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(225,225,230,0.2))',
        backdropFilter: 'blur(10px)',
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
            className="text-[#363D46]"
            sx={{
              '--Table-headerUnderlineThickness': '1px',
              display: { xs: 'none', lg: 'table' },
              minWidth: 760,
              '& th': {
                background: 'rgba(255,255,255,0.4)',
                fontWeight: 600,
                color: '#363D46',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
              },
              '& td': {
                background: 'rgba(255,255,255,0.2)',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
              },
              '& tbody tr:nth-of-type(odd) td': {
                background: 'rgba(255,255,255,0.4)',
              },
              '& tbody tr:nth-of-type(even) td': {
                background: 'rgba(233,233,235,0.4)',
              },
              '& tbody tr:hover td': {
                background: 'rgba(255,255,255,0.55)',
              },
            }}
          >
          <thead>
            <tr>
              <th className="table-col--sm text-[#34495E]/80">N° Lab</th>
              <th className="table-col--lg text-[#34495E]/80">Especie</th>
              <th className="table-col--sm text-[#34495E]/80">Año campaña</th>
              <th className="table-col--md text-[#34495E]/80">Fecha de Evaluacion</th>
              <th className="table-col--sm text-[#34495E]/80">Estado</th>
              <th className="table-col--xl text-[#34495E]/80">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docs?.data?.map((d) => (
              <tr key={d.id}>
                <td className="text-[#34495E]/80">{d.nlab ?? '-'}</td>
                <td className="table-col--lg text-[#34495E]/80">{d.especie ?? '-'}</td>
                <td className="text-[#34495E]/80">{d.recepcion?.anio ?? '-'}</td>
                <td className="text-[#34495E]/80">{d.fecha_evaluacion ?? '-'}</td>
                <td className="text-[#34495E]/80">{renderEstadoBadge(d.estado)}</td>
                <td className="text-[#34495E]/80">
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
              backgroundColor: 'rgba(236, 238, 241, 0.95)',
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
