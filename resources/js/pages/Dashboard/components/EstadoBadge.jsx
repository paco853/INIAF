import React from 'react';
import { Box } from '@mui/joy';

const EstadoBadge = ({ estado }) => {
  const normalized = String(estado || '').toLowerCase();
  const modifier = normalized === 'aprobado'
    ? 'estado-badge--aprobado'
    : 'estado-badge--rechazado';
  return (
    <Box component="span" className={`estado-badge ${modifier}`}>
      {estado || 'RECHAZADO'}
    </Box>
  );
};

export default EstadoBadge;
