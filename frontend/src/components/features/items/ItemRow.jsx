import { useWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import ItemSearchInput from '@components/features/items/ItemSearchInput';
import IvaRateSelect from '@components/features/items/IvaRateSelect';
import Input from '@ui/Input';
import { ivaRateToOption } from '@utils/iva';
import { lineGrossTotal } from '@utils/budgetMath';
import { formatCurrency } from '@utils/money';

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

// % de ganancia: vacío (= 0) o entre 0 y 999,99 con hasta 2 decimales.
const MAX_MARGIN_PERCENTAGE = 999.99;
const isValidMargin = (value) => {
  if (value === null || value === undefined || value === '') return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= MAX_MARGIN_PERCENTAGE && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
};

const validateMargin = (name, index) => (value, values) =>
  !isDescribed(values, name, index) || isValidMargin(value) || '% Ganancia inválido (0 a 999,99)';

// Una línea de "Productos y Servicios": cantidad, descripción, precio neto, % ganancia, alícuota e
// importe final (neto × (1 + IVA% + ganancia%)). En mobile es una tarjeta; desde md, una fila de grilla.
const ItemRow = ({ name, index, control, register, setValue, errors, onRemove, onPriceEnter, descriptionRef }) => {
  const prefix = `${name}.${index}`;
  const item = useWatch({ control, name: prefix }) || {};
  const ids = {
    qty: `${name}-${index}-qty`,
    price: `${name}-${index}-price`,
    iva: `${name}-${index}-iva`,
    margin: `${name}-${index}-margin`,
  };
  const set = (field, value) => setValue(`${prefix}.${field}`, value, { shouldDirty: true });

  // Enter nunca envía el formulario desde una línea; en el precio agrega/avanza.
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (e.currentTarget.id === ids.price) onPriceEnter(index);
  };

  const errorMessage = errors?.quantity?.message || errors?.unit_price?.message || errors?.margin_percentage?.message;

  return (
    <div
      data-testid="item-row"
      className="relative grid grid-cols-2 gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-high md:grid-cols-[4.5rem_minmax(0,1fr)_8rem_5.5rem_6.5rem_7rem_2.25rem] md:items-center md:gap-2 md:p-0 md:py-2 md:border-0 md:rounded-none md:bg-transparent"
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
              set('product_code', null);
            }
          }}
          onSelect={({ description, unit_price, iva_rate, margin_percentage, product_id, service_id, product_code }) => {
            set('description', description);
            set('unit_price', unit_price);
            set('iva_rate', ivaRateToOption(iva_rate));
            set('margin_percentage', margin_percentage ?? 0);
            set('product_id', product_id ?? null);
            set('service_id', service_id ?? null);
            set('product_code', product_code ?? null);
          }}
        />
      </div>

      <div className="md:order-1">
        <MobileLabel htmlFor={ids.qty}>Cantidad</MobileLabel>
        <Input
          id={ids.qty}
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          aria-label={`Cantidad línea ${index + 1}`}
          onKeyDown={handleKeyDown}
          size="sm"
          error={!!errors?.quantity}
          {...register(`${prefix}.quantity`, { validate: validateQuantity(name, index) })}
          className="text-center"
        />
      </div>

      <div className="md:order-3">
        <MobileLabel htmlFor={ids.price}>Precio unit. (sin IVA)</MobileLabel>
        <Input
          id={ids.price}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          aria-label={`Precio unitario línea ${index + 1}`}
          onKeyDown={handleKeyDown}
          size="sm"
          error={!!errors?.unit_price}
          {...register(`${prefix}.unit_price`, { validate: validateAmount(name, index, 'Precio inválido') })}
          className="text-right"
        />
      </div>

      <div className="md:order-4">
        <MobileLabel htmlFor={ids.margin}>% Ganancia</MobileLabel>
        <Input
          id={ids.margin}
          type="number"
          min="0"
          max={MAX_MARGIN_PERCENTAGE}
          step="0.01"
          inputMode="decimal"
          aria-label={`% Ganancia línea ${index + 1}`}
          onKeyDown={handleKeyDown}
          size="sm"
          error={!!errors?.margin_percentage}
          {...register(`${prefix}.margin_percentage`, { validate: validateMargin(name, index) })}
          className="text-right"
        />
      </div>

      <div className="md:order-5">
        <MobileLabel htmlFor={ids.iva}>IVA</MobileLabel>
        <IvaRateSelect
          id={ids.iva}
          aria-label={`% IVA línea ${index + 1}`}
          value={item.iva_rate}
          onChange={(value) => set('iva_rate', value)}
        />
      </div>

      <div className="flex items-baseline justify-between md:order-6 md:block md:text-right">
        <span className="text-xs text-secondary md:sr-only">Importe final</span>
        <span className="text-sm font-medium text-on-surface" data-testid="line-total">
          {formatCurrency(lineGrossTotal(item))}
        </span>
      </div>

      {errorMessage && (
        <p role="alert" className="col-span-2 text-xs text-error md:order-8 md:col-span-7">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={() => onRemove(index)}
        aria-label={`Quitar línea ${index + 1}`}
        className="absolute top-2 right-2 p-1.5 rounded text-secondary hover:text-error hover:bg-error-container/20 transition-colors md:static md:order-7 md:justify-self-center"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ItemRow;
