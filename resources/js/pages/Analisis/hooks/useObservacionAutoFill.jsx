import React from 'react';

const toUpper = (value) => {
  const text = (value ?? '').toString().trim();
  return text === '' ? '' : text.toUpperCase();
};

const convertCategoryForPhrase = (value) => {
  const upper = toUpper(value);
  if (upper === '') {
    return '';
  }
  const overrides = {
    CERTIFICADA: 'CERTIFICACIÓN',
    FISCALIZADA: 'FISCALIZACIÓN',
    
    
  };
  if (Object.prototype.hasOwnProperty.call(overrides, upper)) {
    return overrides[upper];
  }
  return upper;
};

const formatObservacion = (estado, categoria, especie, anio) => {
  if (!estado || (estado !== 'APROBADO' && estado !== 'RECHAZADO')) {
    return '';
  }
  const categoriaFinal = convertCategoryForPhrase(categoria);
  const especieText = toUpper(especie);
  if (categoriaFinal === '' || especieText === '') {
    return '';
  }
  const campaign = (anio ?? '').toString().trim();
  const baseText =
    (estado === 'APROBADO'
      ? 'CORRESPONDE AL PROCESO DE'
      : 'NO CORRESPONDE AL PROCESO DE') +
    ` ${categoriaFinal} DE LOTE DE SEMILLA DE ${especieText}`;
  return campaign ? `${baseText} CAMPAÑA ${campaign}.` : `${baseText}.`;
};

export function useObservacionAutoFill({
  estado,
  observaciones,
  categoriaFinal,
  especie,
  anio,
  setData,
}) {
  const lastAutoRef = React.useRef('');

  const generateObservacion = React.useCallback(
    (nextEstado = estado) => formatObservacion(nextEstado, categoriaFinal, especie, anio),
    [anio, categoriaFinal, especie, estado],
  );

  React.useEffect(() => {
    if (estado !== 'APROBADO' && estado !== 'RECHAZADO') {
      lastAutoRef.current = '';
      return;
    }
    if (lastAutoRef.current === null) {
      return;
    }
    const suggestion = generateObservacion(estado);
    if (!suggestion) {
      return;
    }
    if (observaciones === suggestion && lastAutoRef.current === suggestion) {
      return;
    }
    setData('observaciones', suggestion);
    lastAutoRef.current = suggestion;
  }, [estado, observaciones, generateObservacion, setData]);

  const setAutoObservation = React.useCallback(
    (nextEstado) => {
      const suggestion = generateObservacion(nextEstado);
      if (!suggestion) {
        lastAutoRef.current = '';
        return;
      }
      setData('observaciones', suggestion);
      lastAutoRef.current = suggestion;
    },
    [generateObservacion, setData],
  );

  const onEstadoChange = React.useCallback(
    (value) => {
      setData('estado', value);
      if (value === 'APROBADO' || value === 'RECHAZADO') {
        setAutoObservation(value);
      } else {
        lastAutoRef.current = '';
      }
    },
    [setAutoObservation, setData],
  );

  const handleObservacionChange = React.useCallback(
    (event) => {
      lastAutoRef.current = null;
      setData('observaciones', event.target.value);
    },
    [setData],
  );

  return {
    onEstadoChange,
    handleObservacionChange,
    generateObservacion,
  };
}
