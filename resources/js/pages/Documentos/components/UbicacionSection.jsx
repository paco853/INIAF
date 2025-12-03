import React from 'react';
import { Stack } from '@mui/joy';
import { MapPin, Map as MapIcon, Shield } from 'lucide-react';
import FormField from '../../../components/FormField';

export default function UbicacionSection({ data, errors, onUpperChange }) {
  return (
    // DOCUMENTO_EDIT_COMPONENT





    
    <div className="doc-section doc-section--blue">
      <div className="doc-section__title">
        <MapIcon size={18} />
        <span>Ubicación</span>
      </div>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <FormField
          label="Municipio (opcional)"
          value={data.municipio}
          onChange={onUpperChange('municipio')}
          error={errors.municipio}
          startDecorator={<MapPin size={16} />}
        />
        <FormField
          label="Comunidad (opcional)"
          value={data.comunidad}
          onChange={onUpperChange('comunidad')}
          error={errors.comunidad}
          startDecorator={<MapIcon size={16} />}
        />
        <FormField
          label="Aut. Importación"
          value={data.aut_import}
          onChange={onUpperChange('aut_import')}
          error={errors.aut_import}
          required
          startDecorator={<Shield size={16} />}
        />
      </Stack>
    </div>
  );
}
