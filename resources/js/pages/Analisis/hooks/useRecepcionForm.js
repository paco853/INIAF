import React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';

const RECEPCION_STORAGE_KEY = 'analisis-recepcion-form';
const HUMEDAD_STORAGE_KEY = 'analisis-humedad-form';
const LOTE_DIRTY_STORAGE_KEY = 'analisis-recepcion-lote-dirty';
const VAR_SUGGEST_URL = '/analisis/variedades/suggest';
const RESET_URL = '/analisis/semillas/reset';

const toUpper = (val) => (typeof val === 'string' ? val.toUpperCase() : val);

const normalizeText = (text) => {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ');
};

export function useRecepcionForm() {
  const { props, url } = usePage();

  const cultivosProp = props?.cultivos || [];
  const errors = React.useMemo(() => (
    props?.errors && typeof props.errors === 'object' ? props.errors : {}
  ), [props?.errors]);
  const recepcionProp = React.useMemo(
    () => (props?.recepcion && typeof props.recepcion === 'object' ? props.recepcion : {}),
    [props?.recepcion],
  );

  const [cultivos, setCultivos] = React.useState(cultivosProp);
  const [variedades, setVariedades] = React.useState([]);
  const [comunidades, setComunidades] = React.useState([]);
  const [municipiosSugeridos, setMunicipiosSugeridos] = React.useState([]);
  const [loteDirty, setLoteDirty] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.sessionStorage.getItem(LOTE_DIRTY_STORAGE_KEY);
      return raw === 'true';
    } catch (error) {
      console.warn('Lote dirty storage parse error', error);
      return false;
    }
  });
  const [categoriaManual, setCategoriaManual] = React.useState({
    inicial: false,
    final: false,
  });

  const today = props?.today || new Date().toISOString().slice(0, 10);

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
      anio: null,
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

  const form = useForm('analisisRecepcion', initialRecepcionData);
  const { data, setData, post, processing, transform } = form;

  React.useEffect(() => {
    transform((curr) => {
      const next = { ...curr };
      [
        'semillera',
        'cooperador',
        'categoria_inicial',
        'categoria_final',
        'lote',
        'municipio',
        'comunidad',
        'aut_import',
      ].forEach((k) => {
        next[k] = toUpper(next[k]);
      });
      return next;
    });
  }, [transform]);

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

      const exact = comunidades.find((item) => item.norm === normValue);
      if (exact?.municipio) {
        const muni = toUpper(exact.municipio);
        setData('municipio', muni);
        setMunicipiosSugeridos([muni]);
        return;
      }

      let matches = comunidades.filter(
        (item) =>
          item.norm === normValue ||
          item.norm.startsWith(normValue) ||
          normValue.startsWith(item.norm),
      );

      if (matches.length === 0) {
        matches = comunidades.filter(
          (item) =>
            item.norm.includes(normValue) || normValue.includes(item.norm),
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
    [comunidades, setData],
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
      window.sessionStorage.setItem(
        RECEPCION_STORAGE_KEY,
        JSON.stringify(data),
      );
    } catch (error) {
      console.warn('Recepción storage write error', error);
    }
  }, [data]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        LOTE_DIRTY_STORAGE_KEY,
        loteDirty ? 'true' : 'false',
      );
    } catch (error) {
      console.warn('Lote dirty storage write error', error);
    }
  }, [loteDirty]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
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
  }, []);

  React.useEffect(() => {
    if (!recepcionProp || Object.keys(recepcionProp).length === 0) return;
    const keys = [
      'variedad',
      'especie',
      'nlab',
      'semillera',
      'cooperador',
      'categoria_inicial',
      'categoria_final',
      'lote',
      'bolsas',
      'kgbol',
      'municipio',
      'comunidad',
      'aut_import',
      'anio',
      'fecha',
    ];

    setData((prev) => {
      let changed = false;
      const next = { ...prev };
      keys.forEach((key) => {
        const serverVal = recepcionProp[key];
        const hasServerVal =
          serverVal !== undefined && serverVal !== null && serverVal !== '';
        const isEmpty =
          next[key] === undefined || next[key] === null || next[key] === '';
        if (isEmpty && hasServerVal) {
          next[key] = serverVal;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [recepcionProp, setData]);

  React.useEffect(() => {
    if (queryVariedad && queryVariedad !== data.variedad) {
      setData('variedad', queryVariedad);
    }
  }, [queryVariedad, data.variedad, setData]);

  const loadVariedades = React.useCallback(
    async (especie) => {
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

        const url = new URL(VAR_SUGGEST_URL, window.location.origin);
        url.searchParams.set('cultivo_id', cultivo.id);
        const res = await fetch(url.toString());
        const json = await res.json();
        const items = json?.items || [];

        const normalized = items.flatMap((item) => {
          const baseId =
            item?.id ??
            `virtual-${String(item?.nombre ?? '')
              .toLowerCase()
              .replace(/\s+/g, '-')}`;
          const names = String(item?.nombre ?? '')
            .split(/\r?\n|\n|\r/)
            .map((name) => name.trim())
            .filter(Boolean);

          if (names.length === 0) return [];

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
    },
    [cultivos, data.variedad, setData],
  );

  const handleEspecieChange = React.useCallback(
    (value) => {
      const nextEspecie = value || '';
      setCategoriaManual({ inicial: false, final: false });
      setData((prev) => ({
        ...prev,
        especie: nextEspecie,
        variedad: '',
      }));
    },
    [setData],
  );

  const handleVariedadChange = React.useCallback(
    (value) => setData('variedad', value || ''),
    [setData],
  );

  React.useEffect(() => {
    loadVariedades(data.especie);
  }, [data.especie, loadVariedades]);

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
  }, [
    cultivos,
    data.especie,
    data.categoria_final,
    data.categoria_inicial,
    setData,
    categoriaManual,
  ]);

  const buildAutoLote = React.useCallback(() => {
    const initials = (data.cooperador || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('');

    const lab = (data.nlab || '').trim();
    const especieInitial =
      ((data.especie || '').trim().charAt(0) || '').toUpperCase();
    const yearInput = String(data.anio ?? '').trim();
    const year = /^\d{4}$/.test(yearInput) ? yearInput : '';

    return [initials, lab, especieInitial, year ? String(year) : '']
      .filter((segment) => segment && segment.length > 0)
      .join('-')
      .toUpperCase();
  }, [data.cooperador, data.nlab, data.especie, data.anio]);

  const compute = React.useCallback(() => {
    if (loteDirty) return;
    const fallback = buildAutoLote();
    if (fallback) {
      setData('lote', fallback);
    }
  }, [buildAutoLote, loteDirty, setData]);

  const regenerateLote = React.useCallback(() => {
    setLoteDirty(false);
    compute();
  }, [compute]);

  React.useEffect(() => {
    if ((cultivosProp?.length || 0) > 0 || typeof window === 'undefined') return;
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

  React.useEffect(() => {
    if (!loteDirty) {
      compute();
    }
  }, [compute, loteDirty]);

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

    if (typeof window !== 'undefined') {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.content ||
        props?.csrfToken ||
        '';
      fetch(RESET_URL, {
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
  }, [baseRecepcionData, props?.csrfToken, setData]);

  const onSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      post('/analisis/semillas/recepcion');
    },
    [post],
  );

  const handleLoteChange = React.useCallback(
    (event) => {
      const val = toUpper(event.target.value);
      setData('lote', val);
      setLoteDirty(val !== '');
      if (val === '') {
        regenerateLote();
      }
    },
    [regenerateLote, setData],
  );

  const handleAnioChange = React.useCallback(
    (event) => {
      const value = event.target.value.trim();
      setData('anio', value === '' ? null : value);
    },
    [setData],
  );

  const handleBolsasChange = React.useCallback(
    (event) => setData('bolsas', event.target.value),
    [setData],
  );

  const handleKgbolChange = React.useCallback(
    (event) => setData('kgbol', event.target.value),
    [setData],
  );

  return {
    data,
    processing,
    errorMessages: Object.values(errors).filter(Boolean),
    errors,
    flash: props?.flash || {},
    cultivos,
    variedades,
    comunidades,
    municipiosSugeridos,
    selectedCultivo,
    createVariedadHref,
    handleTextChange,
    handleComunidadChange,
    handleCategoriaChange,
    handleEspecieChange,
    handleVariedadChange,
    handleLoteChange,
    handleAnioChange,
    handleBolsasChange,
    handleKgbolChange,
    regenerateLote,
    onSubmit,
    handleCancel,
    loteDirty,
  };
}
