export const VALIDEZ_UNITS = Object.freeze([
  { value: 'DIAS', label: 'Días', factor: 1 },
  { value: 'MESES', label: 'Meses', factor: 30 },
  { value: 'ANIOS', label: 'Años', factor: 365 },
]);

export const DEFAULT_VALIDEZ_UNIT = 'DIAS';

const findUnit = (unit) => VALIDEZ_UNITS.find((entry) => entry.value === unit) ?? VALIDEZ_UNITS[0];

const formatAmountLabel = (amount, unit) => {
  const num = Number(amount);
  if (!Number.isFinite(num) || num < 0) return '';
  const label = VALIDEZ_UNITS.find((entry) => entry.value === unit)?.label || 'días';
  return `${num} ${label}`.toLowerCase().toUpperCase();
};

export const convertAmountToDias = (amount, unit = DEFAULT_VALIDEZ_UNIT) => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return '';
  }
  const selected = findUnit(unit);
  const days = Math.round(parsed * selected.factor);
  return String(days);
};

export const splitDiasIntoAmountUnit = (dias) => {
  const parsed = Number(dias);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { amount: '', unit: DEFAULT_VALIDEZ_UNIT };
  }
  return { amount: String(parsed), unit: DEFAULT_VALIDEZ_UNIT };
};

export const formatValidezLabel = (validez) => {
  if (!validez) return '';
  if (typeof validez === 'object') {
    if (validez.cantidad != null && validez.unidad) {
      return formatAmountLabel(validez.cantidad, validez.unidad);
    }
    if (validez.dias != null) {
      return formatAmountLabel(validez.dias, 'DIAS');
    }
  }
  const num = Number(validez);
  if (!Number.isFinite(num) || num <= 0) {
    return '';
  }
  return (num === 1 ? '1 día' : `${num} días`).toUpperCase();
};
