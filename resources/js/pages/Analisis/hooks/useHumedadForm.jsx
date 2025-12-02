import React from 'react';
import { useForm } from '@inertiajs/react';

export const HUMEDAD_STORAGE_KEY = 'analisis-humedad-form';
const FALLBACK_MALEZAS_NOCIVAS = 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS';
const FALLBACK_MALEZAS_COMUNES = 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS COMUNES';
const sanitizeMalezaText = (value, fallback) => {
  const text = (value ?? '').toString().trim();
  if (text === '') return '';
  if (!fallback) return text;
  if (!text.startsWith(fallback)) return text;
  return text.replace(/\s*\([^)]*\)$/, '').trim();
};
const sanitizeHumedadFields = (source = {}) => ({
  ...source,
  malezas_nocivas: sanitizeMalezaText(source.malezas_nocivas, FALLBACK_MALEZAS_NOCIVAS),
  malezas_comunes: sanitizeMalezaText(source.malezas_comunes, FALLBACK_MALEZAS_COMUNES),
});

export function useHumedadForm(props) {
  const humidity = props?.humedad || {};
  const validezDefault = props?.validezDefault || '';
  const errors = props?.errors || {};

  const mergeStoredHumedadData = React.useCallback(
    (base, stored) => sanitizeHumedadFields({
      ...base,
      ...(stored && typeof stored === 'object' ? stored : {}),
    }),
    [],
  );

  const initialHumedadData = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return humidity;
    }
    try {
      const raw = window.sessionStorage.getItem(HUMEDAD_STORAGE_KEY);
      if (!raw) {
        return humidity;
      }
      const parsed = JSON.parse(raw);
      return mergeStoredHumedadData(humidity, parsed);
    } catch (error) {
      console.warn('Humedad storage parse error', error);
      return humidity;
    }
  }, [humidity, mergeStoredHumedadData]);

  const normalizeValidez = React.useCallback(
    (value) => (value ?? '').toString().trim().toUpperCase(),
    [],
  );

  const [validezEdited, setValidezEdited] = React.useState(() => {
    const initialValidez = normalizeValidez(initialHumedadData.validez);
    const defaultVal = normalizeValidez(validezDefault);
    if (!initialValidez) return false;
    return initialValidez !== defaultVal;
  });

  const lastValidezDefaultRef = React.useRef(normalizeValidez(validezDefault));

  const { data, setData, post, processing } = useForm(
    'analisisHumedad',
    initialHumedadData,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(HUMEDAD_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Humedad storage write error', error);
    }
  }, [data]);

  React.useEffect(() => {
    const defaultVal = normalizeValidez(validezDefault);
    const lastDefault = lastValidezDefaultRef.current;
    const currentValidez = normalizeValidez(data.validez);
    const defaultChanged = defaultVal !== lastDefault;
    const matchesLastDefault =
      currentValidez === lastDefault || currentValidez === '';
    if (defaultChanged && (!validezEdited || matchesLastDefault)) {
      if (currentValidez !== defaultVal) {
        setData('validez', defaultVal);
      }
      setValidezEdited(false);
    }
    lastValidezDefaultRef.current = defaultVal;
  }, [
    validezDefault,
    validezEdited,
    data.validez,
    normalizeValidez,
    setData,
  ]);

  const handleTextChange = React.useCallback(
    (key) => (event) => setData(key, event.target.value),
    [setData],
  );

  const handleNumberChange = React.useCallback(
    (key) => (event) => setData(key, event.target.value),
    [setData],
  );

  const handleValidezChange = React.useCallback(
    (event) => {
      setValidezEdited(true);
      const value = event.target.value;
      setData('validez', normalizeValidez(value));
    },
    [normalizeValidez, setData],
  );

  const numberInputProps = {
    slotProps: {
      input: {
        inputMode: 'decimal',
      },
    },
  };

  const errorList = React.useMemo(
    () => Object.values(errors).filter(Boolean),
    [errors],
  );

  return {
    data,
    setData,
    post,
    processing,
    handleTextChange,
    handleNumberChange,
    handleValidezChange,
    errorList,
    numberInputProps,
    validezDefault,
    errors,
  };
}
