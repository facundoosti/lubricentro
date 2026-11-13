import { lazy, Suspense, useRef, useState } from 'react';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputVariants } from '@ui/inputVariants';
import { formatDateDigits, parseDisplayDate, isoToDisplay, isoToDate, INVALID_INPUT } from '@/lib/maskedInput';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';
import { useDialogPortalContainer } from '@ui/dialogContext';

// react-day-picker + locale se cargan recién al abrir el calendario. Si falla la carga del chunk (red, o un deploy
// nuevo con otros hashes) se muestra un aviso en el popover en vez de romper la página: no hay Error Boundary.
const CalendarLoadError = () => (
  <p role="alert" className="w-[242px] p-4 text-sm text-on-surface-variant">
    No se pudo cargar el calendario. Recargá la página o tipeá la fecha.
  </p>
);
const DateCalendar = lazy(() => import('@ui/DateCalendar').catch(() => ({ default: CalendarLoadError })));

const inRange = (iso, min, max) => (!min || iso >= min) && (!max || iso <= max);

/**
 * Fecha tipeable en dd/mm/aaaa (las barras se insertan solas) + calendario en un popover.
 * Valor externo en ISO `yyyy-MM-dd` (como `type="date"`) o '' si está vacío. Texto con fecha incompleta,
 * inexistente o fuera de `min`/`max` → `onChange(INVALID_INPUT)` (de `@/lib/maskedInput`; el formulario lo
 * bloquea con `validate: validInput()`) y, al salir del campo, `aria-invalid` con el texto intacto.
 * Compatible con react-hook-form (`Controller`: `value`, `onChange`, `onBlur`, `ref` al input).
 * Dentro de un Dialog el calendario se portea en su panel: Escape cierra solo el calendario.
 *
 * @param {string} value - 'yyyy-MM-dd', '' o INVALID_INPUT
 * @param {(iso: string) => void} onChange - recibe 'yyyy-MM-dd', '' o INVALID_INPUT
 * @param {string} [min] / [max] - 'yyyy-MM-dd'
 * @param {boolean} [error] - borde en rojo (error del formulario)
 * @param {'default'|'sm'} [size] - tamaño de la caja (`inputVariants`)
 * @param {string} [className] - clases extra del input, combinadas con `cn` sobre `inputVariants`
 * @param {string} [containerClassName] - clases del contenedor (ancho)
 */
const DateInput = ({
  value,
  onChange,
  onBlur,
  id,
  name,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  error = false,
  disabled = false,
  min,
  max,
  placeholder = 'dd/mm/aaaa',
  size = 'default',
  className,
  containerClassName,
  ref,
}) => {
  const inputRef = useRef(null);
  const portalContainer = useDialogPortalContainer();
  const [text, setText] = useState(() => isoToDisplay(value));
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);

  const parseInRange = (display) => {
    const iso = parseDisplayDate(display);
    return iso && inRange(iso, min, max) ? iso : null;
  };
  // Valor que representa un texto: ISO, '' (vacío) o INVALID_INPUT (no vacío y no es una fecha válida).
  const toValue = (display) => (display ? parseInRange(display) ?? INVALID_INPUT : '');

  // Valor que llega de afuera (valor inicial, reset del formulario): se muestra si no es el que ya
  // representa el texto tipeado. Un texto inválido vale INVALID_INPUT, así un reset a '' lo limpia.
  const current = value || '';
  const [prevValue, setPrevValue] = useState(current);
  if (prevValue !== current) {
    setPrevValue(current);
    if (toValue(text) !== current) {
      setText(isoToDisplay(current));
      setInvalid(false);
    }
  }

  const emit = (next) => {
    if (next !== current) onChange?.(next);
  };

  const handleChange = (e) => {
    const next = formatDateDigits(e.target.value);
    setText(next);
    const nextValue = toValue(next);
    if (nextValue !== INVALID_INPUT) setInvalid(false);
    emit(nextValue);
  };

  const handleBlur = (e) => {
    setInvalid(toValue(text) === INVALID_INPUT);
    onBlur?.(e);
  };

  const handleSelect = (date) => {
    if (!date) return;
    const iso = format(date, 'yyyy-MM-dd');
    setText(isoToDisplay(iso));
    setInvalid(false);
    emit(iso);
    setOpen(false);
  };

  const setRefs = (node) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const selected = isoToDate(current);
  const minDate = isoToDate(min);
  const maxDate = isoToDate(max);
  const disabledDays = [minDate && { before: minDate }, maxDate && { after: maxDate }].filter(Boolean);

  return (
    <div className={cn('relative', containerClassName)}>
      <input
        ref={setRefs}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        id={id}
        name={name}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={error || invalid || undefined}
        placeholder={placeholder}
        disabled={disabled}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(inputVariants({ size }), className, 'pr-10', (error || invalid) && 'border-error')}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          aria-label="Abrir calendario"
          className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-secondary transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarDays className="size-4" />
        </PopoverTrigger>
        <PopoverContent
          container={portalContainer ?? undefined}
          align="end"
          className="w-auto p-0"
          finalFocus={inputRef}
        >
          <Suspense fallback={<div className="h-[300px] w-[242px]" aria-busy="true" />}>
            <DateCalendar
              selected={selected}
              defaultMonth={selected ?? new Date()}
              onSelect={handleSelect}
              disabled={disabledDays.length ? disabledDays : undefined}
              autoFocus
            />
          </Suspense>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Field le inyecta id, error y aria-describedby.
DateInput.isFieldControl = true;

export default DateInput;
