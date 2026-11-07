import { round2 } from '@utils/money';
import { toIvaRate } from '@utils/iva';

const lineNet = (item) => (Number(item?.quantity) || 0) * (Number(item?.unit_price) || 0);

// Vista previa de los totales del presupuesto. Replica Budget#compute_totals del
// backend (fuente de verdad): IVA redondeado por alícuota, no por línea; el recargo
// de tarjeta se aplica sobre el total con IVA.
export const computeBudgetTotals = (items = [], surchargePercentage = 0) => {
  const groups = new Map();
  let exemptTotal = 0;

  items.forEach((item) => {
    const net = lineNet(item);
    const rate = toIvaRate(item?.iva_rate);
    if (rate === null) {
      exemptTotal += net;
    } else {
      groups.set(rate, (groups.get(rate) || 0) + net);
    }
  });

  const ivaBreakdown = [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([rate, base]) => ({ rate, base: round2(base), amount: round2((base * rate) / 100) }));

  const subtotalNet = [...groups.values()].reduce((sum, base) => sum + base, 0);
  const totalIva = ivaBreakdown.reduce((sum, row) => sum + row.amount, 0);
  const totalList = round2(subtotalNet + totalIva + exemptTotal);
  const surcharge = Number(surchargePercentage) || 0;
  const totalCard = round2(totalList * (1 + surcharge / 100));

  return {
    subtotalNet: round2(subtotalNet),
    totalIva: round2(totalIva),
    subtotalGross: round2(subtotalNet + totalIva),
    exemptTotal: round2(exemptTotal),
    ivaBreakdown,
    totalList,
    totalCard,
    surchargeAmount: round2(totalCard - totalList),
  };
};

export const lineNetTotal = (item) => round2(lineNet(item));

// Importe de la línea con IVA (bruto). Sin alícuota = precio final, igual al neto.
export const lineGrossTotal = (item) => {
  const rate = toIvaRate(item?.iva_rate);
  const net = lineNet(item);
  return round2(rate === null ? net : net * (1 + rate / 100));
};
