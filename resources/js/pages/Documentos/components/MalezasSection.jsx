import React from 'react';
import { Stack } from '@mui/joy';
import { Leaf } from 'lucide-react';
import FormField from '../../../components/FormField';

export default function MalezasSection({ data, errors, onUpperChange, onTextareaInput }) {
  return (
    // DOCUMENTO_EDIT_COMPONENT




    
    <div className="doc-section doc-section--mint">
      <div className="doc-section__title">
        <Leaf size={18} />
        <span>Malezas</span>
      </div>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <FormField
          label="Malezas nocivas"
          value={data.malezas_nocivas}
          onChange={onUpperChange('malezas_nocivas')}
          error={errors.malezas_nocivas}
          startDecorator={<Leaf size={16} />}
          textarea
          minRows={2}
          slotProps={{
            input: {
              onInput: onTextareaInput,
              style: { overflow: 'hidden' },
            },
          }}
        />
        <FormField
          label="Malezas comunes"
          value={data.malezas_comunes}
          onChange={onUpperChange('malezas_comunes')}
          error={errors.malezas_comunes}
          startDecorator={<Leaf size={16} />}
          textarea
          minRows={2}
          slotProps={{
            input: {
              onInput: onTextareaInput,
              style: { overflow: 'hidden' },
            },
          }}
        />
      </Stack>
    </div>
  );
}
