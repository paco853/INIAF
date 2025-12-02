import React from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Alert from '@mui/joy/Alert';
import { useRecepcionForm } from './hooks/useRecepcionForm';
import DatosGenerales from '../../components/recepcion/DatosGenerales';
import CategoriaYLote from '../../components/recepcion/CategoriaYLote';
import UbicacionGeografica from '../../components/recepcion/UbicacionGeografica';

export default function AnalisisSemillas() {
  const {
    data,
    processing,
    errorMessages,
    flash,
    cultivos,
    variedades,
    municipiosSugeridos,
    handleTextChange,
    handleComunidadChange,
    handleCategoriaChange,
    handleEspecieChange,
    handleVariedadChange,
    handleLoteChange,
    handleAnioChange,
    handleBolsasChange,
    handleKgbolChange,
    regenerateLote,
    onSubmit,
    handleCancel,
    createVariedadHref,
  } = useRecepcionForm();

  return (
    <Box className="recepcion-page">
      <Box className="recepcion-card">
        <Typography level="h4" className="recepcion-title">
          <span className="title-icon">📑</span>
          Registro de Recepción
        </Typography>

        {flash?.error && (
          <Alert color="danger" variant="soft">
            {flash.error}
          </Alert>
        )}

        {flash?.status && (
          <Alert color="success" variant="soft">
            {flash.status}
          </Alert>
        )}

        {errorMessages.length > 0 && (
          <Alert
            color="danger"
            variant="soft"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Box sx={{ fontSize: 20 }}>⚠️</Box>
            <Box>
              <Typography level="title-sm" sx={{ mb: 0.5, fontWeight: 700 }}>
                Corrige los siguientes campos:
              </Typography>
              <ul className="list-compact">
                {errorMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </Box>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="recepcion-form">
          <DatosGenerales
            data={data}
            cultivos={cultivos}
            variedades={variedades}
            handleTextChange={handleTextChange}
            handleEspecieChange={handleEspecieChange}
            handleVariedadChange={handleVariedadChange}
            handleAnioChange={handleAnioChange}
            createVariedadHref={createVariedadHref}
          />

          <CategoriaYLote
            data={data}
            handleCategoriaChange={handleCategoriaChange}
            handleLoteChange={handleLoteChange}
            regenerateLote={regenerateLote}
            handleBolsasChange={handleBolsasChange}
            handleKgbolChange={handleKgbolChange}
          />

          <UbicacionGeografica
            data={data}
            handleComunidadChange={handleComunidadChange}
            handleTextChange={handleTextChange}
            municipiosSugeridos={municipiosSugeridos}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            className="recepcion-actions"
          >
            <Button type="submit" variant="solid" disabled={processing}>
              Siguiente
            </Button>
            <Button variant="outlined" color="neutral" onClick={handleCancel}>
              Cancelar
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
