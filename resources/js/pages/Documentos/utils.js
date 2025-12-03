export const DECIMAL_INPUT_SLOT_PROPS = Object.freeze({
  input: {
    inputMode: 'decimal',
    style: { appearance: 'textfield' },
  },
});

export const NUMBER_INPUT_SLOT_PROPS = Object.freeze({
  input: {
    inputMode: 'numeric',
    style: { appearance: 'textfield' },
  },
});

export const normalizeUpper = (value) => {
  const text = (value ?? '').toString().trim();
  return text === '' ? '' : text.toUpperCase();
};

const CATEGORY_OVERRIDES = Object.freeze({
  CERTIFICADO: 'CERTIFICACIÓN',
  CERTIFICADA: 'CERTIFICACIÓN',
  FISCALIZADO: 'FISCALIZACIÓN',
  FISCALIZADA: 'FISCALIZACIÓN',
  REGISTRADO: 'REGISTRACIÓN',
  REGISTRADA: 'REGISTRACIÓN',
});

export const convertCategoryForObservation = (value) => {
  const upper = normalizeUpper(value);
  if (upper === '') {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(CATEGORY_OVERRIDES, upper)) {
    return CATEGORY_OVERRIDES[upper];
  }
  if (upper.endsWith('ADO')) {
    return `${upper.slice(0, -3)}ACIÓN`;
  }
  if (upper.endsWith('ADA')) {
    return `${upper.slice(0, -3)}CIÓN`;
  }
  return upper;
};

export const buildObservationText = (estado, categoriaFinal, especie, anio) => {
  const state = normalizeUpper(estado);
  if (state !== 'APROBADO' && state !== 'RECHAZADO') {
    return '';
  }
  const categoria = convertCategoryForObservation(categoriaFinal);
  const especieText = normalizeUpper(especie);
  const campaign = (anio ?? '').toString().trim();
  const base = state === 'APROBADO' ? 'CORRESPONDE' : 'NO CORRESPONDE';
  const fragments = [];
  if (categoria) {
    fragments.push(`AL PROCESO DE ${categoria}`);
  }
  if (especieText) {
    fragments.push(`DE LOTE DE SEMILLA DE ${especieText}`);
  }
  let sentence = base;
  if (fragments.length > 0) {
    sentence += ` ${fragments.join(' ')}`;
  }
  if (campaign) {
    sentence += ` CAMPAÑA ${campaign.toUpperCase()}.`;
  } else {
    sentence += '.';
  }
  return sentence.replace(/\s+/g, ' ').trim();
};

export const toUpperValue = (value, options = {}) => {
  const { trim = true } = options;
  let text = (value ?? '').toString();
  if (trim) {
    text = text.trim();
  }
  const upper = text.toUpperCase();
  return trim ? normalizeUpper(upper) : upper;
};

export const calculateTotalKg = (bolsas, kgbol) => {
  const bolsasNum = Number(bolsas);
  const kgbolNum = Number(kgbol);
  if (
    Number.isFinite(bolsasNum)
    && Number.isFinite(kgbolNum)
    && bolsas !== ''
    && kgbol !== ''
  ) {
    const total = bolsasNum * kgbolNum;
    return Number.isFinite(total) ? total.toFixed(2) : '';
  }
  return '';
};

export const buildAutoLoteValue = ({
  cooperador,
  nlab,
  especie,
  fechaEvaluacion,
  anio,
}) => {
  const initials = (cooperador || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('');
  const lab = (nlab || '').trim();
  const especieInitial = ((especie || '').trim().charAt(0) || '').toUpperCase();
  const manualYear = (anio || '').toString().trim();
  let yearPart = '';
  if (/^\d{4}$/.test(manualYear)) {
    yearPart = manualYear;
  } else if (fechaEvaluacion) {
    const parsed = new Date(fechaEvaluacion);
    if (!Number.isNaN(parsed.getTime())) {
      yearPart = String(parsed.getFullYear());
    }
  }
  if (yearPart === '') {
    yearPart = String(new Date().getFullYear());
  }
  const parts = [initials, lab, especieInitial, String(yearPart)];
  return parts.filter((segment) => segment && segment.length > 0).join('-').toUpperCase();
};

const uniqueNormalizedList = (values) => Array.from(
  new Set(
    values
      .map((value) => normalizeUpper(value))
      .filter((value) => value && value !== ''),
  ),
);

export const buildCultivosMetadata = (cultivos = []) => {
  const metaMap = new Map();
  const especiesSet = new Set();
  const categoriaInicialSet = new Set();
  const categoriaFinalSet = new Set();
  const variedadGlobalSet = new Set();

  cultivos.forEach((cultivo) => {
    const especieName = normalizeUpper(cultivo?.especie);
    const categoriaInicial = normalizeUpper(cultivo?.categoria_inicial);
    const categoriaFinal = normalizeUpper(cultivo?.categoria_final);
    const variedades = Array.isArray(cultivo?.variedades)
      ? uniqueNormalizedList(cultivo.variedades)
      : [];

    if (especieName) {
      especiesSet.add(especieName);
      metaMap.set(especieName, {
        categoria_inicial: categoriaInicial,
        categoria_final: categoriaFinal,
        variedades,
      });
    }
    if (categoriaInicial) {
      categoriaInicialSet.add(categoriaInicial);
    }
    if (categoriaFinal) {
      categoriaFinalSet.add(categoriaFinal);
    }
    variedades.forEach((nombre) => variedadGlobalSet.add(nombre));
  });

  return {
    metaMap,
    especiesOptions: Array.from(especiesSet),
    categoriaInicialOptions: Array.from(categoriaInicialSet),
    categoriaFinalOptions: Array.from(categoriaFinalSet),
    variedadGlobalOptions: Array.from(variedadGlobalSet),
  };
};

export const getVariedadOptions = (metaMap, especie, currentVariedad, variedadGlobalOptions = []) => {
  const especieKey = normalizeUpper(especie);
  const meta = especieKey ? metaMap.get(especieKey) : null;
  const base = (meta && Array.isArray(meta.variedades) && meta.variedades.length > 0)
    ? meta.variedades
    : variedadGlobalOptions;
  const current = normalizeUpper(currentVariedad);
  if (current && !base.includes(current)) {
    return [current, ...base];
  }
  return base;
};
