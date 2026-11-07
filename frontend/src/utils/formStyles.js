// Clases compartidas de los formularios (patrón de input del design system).
export const inputClass = (hasError = false) =>
  `w-full h-11 rounded-lg bg-surface-variant border px-4 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
    hasError ? 'border-error' : 'border-outline-variant'
  }`;

export const labelClass = 'flex items-center gap-1.5 text-sm font-medium text-on-surface mb-1';
