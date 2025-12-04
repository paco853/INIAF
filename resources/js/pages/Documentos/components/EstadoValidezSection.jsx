import React from 'react';
import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  Typography,
  RadioGroup,
  Radio,
} from '@mui/joy';
import { ShieldCheck, Clock } from 'lucide-react';

export default function EstadoValidezSection({
  errors,
  estadoValue,
  onEstadoChange,
  diasValue,
  onDiasChange,
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
              (Ingresa días)
            </Typography>
          </FormLabel>
          <Stack direction="row" spacing={1}>
            <Input
              type="number"
              min={0}
              value={diasValue}
              onChange={(event) => onDiasChange(event.target.value)}
              startDecorator={<Clock size={16} />}
              sx={{ flex: 1 }}
            />
          </Stack>
          {errors.validez && (
            <Typography level="body-sm" color="danger">{errors.validez}</Typography>
          )}
        </FormControl>
      </Stack>
    </div>
  );
}
