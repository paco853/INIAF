import React from 'react';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';

export default function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  startDecorator,
  type = 'text',
  min,
  max,
  step,
  required = false,
  className,
  slotProps,
}) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        startDecorator={startDecorator}
        type={type}
        min={min}
        max={max}
        step={step}
        required={required}
        className={className}
        slotProps={slotProps}
      />
    </FormControl>
  );
}
