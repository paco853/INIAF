import React from 'react';
import {
  Card,
  Stack,
  Select,
  Option,
  Button,
} from '@mui/joy';
import { Link } from '@inertiajs/react';
import { Settings } from 'lucide-react';

const FiltersBar = ({
  selectedCultivo,
  selectedMunicipio,
  cultivoOptions,
  municipioOptions,
  onCultivoChange,
  onMunicipioChange,
  onCustomize,
}) => (
  <Card variant="soft" color="neutral" sx={{ p: 2 }}>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
        <Select
          size="sm"
          value={selectedCultivo}
          onChange={(_, v) => onCultivoChange(v || 'Todos')}
          startDecorator="🌱"
        >
          {cultivoOptions.map((opt) => (
            <Option key={opt} value={opt}>{opt}</Option>
          ))}
        </Select>
        <Select
          size="sm"
          value={selectedMunicipio}
          onChange={(_, v) => onMunicipioChange(v || 'Todo Potosí')}
          startDecorator="📍"
        >
          {municipioOptions.map((opt) => (
            <Option key={opt} value={opt}>{opt}</Option>
          ))}
        </Select>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={onCustomize}
          startDecorator={<Settings size={14} />}
          sx={{ borderRadius: 12 }}
        >
          Personalizar
        </Button>
        <Button component={Link} href="/ui/analisis/semillas" size="sm" variant="solid" color="success" startDecorator="＋">
          Registrar análisis
        </Button>
      </Stack>
    </Stack>
  </Card>
);

export default FiltersBar;
