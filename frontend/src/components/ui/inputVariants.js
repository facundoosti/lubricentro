// Clases de los campos de texto (Input, Textarea, trigger de Select, DateInput, TimeInput, Autocomplete).
// Van en un archivo aparte para que los componentes exporten solo componentes (react-refresh/only-export-components).
import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'w-full rounded-lg border border-outline-variant bg-surface-variant text-on-surface placeholder:text-secondary transition-colors ' +
    'outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 ' +
    'disabled:cursor-not-allowed disabled:opacity-50 ' +
    'aria-invalid:border-error aria-invalid:focus-visible:ring-error/20',
  {
    variants: {
      size: {
        default: 'px-3 py-2 text-sm',
        sm: 'px-2 py-1.5 text-sm',
      },
    },
    defaultVariants: { size: 'default' },
  },
);
