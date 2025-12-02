import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Alert from '@mui/joy/Alert';
import Link from '@mui/joy/Link';
import { FlaskConical, Sprout, BookOpen, Home, Users, Calendar } from 'lucide-react';

export default function DatosGenerales({
  data,
  cultivos,
  variedades,
  handleTextChange,
  handleEspecieChange,
  handleVariedadChange,
  handleAnioChange,
  createVariedadHref,
}) {
  return (
    <Box className="recepcion-section">
      <Typography level="title-md" className="section-title">
        Datos Generales y Origen
      </Typography>
      <Box className="recepcion-grid recepcion-grid--lab">
        <FormControl>
          <FormLabel>Año / Campaña</FormLabel>
          <Input
            type="number"
            placeholder="2024"
            min={1900}
            max={2100}
            value={data.anio ?? ''}
            onChange={handleAnioChange}
            startDecorator={<Calendar size={16} />}
          />
        </FormControl>
        <Box className="lab-card">
          <FormLabel>Nº Lab</FormLabel>
          <Input
            placeholder="Nº Lab"
            value={data.nlab}
            onChange={handleTextChange('nlab')}
            required
            startDecorator={<FlaskConical size={16} />}
          />
        </Box>

        <FormControl>
          <FormLabel>Especie</FormLabel>
          <Select
            value={data.especie || null}
            onChange={(_, v) => handleEspecieChange(v)}
            required
            startDecorator={<Sprout size={16} />}
          >
            <Option value="" disabled icon={<Sprout size={14} />}>
              Selecciona especie
            </Option>
            {cultivos.map((c) => (
              <Option key={c.id} value={c.especie} icon={<Sprout size={14} />}>
                {c.especie}
              </Option>
            ))}
          </Select>
          <input hidden required value={data.especie || ''} onChange={() => {}} />
        </FormControl>

        <FormControl>
          <FormLabel>Variedad</FormLabel>
          <Select
            value={data.variedad || null}
            onChange={(_, v) => handleVariedadChange(v)}
            placeholder={variedades.length ? 'Variedad' : 'Sin variedades'}
            disabled={!data.especie || cultivos.length === 0}
            required
            startDecorator={<BookOpen size={16} />}
          >
            <Option value="" disabled icon={<BookOpen size={14} />}>
              Selecciona variedad
            </Option>
            {data.variedad &&
              !variedades.some((v) => v.nombre === data.variedad) && (
                <Option value={data.variedad} icon={<BookOpen size={14} />}>
                  {data.variedad}
                </Option>
              )}
            {variedades.map((v) => (
              <Option
                key={v.id ?? v.nombre}
                value={v.nombre}
                icon={<BookOpen size={14} />}
              >
                {v.nombre}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Semillera (opcional)</FormLabel>
          <Input
            placeholder="Nombre de la semillera"
            value={data.semillera}
            onChange={handleTextChange('semillera')}
            startDecorator={<Home size={16} />}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Cooperador (opcional)</FormLabel>
          <Input
            placeholder="Nombre del cooperador"
            value={data.cooperador}
            onChange={handleTextChange('cooperador')}
            startDecorator={<Users size={16} />}
          />
        </FormControl>
      </Box>
      {!variedades.length && (
        <Alert color="warning" variant="outlined" sx={{ mt: 1 }}>
          No hay variedades registradas para esta especie{' '}
          <Link href={createVariedadHref} className="link-underline">
            Añadir variedad
          </Link>
        </Alert>
      )}
    </Box>
  );
}
