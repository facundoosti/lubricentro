import { describe, it, expect } from 'vitest';
import { inputVariants } from '@ui/inputVariants';

describe('inputVariants', () => {
  it('por defecto usa el estilo compacto', () => {
    const classes = inputVariants().split(/\s+/);
    expect(classes).toEqual(expect.arrayContaining([
      'px-3', 'py-2', 'text-sm', 'rounded-lg', 'bg-surface-variant', 'border-outline-variant',
      'focus-visible:border-primary', 'focus-visible:ring-2', 'focus-visible:ring-primary/20',
      'aria-invalid:border-error',
    ]));
  });

  it('size="sm" usa px-2 py-1.5 y no px-3 py-2', () => {
    const classes = inputVariants({ size: 'sm' }).split(/\s+/);
    expect(classes).toEqual(expect.arrayContaining(['px-2', 'py-1.5']));
    expect(classes).not.toContain('px-3');
    expect(classes).not.toContain('py-2');
  });
});
