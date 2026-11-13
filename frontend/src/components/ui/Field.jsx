import { Children, cloneElement, isValidElement, useId } from 'react';
import { cn } from '@/lib/utils';

const CONTROL_TAGS = ['input', 'textarea', 'select'];

/**
 * Label + control + ayuda o error, con un único estilo de label. Asocia el label al control. El id del
 * control es, en orden: el `id` propio del hijo (si es un control), el `id` de Field o uno de `useId`.
 * El label tiene `id` = `${id}-label`, para controles que se etiquetan con `aria-labelledby` (Select,
 * Combobox): el consumidor se lo pasa con el `id` de Field.
 *
 * Qué se le inyecta al primer hijo (`cloneElement`):
 * - Componente de campo, marcado con `Component.isFieldControl = true` (Input, Textarea, DateInput,
 *   TimeInput, Autocomplete, Select, CustomerSearchInput): `id` (si no trae uno), `error` y
 *   `aria-describedby` apuntando al mensaje.
 * - `<input>`/`<textarea>`/`<select>` nativo: solo el `id` (si no trae uno).
 * - Cualquier otro (`Controller`, un contenedor DOM como `div.relative`, un componente genérico): nada. El
 *   consumidor pasa el mismo `id` a Field y al control, y el `error` al control.
 * Sin ningún hijo elemento, el label no lleva `htmlFor`.
 *
 * @param {import('react').ReactNode} label
 * @param {string} [id] - id del control (si el hijo no trae uno; por defecto uno generado)
 * @param {boolean} [required] - muestra `*` en rojo después del label
 * @param {import('react').ReactNode} [error] - mensaje de error (marca el control con `error`)
 * @param {import('react').ReactNode} [hint] - ayuda debajo del control (si no hay error)
 * @param {import('react').ReactNode} [labelAddon] - contenido extra dentro del label, después del `*` (ej. un badge)
 * @param {string} [className] - clases del contenedor (ej. `md:col-span-2`)
 * @param {string} [labelClassName] - clases extra del label
 */
const Field = ({ label, id, required = false, error, hint, labelAddon, className, labelClassName, children }) => {
  const generatedId = useId();
  const items = Children.toArray(children);
  const controlIndex = items.findIndex(isValidElement);
  const control = items[controlIndex];
  const isFieldControl = control?.type?.isFieldControl === true;
  const isNativeControl = CONTROL_TAGS.includes(control?.type);
  const ownId = isFieldControl || isNativeControl ? control.props.id : undefined;
  const controlId = ownId ?? id ?? generatedId;
  const labelId = `${controlId}-label`;
  const messageId = `${controlId}-message`;

  const hasError = Boolean(error);
  const message = hasError ? (error === true ? null : error) : hint;

  if (isFieldControl) {
    const describedBy = [control.props['aria-describedby'], message && messageId].filter(Boolean).join(' ');
    items[controlIndex] = cloneElement(control, {
      id: controlId,
      'aria-describedby': describedBy || undefined,
      error: hasError || control.props.error || false,
    });
  } else if (isNativeControl && !ownId) {
    items[controlIndex] = cloneElement(control, { id: controlId });
  }

  const requiredMark = required && <span className="text-error"> *</span>;

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={control ? controlId : undefined}
          className={cn('block text-sm font-medium text-on-surface', labelAddon && 'flex items-center gap-1.5', labelClassName)}
        >
          {labelAddon ? <span>{label}{requiredMark}</span> : <>{label}{requiredMark}</>}
          {labelAddon}
        </label>
      )}
      {items}
      {message && (
        <p id={messageId} role={hasError ? 'alert' : undefined} className={cn('text-xs', hasError ? 'text-error' : 'text-on-surface-variant')}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Field;
