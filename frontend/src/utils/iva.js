import { round2 } from '@utils/money';

// Alícuotas que acepta el backend (products.iva_rate y budget_items.iva_rate).
export const IVA_RATES = [21, 10.5];
export const DEFAULT_IVA_RATE = 21;

export const PRODUCT_IVA_OPTIONS = [
  { value: '21', label: '21%' },
  { value: '10.5', label: '10,5%' },
];

// Para ítems de presupuesto: '' = sin IVA (precio final).
export const ITEM_IVA_OPTIONS = [...PRODUCT_IVA_OPTIONS, { value: '', label: 'Sin IVA' }];

// "21.0" | 21 | "10,5" -> 21 | 10.5 ; vacío/nulo -> null (sin IVA)
export const toIvaRate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

// Valor para <select>: 21 -> "21", 10.5 -> "10.5", null -> ""
export const ivaRateToOption = (value) => {
  const rate = toIvaRate(value);
  return rate === null ? '' : String(rate);
};

export const formatIvaRate = (value) => {
  const rate = toIvaRate(value);
  return rate === null ? 'Sin IVA' : `${String(rate).replace('.', ',')}%`;
};

export const priceWithIva = (net, rate) => {
  const r = toIvaRate(rate);
  const n = Number(net) || 0;
  return r === null ? n : round2(n * (1 + r / 100));
};
