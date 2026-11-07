import { DEFAULT_IVA_RATE, ivaRateToOption, toIvaRate } from '@utils/iva';

export const BUDGET_STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviado' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
];

export const formatVehicle = (v) =>
  [v.brand, v.model, v.year, v.license_plate ? `(${v.license_plate})` : ''].filter(Boolean).join(' ');

export const emptyItem = (position = 0) => ({
  quantity: 1,
  description: '',
  unit_price: 0,
  iva_rate: String(DEFAULT_IVA_RATE),
  position,
});

// Fecha local (no UTC): a la noche en Argentina toISOString ya da el día siguiente.
export const today = () => new Date().toLocaleDateString('en-CA');

export const defaultValues = () => ({
  date: today(),
  status: 'draft',
  customer_id: '',
  vehicle_id: null,
  vehicle_description: '',
  notes: '',
  card_surcharge_percentage: 0,
  items_attributes: [emptyItem(0)],
});

export const toFormValues = (budget) => ({
  date: budget.date || today(),
  status: budget.status || 'draft',
  customer_id: budget.customer_id || '',
  vehicle_id: budget.vehicle_id || null,
  vehicle_description: budget.vehicle_description || '',
  notes: budget.notes || '',
  card_surcharge_percentage: Number(budget.card_surcharge_percentage) || 0,
  items_attributes: budget.items?.length
    ? budget.items.map((item, idx) => ({
        id: item.id,
        position: idx,
        quantity: Number(item.quantity),
        description: item.description,
        unit_price: Number(item.unit_price),
        iva_rate: ivaRateToOption(item.iva_rate),
      }))
    : [emptyItem(0)],
});

// Las líneas sin descripción no se envían (si ya estaban guardadas, se borran).
export const toPayload = (formData, removedIds = []) => {
  const items = formData.items_attributes || [];
  const kept = items.filter((item) => item.description?.trim());
  const blankSaved = items.filter((item) => !item.description?.trim() && item.id).map((item) => item.id);

  return {
    ...formData,
    customer_id: formData.customer_id || null,
    vehicle_id: formData.vehicle_id || null,
    items_attributes: [
      ...kept.map((item, idx) => ({
        ...(item.id ? { id: item.id } : {}),
        position: idx,
        quantity: item.quantity,
        description: item.description.trim(),
        unit_price: item.unit_price,
        iva_rate: toIvaRate(item.iva_rate),
      })),
      ...[...removedIds, ...blankSaved].map((id) => ({ id, _destroy: true })),
    ],
  };
};
