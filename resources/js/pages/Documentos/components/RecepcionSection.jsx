import React from 'react';
import { Stack, FormControl, FormLabel, Select, Option, Typography, Input } from '@mui/joy';
import {
  Package,
  Tag,
  Building2,
  Handshake,
  Shield,
  ShieldCheck,
  Clock,
  Scale,
} from 'lucide-react';
import FormField from '../../../components/FormField';
import { DECIMAL_INPUT_SLOT_PROPS, NUMBER_INPUT_SLOT_PROPS } from '../utils';
// DOCUMENTO_EDIT_COMPONENT






export default function RecepcionSection({
  data,
  errors,
  variedadOptions,
  onVariedadSelect,
  onUpperChange,
  onUpperNoTrimChange,
  onPlainChange,
  onAnioChange,
  onLoteManualChange,
  totalKg,
}) {
  return (
    <div className="doc-section doc-section--peach">
      <div className="doc-section__title">
        <Package size={18} />
        <span>Recepción</span>
      </div>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormControl error={Boolean(errors.variedad)}>
            <FormLabel>Variedad</FormLabel>
            <Select
              value={data.variedad || null}
              onChange={onVariedadSelect}
              placeholder="Selecciona variedad"
              startDecorator={<Tag size={16} />}
              required
              slotProps={{
                button: {
                  sx: {
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    minHeight: 48,
                    alignItems: 'center',
                  },
                },
                listbox: {
                  sx: { maxHeight: 260 },
                },
              }}
            >
              {variedadOptions.map((value) => (
                <Option key={value} value={value} sx={{ whiteSpace: 'normal', lineHeight: 1.2 }}>
                  {value}
                </Option>
              ))}
            </Select>
            {errors.variedad && (
              <Typography level="body-sm" color="danger" sx={{ mt: 0.25 }}>
                {errors.variedad}
              </Typography>
            )}
          </FormControl>
          <FormField
            label="Semillera (opcional)"
            value={data.semillera}
            onChange={onUpperNoTrimChange('semillera')}
            error={errors.semillera}
            startDecorator={<Building2 size={16} />}
          />
          <FormField
            label="Cooperador (opcional)"
            value={data.cooperador}
            onChange={onUpperNoTrimChange('cooperador')}
            error={errors.cooperador}
            startDecorator={<Handshake size={16} />}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="Categoría inicial"
            value={data.categoria_inicial}
            onChange={onUpperChange('categoria_inicial')}
            error={errors.categoria_inicial}
            required
            startDecorator={<Shield size={16} />}
            slotProps={{
              input: {
                list: 'documento-categorias-iniciales',
                autoComplete: 'on',
              },
            }}
          />
          <FormField
            label="Categoría final"
            value={data.categoria_final}
            onChange={onUpperChange('categoria_final')}
            error={errors.categoria_final}
            required
            startDecorator={<ShieldCheck size={16} />}
            slotProps={{
              input: {
                list: 'documento-categorias-finales',
                autoComplete: 'on',
              },
            }}
          />
          <FormField
            label="Año"
            type="number"
            min="1900"
            max="2100"
            value={data.anio}
            onChange={onAnioChange}
            slotProps={NUMBER_INPUT_SLOT_PROPS}
            error={errors.anio}
            startDecorator={<Clock size={16} />}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormField
            label="Lote"
            value={data.lote}
            onChange={onLoteManualChange}
            error={errors.lote}
            required
            startDecorator={<Package size={16} />}
            slotProps={{
              input: {
                list: 'lote-suggestions',
                autoComplete: 'on',
              },
            }}
          />
          <FormField
            label="Bolsas (opcional)"
            type="number"
            step="1"
            min="0"
            value={data.bolsas}
            onChange={onPlainChange('bolsas')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.bolsas}
            startDecorator={<Scale size={16} />}
          />
          <FormField
            label="Kg/bolsa (opcional)"
            type="number"
            step="0.01"
            min="0"
            value={data.kgbol}
            onChange={onPlainChange('kgbol')}
            slotProps={DECIMAL_INPUT_SLOT_PROPS}
            error={errors.kgbol}
            startDecorator={<Scale size={16} />}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
          <FormControl>
            <FormLabel>Total (kg)</FormLabel>
            <Input value={totalKg || ''} readOnly startDecorator={<Scale size={16} />} />
          </FormControl>
        </Stack>
      </Stack>
    </div>
  );
}
