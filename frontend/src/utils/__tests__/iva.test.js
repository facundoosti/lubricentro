import { describe, it, expect } from 'vitest';
import { toIvaRate, ivaRateToOption, formatIvaRate, priceWithIva } from '@utils/iva';
import { round2, formatCurrency } from '@utils/money';

describe('utils/iva', () => {
  it('normaliza la alícuota', () => {
    expect(toIvaRate('21.0')).toBe(21);
    expect(toIvaRate('10,5')).toBe(10.5);
    expect(toIvaRate('')).toBeNull();
    expect(toIvaRate(null)).toBeNull();
  });

  it('convierte a valor de select', () => {
    expect(ivaRateToOption('21.0')).toBe('21');
    expect(ivaRateToOption(10.5)).toBe('10.5');
    expect(ivaRateToOption(null)).toBe('');
  });

  it('formatea la alícuota en español', () => {
    expect(formatIvaRate('10.5')).toBe('10,5%');
    expect(formatIvaRate(21)).toBe('21%');
    expect(formatIvaRate(null)).toBe('Sin IVA');
  });

  it('calcula el precio con IVA', () => {
    expect(priceWithIva(10000, 21)).toBe(12100);
    expect(priceWithIva('10000', '10.5')).toBe(11050);
    expect(priceWithIva(99.99, 10.5)).toBe(110.49);
    expect(priceWithIva(500, null)).toBe(500);
  });
});

describe('utils/money', () => {
  it('redondea half-up a 2 decimales', () => {
    expect(round2(0.021)).toBe(0.02);
    expect(round2(1.005)).toBe(1.01);
    expect(round2(133.1)).toBe(133.1);
  });

  it('formatea en pesos', () => {
    expect(formatCurrency(12100)).toBe('$12.100');
    expect(formatCurrency('1234.5')).toBe('$1.234,50');
    expect(formatCurrency('27654.8')).toBe('$27.654,80');
    expect(formatCurrency('100.0')).toBe('$100');
  });
});
