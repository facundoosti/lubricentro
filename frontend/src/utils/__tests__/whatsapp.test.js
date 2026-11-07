import { describe, it, expect } from 'vitest';
import { normalizeWhatsAppPhone, buildBudgetMessage, buildWhatsAppUrl } from '@utils/whatsapp';

describe('normalizeWhatsAppPhone', () => {
  it.each([
    ['11 5555-1234', '5491155551234'],
    ['+54 9 11 5555-1234', '5491155551234'],
    ['+54 11 5555-1234', '5491155551234'],
    ['011 5555-1234', '5491155551234'],
    ['0054 9 351 555 1234', '5493515551234'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeWhatsAppPhone(input)).toBe(expected);
  });

  it('devuelve null sin teléfono', () => {
    expect(normalizeWhatsAppPhone('')).toBeNull();
    expect(normalizeWhatsAppPhone(null)).toBeNull();
  });
});

describe('buildBudgetMessage', () => {
  it('arma el resumen con los totales', () => {
    const text = buildBudgetMessage({
      budget: { id: 12, date: '2026-11-06', vehicle_description: 'Ford Ka 2015 (AB123CD)', total_list: '43620.0', total_card: '47982.0' },
      customerName: 'Juan Pérez',
      businessName: 'Killamet',
    });
    expect(text).toBe(
      'Hola Juan! Te paso el presupuesto #12 de Killamet (06/11/2026).\n' +
        'Vehículo: Ford Ka 2015 (AB123CD)\n' +
        'Total efectivo / débito: $43.620\n' +
        'Total tarjeta de crédito: $47.982',
    );
  });
});

describe('buildWhatsAppUrl', () => {
  it('codifica el texto', () => {
    expect(buildWhatsAppUrl('11 5555-1234', 'Hola\nchau')).toBe('https://wa.me/5491155551234?text=Hola%0Achau');
  });

  it('devuelve null sin teléfono', () => {
    expect(buildWhatsAppUrl('', 'x')).toBeNull();
  });

  it('sin mensaje devuelve solo el número', () => {
    expect(buildWhatsAppUrl('11 5555-1234')).toBe('https://wa.me/5491155551234');
  });
});
