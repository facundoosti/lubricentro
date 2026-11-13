import { cn } from '@/lib/utils';
import { Switch as SwitchPrimitive } from '@/components/ui/primitives/switch';

// Estilos de la app: `default` (día abierto/cerrado en Configuración) y `theme` (modo oscuro del encabezado,
// con ícono dentro del thumb vía `thumbContent`).
const VARIANTS = {
  default: {
    root: 'h-6 w-11 overflow-hidden data-checked:bg-primary-container data-unchecked:bg-outline',
    thumb: 'absolute top-0.5 left-0.5 h-5 w-5 bg-surface-container shadow-sm data-checked:translate-x-5',
  },
  theme: {
    root: 'h-6 w-11 border border-outline-variant bg-surface-container-high',
    thumb: 'h-4 w-4 bg-primary-container text-on-primary shadow-theme-xs translate-x-1 data-checked:translate-x-6',
  },
};

/**
 * Switch de Base UI: rol `switch`, `aria-checked`, click, Espacio y Enter.
 *
 * @param {boolean} checked
 * @param {(checked: boolean) => void} onCheckedChange
 * @param {'default'|'theme'} [variant='default']
 * @param {React.ReactNode} [thumbContent] - nodo dentro del thumb (ícono)
 * @param {string} aria-label
 */
const Switch = ({
  checked,
  onCheckedChange,
  variant = 'default',
  thumbContent,
  disabled = false,
  className,
  thumbClassName,
  ...props
}) => {
  const styles = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <SwitchPrimitive
      checked={!!checked}
      onCheckedChange={(next) => onCheckedChange?.(next)}
      disabled={disabled}
      className={cn(styles.root, className)}
      thumbClassName={cn(styles.thumb, thumbClassName)}
      thumbContent={thumbContent}
      {...props}
    />
  );
};

export default Switch;
