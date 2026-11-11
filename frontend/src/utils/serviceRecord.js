import { toFormItems, toItemsAttributes } from '@utils/items';

// Ítems de la atención (respuesta `with_details`) -> valores del form.
// Una atención migrada trae sus líneas sin IVA: el % queda vacío.
export const toServiceRecordFormItems = (record) => toFormItems(record?.items);

// Ítems de un presupuesto -> líneas nuevas de la atención (sin ids: se crean de cero).
export const budgetToFormItems = (budget) => toFormItems(budget?.items, { keepIds: false });

/**
 * Form -> payload de POST/PUT /service_records. El total lo calcula el backend (no se envía).
 * `budget_id` solo va al crear: editar la atención no toca el vínculo ni el presupuesto.
 */
export const toServiceRecordPayload = (formData, { removedIds = [], isEditing = false } = {}) => {
  const { items_attributes: items, budget_id: budgetId, ...fields } = formData;
  return {
    ...fields,
    mileage: fields.mileage ? parseInt(fields.mileage, 10) : null,
    next_service_date: fields.next_service_date || null,
    appointment_id: fields.appointment_id || null,
    items_attributes: toItemsAttributes(items, removedIds, { withCatalog: true }),
    ...(!isEditing && budgetId ? { budget_id: budgetId } : {}),
  };
};
