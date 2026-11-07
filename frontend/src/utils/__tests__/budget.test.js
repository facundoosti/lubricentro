import { describe, it, expect } from 'vitest';
import { toPayload, toFormValues, formatVehicle } from '@utils/budget';

describe('toPayload', () => {
  const base = { date: '2026-11-06', status: 'draft', customer_id: '', vehicle_id: null, card_surcharge_percentage: 0 };

  it('convierte la alícuota y numera las posiciones', () => {
    const payload = toPayload({
      ...base,
      items_attributes: [
        { quantity: 2, description: 'Aceite', unit_price: 10000, iva_rate: '21' },
        { quantity: 1, description: ' Mano de obra ', unit_price: 15000, iva_rate: '' },
      ],
    });
    expect(payload.customer_id).toBeNull();
    expect(payload.items_attributes).toEqual([
      { position: 0, quantity: 2, description: 'Aceite', unit_price: 10000, iva_rate: 21 },
      { position: 1, quantity: 1, description: 'Mano de obra', unit_price: 15000, iva_rate: null },
    ]);
  });

  it('descarta líneas vacías y borra las ya guardadas', () => {
    const payload = toPayload(
      {
        ...base,
        items_attributes: [
          { id: 5, quantity: 1, description: 'Filtro', unit_price: 100, iva_rate: '10.5' },
          { quantity: 1, description: '', unit_price: 0, iva_rate: '21' },
          { id: 7, quantity: 1, description: '  ', unit_price: 0, iva_rate: '21' },
        ],
      },
      [9],
    );
    expect(payload.items_attributes).toEqual([
      { id: 5, position: 0, quantity: 1, description: 'Filtro', unit_price: 100, iva_rate: 10.5 },
      { id: 9, _destroy: true },
      { id: 7, _destroy: true },
    ]);
  });
});

describe('toFormValues', () => {
  it('lleva la alícuota de la API al formato del select', () => {
    const values = toFormValues({
      date: '2026-11-01',
      status: 'sent',
      customer_id: 3,
      vehicle_id: 4,
      card_surcharge_percentage: '10.0',
      items: [
        { id: 1, quantity: '2.0', description: 'Aceite', unit_price: '100.0', iva_rate: '21.0' },
        { id: 2, quantity: '1.0', description: 'Service', unit_price: '50.0', iva_rate: null },
      ],
    });
    expect(values.card_surcharge_percentage).toBe(10);
    expect(values.items_attributes.map((i) => i.iva_rate)).toEqual(['21', '']);
    expect(values.items_attributes[0]).toMatchObject({ quantity: 2, unit_price: 100 });
  });
});

describe('formatVehicle', () => {
  it('arma la descripción para el PDF', () => {
    expect(formatVehicle({ brand: 'Ford', model: 'Ka', year: 2015, license_plate: 'AB123CD' })).toBe('Ford Ka 2015 (AB123CD)');
  });
});
