import React from 'react';
import { FormControl, FormLabel, Input, Textarea, Typography } from '@mui/joy';

export default function FormField({
  label,
  value,
  onChange,
  type = 'text',
  textarea = false,
  error,
  minRows = 3,
  slotProps,
  required = false,
  startDecorator,
}) {
  const hasError = Boolean(error);
  return (
    <FormControl error={hasError}>
      <FormLabel>{label}</FormLabel>
      {textarea ? (
        <Textarea
          minRows={minRows}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          startDecorator={startDecorator}
          error={hasError}
          slotProps={slotProps}
        />
      ) : (
        <Input
          type={type}
          value={value ?? ''}
          onChange={onChange}
          slotProps={slotProps}
          required={required}
          startDecorator={startDecorator}
          error={hasError}
        />
      )}
      {error && (
        <Typography level="body-sm" color="danger" sx={{ mt: 0.25 }}>
          {error}
        </Typography>
      )}
    </FormControl>
  );
}
