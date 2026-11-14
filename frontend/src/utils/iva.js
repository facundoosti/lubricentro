import { round2 } from '@utils/money';

export const DEFAULT_IVA_RATE = 21;

export const PRODUCT_IVA_OPTIONS = [
  { value: '21', label: '21%' },
  { value: '10.5', label: '10,5%' },
];

// "21.0" | 21 | "10,5" -> 21 | 10.5 ; vacío/nulo/0 -> null (sin IVA)
export const toIvaRate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) && n !== 0 ? n : null;
};

// Valor para el select: 21 -> "21", 10.5 -> "10.5", null/0 -> ""
export const ivaRateToOption = (value) => {
  const rate = toIvaRate(value);
  return rate === null ? '' : String(rate);
};

// "15,75%" ; sin IVA -> "Sin IVA"
export const formatIvaRate = (value) => {
  const rate = toIvaRate(value);
  return rate === null ? 'Sin IVA' : `${String(rate).replace('.', ',')}%`;
};

// Alícuotas de una línea (presupuesto y atención): 21% · 10,5% · Sin IVA ('' = precio final).
export const ITEM_IVA_OPTIONS = [...PRODUCT_IVA_OPTIONS, { value: '', label: 'Sin IVA' }];

// Opciones del select para una línea. Si tiene guardado otro % (ej. 15, del % libre
// anterior), se agrega como "15% (anterior)" para no perderlo al editar.
export const itemIvaOptions = (value) => {
  const option = ivaRateToOption(value);
  if (ITEM_IVA_OPTIONS.some((opt) => opt.value === option)) return ITEM_IVA_OPTIONS;
  return [...ITEM_IVA_OPTIONS, { value: option, label: `${formatIvaRate(option)} (anterior)` }];
};

export const priceWithIva = (net, rate) => {
  const r = toIvaRate(rate);
  const n = Number(net) || 0;
  return r === null ? n : round2(n * (1 + r / 100));
};
