import { round2 } from '@utils/money';

// Alícuotas que acepta el backend (products.iva_rate y budget_items.iva_rate).
export const IVA_RATES = [21, 10.5];
export const DEFAULT_IVA_RATE = 21;

export const PRODUCT_IVA_OPTIONS = [
  { value: '21', label: '21%' },
  { value: '10.5', label: '10,5%' },
];

// Ítems (presupuesto y atención): % libre entre 0 y 99,99; vacío o 0 = sin IVA.
export const MAX_ITEM_IVA_RATE = 99.99;

// "21.0" | 21 | "10,5" -> 21 | 10.5 ; vacío/nulo/0 -> null (sin IVA)
export const toIvaRate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) && n !== 0 ? n : null;
};

// Valor para el campo del form: 21 -> "21", 10.5 -> "10.5", null/0 -> ""
export const ivaRateToOption = (value) => {
  const rate = toIvaRate(value);
  return rate === null ? '' : String(rate);
};

// "15,75%" ; sin IVA -> "Sin IVA"
export const formatIvaRate = (value) => {
  const rate = toIvaRate(value);
  return rate === null ? 'Sin IVA' : `${String(rate).replace('.', ',')}%`;
};

export const priceWithIva = (net, rate) => {
  const r = toIvaRate(rate);
  const n = Number(net) || 0;
  return r === null ? n : round2(n * (1 + r / 100));
};

// % de una línea: vacío (sin IVA) o un número entre 0 y 99,99 con hasta 2 decimales.
export const isValidItemIvaRate = (value) => {
  if (value === null || value === undefined || value === '') return true;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 && n <= MAX_ITEM_IVA_RATE && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
};
