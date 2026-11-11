import { describe, it, expect } from 'vitest';
import { toIvaRate, ivaRateToOption, formatIvaRate, priceWithIva, itemIvaOptions, ITEM_IVA_OPTIONS } from '@utils/iva';
import { round2, formatCurrency } from '@utils/money';

describe('utils/iva', () => {
  it('normaliza la alícuota', () => {
    expect(toIvaRate('21.0')).toBe(21);
    expect(toIvaRate('10,5')).toBe(10.5);
    expect(toIvaRate('')).toBeNull();
    expect(toIvaRate(null)).toBeNull();
  });

  it('trata el 0 como sin IVA', () => {
    expect(toIvaRate(0)).toBeNull();
    expect(toIvaRate('0')).toBeNull();
    expect(toIvaRate('0.00')).toBeNull();
    expect(ivaRateToOption('0.0')).toBe('');
  });

  it('conserva un % anterior fuera de la lista', () => {
    expect(toIvaRate('15')).toBe(15);
    expect(toIvaRate('15,75')).toBe(15.75);
    expect(ivaRateToOption('99.99')).toBe('99.99');
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
    expect(formatIvaRate('15.0')).toBe('15%');
    expect(formatIvaRate('15.75')).toBe('15,75%');
    expect(formatIvaRate(0)).toBe('Sin IVA');
  });

  it('ofrece 21% · 10,5% · Sin IVA para una línea', () => {
    expect(ITEM_IVA_OPTIONS.map((o) => o.label)).toEqual(['21%', '10,5%', 'Sin IVA']);
    expect(itemIvaOptions('21.0')).toBe(ITEM_IVA_OPTIONS);
    expect(itemIvaOptions('')).toBe(ITEM_IVA_OPTIONS);
    expect(itemIvaOptions(null)).toBe(ITEM_IVA_OPTIONS);
  });

  it('agrega la opción "(anterior)" para un % fuera de la lista', () => {
    const options = itemIvaOptions('15.0');
    expect(options).toHaveLength(4);
    expect(options[3]).toEqual({ value: '15', label: '15% (anterior)' });
    expect(itemIvaOptions('15.75')[3].label).toBe('15,75% (anterior)');
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
