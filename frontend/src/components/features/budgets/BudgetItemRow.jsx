import { useWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import ItemSearchInput from '@components/features/budgets/ItemSearchInput';
import IvaRateSelect from '@components/features/budgets/IvaRateSelect';
import { ivaRateToOption } from '@utils/iva';
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

// Una línea del presupuesto. En mobile es una tarjeta; desde md, una fila de grilla.
// Las líneas sin descripción se descartan al guardar, así que solo se validan las que tienen.
const validateIfDescribed = (index, message) => (value, values) =>
  !values.items_attributes?.[index]?.description?.trim() || (value !== '' && Number(value) >= 0) || message;

const BudgetItemRow = ({ index, control, register, setValue, errors, onRemove, onPriceEnter, descriptionRef }) => {
  const item = useWatch({ control, name: `items_attributes.${index}` }) || {};
  const prefix = `items_attributes.${index}`;
  const ids = { qty: `item-${index}-qty`, price: `item-${index}-price`, iva: `item-${index}-iva` };

  // Enter nunca envía el formulario desde una línea; en el precio agrega/avanza.
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (e.currentTarget.id === ids.price) onPriceEnter(index);
  };

  return (
    <div
      data-testid="budget-item"
      className="relative grid grid-cols-2 gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-high md:grid-cols-[4.5rem_minmax(0,1fr)_8rem_6.5rem_7rem_2.25rem] md:items-center md:gap-2 md:p-0 md:py-2 md:border-0 md:rounded-none md:bg-transparent"
    >
      <div className="col-span-2 pr-8 md:col-span-1 md:order-2 md:pr-0">
        <span className="block text-xs text-secondary mb-1 md:sr-only">Artículo / descripción</span>
        <ItemSearchInput
          inputRef={descriptionRef}
          value={item.description || ''}
          onChange={(text) => setValue(`${prefix}.description`, text, { shouldDirty: true })}
          onSelect={({ description, unit_price, iva_rate }) => {
            setValue(`${prefix}.description`, description, { shouldDirty: true });
            setValue(`${prefix}.unit_price`, unit_price, { shouldDirty: true });
            setValue(`${prefix}.iva_rate`, ivaRateToOption(iva_rate), { shouldDirty: true });
          }}
        />
      </div>

      <div className="md:order-1">
        <MobileLabel htmlFor={ids.qty}>Cantidad</MobileLabel>
        <input
          id={ids.qty}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          aria-label={`Cantidad línea ${index + 1}`}
          onKeyDown={handleKeyDown}
          aria-invalid={!!errors?.quantity}
          {...register(`${prefix}.quantity`, { validate: validateIfDescribed(index, 'Cantidad inválida') })}
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
          {...register(`${prefix}.unit_price`, { validate: validateIfDescribed(index, 'Precio inválido') })}
          className={`${inputClass} text-right ${errors?.unit_price ? 'border-error' : ''}`}
        />
      </div>

      <div className="md:order-4">
        <MobileLabel htmlFor={ids.iva}>IVA</MobileLabel>
        <IvaRateSelect
          id={ids.iva}
          value={item.iva_rate}
          onChange={(v) => setValue(`${prefix}.iva_rate`, v, { shouldDirty: true })}
        />
      </div>

      <div className="flex items-baseline justify-between md:order-5 md:block md:text-right">
        <span className="text-xs text-secondary md:sr-only">Importe c/IVA</span>
        <span className="text-sm font-medium text-on-surface" data-testid="line-total">
          {formatCurrency(lineGrossTotal(item))}
        </span>
      </div>

      {(errors?.quantity || errors?.unit_price) && (
        <p role="alert" className="col-span-2 text-xs text-error md:order-7 md:col-span-6">
          {errors.quantity?.message || errors.unit_price?.message}
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

export default BudgetItemRow;
