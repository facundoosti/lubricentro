import { MAX_ITEM_IVA_RATE } from '@utils/iva';

/**
 * IvaRateInput — % de IVA libre de una línea (0 a 99,99). Vacío o 0 = sin IVA.
 * Se puede registrar con react-hook-form (`{...register(name)}`) o usar controlado
 * con `value` / `onChange`.
 */
const IvaRateInput = ({ id, ref, className = '', invalid = false, 'aria-label': ariaLabel = '% IVA', ...rest }) => (
  <div className="relative">
    <input
      id={id}
      ref={ref}
      type="number"
      min="0"
      max={MAX_ITEM_IVA_RATE}
      step="0.01"
      inputMode="decimal"
      placeholder="Sin IVA"
      aria-label={ariaLabel}
      aria-invalid={invalid}
      className={`w-full pl-2 pr-6 py-1.5 bg-surface-variant border rounded text-on-surface text-sm text-right focus:outline-none focus:border-primary placeholder:text-secondary ${
        invalid ? 'border-error' : 'border-outline-variant'
      } ${className}`}
      {...rest}
    />
    <span aria-hidden="true" className="absolute inset-y-0 right-2 flex items-center text-xs text-secondary pointer-events-none">
      %
    </span>
  </div>
);

export default IvaRateInput;
