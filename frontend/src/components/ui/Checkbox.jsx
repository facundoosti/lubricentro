import { Checkbox as CheckboxPrimitive } from '@/components/ui/primitives/checkbox';

/**
 * Checkbox de Base UI con estado indeterminado (`aria-checked="mixed"`).
 *
 * @param {boolean} checked
 * @param {boolean} [indeterminate]
 * @param {(checked: boolean) => void} onCheckedChange
 * @param {boolean} [disabled]
 * @param {string} aria-label
 */
const Checkbox = ({ checked, indeterminate = false, onCheckedChange, disabled = false, className, ...props }) => (
  <CheckboxPrimitive
    checked={!!checked}
    indeterminate={indeterminate}
    onCheckedChange={(next) => onCheckedChange?.(next)}
    disabled={disabled}
    className={className}
    {...props}
  />
);

export default Checkbox;
