import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PRODUCT_MARGIN,
  computeItemsTotals,
  lineGrossTotal,
  lineNetTotal,
  toMarginPercentage,
  unitFinalPrice,
} from '@utils/budgetMath';

describe('computeItemsTotals', () => {
  it('calcula un presupuesto mixto igual que el backend', () => {
    const totals = computeItemsTotals(
      [
        { quantity: 2, unit_price: 10000, iva_rate: '21' },
        { quantity: 1, unit_price: '4000', iva_rate: '10.5' },
        { quantity: 1, unit_price: 15000, iva_rate: '' },
      ],
      10,
    );

    expect(totals).toMatchObject({
      subtotalNet: 24000,
      totalIva: 4620,
      exemptTotal: 15000,
      totalList: 43620,
      totalCard: 47982,
      surchargeAmount: 4362,
    });
    expect(totals.ivaBreakdown).toEqual([
      { rate: 21, base: 20000, amount: 4200 },
      { rate: 10.5, base: 4000, amount: 420 },
    ]);
  });

  it('aplica el recargo sobre el total con IVA', () => {
    const totals = computeItemsTotals([{ quantity: 1, unit_price: 100, iva_rate: 21 }], 10);
    expect(totals.totalList).toBe(121);
    expect(totals.totalCard).toBe(133.1);
  });

  it('redondea el IVA por alícuota y no por línea', () => {
    const totals = computeItemsTotals([
      { quantity: 1, unit_price: 0.05, iva_rate: 21 },
      { quantity: 1, unit_price: 0.05, iva_rate: 21 },
    ]);
    expect(totals.totalIva).toBe(0.02);
  });

  it('trata los ítems sin alícuota como precio final', () => {
    const totals = computeItemsTotals([{ quantity: 2, unit_price: 25000, iva_rate: null }], 10);
    expect(totals).toMatchObject({ totalList: 50000, totalIva: 0, subtotalNet: 0, totalCard: 55000 });
    expect(totals.ivaBreakdown).toEqual([]);
  });

  it('tolera ítems vacíos', () => {
    expect(computeItemsTotals([{ quantity: '', unit_price: '' }]).totalList).toBe(0);
    expect(computeItemsTotals().totalCard).toBe(0);
  });
});

describe('lineGrossTotal', () => {
  it('suma el IVA de la línea y deja igual las líneas sin IVA', () => {
    expect(lineGrossTotal({ quantity: '2', unit_price: '10000', iva_rate: '21' })).toBe(24200);
    expect(lineGrossTotal({ quantity: '1', unit_price: '4000', iva_rate: '10.5' })).toBe(4420);
    expect(lineGrossTotal({ quantity: '1', unit_price: '15000', iva_rate: null })).toBe(15000);
  });

});

describe('computeItemsTotals', () => {
  it('es la misma fórmula que la del presupuesto', () => {
    expect(computeItemsTotals).toBe(computeItemsTotals);
  });

  it('calcula una atención mixta sin recargo', () => {
    const totals = computeItemsTotals([
      { quantity: 2, unit_price: 10000, iva_rate: '21' },
      { quantity: 1, unit_price: 5000, iva_rate: '' },
    ]);
    expect(totals).toMatchObject({ totalList: 29200, totalCard: 29200, exemptTotal: 5000, totalIva: 4200 });
  });

  it('aplica un % anterior y trata el 0 como sin IVA', () => {
    const totals = computeItemsTotals([
      { quantity: 1, unit_price: 1000, iva_rate: '15' },
      { quantity: 1, unit_price: 1000, iva_rate: '0' },
    ]);
    expect(totals.ivaBreakdown).toEqual([{ rate: 15, base: 1000, amount: 150 }]);
    expect(totals).toMatchObject({ exemptTotal: 1000, totalList: 2150, marginTotal: 0 });
    expect(lineGrossTotal({ quantity: 1, unit_price: 1000, iva_rate: '30' })).toBe(1300);
  });
});

describe('ganancia por línea (fórmula compuesta)', () => {
  it('aplica la ganancia sobre neto + IVA: 1 × $1.000, 21%, 30%, recargo 10%', () => {
    const items = [{ quantity: 1, unit_price: 1000, iva_rate: '21', margin_percentage: '30' }];
    const totals = computeItemsTotals(items, 10);

    expect(lineGrossTotal(items[0])).toBe(1573);
    expect(unitFinalPrice(items[0])).toBe(1573);
    expect(totals).toMatchObject({ subtotalNet: 1000, totalIva: 210, marginTotal: 363, totalList: 1573, totalCard: 1730.3 });
    expect(totals.ivaBreakdown).toEqual([{ rate: 21, base: 1000, amount: 210 }]);
  });

  it('1 × $1.000, 21%, 50% → IVA $210, ganancia $605, final $1.815', () => {
    const items = [{ quantity: 1, unit_price: 1000, iva_rate: '21', margin_percentage: '50' }];
    const totals = computeItemsTotals(items);

    expect(lineGrossTotal(items[0])).toBe(1815);
    expect(totals).toMatchObject({ totalIva: 210, marginTotal: 605, totalList: 1815 });
  });

  it('redondea el IVA de la línea antes de aplicar la ganancia (igual que Line#line_margin)', () => {
    // neto 10,01; IVA round(2,1021) = 2,10; ganancia round(12,11 × 33,33%) = round(4,036263) = 4,04
    const item = { quantity: 1, unit_price: 10.01, iva_rate: '21', margin_percentage: '33.33' };
    expect(computeItemsTotals([item]).marginTotal).toBe(4.04);
    expect(lineGrossTotal(item)).toBe(16.15);
  });

  it('precio unitario final compuesto: unitario × (1 + IVA%) × (1 + ganancia%), por partes redondeadas', () => {
    const item = { quantity: 3, unit_price: 10.01, iva_rate: '21', margin_percentage: '33.33' };
    expect(unitFinalPrice(item)).toBe(16.15);
    // Línea: neto 30,03; IVA 6,31; ganancia round(36,34 × 33,33%) = round(12,112122) = 12,11
    expect(lineGrossTotal(item)).toBe(48.45);
  });

  it('suma la ganancia en líneas sin IVA', () => {
    const items = [{ quantity: 2, unit_price: 500, iva_rate: '', margin_percentage: 20 }];
    const totals = computeItemsTotals(items);
    expect(lineGrossTotal(items[0])).toBe(1200);
    expect(totals).toMatchObject({ exemptTotal: 1000, marginTotal: 200, totalList: 1200 });
  });

  it('redondea la ganancia por línea y el neto a 2 decimales', () => {
    const totals = computeItemsTotals([
      { quantity: 1, unit_price: 0.05, iva_rate: '', margin_percentage: 10 },
      { quantity: 1, unit_price: 0.05, iva_rate: '', margin_percentage: 10 },
    ]);
    // round(0.005) = 0.01 por línea -> 0.02 (no round(0.01) por grupo)
    expect(totals.marginTotal).toBe(0.02);
  });

  it('trata la ganancia vacía como 0', () => {
    expect(toMarginPercentage('')).toBe(0);
    expect(toMarginPercentage(null)).toBe(0);
    expect(toMarginPercentage('12,5')).toBe(12.5);
    expect(lineGrossTotal({ quantity: 1, unit_price: 100, iva_rate: '21', margin_percentage: '' })).toBe(121);
  });
});

describe('redondeo en centavos (half-up, igual que BigDecimal)', () => {
  it('redondea la ganancia de medio centavo hacia arriba: 6,10 × 35% = 2,14', () => {
    const item = { quantity: 1, unit_price: 6.1, iva_rate: '', margin_percentage: 35 };
    expect(computeItemsTotals([item]).marginTotal).toBe(2.14);
    expect(lineGrossTotal(item)).toBe(8.24);
  });

  it('redondea la ganancia de medio centavo hacia arriba: 7,25 × 30% = 2,18', () => {
    const item = { quantity: 1, unit_price: '7.25', iva_rate: '', margin_percentage: '30' };
    expect(computeItemsTotals([item]).marginTotal).toBe(2.18);
    expect(lineGrossTotal(item)).toBe(9.43);
    expect(unitFinalPrice(item)).toBe(9.43);
  });

  it('redondea el IVA 10,5% de medio centavo hacia arriba: 3 × 10,5% = 0,32', () => {
    const item = { quantity: 1, unit_price: 3, iva_rate: '10.5' };
    const totals = computeItemsTotals([item]);
    expect(totals.ivaBreakdown).toEqual([{ rate: 10.5, base: 3, amount: 0.32 }]);
    expect(totals.totalList).toBe(3.32);
    expect(lineGrossTotal(item)).toBe(3.32);
  });

  it('redondea el neto de la línea sin errores de flotante', () => {
    expect(lineNetTotal({ quantity: 1.15, unit_price: 0.5 })).toBe(0.58);
    expect(lineNetTotal({ quantity: 3, unit_price: 0.1 })).toBe(0.3);
  });

  it('expone la ganancia por defecto de un producto', () => {
    expect(DEFAULT_PRODUCT_MARGIN).toBe(50);
  });
});

// Casos de borde espejados en backend/spec/models/concerns/itemized_totals_spec.rb (mismos inputs y resultados).
describe('casos de borde (espejo de itemized_totals_spec.rb)', () => {
  it('con alícuota 21% y ganancia 0, la ganancia de la línea es 0', () => {
    const item = { quantity: 1, unit_price: 1000, iva_rate: '21', margin_percentage: 0 };
    expect(computeItemsTotals([item]).marginTotal).toBe(0);
    expect(lineGrossTotal(item)).toBe(1210);
  });

  it('toma margin_percentage nulo como 0 aunque haya alícuota', () => {
    const item = { quantity: 1, unit_price: 1000, iva_rate: '21', margin_percentage: null };
    expect(computeItemsTotals([item]).marginTotal).toBe(0);
    expect(lineGrossTotal(item)).toBe(1210);
  });

  it('con cantidad fraccionaria redondea el neto antes del IVA y la ganancia half-up', () => {
    // 1,5 × 333,33 = 499,995 → neto 500,00; IVA 105,00; ganancia 605 × 12,5% = 75,625 → 75,63
    const item = { quantity: 1.5, unit_price: 333.33, iva_rate: '21', margin_percentage: 12.5 };
    const totals = computeItemsTotals([item]);
    expect(lineNetTotal(item)).toBe(500);
    expect(totals).toMatchObject({ subtotalNet: 500, totalIva: 105, marginTotal: 75.63, totalList: 680.63 });
    expect(lineGrossTotal(item)).toBe(680.63);
  });

  it('la suma de importes de línea puede diferir en 1 centavo del total (IVA por alícuota)', () => {
    // Trade-off aceptado (design): por línea IVA round(2,1042) = 2,10 → 12,12 c/u → 24,24;
    // por alícuota round(20,04 × 21%) = 4,21 → 24,25
    const items = [
      { quantity: 1, unit_price: 10.02, iva_rate: '21' },
      { quantity: 1, unit_price: 10.02, iva_rate: '21' },
    ];
    const lineSum = items.reduce((sum, item) => sum + lineGrossTotal(item), 0);
    expect(lineSum).toBe(24.24);
    expect(computeItemsTotals(items).totalList).toBe(24.25);
  });
});
