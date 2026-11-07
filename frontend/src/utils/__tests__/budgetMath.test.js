import { describe, it, expect } from 'vitest';
import { computeBudgetTotals, lineGrossTotal } from '@utils/budgetMath';

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

  it('expone el subtotal con IVA de los productos', () => {
    const totals = computeBudgetTotals([
      { quantity: 2, unit_price: 10000, iva_rate: 21 },
      { quantity: 1, unit_price: 4000, iva_rate: 10.5 },
      { quantity: 1, unit_price: 15000, iva_rate: null },
    ]);
    expect(totals.subtotalGross).toBe(28620);
  });
});
