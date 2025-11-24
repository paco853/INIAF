import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Sheet,
  Table,
} from '@mui/joy';
import EstadoBadge from './EstadoBadge.jsx';

const RecientesTable = ({ rows = [], onSelect }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography level="title-md" sx={{ mb: 1 }}>Últimos registros</Typography>
      <Typography level="body-xs" color="neutral" sx={{ mb: 1 }}>Basado en datos del sistema</Typography>
      <Sheet variant="soft" sx={{ borderRadius: 10, overflow: 'hidden' }}>
        <Table size="sm" borderAxis="both">
          <thead>
            <tr>
              <th>N° Lab</th>
              <th>Especie</th>
              <th>Cooperador</th>
              <th>Municipio</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.id} onClick={() => onSelect(row)} style={{ cursor: 'pointer' }}>
                <td>{row.nlab}</td>
                <td>{row.especie}</td>
                <td>{row.cooperador}</td>
                <td>{row.municipio ?? '-'}</td>
                <td><EstadoBadge estado={row.estado} /></td>
                <td>{row.fecha}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-sm" textAlign="center" sx={{ py: 1 }}>
                    Sin registros recientes.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>
    </CardContent>
  </Card>
);

export default RecientesTable;
