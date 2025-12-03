import React from 'react';
import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Typography,
  RadioGroup,
  Radio,
} from '@mui/joy';
import { ShieldCheck, Clock } from 'lucide-react';
import { DEFAULT_VALIDEZ_UNIT, VALIDEZ_UNITS } from '../../Cultivos/validezUtils';

export default function EstadoValidezSection({
  errors,
  estadoValue,
  onEstadoChange,
  validezAmount,
  validezUnit,
  onValidezAmountChange,
  onValidezUnitChange,
}) {
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
        <FormControl error={Boolean(errors.validez)}>
          <FormLabel>
            Validez
            <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary', ml: 0.5 }}>
              (Selecciona cantidad y unidad)
            </Typography>
          </FormLabel>
          <Stack direction="row" spacing={1}>
            <Input
              type="number"
              min={0}
              value={validezAmount}
              onChange={(event) => onValidezAmountChange(event.target.value)}
              startDecorator={<Clock size={16} />}
              sx={{ flex: 1 }}
            />
            <Select
              value={validezUnit || DEFAULT_VALIDEZ_UNIT}
              onChange={(_, value) => onValidezUnitChange(value)}
              sx={{ minWidth: 110 }}
            >
              {VALIDEZ_UNITS.map((unit) => (
                <Option key={unit.value} value={unit.value}>{unit.label}</Option>
              ))}
            </Select>
          </Stack>
          {errors.validez && (
            <Typography level="body-sm" color="danger">{errors.validez}</Typography>
          )}
        </FormControl>
      </Stack>
    </div>
  );
}
