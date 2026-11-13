import { cn } from '@/lib/utils';
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/primitives/select';

/**
 * Lista corta sin búsqueda (Select de Base UI): teclado (flechas, Enter, Escape), etiqueta con
 * `aria-labelledby`. Dentro de un Dialog, Escape cierra solo la lista. Compatible con react-hook-form
 * (Controller): `onChange` recibe el `value` de la opción.
 *
 * Si `value` no está entre las `options` (ej. un valor viejo que ya no se ofrece), el trigger muestra
 * `orphanLabel` (o `String(value)` si no se pasa) en vez del placeholder: es lo que el formulario va a enviar.
 *
 * @param {{ value: string, label: string }[]} options
 * @param {string} value
 * @param {(value: string) => void} onChange
 * @param {string} [placeholder='Seleccionar...']
 * @param {string} [orphanLabel] - texto del trigger si `value` no está entre las opciones (default `String(value)`)
 * @param {boolean} [disabled]
 * @param {boolean} [error] - borde en rojo
 * @param {string} [id]
 * @param {string} [aria-labelledby]
 * @param {string} [aria-label] - nombre accesible sin etiqueta visible
 * @param {boolean} [showIcon=true] - flecha del trigger (false en el badge de estado del presupuesto)
 * @param {string} [className] - clases extra del trigger
 * @param {string} [valueClassName] - clases del texto elegido (ej. `text-inherit` para heredar el color del trigger)
 * @param {string} [contentClassName] - clases extra de la lista (ej. ancho mínimo si el trigger es chico)
 */
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  orphanLabel: orphanLabelProp,
  disabled = false,
  error = false,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
  showIcon = true,
  className,
  contentClassName,
  valueClassName,
}) => {
  const selected = options.find((o) => String(o.value) === String(value));
  const hasValue = value !== null && value !== undefined && value !== '';
  const orphanLabel = !selected && hasValue ? orphanLabelProp || String(value) : null;

  return (
    <SelectRoot
      items={options}
      value={selected ? selected.value : null}
      // Sin opción vacía: Base UI avisa null cuando las opciones cambian y el valor deja de estar (ej. la
      // hora vieja con minutos que se agrega solo mientras está elegida); eso no es una elección del usuario.
      onValueChange={(next) => { if (next !== null && next !== undefined) onChange?.(next); }}
      disabled={disabled}
      modal={false}
    >
      <SelectTrigger
        id={id}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        showIcon={showIcon}
        aria-invalid={error || undefined}
        className={cn(error && 'border-error hover:border-error data-popup-open:border-error', className)}
      >
        <SelectValue placeholder={placeholder} className={cn(orphanLabel && 'data-placeholder:text-on-surface', valueClassName)}>
          {orphanLabel ?? undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent aria-labelledby={ariaLabelledBy} aria-label={ariaLabel} className={contentClassName}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} title={opt.label}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default Select;
