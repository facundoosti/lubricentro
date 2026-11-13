import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combina clases condicionales (clsx) y resuelve conflictos de Tailwind (tailwind-merge):
// cn('px-2', 'px-4', false && 'hidden') → 'px-4'
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
