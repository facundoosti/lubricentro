import { useWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import ItemSearchInput from '@components/features/items/ItemSearchInput';
import IvaRateInput from '@components/features/items/IvaRateInput';
import { isValidItemIvaRate, ivaRateToOption } from '@utils/iva';
import { lineGrossTotal } from '@utils/budgetMath';
import { formatCurrency } from '@utils/money';

const inputClass =
  'w-full px-2 py-1.5 bg-surface-variant border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-primary';

// Etiqueta visible solo en mobile (en md+ la da el encabezado de la tabla).
const MobileLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-xs text-secondary mb-1 md:sr-only">
    {children}
  </label>
);

// Las líneas sin descripción se descartan al guardar, así que solo se validan las que tienen.
const isDescribed = (values, name, index) => !!values?.[name]?.[index]?.description?.trim();

const validateAmount = (name, index, message) => (value, values) =>
  !isDescribed(values, name, index) || (value !== '' && Number(value) >= 0) || message;

const validateQuantity = (name, index) => (value, values) =>
  !isDescribed(values, name, index) || (value !== '' && Number(value) > 0) || 'Cantidad inválida';

const validateIva = (name, index) => (value, values) =>
  !isDescribed(values, name, index) || isValidItemIvaRate(value) || '% IVA inválido (0 a 99,99)';

// Una línea de "Productos y Servicios". En mobile es una tarjeta; desde md, una fila de grilla.
const ItemRow = ({ name, index, control, register, setValue, errors, onRemove, onPriceEnter, descriptionRef }) => {
  const prefix = `${name}.${index}`;
  const item = useWatch({ control, name: prefix }) || {};
  const ids = { qty: `${name}-${index}-qty`, price: `${name}-${index}-price`, iva: `${name}-${index}-iva` };
  const set = (field, value) => setValue(`${prefix}.${field}`, value, { shouldDirty: true });

  // Enter nunca envía el formulario desde una línea; en el precio agrega/avanza.
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (e.currentTarget.id === ids.price) onPriceEnter(index);
  };

  const errorMessage = errors?.quantity?.message || errors?.unit_price?.message || errors?.iva_rate?.message;

  return (
    <div
      data-testid="item-row"
      className="relative grid grid-cols-2 gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-high md:grid-cols-[4.5rem_minmax(0,1fr)_8rem_6.5rem_7rem_2.25rem] md:items-center md:gap-2 md:p-0 md:py-2 md:border-0 md:rounded-none md:bg-transparent"
    >
      <div className="col-span-2 pr-8 md:col-span-1 md:order-2 md:pr-0">
        <span className="block text-xs text-secondary mb-1 md:sr-only">Producto / servicio</span>
        <ItemSearchInput
          inputRef={descriptionRef}
          value={item.description || ''}
          onChange={(text) => {
            set('description', text);
            // Sin descripción la línea ya no viene del catálogo.
            if (!text) {
              set('product_id', null);
              set('service_id', null);
            }
          }}
          onSelect={({ description, unit_price, iva_rate, product_id, service_id }) => {
            set('description', description);
            set('unit_price', unit_price);
            set('iva_rate', ivaRateToOption(iva_rate));
            set('product_id', product_id ?? null);
            set('service_id', service_id ?? null);
          }}
        />
      </div>

      <div className="md:order-1">
        <MobileLabel htmlFor={ids.qty}>Cantidad</MobileLabel>
        <input
          id={ids.qty}
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          aria-label={`Cantidad línea ${index + 1}`}
          onKeyDown={handleKeyDown}
          aria-invalid={!!errors?.quantity}
          {...register(`${prefix}.quantity`, { validate: validateQuantity(name, index) })}
          className={`${inputClass} text-center ${errors?.quantity ? 'border-error' : ''}`}
        />
      </div>

      <div className="md:order-3">
        <MobileLabel htmlFor={ids.price}>Precio unit. (sin IVA)</MobileLabel>
        <input
          id={ids.price}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          aria-label={`Precio unitario línea ${index + 1}`}
          onKeyDown={handleKeyDown}
          aria-invalid={!!errors?.unit_price}
          {...register(`${prefix}.unit_price`, { validate: validateAmount(name, index, 'Precio inválido') })}
          className={`${inputClass} text-right ${errors?.unit_price ? 'border-error' : ''}`}
        />
      </div>

      <div className="md:order-4">
        <MobileLabel htmlFor={ids.iva}>% IVA</MobileLabel>
        <IvaRateInput
          id={ids.iva}
          aria-label={`% IVA línea ${index + 1}`}
          invalid={!!errors?.iva_rate}
          onKeyDown={handleKeyDown}
          {...register(`${prefix}.iva_rate`, { validate: validateIva(name, index) })}
        />
      </div>

      <div className="flex items-baseline justify-between md:order-5 md:block md:text-right">
        <span className="text-xs text-secondary md:sr-only">Importe c/IVA</span>
        <span className="text-sm font-medium text-on-surface" data-testid="line-total">
          {formatCurrency(lineGrossTotal(item))}
        </span>
      </div>

      {errorMessage && (
        <p role="alert" className="col-span-2 text-xs text-error md:order-7 md:col-span-6">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={() => onRemove(index)}
        aria-label={`Quitar línea ${index + 1}`}
        className="absolute top-2 right-2 p-1.5 rounded text-secondary hover:text-error hover:bg-error-container/20 transition-colors md:static md:order-6 md:justify-self-center"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ItemRow;
