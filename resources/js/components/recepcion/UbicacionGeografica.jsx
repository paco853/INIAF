import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import { MapPin, Hash } from 'lucide-react';

export default function UbicacionGeografica({
  data,
  handleComunidadChange,
  handleTextChange,
  municipiosSugeridos,
}) {
  return (
    <Box className="recepcion-section">
      <Typography level="title-md" className="section-title">
        Ubicación Geográfica
      </Typography>
      <Box className="recepcion-grid recepcion-grid--even">
        <FormControl>
          <FormLabel>Comunidad (opcional)</FormLabel>
          <Input
            placeholder="Comunidad"
            value={data.comunidad}
            onChange={handleComunidadChange}
            startDecorator={<MapPin size={16} />}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Municipio (opcional)</FormLabel>
          <Input
            placeholder="Municipio"
            value={data.municipio}
            onChange={handleTextChange('municipio')}
            slotProps={{ input: { list: 'municipio-suggest' } }}
            startDecorator={<MapPin size={16} />}
          />
        </FormControl>
        <FormControl>
          <FormLabel>N° Aut. Import</FormLabel>
          <Input
            placeholder="N° Aut. Import"
            value={data.aut_import}
            onChange={handleTextChange('aut_import')}
            startDecorator={<Hash size={16} />}
          />
        </FormControl>
      </Box>
      <datalist id="municipio-suggest">
        {municipiosSugeridos.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
    </Box>
  );
}
