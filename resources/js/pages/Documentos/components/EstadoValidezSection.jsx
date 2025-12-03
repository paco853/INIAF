import React from 'react';
import { Stack, FormControl, FormLabel, RadioGroup, Radio, Typography } from '@mui/joy';
import { ShieldCheck, Clock } from 'lucide-react';
import FormField from '../../../components/FormField';

export default function EstadoValidezSection({
  data,
  errors,
  estadoValue,
  onEstadoChange,
  onUpperChange,
  validezReadOnly,
}) {
  // DOCUMENTO_EDIT_COMPONENT



  
  return (
    <div className="doc-section">
      <div className="doc-section__title">
        <ShieldCheck size={18} />
        <span>Estado y validez</span>
      </div>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <FormControl>
          <FormLabel>Estado</FormLabel>
          <RadioGroup
            value={estadoValue}
            onChange={onEstadoChange}
            orientation="horizontal"
            sx={{ gap: 0.75, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}
            required
          >
            <Radio value="APROBADO" label="Aprobado" />
            <Radio value="RECHAZADO" label="Rechazado" />
          </RadioGroup>
          {errors.estado && (
            <Typography level="body-sm" color="danger">{errors.estado}</Typography>
          )}
        </FormControl>
        <FormField
          label="Validez"
          value={data.validez}
          onChange={onUpperChange('validez')}
          error={errors.validez}
          startDecorator={<Clock size={16} />}
          readOnly={validezReadOnly}
          slotProps={
            validezReadOnly
              ? {
                  input: {
                    sx: { bgcolor: 'background.level1' },
                  },
                }
              : undefined
          }
        />
      </Stack>
    </div>
  );
}
