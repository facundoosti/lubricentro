import { describe, it, expect } from 'vitest';
import { toPayload, toFormValues, formatVehicle } from '@utils/budget';

describe('toPayload', () => {
  const base = { date: '2026-11-06', status: 'draft', customer_id: '', vehicle_id: null, card_surcharge_percentage: 0 };

  it('convierte la alícuota y la ganancia y numera las posiciones', () => {
    const payload = toPayload({
      ...base,
      items_attributes: [
        { quantity: 2, description: 'Aceite', unit_price: 10000, iva_rate: '21', margin_percentage: '30' },
        { quantity: 1, description: ' Mano de obra ', unit_price: 15000, iva_rate: '', margin_percentage: '' },
      ],
    });
    expect(payload.customer_id).toBeNull();
    expect(payload.items_attributes).toEqual([
      { position: 0, quantity: 2, description: 'Aceite', unit_price: 10000, iva_rate: 21, margin_percentage: 30, product_code: null },
      { position: 1, quantity: 1, description: 'Mano de obra', unit_price: 15000, iva_rate: null, margin_percentage: 0, product_code: null },
    ]);
  });

  it('envía la alícuota 0 como null (sin IVA)', () => {
    const payload = toPayload({
      ...base,
      items_attributes: [
        { quantity: 1, description: 'Lavado', unit_price: 500, iva_rate: '0' },
        { quantity: 1, description: 'Repuesto', unit_price: 100, iva_rate: '0.0' },
      ],
    });
    expect(payload.items_attributes.map((item) => item.iva_rate)).toEqual([null, null]);
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
      { id: 5, position: 0, quantity: 1, description: 'Filtro', unit_price: 100, iva_rate: 10.5, margin_percentage: 0, product_code: null },
      { id: 9, _destroy: true },
      { id: 7, _destroy: true },
    ]);
  });
});

describe('toPayload — código de producto', () => {
  it('envía el SKU copiado del catálogo', () => {
    const payload = toPayload({
      date: '2026-11-13', status: 'draft', customer_id: 1, vehicle_id: null, card_surcharge_percentage: 0,
      items_attributes: [{ quantity: 1, description: 'Filtro', unit_price: 100, iva_rate: '21', product_code: 'PH10044' }],
    });
    expect(payload.items_attributes[0].product_code).toBe('PH10044');
  });
});

describe('toFormValues', () => {
  it('lleva la alícuota y la ganancia de la API al form', () => {
    const values = toFormValues({
      date: '2026-11-01',
      status: 'sent',
      customer_id: 3,
      vehicle_id: 4,
      card_surcharge_percentage: '10.0',
      items: [
        { id: 1, quantity: '2.0', description: 'Aceite', unit_price: '100.0', iva_rate: '21.0', margin_percentage: '30.0' },
        { id: 2, quantity: '1.0', description: 'Service', unit_price: '50.0', iva_rate: null },
      ],
    });
    expect(values.card_surcharge_percentage).toBe(10);
    expect(values.items_attributes.map((i) => i.iva_rate)).toEqual(['21', '']);
    expect(values.items_attributes[0]).toMatchObject({ quantity: 2, unit_price: 100, margin_percentage: 30 });
    // ítem sin margin_percentage (respuesta vieja) -> 0
    expect(values.items_attributes[1].margin_percentage).toBe(0);
  });
});

describe('formatVehicle', () => {
  it('arma la descripción para el PDF', () => {
    expect(formatVehicle({ brand: 'Ford', model: 'Ka', year: 2015, license_plate: 'AB123CD' })).toBe('Ford Ka 2015 (AB123CD)');
  });
});
