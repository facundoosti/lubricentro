import { cn } from '@/lib/utils';
import { inputVariants } from '@ui/inputVariants';

// Padding izquierdo e ícono según el tamaño, para que el texto no pise el ícono.
const ICON_PADDING = { default: 'pl-9', sm: 'pl-7' };
const ICON_POSITION = { default: 'left-3', sm: 'left-2' };

/**
 * Campo de texto del design system: una sola fuente de clases (`inputVariants`) para todos los formularios.
 * Reenvía `ref` y las props nativas (funciona con `register` de react-hook-form).
 *
 * @param {'default'|'sm'} [size] - `sm` para filas densas (ítems). No es el atributo nativo `size`.
 * @param {boolean} [error] - `aria-invalid` (borde en rojo vía `aria-invalid:border-error`)
 * @param {import('react').ElementType} [startIcon] - ícono de Lucide a la izquierda (buscadores)
 * @param {string} [className] - clases del input, combinadas con `cn` (un override reemplaza al del componente)
 * @param {string} [containerClassName] - clases del contenedor cuando hay `startIcon` (ancho)
 */
const Input = ({
  size = 'default',
  error = false,
  startIcon: StartIcon,
  className,
  containerClassName,
  type = 'text',
  ref,
  ...props
}) => {
  const input = (
    <input
      type={type}
      {...props}
      ref={ref}
      aria-invalid={error || props['aria-invalid'] || undefined}
      className={cn(inputVariants({ size }), StartIcon && ICON_PADDING[size], className)}
    />
  );

  if (!StartIcon) return input;

  return (
    <div className={cn('relative', containerClassName)}>
      <StartIcon
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-secondary',
          ICON_POSITION[size],
        )}
      />
      {input}
    </div>
  );
};

// Field le inyecta id, error y aria-describedby.
Input.isFieldControl = true;

export default Input;
