import { useForm } from '@inertiajs/react';
import React from 'react';
import {
  // DOCUMENTO_EDIT




  
  buildObservationText,
  toUpperValue,
  buildAutoLoteValue,
  calculateTotalKg,
  buildCultivosMetadata,
  getVariedadOptions,
  normalizeUpper,
} from '../utils';
import {
  AUTO_LOTE_NO_TRIM_FIELDS,
  AUTO_LOTE_PLAIN_FIELDS,
  AUTO_LOTE_UPPER_FIELDS,
  REQUIRED_FIELDS,
  REQUIRED_LABELS,
  buildInitialFormData,
} from '../config';

export default function useDocumentoForm({ doc = {}, loteSuggestions = [], cultivos = [] }) {
  const {
    data,
    setData,
    put,
    processing,
    errors,
  } = useForm(buildInitialFormData(doc));

  const [loteDirty, setLoteDirty] = React.useState(Boolean(doc.lote));
  const [showMissingModal, setShowMissingModal] = React.useState(false);
  const [nlabClientError, setNlabClientError] = React.useState('');
  const [checkingNlab, setCheckingNlab] = React.useState(false);
  const autoObservationRef = React.useRef('');

  const cultivosMetadata = React.useMemo(
    () => buildCultivosMetadata(Array.isArray(cultivos) ? cultivos : []),
    [cultivos],
  );
  const {
    metaMap: cultivosMeta,
    especiesOptions,
    categoriaInicialOptions,
    categoriaFinalOptions,
    variedadGlobalOptions,
  } = cultivosMetadata;
  const especieKey = React.useMemo(() => normalizeUpper(data.especie), [data.especie]);
  const currentCultivoMeta = React.useMemo(
    () => (especieKey ? cultivosMeta.get(especieKey) : null),
    [cultivosMeta, especieKey],
  );
  const validezAutoLabel = currentCultivoMeta?.validezLabel || '';
  const variedadOptions = React.useMemo(
    () => getVariedadOptions(cultivosMeta, data.especie, data.variedad, variedadGlobalOptions),
    [cultivosMeta, data.especie, data.variedad, variedadGlobalOptions],
  );

  React.useEffect(() => {
    if (!validezAutoLabel) {
      return;
    }
    setData('validez', validezAutoLabel);
  }, [validezAutoLabel, setData]);

  const missingRequired = React.useMemo(() => (
    REQUIRED_FIELDS.filter((f) => {
      const v = data[f];
      if (v === 0 || v === '0') return false;
      return (v ?? '').toString().trim() === '';
    })
  ), [data]);
  const hasMissingRequired = missingRequired.length > 0;
  const missingMessage = hasMissingRequired
    ? `Completa los campos obligatorios: ${missingRequired.map((f) => REQUIRED_LABELS[f] ?? f).join(', ')}`
    : '';
  const serverErrors = React.useMemo(
    () => Object.values(errors || {}).filter(Boolean),
    [errors],
  );
  const nlabFieldError = errors.nlab ?? nlabClientError;

  const lotes = React.useMemo(() => {
    const base = Array.isArray(loteSuggestions) ? [...loteSuggestions] : [];
    if (doc.lote) {
      base.unshift(doc.lote);
    }
    return Array.from(new Set(base)).filter(Boolean);
  }, [doc.lote, loteSuggestions]);

  React.useEffect(() => {
    if (!hasMissingRequired) {
      setShowMissingModal(false);
    }
  }, [hasMissingRequired]);

  const handleUpperChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, toUpperValue(value));
      if (name === 'nlab') {
        setNlabClientError('');
      }
      if (AUTO_LOTE_UPPER_FIELDS.has(name)) {
        setLoteDirty(false);
      }
    },
    [setData],
  );

  const handleUpperNoTrimChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, toUpperValue(value, { trim: false }));
      if (AUTO_LOTE_NO_TRIM_FIELDS.has(name)) {
        setLoteDirty(false);
      }
    },
    [setData],
  );

  const handlePlainChange = React.useCallback(
    (name) => (event) => {
      const value = event.target.value ?? '';
      setData(name, value);
      if (AUTO_LOTE_PLAIN_FIELDS.has(name)) {
        setLoteDirty(false);
      }
    },
    [setData],
  );

  const handleVariedadSelect = React.useCallback(
    (_, value) => {
      const normalized = toUpperValue(value || '');
      setData('variedad', normalized);
    },
    [setData],
  );

  const handleEspecieSelect = React.useCallback(
    (_, value) => {
      const normalized = toUpperValue(value || '');
      setData('especie', normalized);
      if (!normalized) {
        setData('validez', '');
        setLoteDirty(false);
        return;
      }
      const meta = cultivosMeta.get(normalized);
      if (meta) {
        if (meta.categoria_inicial) {
          setData('categoria_inicial', meta.categoria_inicial);
        }
        if (meta.categoria_final) {
          setData('categoria_final', meta.categoria_final);
        }
        if (meta.validezLabel) {
          setData('validez', meta.validezLabel);
        } else {
          setData('validez', '');
        }
        const currentVariedad = normalizeUpper(data.variedad);
        if (meta.variedades.length > 0) {
          const nextVariedad = meta.variedades.includes(currentVariedad)
            ? currentVariedad
            : meta.variedades[0];
          setData('variedad', nextVariedad);
        } else {
          setData('variedad', '');
        }
      }
      setLoteDirty(false);
    },
    [cultivosMeta, data.variedad, setData],
  );

  const handleObservacionesChange = React.useCallback(
    (event) => {
      autoObservationRef.current = null;
      const value = event.target.value ?? '';
      setData('observaciones', toUpperValue(value));
    },
    [setData],
  );

  const handleAnioChange = React.useCallback(
    (event) => {
      setLoteDirty(false);
      setNlabClientError('');
      setData('anio', event.target.value ?? '');
    },
    [setData],
  );

  const handleTextareaInput = React.useCallback((event) => {
    const target = event.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }, []);

  const generateObservation = React.useCallback(
    (
      nextEstado = data.estado,
      nextCategoria = data.categoria_final,
      nextEspecie = data.especie,
      nextAnio = data.anio,
    ) => buildObservationText(nextEstado, nextCategoria, nextEspecie, nextAnio),
    [data.anio, data.categoria_final, data.estado, data.especie],
  );

  const estadoValue = React.useMemo(() => data.estado || 'APROBADO', [data.estado]);

  const handleEstadoChange = React.useCallback(
    (event) => {
      const next = event.target.value;
      if (next === 'APROBADO') {
        setData('estado', 'APROBADO');
        const suggestion = generateObservation('APROBADO');
        if (suggestion) {
          setData('observaciones', suggestion);
          autoObservationRef.current = suggestion;
        } else {
          autoObservationRef.current = '';
        }
      } else if (next === 'RECHAZADO') {
        setData('estado', 'RECHAZADO');
        const suggestion = generateObservation('RECHAZADO');
        if (suggestion) {
          setData('observaciones', suggestion);
          autoObservationRef.current = suggestion;
        } else {
          autoObservationRef.current = '';
        }
      } else {
        setData('estado', '');
        autoObservationRef.current = '';
      }
    },
    [generateObservation, setData],
  );

  const totalKg = React.useMemo(
    () => calculateTotalKg(data.bolsas, data.kgbol),
    [data.bolsas, data.kgbol],
  );

  const buildAutoLote = React.useCallback(
    () => buildAutoLoteValue({
      cooperador: data.cooperador,
      nlab: data.nlab,
      especie: data.especie,
      fechaEvaluacion: data.fecha_evaluacion,
      anio: data.anio,
    }),
    [data.cooperador, data.nlab, data.especie, data.fecha_evaluacion, data.anio],
  );

  React.useEffect(() => {
    if (loteDirty) {
      return;
    }
    const nextLote = buildAutoLote();
    if (nextLote !== data.lote) {
      setData('lote', nextLote);
    }
  }, [buildAutoLote, data.lote, loteDirty, setData]);

  const handleLoteManualChange = React.useCallback(
    (event) => {
      const value = event.target.value ?? '';
      const normalized = toUpperValue(value);
      setData('lote', normalized);
      if (normalized === '') {
        setLoteDirty(false);
      } else {
        setLoteDirty(true);
      }
    },
    [setData],
  );

  React.useEffect(() => {
    if (autoObservationRef.current === null) {
      return;
    }
    if (data.estado !== 'APROBADO' && data.estado !== 'RECHAZADO') {
      autoObservationRef.current = '';
      return;
    }
    const suggestion = generateObservation();
    if (!suggestion) {
      return;
    }
    if (data.observaciones === suggestion) {
      autoObservationRef.current = suggestion;
      return;
    }
    setData('observaciones', suggestion);
    autoObservationRef.current = suggestion;
  }, [data.estado, data.categoria_final, data.especie, data.anio, data.observaciones, generateObservation, setData]);

  const checkNlabDuplicate = React.useCallback(async () => {
    const lab = (data.nlab || '').trim();
    if (lab === '') {
      return false;
    }
    const params = new URLSearchParams();
    params.set('nlab', lab);
    const anioValue = (data.anio || '').toString().trim();
    if (anioValue !== '') {
      params.set('anio', anioValue);
    }
    if (doc?.id) {
      params.set('ignore_id', String(doc.id));
    }
    try {
      const response = await fetch(`/documentos/check-nlab?${params.toString()}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!response.ok) {
        return false;
      }
      const payload = await response.json();
      return Boolean(payload.exists);
    } catch (error) {
      return false;
    }
  }, [data.anio, data.nlab, doc?.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (hasMissingRequired) {
      setShowMissingModal(true);
      return;
    }
    setShowMissingModal(false);
    setCheckingNlab(true);
    const existsDuplicate = await checkNlabDuplicate();
    setCheckingNlab(false);
    if (existsDuplicate) {
      setNlabClientError('Este número de laboratorio ya existe para la campaña seleccionada.');
      setShowMissingModal(false);
      return;
    }
    setNlabClientError('');
    put(`/documentos/${doc.id}`, {
      preserveScroll: true,
      preserveState: (page) => {
        const nextErrors = page?.props?.errors || {};
        return Object.keys(nextErrors).length === 0;
      },
      onError: () => setShowMissingModal(false),
    });
  };

  return {
    data,
    errors,
    processing,
    submit,
    showMissingModal,
    setShowMissingModal,
    missingMessage,
    serverErrors,
    hasMissingRequired,
    nlabFieldError,
    nlabClientError,
    checkingNlab,
    lotes,
    especiesOptions,
    categoriaInicialOptions,
    categoriaFinalOptions,
    variedadOptions,
    totalKg,
    estadoValue,
    handleUpperChange,
    handleUpperNoTrimChange,
    handlePlainChange,
    handleVariedadSelect,
    handleEspecieSelect,
    handleObservacionesChange,
    handleAnioChange,
    handleTextareaInput,
    handleEstadoChange,
    handleLoteManualChange,
  };
}
