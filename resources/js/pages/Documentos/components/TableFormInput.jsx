import React from 'react';
import { Input, Typography, FormControl, FormLabel, Select, Option } from '@mui/joy';

const inputStyles = {
  minHeight: 36,
  borderRadius: 0,
  border: 0,
  padding: '0.25rem 0.75rem',
  fontWeight: 500,
};

export function TableFormSelect({
  value,
  onChange,
  options,
  startDecorator,
  error,
  placeholder,
  label,
}) {
  return (
    <FormControl error={Boolean(error)} className="m-0">
      <FormLabel className="sr-only">{label}</FormLabel>
      <Select
        value={value || null}
        onChange={onChange}
        placeholder={placeholder}
        startDecorator={startDecorator}
        slotProps={{
          button: { sx: { border: 'none', minHeight: 40, px: 0, borderRadius: 0 } },
        }}
        variant="plain"
      >
        {options.map((valueOption) => (
          <Option key={valueOption} value={valueOption}>
            {valueOption}
          </Option>
        ))}
      </Select>
      {error && (
        <Typography level="body-xs" sx={{ color: 'var(--joy-palette-danger-500)' }}>
          {error}
        </Typography>
      )}
    </FormControl>
  );
}

export default function TableFormInput({
  value,
  onChange,
  error,
  type = 'text',
  startDecorator,
  readOnly = false,
  slotProps = {},
  list,
}) {
  return (
    <div className="flex flex-col gap-1">
      <Input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        startDecorator={startDecorator}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
            list,
            sx: {
              ...inputStyles,
              ...(slotProps?.input?.sx ?? {}),
            },
          },
        }}
        variant="plain"
        size="sm"
        readOnly={readOnly}
      />
      {error && (
        <Typography level="body-xs" sx={{ color: 'var(--joy-palette-danger-500)' }}>
          {error}
        </Typography>
      )}
    </div>
  );
}
