export const VALIDEZ_UNITS = Object.freeze([
  { value: 'DIAS', label: 'Días', factor: 1 },
  { value: 'MESES', label: 'Meses', factor: 30 },
  { value: 'ANIOS', label: 'Años', factor: 365 },
]);

export const DEFAULT_VALIDEZ_UNIT = 'DIAS';

const findUnit = (unit) => VALIDEZ_UNITS.find((entry) => entry.value === unit) ?? VALIDEZ_UNITS[0];

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
  if (parsed % 365 === 0) {
    return { amount: String(parsed / 365), unit: 'ANIOS' };
  }
  if (parsed % 30 === 0) {
    return { amount: String(parsed / 30), unit: 'MESES' };
  }
  return { amount: String(parsed), unit: 'DIAS' };
};

export const formatValidezLabel = (dias) => {
  const num = Number(dias);
  if (!Number.isFinite(num) || num <= 0) {
    return '';
  }
  if (num % 365 === 0) {
    const years = num / 365;
    return (years === 1 ? '1 año' : `${years} años`).toUpperCase();
  }
  if (num % 30 === 0) {
    const months = num / 30;
    return (months === 1 ? '1 mes' : `${months} meses`).toUpperCase();
  }
  return (num === 1 ? '1 día' : `${num} días`).toUpperCase();
};
