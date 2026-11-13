import { cn } from '@/lib/utils';
import { inputVariants } from '@ui/inputVariants';

/**
 * Textarea del design system: mismo estilo, foco y error que `@ui/Input`. El alto depende de `rows`;
 * no se redimensiona a mano salvo con `resize`. Reenvía `ref` y las props nativas.
 *
 * @param {number} [rows=3]
 * @param {boolean} [resize] - permite redimensionar en vertical
 * @param {boolean} [error] - `aria-invalid` (borde en rojo vía `aria-invalid:border-error`)
 * @param {'default'|'sm'} [size]
 * @param {string} [className] - combinadas con `cn`
 */
const Textarea = ({ rows = 3, resize = false, error = false, size = 'default', className, ref, ...props }) => (
  <textarea
    rows={rows}
    {...props}
    ref={ref}
    aria-invalid={error || props['aria-invalid'] || undefined}
    className={cn(inputVariants({ size }), resize ? 'resize-y' : 'resize-none', className)}
  />
);

// Field le inyecta id, error y aria-describedby.
Textarea.isFieldControl = true;

export default Textarea;
