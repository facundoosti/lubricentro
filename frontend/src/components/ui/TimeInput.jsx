import { useState } from 'react';
import { cn } from '@/lib/utils';
import { inputVariants } from '@ui/inputVariants';
import { formatTimeDigits, parseDisplayTime, INVALID_INPUT } from '@/lib/maskedInput';

/**
 * Hora tipeable en hh:mm (24 h; los dos puntos se insertan solos). Valor externo 'HH:mm' o ''.
 * Hora incompleta o fuera de rango → `onChange(INVALID_INPUT)` (de `@/lib/maskedInput`, para que el
 * formulario bloquee el envío) y, al salir del campo, `aria-invalid`.
 *
 * @param {string} value - 'HH:mm', '' o INVALID_INPUT
 * @param {(time: string) => void} onChange - recibe 'HH:mm', '' o INVALID_INPUT
 * @param {boolean} [error]
 * @param {'default'|'sm'} [size] - tamaño de la caja (`inputVariants`)
 * @param {string} [className] - clases extra del input, combinadas con `cn` sobre `inputVariants`
 */
const TimeInput = ({
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
  placeholder = 'hh:mm',
  size = 'default',
  className,
  ref,
}) => {
  const current = value || '';
  const [text, setText] = useState(() => formatTimeDigits(current));
  const [invalid, setInvalid] = useState(false);

  // Valor que representa un texto: 'HH:mm', '' (vacío) o INVALID_INPUT (no vacío y no es una hora válida).
  const toValue = (display) => (display ? parseDisplayTime(display) ?? INVALID_INPUT : '');

  // Valor que llega de afuera (inicial, reset): se muestra si no es el que ya representa el texto.
  const [prevValue, setPrevValue] = useState(current);
  if (prevValue !== current) {
    setPrevValue(current);
    if (toValue(text) !== current) {
      setText(formatTimeDigits(current));
      setInvalid(false);
    }
  }

  const handleChange = (e) => {
    const next = formatTimeDigits(e.target.value);
    setText(next);
    const nextValue = toValue(next);
    if (nextValue !== INVALID_INPUT) setInvalid(false);
    if (nextValue !== current) onChange?.(nextValue);
  };

  const handleBlur = (e) => {
    setInvalid(toValue(text) === INVALID_INPUT);
    onBlur?.(e);
  };

  return (
    <input
      ref={ref}
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
      className={cn(inputVariants({ size }), className, (error || invalid) && 'border-error')}
    />
  );
};

// Field le inyecta id, error y aria-describedby.
TimeInput.isFieldControl = true;

export default TimeInput;
