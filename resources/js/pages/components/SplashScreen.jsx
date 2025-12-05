import React from 'react';
import { Box, Sheet, Typography, CircularProgress } from '@mui/joy';

export default function SplashScreen({ open, status }) {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15,23,42,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1600,
      }}
    >
      <Sheet
        variant="soft"
        sx={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(229, 244, 255, 0.85))',
          boxShadow: '0 20px 35px rgba(15,23,42,0.3)',
        }}
      >
        <Box
          component="img"
          src="/images/titulo.png"
          alt="INIAF"
          sx={{
            width: 80,
            mb: 1,
            filter: 'drop-shadow(0 0 10px rgba(15,23,42,0.2))',
          }}
        />
        <Typography level="body-lg" fontWeight="600">
          INIAF
        </Typography>
        <Typography level="body-xs" color="neutral.500">
          {status || 'Cargando...'}
        </Typography>
        <CircularProgress variant="soft" color="success" size="sm" thickness={6} />
      </Sheet>
    </Box>
  );
}
