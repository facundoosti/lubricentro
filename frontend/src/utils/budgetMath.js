import { toIvaRate } from '@utils/iva';

// % de ganancia por defecto al elegir un producto del catálogo (servicio y texto libre: 0).
export const DEFAULT_PRODUCT_MARGIN = 50;

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

// IVA de un importe en centavos: round(importe × IVA% / 100, 2); 0 sin alícuota (Line#line_iva).
const ivaOfCents = (cents, item) => percentOfCents(cents, toHundredths(toIvaRate(item?.iva_rate) ?? 0));

// Neto + IVA + ganancia compuesta de un importe en centavos: la ganancia se aplica sobre
// importe + IVA (Line#line_margin), cada parte redondeada a centavos.
const finalParts = (netCents, item) => {
  const iva = ivaOfCents(netCents, item);
  const margin = percentOfCents(netCents + iva, marginBp(item));
  return { iva, margin, total: netCents + iva + margin };
};

// Ganancia de la línea en centavos: round((neto + IVA de la línea) × ganancia% / 100, 2).
const lineMarginCents = (item) => finalParts(lineNetCents(item), item).margin;

// Vista previa de los totales de una lista de ítems (presupuesto o atención). Replica
// Budget#compute_totals del backend (fuente de verdad): IVA redondeado por alícuota (sobre
// el neto sin ganancia), ganancia compuesta redondeada por línea (sobre neto + IVA de la
// línea); el recargo de tarjeta se aplica sobre el total efectivo/débito.
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

// Importe final de la línea: neto + IVA + ganancia sobre (neto + IVA), cada parte redondeada
// a centavos. Sin alícuota = precio final (solo se suma la ganancia).
export const lineGrossTotal = (item) => fromCents(finalParts(lineNetCents(item), item).total);

// Precio unitario final (impresión): unitario × (1 + IVA%) × (1 + ganancia%), en centavos.
export const unitFinalPrice = (item) => fromCents(finalParts(toHundredths(item?.unit_price), item).total);
