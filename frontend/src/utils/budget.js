import { emptyItem, toFormItems, toItemsAttributes } from '@utils/items';

export const BUDGET_STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviado' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
];

export const formatVehicle = (v) =>
  [v.brand, v.model, v.year, v.license_plate ? `(${v.license_plate})` : ''].filter(Boolean).join(' ');

// Fecha local (no UTC): a la noche en Argentina toISOString ya da el día siguiente.
const today = () => new Date().toLocaleDateString('en-CA');

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
  items_attributes: toFormItems(budget.items),
});

// Las líneas sin descripción no se envían (si ya estaban guardadas, se borran).
export const toPayload = (formData, removedIds = []) => ({
  ...formData,
  customer_id: formData.customer_id || null,
  vehicle_id: formData.vehicle_id || null,
  items_attributes: toItemsAttributes(formData.items_attributes, removedIds, { withProductCode: true }),
});
