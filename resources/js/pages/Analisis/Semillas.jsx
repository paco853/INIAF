import React from 'react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Alert from '@mui/joy/Alert';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import {
  FlaskConical,
  Sprout,
  BookOpen,
  Home,
  Users,
  MapPin,
  Hash,
  RefreshCcw,
  Tag,
  Box as BoxIcon,
  Scale,
} from 'lucide-react';

export default function AnalisisSemillas() {
  const page = usePage();
  const { props, url } = page;
  const cultivosProp = props?.cultivos || [];
  const recepcionProp = React.useMemo(
    () => (props?.recepcion && typeof props.recepcion === 'object' ? props.recepcion : {}),
    [props?.recepcion],
  );
  const [cultivos, setCultivos] = React.useState(cultivosProp);
  const today = props?.today || new Date().toISOString().slice(0, 10);
  const errors = props?.errors || {};
  const errorMessages = React.useMemo(() => Object.values(errors).filter(Boolean), [errors]);
  const RECEPCION_STORAGE_KEY = 'analisis-recepcion-form';
  const HUMEDAD_STORAGE_KEY = 'analisis-humedad-form';
  const LOTE_DIRTY_STORAGE_KEY = 'analisis-recepcion-lote-dirty';

  const baseRecepcionData = React.useMemo(
    () => ({
      nlab: '',
      especie: cultivosProp?.[0]?.especie || '',
      variedad: '',
      semillera: '',
      cooperador: '',
      categoria_inicial: cultivosProp?.[0]?.categoria_inicial || '',
      categoria_final: cultivosProp?.[0]?.categoria_final || '',
      lote: '',
      bolsas: '',
      kgbol: '',
      fecha: today,
      municipio: '',
      comunidad: '',
      aut_import: 'NINGUNO',
    }),
    [cultivosProp, today],
  );

  const baseWithSession = React.useMemo(
    () => ({ ...baseRecepcionData, ...recepcionProp }),
    [baseRecepcionData, recepcionProp],
  );

  const initialRecepcionData = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return baseWithSession;
    }
    try {
      const raw = window.sessionStorage.getItem(RECEPCION_STORAGE_KEY);
      if (!raw) {
        return baseWithSession;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...baseWithSession, ...parsed };
      }
      return baseWithSession;
    } catch (error) {
      console.warn('Recepción storage parse error', error);
      return baseWithSession;
    }
  }, [baseWithSession]);

  const { data, setData, post, processing, transform } = useForm('analisisRecepcion', initialRecepcionData);

  const [variedades, setVariedades] = React.useState([]);
  const initialLoteDirty = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.sessionStorage.getItem(LOTE_DIRTY_STORAGE_KEY);
      return raw === 'true';
    } catch (error) {
      console.warn('Lote dirty storage parse error', error);
      return false;
    }
  }, []);
  const [loteDirty, setLoteDirty] = React.useState(initialLoteDirty);
  const [categoriaManual, setCategoriaManual] = React.useState({ inicial: false, final: false });
  const computeUrl = '/analisis/semillas/compute';
  const varSuggestUrl = '/analisis/variedades/suggest';
  const resetUrl = '/analisis/semillas/reset';
  const selectedCultivo = React.useMemo(
    () => cultivos.find((c) => c.especie === data.especie),
    [cultivos, data.especie],
  );
  const queryParams = React.useMemo(() => {
    try {
      const search = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
      return new URLSearchParams(search);
    } catch (_) {
      return new URLSearchParams();
    }
  }, [url]);
  const queryVariedad = queryParams.get('variedad') || '';
  const createVariedadHref = React.useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCultivo?.id) {
      params.set('cultivo_id', String(selectedCultivo.id));
    }
    params.set('redirect_to', url);
    const queryString = params.toString();
    return `/ui/variedades/create${queryString ? `?${queryString}` : ''}`;
  }, [selectedCultivo, url]);
  const toUpper = (val) => (typeof val === 'string' ? val.toUpperCase() : val);
  const [comunidades, setComunidades] = React.useState([]);
  const [municipiosSugeridos, setMunicipiosSugeridos] = React.useState([]);
  const normalizeText = React.useCallback((text) => {
    if (!text) return '';
    return String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ');
  }, []);
  const handleTextChange = React.useCallback(
    (key) => (event) => setData(key, toUpper(event.target.value)),
    [setData],
  );
  const handleComunidadChange = React.useCallback(
    (event) => {
      const value = toUpper(event.target.value);
      setData('comunidad', value);
      if (!value || comunidades.length === 0) {
        setMunicipiosSugeridos([]);
        setData('municipio', '');
        return;
      }

      const normValue = normalizeText(value);

      // buscar match exacto primero
      const exact = comunidades.find((item) => item.norm === normValue);
      if (exact?.municipio) {
        const muni = toUpper(exact.municipio);
        setData('municipio', muni);
        setMunicipiosSugeridos([muni]);
        return;
      }

      let matches = comunidades.filter(
        (item) => item.norm === normValue || item.norm.startsWith(normValue) || normValue.startsWith(item.norm),
      );
      if (matches.length === 0) {
        matches = comunidades.filter(
          (item) => item.norm.includes(normValue) || normValue.includes(item.norm),
        );
      }
      const preferidos = matches.filter(
        (m) => m.municipio && m.municipio !== 'DESCONOCIDO',
      );
      const candidatos = preferidos.length > 0 ? preferidos : matches;
      const sugeridos = Array.from(
        new Set(
          candidatos
            .map((m) => m.municipio)
            .filter(Boolean)
            .map((m) => toUpper(m)),
        ),
      );
      setMunicipiosSugeridos(sugeridos);
      if (sugeridos.length === 1 && sugeridos[0]) {
        setData('municipio', sugeridos[0]);
      }
    },
    [comunidades, setData, normalizeText],
  );

  const handleCategoriaChange = React.useCallback(
    (key) => (event) => {
      const nextValue = toUpper(event.target.value);
      setCategoriaManual((prev) => ({ ...prev, [key]: true }));
      if (key === 'inicial') {
        setData('categoria_inicial', nextValue);
      } else {
        setData('categoria_final', nextValue);
      }
    },
    [setData],
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(RECEPCION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Recepción storage write error', error);
    }
  }, [data]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(LOTE_DIRTY_STORAGE_KEY, loteDirty ? 'true' : 'false');
    } catch (error) {
      console.warn('Lote dirty storage write error', error);
    }
  }, [loteDirty]);

  // Uppercase on text inputs
  transform((curr) => {
    const next = { ...curr };
    ['semillera', 'cooperador', 'categoria_inicial', 'categoria_final', 'lote', 'municipio', 'comunidad', 'aut_import'].forEach((k) => {
      next[k] = toUpper(next[k]);
    });
    return next;
  });

  React.useEffect(() => {
    fetch('/comunidades/suggest')
      .then((res) => res.json())
      .then((json) => {
        const source = Array.isArray(json?.comunidades) ? json.comunidades : [];
        const mapped = source
          .map((item) => {
            const nombre = item?.comunidad;
            const municipio = item?.municipio || 'DESCONOCIDO';
            if (!nombre) return null;
            const comunidadUpper = normalizeText(nombre);
            const municipioUpper = String(municipio).toUpperCase().trim();
            return {
              id: item?.id ?? null,
              comunidad: comunidadUpper,
              norm: comunidadUpper,
              municipio: municipioUpper,
              municipioNorm: normalizeText(municipioUpper),
            };
          })
          .filter(Boolean);
        setComunidades(mapped);
      })
      .catch(() => {});
  }, [normalizeText]);

  // Rellena campos vacíos con lo que haya en la sesión del backend (ej. al volver desde Inicio)
  React.useEffect(() => {
    if (!recepcionProp) return;
    const keys = ['variedad', 'especie', 'nlab', 'semillera', 'cooperador', 'categoria_inicial', 'categoria_final', 'lote', 'bolsas', 'kgbol', 'municipio', 'comunidad', 'aut_import', 'fecha'];
    setData((prev) => {
      let changed = false;
      const next = { ...prev };
      keys.forEach((key) => {
        const serverVal = recepcionProp[key];
        const hasServerVal = serverVal !== undefined && serverVal !== null && serverVal !== '';
        const isEmpty = next[key] === undefined || next[key] === null || next[key] === '';
        if (isEmpty && hasServerVal) {
          next[key] = serverVal;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [recepcionProp, setData]);

  const onSubmit = (e) => {
    e.preventDefault();
    post('/analisis/semillas/recepcion');
  };

  const handleCancel = React.useCallback(() => {
    const clearStorage = () => {
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.removeItem(RECEPCION_STORAGE_KEY);
          window.sessionStorage.removeItem(HUMEDAD_STORAGE_KEY);
          window.sessionStorage.removeItem(LOTE_DIRTY_STORAGE_KEY);
        } catch (error) {
          console.warn('Recepción storage remove error', error);
        }
      }
    };

    clearStorage();
    // Limpiar sesión en backend y recargar formulario vacío
    if (typeof window !== 'undefined') {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || props?.csrfToken || '';
      fetch(resetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
      }).catch(() => {});
    }
    setCategoriaManual({ inicial: false, final: false });
    setLoteDirty(false);
    setVariedades([]);
    setData(baseRecepcionData);
    router.visit('/ui/analisis/semillas', { replace: true });
  }, [baseRecepcionData, props?.csrfToken, resetUrl, setData]);

  React.useEffect(() => {
    if (queryVariedad && queryVariedad !== data.variedad) {
      setData('variedad', queryVariedad);
    }
  }, [queryVariedad, data.variedad, setData]);

  // Cargar variedades por especie
  const loadVariedades = React.useCallback(async (especie) => {
    if (!especie) {
      setVariedades([]);
      return;
    }
    const currentVariedad = (data.variedad || '').trim();
    const currentUpper = currentVariedad.toUpperCase();

    try {
      const cultivo = cultivos.find((c) => c.especie === especie);
      if (!cultivo?.id || typeof window === 'undefined') {
        setVariedades([]);
        return;
      }
      const url = new URL(varSuggestUrl, window.location.origin);
      url.searchParams.set('cultivo_id', cultivo.id);
      const res = await fetch(url.toString());
      const json = await res.json();
      const items = json?.items || [];
      const normalized = items.flatMap((item) => {
        const baseId = item?.id ?? `virtual-${String(item?.nombre ?? '').toLowerCase().replace(/\s+/g, '-')}`;
        const names = String(item?.nombre ?? '')
          .split(/\r?\n|\n|\r/)
          .map((name) => name.trim())
          .filter(Boolean);
        if (names.length === 0) {
          return [];
        }
        return names.map((name, idx) => ({
          id: `${baseId}-${idx}`,
          nombre: name,
        }));
      });

      let resolvedVariedad = currentVariedad;
      if (currentVariedad) {
        const matched = normalized.find(
          (v) => v.nombre.trim().toUpperCase() === currentUpper,
        );
        if (matched) {
          resolvedVariedad = matched.nombre;
        }
      }

      if (resolvedVariedad !== currentVariedad) {
        setData('variedad', resolvedVariedad);
      }

      setVariedades(normalized);
    } catch (e) {
      console.error('Variedades fetch error', e);
      setVariedades([]);
    }
  }, [cultivos, data.variedad, varSuggestUrl, setData]);

  const buildAutoLote = React.useCallback(() => {
    const initials = (data.cooperador || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('');
    const lab = (data.nlab || '').trim();
    const especieInitial = ((data.especie || '').trim().charAt(0) || '').toUpperCase();
    let year = new Date().getFullYear();
    if (data.fecha) {
      const parsed = new Date(data.fecha);
      if (!Number.isNaN(parsed.getTime())) {
        year = parsed.getFullYear();
      }
    }
    return [initials, lab, especieInitial, year ? String(year) : '']
      .filter((segment) => segment && segment.length > 0)
      .join('-')
      .toUpperCase();
  }, [data.cooperador, data.nlab, data.especie, data.fecha]);

  // Calcular lote y total desde backend utilitario
  const compute = React.useCallback(async () => {
    try {
      const payload = {
        especie: data.especie,
        cooperador: data.cooperador,
        nlab: data.nlab,
        bolsas: data.bolsas,
        kgbol: data.kgbol,
      };
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || props?.csrfToken || '';
      const res = await fetch(computeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!loteDirty) {
        if (json?.lote) {
          setData('lote', json.lote);
        } else {
          const fallback = buildAutoLote();
          if (fallback) setData('lote', fallback);
        }
      }
    } catch (e) {
      console.warn('compute error', e);
      if (!loteDirty) {
        const fallback = buildAutoLote();
        if (fallback) setData('lote', fallback);
      }
    }
  }, [data.especie, data.cooperador, data.nlab, data.bolsas, data.kgbol, setData, loteDirty, props, buildAutoLote]);
  const regenerateLote = React.useCallback(() => {
    setLoteDirty(false);
    compute();
  }, [compute]);

  // Si no llegaron cultivos como props, obtenerlos desde suggestEspecies
  React.useEffect(() => {
    if ((cultivosProp?.length || 0) > 0) return;
    (async () => {
      try {
        const url = new URL('/analisis/especies/suggest', window.location.origin);
        url.searchParams.set('limit', '100');
        const res = await fetch(url.toString());
        const json = await res.json();
        const items = json?.items || [];
        setCultivos(items);
        if (!data.especie && items[0]?.especie) {
          setData((prev) => ({
            ...prev,
            especie: items[0].especie,
            categoria_inicial: items[0].categoria_inicial || '',
            categoria_final: items[0].categoria_final || '',
          }));
        }
      } catch (e) {
        console.warn('especies suggest error', e);
      }
    })();
  }, [cultivosProp?.length, data.especie, setData]);

  // Actualizar categorías al cambiar especie o catálogo de cultivos
  React.useEffect(() => {
    const cultivoActual = cultivos.find((x) => x.especie === data.especie);
    if (!cultivoActual) return;

    const categoriaInicial = toUpper(cultivoActual.categoria_inicial || '');
    const categoriaFinal = toUpper(cultivoActual.categoria_final || '');

    if (!categoriaManual.inicial && (data.categoria_inicial || '') !== categoriaInicial) {
      setData('categoria_inicial', categoriaInicial);
    }
    if (!categoriaManual.final && (data.categoria_final || '') !== categoriaFinal) {
      setData('categoria_final', categoriaFinal);
    }
  }, [cultivos, data.especie, data.categoria_final, data.categoria_inicial, setData, categoriaManual]);

  // Cargar variedades al preparar especie o catálogos
  React.useEffect(() => {
    loadVariedades(data.especie);
  }, [data.especie, loadVariedades]);

  // Recalcular lote/total al cambiar campos clave
  React.useEffect(() => {
    compute();
  }, [compute]);

  return (
    <Box className="recepcion-page">
      <Box className="recepcion-card">
        <Typography level="h4" className="recepcion-title">
          <span className="title-icon">📑</span>
          Registro de Recepción
        </Typography>
        {props?.flash?.error && <Alert color="danger" variant="soft">{props.flash.error}</Alert>}
        {props?.flash?.status && <Alert color="success" variant="soft">{props.flash.status}</Alert>}
        {(errorMessages.length > 0) && (
          <Alert color="danger" variant="soft" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ fontSize: 20 }}>⚠️</Box>
            <Box>
              <Typography level="title-sm" sx={{ mb: 0.5, fontWeight: 700 }}>
                Corrige los siguientes campos:
              </Typography>
              <ul className="list-compact">
                {errorMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </Box>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="recepcion-form">
          <Box className="recepcion-section">
            <Typography level="title-md" className="section-title">
              Datos Generales y Origen
            </Typography>
            <Box className="recepcion-grid recepcion-grid--lab">
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
                  onChange={(_, v) => {
                    const nextEspecie = v || '';
                    setCategoriaManual({ inicial: false, final: false });
                    setData((prev) => ({
                      ...prev,
                      especie: nextEspecie,
                      variedad: '',
                      
                    }));
                    

                  }}
                  
                  required
                  
                  startDecorator={<Sprout size={16} />}
                >
                  <Option value="" disabled icon={<Sprout size={14} />}>Selecciona especie</Option>
                  {cultivos.map((c) => (
                    <Option key={c.id} value={c.especie} icon={<Sprout size={14} />}>{c.especie}</Option>
                  ))}
                </Select>
                <input hidden required value={data.especie || ""}onChange={() => {}}
/>
                
                  
              </FormControl>
              <FormControl>
              <FormLabel>Variedad</FormLabel>
              <Select
                value={data.variedad || null}
                onChange={(_, v) => setData('variedad', v || '')}
                placeholder={variedades.length ? 'Variedad' : 'Sin variedades'}
                disabled={cultivos.length === 0}
                required
                startDecorator={<BookOpen size={16} />}
              >
                <Option value="" disabled icon={<BookOpen size={14} />}>Selecciona variedad</Option>
                {data.variedad && !variedades.some((v) => v.nombre === data.variedad) && (
                  <Option value={data.variedad} icon={<BookOpen size={14} />}>
                    {data.variedad}
                  </Option>
                )}
                {variedades.map((v) => (
                  <Option key={v.id ?? v.nombre} value={v.nombre} icon={<BookOpen size={14} />}>{v.nombre}</Option>
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
            {variedades.length === 0 && (
              <Alert color="warning" variant="outlined" sx={{ mt: 1 }}>
                No hay variedades registradas para esta especie{' '}
                <Link href={createVariedadHref} className="link-underline">
                  Añadir variedad
                </Link>
              </Alert>
            )}
          </Box>

          <Box className="recepcion-section">
            <Typography level="title-md" className="section-title">
              Categoría y Lote
            </Typography>
            <Box className="clasificacion-row clasificacion-row--center">
              <span className="clasificacion-dot" />
              <Typography level="body-sm" className="clasificacion-text">Clasificación</Typography>
            </Box>
            <Box className="fieldset-row">
              <FormControl>
                <FormLabel>Cat. inicial</FormLabel>
                <Input
                  placeholder="Categoría inicial"
                  value={data.categoria_inicial}
                  onChange={handleCategoriaChange('inicial')}
                  startDecorator={<Tag size={16} />}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cat. final</FormLabel>
                <Input
                  placeholder="Categoría final"
                  value={data.categoria_final}
                  onChange={handleCategoriaChange('final')}
                  startDecorator={<Tag size={16} />}
                />
              </FormControl>
            </Box>
            <Box className="fieldset-row">
              <FormControl>
                <FormLabel>Código de lote</FormLabel>
                <Stack direction="row" spacing={1} className="lote-row">
                  <Input
                    placeholder="Lote"
                    value={data.lote}
                    onChange={(e) => {
                      const val = toUpper(e.target.value);
                      setData('lote', val);
                      setLoteDirty(val !== '');
                      if (val === '') regenerateLote();
                    }}
                    required
                    startDecorator={<Hash size={16} />}
                    className="lote-input"
                  />
                  <Button
                    variant="outlined"
                    color="neutral"
                    size="sm"
                    onClick={regenerateLote}
                    className="lote-btn"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    <RefreshCcw size={16} />
                  </Button>
                </Stack>
              </FormControl>
              <FormControl>
                <FormLabel>Cantidad (bolsas)</FormLabel>
                <Input
                  placeholder="Bolsas"
                  type="number"
                  value={data.bolsas}
                  onChange={(e) => setData('bolsas', e.target.value)}
                  startDecorator={<BoxIcon size={16} />}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Peso (kg/bolsa)</FormLabel>
                <Input
                  placeholder="Kg/bolsa"
                  type="number"
                  value={data.kgbol}
                  onChange={(e) => setData('kgbol', e.target.value)}
                  className="peso-input"
                  startDecorator={<Scale size={16} />}
                />
              </FormControl>
            </Box>
          </Box>

          <Box className="recepcion-section">
            <Typography level="title-md" className="section-title">
              Ubicación Geográfica
            </Typography>
            <Box className="recepcion-grid recepcion-grid--even">
              <FormControl>
                <FormLabel>Comunidad (opcional)</FormLabel>
                <Input
                  placeholder="Comunidad"
                  value={data.comunidad}
                  onChange={handleComunidadChange}
                  startDecorator={<MapPin size={16} />}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Municipio (opcional)</FormLabel>
                <Input
                  placeholder="Municipio"
                  value={data.municipio}
                  onChange={handleTextChange('municipio')}
                  slotProps={{ input: { list: 'municipio-suggest' } }}
                  startDecorator={<MapPin size={16} />}
                />
              </FormControl>
              <FormControl>
                <FormLabel>N° Aut. Import</FormLabel>
                <Input placeholder="N° Aut. Import" value={data.aut_import} onChange={handleTextChange('aut_import')} startDecorator={<Hash size={16} />} />
              </FormControl>
            </Box>
            <datalist id="municipio-suggest">
              {municipiosSugeridos.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} className="recepcion-actions">
            <Button type="submit" variant="solid" disabled={processing}>
              Siguiente
            </Button>
            <Button variant="outlined" color="neutral" onClick={handleCancel}>Cancelar</Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
