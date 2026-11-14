import { toIvaRate } from '@utils/iva';

// % de ganancia por defecto al elegir un producto del catálogo (servicio y texto libre: 0).
export const DEFAULT_PRODUCT_MARGIN = 30;

// % de ganancia de la línea: vacío/nulo/inválido = 0.
export const toMarginPercentage = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

// Todos los cálculos van en centavos enteros (sin flotantes intermedios) para igualar a
// BigDecimal#round(2) del backend (half-up). Cantidad, precio y % tienen 2 decimales en la BD.
const toHundredths = (value) => Math.round((Number(value) || 0) * 100);

// round(a / b) half-up para enteros (simétrico para negativos).
const divRound = (a, b) => Math.sign(a) * Math.floor((Math.abs(a) + b / 2) / b);

// Aplica un % (en centésimos: 21 -> 2100) a un importe en centavos: round(cents × % / 100).
const percentOfCents = (cents, percentHundredths) => divRound(cents * percentHundredths, 10000);

const fromCents = (cents) => cents / 100;

// Neto de la línea en centavos: round(cantidad × precio, 2) (ItemizedTotals::Line#line_net).
const lineNetCents = (item) => divRound(toHundredths(item?.quantity) * toHundredths(item?.unit_price), 100);

const marginBp = (item) => toHundredths(toMarginPercentage(item?.margin_percentage));

// Ganancia de la línea en centavos: round(neto × ganancia% / 100, 2) (Line#line_margin).
const lineMarginCents = (item) => percentOfCents(lineNetCents(item), marginBp(item));

// Vista previa de los totales de una lista de ítems (presupuesto o atención). Replica
// Budget#compute_totals del backend (fuente de verdad): IVA redondeado por alícuota (sobre
// el neto sin ganancia), ganancia redondeada por línea; el recargo de tarjeta se aplica
// sobre el total efectivo/débito.
export const computeItemsTotals = (items = [], surchargePercentage = 0) => {
  const groups = new Map();
  let exemptCents = 0;
  let marginCents = 0;

  items.forEach((item) => {
    const net = lineNetCents(item);
    const rate = toIvaRate(item?.iva_rate);
    marginCents += lineMarginCents(item);
    if (rate === null) {
      exemptCents += net;
    } else {
      groups.set(rate, (groups.get(rate) || 0) + net);
    }
  });

  const breakdownCents = [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([rate, base]) => ({ rate, base, amount: percentOfCents(base, toHundredths(rate)) }));

  const subtotalNetCents = breakdownCents.reduce((sum, row) => sum + row.base, 0);
  const totalIvaCents = breakdownCents.reduce((sum, row) => sum + row.amount, 0);
  const totalListCents = subtotalNetCents + totalIvaCents + exemptCents + marginCents;
  const totalCardCents = totalListCents + percentOfCents(totalListCents, toHundredths(surchargePercentage));

  return {
    subtotalNet: fromCents(subtotalNetCents),
    totalIva: fromCents(totalIvaCents),
    exemptTotal: fromCents(exemptCents),
    marginTotal: fromCents(marginCents),
    ivaBreakdown: breakdownCents.map(({ rate, base, amount }) => ({ rate, base: fromCents(base), amount: fromCents(amount) })),
    totalList: fromCents(totalListCents),
    totalCard: fromCents(totalCardCents),
    surchargeAmount: fromCents(totalCardCents - totalListCents),
  };
};

export const lineNetTotal = (item) => fromCents(lineNetCents(item));

// Neto + ganancia + IVA de un importe en centavos (fórmula sumada, cada parte redondeada).
const finalCents = (netCents, item) => {
  const rate = toIvaRate(item?.iva_rate) ?? 0;
  return netCents + percentOfCents(netCents, marginBp(item)) + percentOfCents(netCents, toHundredths(rate));
};

// Importe final de la línea: neto + ganancia + IVA (cada uno redondeado a centavos).
// Sin alícuota = precio final (solo se suma la ganancia).
export const lineGrossTotal = (item) => fromCents(finalCents(lineNetCents(item), item));

// Precio unitario final (impresión): unitario + ganancia + IVA, en centavos.
export const unitFinalPrice = (item) => fromCents(finalCents(toHundredths(item?.unit_price), item));
