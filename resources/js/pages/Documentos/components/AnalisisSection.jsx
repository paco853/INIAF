import React from 'react';
import { Stack } from '@mui/joy';
import { Thermometer, Activity } from 'lucide-react';
import FormField from '../../../components/FormField';
import { DECIMAL_INPUT_SLOT_PROPS } from '../utils';

export default function AnalisisSection({ data, errors, onPlainChange }) {
  return (
    // DOCUMENTO_EDIT_COMPONENT




    
    <div className="doc-section doc-section--mint">
      <div className="doc-section__title">
        <Thermometer size={18} />
        <span>Análisis de humedad y pureza</span>
      </div>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="Humedad (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.resultado}
            onChange={onPlainChange('resultado')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.resultado}
            startDecorator={<Thermometer size={16} />}
          />
          <FormField
            label="Germinación (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.germinacion_pct}
            onChange={onPlainChange('germinacion_pct')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.germinacion_pct}
            startDecorator={<Activity size={16} />}
          />
          <FormField
            label="Viabilidad (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.viabilidad_pct}
            onChange={onPlainChange('viabilidad_pct')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.viabilidad_pct}
            startDecorator={<Activity size={16} />}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="Semilla pura (otros) %"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.otros_sp_pct}
            onChange={onPlainChange('otros_sp_pct')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.otros_sp_pct}
          />
          <FormField
            label="Semilla pura (otros) kg"
            type="number"
            step="0.01"
            min="0"
            value={data.otros_sp_kg}
            onChange={onPlainChange('otros_sp_kg')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.otros_sp_kg}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="Otros cultivos %"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.otros_cultivos_pct}
            onChange={onPlainChange('otros_cultivos_pct')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.otros_cultivos_pct}
          />
          <FormField
            label="Otros cultivos kg"
            type="number"
            step="0.01"
            min="0"
            value={data.otros_cultivos_kg}
            onChange={onPlainChange('otros_cultivos_kg')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.otros_cultivos_kg}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="Malezas comunes %"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.malezas_comunes_pct}
            onChange={onPlainChange('malezas_comunes_pct')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.malezas_comunes_pct}
          />
          <FormField
            label="Malezas comunes kg"
            type="number"
            step="0.01"
            min="0"
            value={data.malezas_comunes_kg}
            onChange={onPlainChange('malezas_comunes_kg')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.malezas_comunes_kg}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="Malezas prohibidas %"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={data.malezas_prohibidas_pct}
            onChange={onPlainChange('malezas_prohibidas_pct')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.malezas_prohibidas_pct}
          />
          <FormField
            label="Malezas prohibidas kg"
            type="number"
            step="0.01"
            min="0"
            value={data.malezas_prohibidas_kg}
            onChange={onPlainChange('malezas_prohibidas_kg')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.malezas_prohibidas_kg}
          />
        </Stack>
      </Stack>
    </div>
  );
}
