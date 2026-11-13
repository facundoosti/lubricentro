import { describe, it, expect } from 'vitest';
import { toServiceRecordFormItems, budgetToFormItems, toServiceRecordPayload } from '@utils/serviceRecord';

const form = (overrides = {}) => ({
  service_date: '2026-11-11',
  mileage: '85000',
  notes: '',
  next_service_date: '',
  customer_id: 3,
  vehicle_id: 10,
  appointment_id: '',
  budget_id: null,
  items_attributes: [],
  ...overrides,
});

describe('utils/serviceRecord', () => {
  it('mapea los ítems de la respuesta al form (migrada = % vacío)', () => {
    const items = toServiceRecordFormItems({
      items: [
        { id: 2, position: 1, description: 'Filtro', quantity: '2.0', unit_price: '3000.0', iva_rate: null, margin_percentage: '20.0', product_id: 4, service_id: null },
        { id: 1, position: 0, description: 'Cambio de aceite', quantity: '1.0', unit_price: '8000.0', iva_rate: null, product_id: null, service_id: 9 },
      ],
    });
    expect(items).toEqual([
      { id: 1, position: 0, description: 'Cambio de aceite', quantity: 1, unit_price: 8000, iva_rate: '', margin_percentage: 0, product_id: null, service_id: 9, product_code: null },
      { id: 2, position: 1, description: 'Filtro', quantity: 2, unit_price: 3000, iva_rate: '', margin_percentage: 20, product_id: 4, service_id: null, product_code: null },
    ]);
  });

  it('sin ítems deja una línea vacía', () => {
    expect(toServiceRecordFormItems({ items: [] })).toHaveLength(1);
    expect(toServiceRecordFormItems(undefined)[0]).toMatchObject({ description: '', iva_rate: '21', margin_percentage: 0 });
  });

  it('los ítems de un presupuesto se copian sin ids y con su ganancia', () => {
    const items = budgetToFormItems({
      items: [{ id: 50, position: 0, description: 'Aceite', quantity: '4.0', unit_price: '10000.0', iva_rate: '21.0', margin_percentage: '30.0' }],
    });
    expect(items).toEqual([
      { position: 0, description: 'Aceite', quantity: 4, unit_price: 10000, iva_rate: '21', margin_percentage: 30, product_id: null, service_id: null, product_code: null },
    ]);
  });

  it('arma items_attributes con catálogo, _destroy y sin total_amount', () => {
    const payload = toServiceRecordPayload(
      form({
        total_amount: 1,
        items_attributes: [
          { id: 1, description: ' Aceite 5W30 ', quantity: 4, unit_price: 10000, iva_rate: '21', margin_percentage: '15.5', product_id: 7, service_id: null },
          { description: 'Lavado de motor', quantity: 1, unit_price: 5000, iva_rate: '', product_id: null, service_id: null },
          { id: 3, description: '', quantity: 1, unit_price: 0, iva_rate: '21' },
          { description: '', quantity: 1, unit_price: 0, iva_rate: '21' },
        ],
      }),
      { removedIds: [9] },
    );

    expect(payload.items_attributes).toEqual([
      { id: 1, position: 0, quantity: 4, description: 'Aceite 5W30', unit_price: 10000, iva_rate: 21, margin_percentage: 15.5, product_id: 7, service_id: null },
      { position: 1, quantity: 1, description: 'Lavado de motor', unit_price: 5000, iva_rate: null, margin_percentage: 0, product_id: null, service_id: null },
      { id: 9, _destroy: true },
      { id: 3, _destroy: true },
    ]);
    expect(payload).toMatchObject({ mileage: 85000, next_service_date: null, appointment_id: null });
    expect(payload).not.toHaveProperty('service_record_services_attributes');
    expect(payload).not.toHaveProperty('service_record_products_attributes');
  });

  it('envía budget_id solo al crear y si hay vínculo', () => {
    expect(toServiceRecordPayload(form({ budget_id: 12 }))).toMatchObject({ budget_id: 12 });
    expect(toServiceRecordPayload(form({ budget_id: null }))).not.toHaveProperty('budget_id');
    expect(toServiceRecordPayload(form({ budget_id: 12 }), { isEditing: true })).not.toHaveProperty('budget_id');
  });
});
