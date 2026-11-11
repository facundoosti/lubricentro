import { DEFAULT_IVA_RATE, ivaRateToOption, toIvaRate } from '@utils/iva';

// Línea nueva de "Productos y Servicios" (presupuesto y atención). Texto libre = 21%.
export const emptyItem = (position = 0) => ({
  quantity: 1,
  description: '',
  unit_price: 0,
  iva_rate: String(DEFAULT_IVA_RATE),
  product_id: null,
  service_id: null,
  position,
});

// Ítems de la API -> valores del form. Sin ítems queda una línea vacía.
// `keepIds: false` sirve para copiar ítems de otro documento (se crean de cero).
export const toFormItems = (items, { keepIds = true } = {}) =>
  items?.length
    ? [...items]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((item, idx) => ({
          ...(keepIds && item.id ? { id: item.id } : {}),
          position: idx,
          quantity: Number(item.quantity),
          description: item.description,
          unit_price: Number(item.unit_price),
          iva_rate: ivaRateToOption(item.iva_rate),
          product_id: item.product_id ?? null,
          service_id: item.service_id ?? null,
        }))
    : [emptyItem(0)];

// Una línea "tiene datos" si el usuario escribió algo en la descripción.
export const hasFilledItems = (items = []) => items.some((item) => item?.description?.trim());

// Form -> `items_attributes`. Las líneas sin descripción no se envían (si ya estaban
// guardadas, se borran); los ids quitados van con _destroy.
// `withCatalog` agrega product_id / service_id (atención; el presupuesto no los guarda).
export const toItemsAttributes = (items = [], removedIds = [], { withCatalog = false } = {}) => {
  const kept = items.filter((item) => item.description?.trim());
  const blankSaved = items.filter((item) => !item.description?.trim() && item.id).map((item) => item.id);

  return [
    ...kept.map((item, idx) => ({
      ...(item.id ? { id: item.id } : {}),
      position: idx,
      quantity: item.quantity,
      description: item.description.trim(),
      unit_price: item.unit_price,
      iva_rate: toIvaRate(item.iva_rate),
      ...(withCatalog ? { product_id: item.product_id || null, service_id: item.service_id || null } : {}),
    })),
    ...[...removedIds, ...blankSaved].map((id) => ({ id, _destroy: true })),
  ];
};
