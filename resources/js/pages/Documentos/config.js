export const AUTO_LOTE_UPPER_FIELDS = new Set(['nlab']);
export const AUTO_LOTE_NO_TRIM_FIELDS = new Set(['cooperador']);
export const AUTO_LOTE_PLAIN_FIELDS = new Set(['fecha_evaluacion']);

export const REQUIRED_FIELDS = [
  'nlab',
  'especie',
  'fecha_evaluacion',
  'estado',
  'variedad',
  'categoria_inicial',
  'categoria_final',
  'lote',
  'aut_import',
];
// DOCUMENTO_EDIT





export const REQUIRED_LABELS = {
  nlab: 'N° Laboratorio',
  especie: 'Especie',
  fecha_evaluacion: 'Fecha evaluación',
  estado: 'Estado',
  validez: 'Validez',
  variedad: 'Variedad',
  semillera: 'Semillera',
  cooperador: 'Cooperador',
  categoria_inicial: 'Categoría inicial',
  categoria_final: 'Categoría final',
  lote: 'Lote',
  bolsas: 'Bolsas',
  kgbol: 'Kg/bolsa',
  aut_import: 'Aut. Importación',
};

const DEFAULT_MALEZAS_NOCIVAS = 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS';
const DEFAULT_MALEZAS_COMUNES = 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS COMUNES';

export const buildInitialFormData = (doc = {}) => ({
  nlab: doc.nlab ?? '',
  especie: doc.especie ?? '',
  fecha_evaluacion: doc.fecha_evaluacion ?? '',
  estado: doc.estado ?? 'APROBADO',
  validez: doc.validez ?? '',
  observaciones: doc.observaciones ?? '',
  malezas_nocivas: (doc.malezas_nocivas && doc.malezas_nocivas !== '-') ? doc.malezas_nocivas : DEFAULT_MALEZAS_NOCIVAS,
  malezas_comunes: (doc.malezas_comunes && doc.malezas_comunes !== '-') ? doc.malezas_comunes : DEFAULT_MALEZAS_COMUNES,
  variedad: doc.variedad ?? '',
  semillera: doc.semillera ?? '',
  cooperador: doc.cooperador ?? '',
  categoria_inicial: doc.categoria_inicial ?? '',
  categoria_final: doc.categoria_final ?? '',
  anio: doc.anio ?? '',
  lote: doc.lote ?? '',
  bolsas: doc.bolsas ?? '',
  kgbol: doc.kgbol ?? '',
  municipio: doc.municipio ?? '',
  comunidad: doc.comunidad ?? '',
  aut_import: doc.aut_import ?? '',
  resultado: doc.resultado ?? '',
  otros_sp_pct: doc.otros_sp_pct ?? '',
  otros_sp_kg: doc.otros_sp_kg ?? '',
  otros_cultivos_pct: doc.otros_cultivos_pct ?? '',
  otros_cultivos_kg: doc.otros_cultivos_kg ?? '',
  malezas_comunes_pct: doc.malezas_comunes_pct ?? '',
  malezas_comunes_kg: doc.malezas_comunes_kg ?? '',
  malezas_prohibidas_pct: doc.malezas_prohibidas_pct ?? '',
  malezas_prohibidas_kg: doc.malezas_prohibidas_kg ?? '',
  germinacion_pct: doc.germinacion_pct ?? '',
  viabilidad_pct: doc.viabilidad_pct ?? doc.variavilidad_pct ?? '',
});
