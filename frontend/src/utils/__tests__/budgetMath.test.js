import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PRODUCT_MARGIN,
  computeBudgetTotals,
  computeItemsTotals,
  lineGrossTotal,
  lineNetTotal,
  toMarginPercentage,
  unitFinalPrice,
} from '@utils/budgetMath';

describe('computeBudgetTotals', () => {
  it('calcula un presupuesto mixto igual que el backend', () => {
    const totals = computeBudgetTotals(
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
    const totals = computeBudgetTotals([{ quantity: 1, unit_price: 100, iva_rate: 21 }], 10);
    expect(totals.totalList).toBe(121);
    expect(totals.totalCard).toBe(133.1);
  });

  it('redondea el IVA por alícuota y no por línea', () => {
    const totals = computeBudgetTotals([
      { quantity: 1, unit_price: 0.05, iva_rate: 21 },
      { quantity: 1, unit_price: 0.05, iva_rate: 21 },
    ]);
    expect(totals.totalIva).toBe(0.02);
  });

  it('trata los ítems sin alícuota como precio final', () => {
    const totals = computeBudgetTotals([{ quantity: 2, unit_price: 25000, iva_rate: null }], 10);
    expect(totals).toMatchObject({ totalList: 50000, totalIva: 0, subtotalNet: 0, totalCard: 55000 });
    expect(totals.ivaBreakdown).toEqual([]);
  });

  it('tolera ítems vacíos', () => {
    expect(computeBudgetTotals([{ quantity: '', unit_price: '' }]).totalList).toBe(0);
    expect(computeBudgetTotals().totalCard).toBe(0);
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
    expect(computeItemsTotals).toBe(computeBudgetTotals);
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

describe('ganancia por línea (fórmula sumada)', () => {
  it('suma IVA y ganancia sobre el neto: 1 × $1.000, 21%, 30%, recargo 10%', () => {
    const items = [{ quantity: 1, unit_price: 1000, iva_rate: '21', margin_percentage: '30' }];
    const totals = computeItemsTotals(items, 10);

    expect(lineGrossTotal(items[0])).toBe(1510);
    expect(unitFinalPrice(items[0])).toBe(1510);
    expect(totals).toMatchObject({ subtotalNet: 1000, totalIva: 210, marginTotal: 300, totalList: 1510, totalCard: 1661 });
    expect(totals.ivaBreakdown).toEqual([{ rate: 21, base: 1000, amount: 210 }]);
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
    expect(DEFAULT_PRODUCT_MARGIN).toBe(30);
  });
});
