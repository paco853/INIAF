import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import { Hash, RefreshCcw, Tag, Box as BoxIcon, Scale } from 'lucide-react';
import LabeledInput from '../shared/LabeledInput';

export default function CategoriaYLote({
  data,
  handleCategoriaChange,
  handleLoteChange,
  regenerateLote,
  handleAnioChange,
  handleBolsasChange,
  handleKgbolChange,
}) {
  return (
    <Box className="recepcion-section">
      <Typography level="title-md" className="section-title">
        Categoría y Lote
      </Typography>
      <Box className="clasificacion-row clasificacion-row--center">
        <span className="clasificacion-dot" />
        <Typography level="body-sm" className="clasificacion-text">
          Clasificación
        </Typography>
      </Box>
      <Box className="fieldset-row">
        <LabeledInput
          label="Cat. inicial"
          placeholder="Categoría inicial"
          value={data.categoria_inicial}
          onChange={handleCategoriaChange('inicial')}
          startDecorator={<Tag size={16} />}
        />
        <LabeledInput
          label="Cat. final"
          placeholder="Categoría final"
          value={data.categoria_final}
          onChange={handleCategoriaChange('final')}
          startDecorator={<Tag size={16} />}
        />
      </Box>
      <Box className="fieldset-row">
        <FormControl>
          <FormLabel>Código de lote</FormLabel>
          <Stack direction="row" spacing={1} className="lote-row">
            <Input
              placeholder="Lote"
              value={data.lote}
              onChange={handleLoteChange}
              required
              startDecorator={<Hash size={16} />}
              className="lote-input"
              slotProps={{
                root: {
                  sx: {
                    flex: '1 1 auto',
                    minWidth: 140,
                    maxWidth: 360,
                  },
                },
                input: {
                  style: {
                    width: '100%',
                  },
                },
              }}
            />
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              onClick={regenerateLote}
              className="lote-btn"
              sx={{ whiteSpace: 'nowrap' }}
            >
              <RefreshCcw size={16} />
            </Button>
          </Stack>
        </FormControl>
        <LabeledInput
          label="Año"
          type="number"
          placeholder="Año"
          min={1900}
          max={2100}
          step={1}
          value={data.anio ?? ''}
          onChange={handleAnioChange}
        />
        <LabeledInput
          label="Cantidad (bolsas)"
          placeholder="Bolsas"
          type="number"
          value={data.bolsas}
          onChange={handleBolsasChange}
          startDecorator={<BoxIcon size={16} />}
        />
        <LabeledInput
          label="Peso (kg/bolsa)"
          placeholder="Kg/bolsa"
          type="number"
          value={data.kgbol}
          onChange={handleKgbolChange}
          className="peso-input"
          startDecorator={<Scale size={16} />}
        />
      </Box>
    </Box>
  );
}
