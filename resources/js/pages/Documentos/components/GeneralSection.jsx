import React from 'react';
import { Stack, FormControl, FormLabel, Select, Option, Typography } from '@mui/joy';
import { Hash, Sprout, CalendarDays, BadgeCheck } from 'lucide-react';
import FormField from '../../../components/FormField';

export default function GeneralSection({
  data,
  errors,
  nlabFieldError,
  especiesOptions,
  onUpperChange,
  onPlainChange,
  onEspecieSelect,
}) {
  // DOCUMENTO_EDIT_COMPONENT




  
  return (
    <div className="doc-section doc-section--blue">
      <div className="doc-section__title">
        <BadgeCheck size={18} />
        <span>Datos generales</span>
      </div>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="N° Laboratorio"
            value={data.nlab}
            onChange={onUpperChange('nlab')}
            error={nlabFieldError}
            required
            startDecorator={<Hash size={16} />}
          />
          <FormControl error={Boolean(errors.especie)}>
            <FormLabel>Especie</FormLabel>
            <Select
              value={data.especie || null}
              onChange={onEspecieSelect}
              placeholder="Selecciona especie"
              startDecorator={<Sprout size={16} />}
              required
              sx={{ minWidth: 200 }}
            >
              {especiesOptions.map((value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </Select>
            {errors.especie && (
              <Typography level="body-sm" color="danger" sx={{ mt: 0.25 }}>
                {errors.especie}
              </Typography>
            )}
          </FormControl>
          <FormField
            label="Fecha evaluación"
            type="date"
            value={data.fecha_evaluacion}
            onChange={onPlainChange('fecha_evaluacion')}
            error={errors.fecha_evaluacion}
            required
            startDecorator={<CalendarDays size={16} />}
          />
        </Stack>
      </Stack>
    </div>
  );
}
