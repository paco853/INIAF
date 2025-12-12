import React from 'react';
import { Sheet, Input, Select, Option, Stack, Button } from '@mui/joy';

export default function DocumentosFilters({
  filterState,
  speciesOptions,
  onYearChange,
  onFilterChange,
  onEspecieChange,
  onEstadoChange,
  onSubmit,
  onClear,
}) {
  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 18,
      }}
    >
      <form className="filters-grid" onSubmit={onSubmit}>
        <Input
          size="sm"
          className="filters-control"
          type="number"
          placeholder="Año campaña"
          min={1900}
          max={2100}
          value={filterState.anio}
          onChange={onYearChange}
        />
        <Input
          size="sm"
          className="filters-control"
          placeholder="N° Laboratorio"
          value={filterState.nlab}
          onChange={onFilterChange('nlab')}
        />
        <Input
          size="sm"
          className="filters-control"
          placeholder="Cooperador"
          value={filterState.cooperador || ''}
          onChange={onFilterChange('cooperador')}
        />
        <Select
          size="sm"
          className="filters-control"
          placeholder="Especie"
          value={filterState.especie || 'ALL'}
          onChange={onEspecieChange}
        >
          <Option value="ALL">Todos</Option>
          {speciesOptions.map((name) => (
            <Option key={name} value={name}>
              {name}
            </Option>
          ))}
        </Select>
        <Select
          size="sm"
          className="filters-control"
          value={filterState.estado || 'ALL'}
          onChange={onEstadoChange}
          placeholder="Estado"
        >
          <Option value="ALL">Todos</Option>
          <Option value="APROBADO">Aprobado</Option>
          <Option value="RECHAZADO">Rechazado</Option>
        </Select>
        <Stack direction="row" spacing={1} className="filters-actions">
          <Button type="submit" size="sm" variant="solid">
            Buscar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="plain"
            color="primary"
            onClick={onClear}
            className="filters__clear"
          >
            Limpiar filtros
          </Button>
        </Stack>
      </form>
    </Sheet>
  );
}
