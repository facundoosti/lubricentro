import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('resuelve conflictos de Tailwind y descarta valores falsy', () => {
    const hidden = false;
    expect(cn('px-2', 'px-4', hidden && 'hidden')).toBe('px-4');
  });

  it('acepta objetos y arrays (clsx)', () => {
    expect(cn(['text-sm', { 'font-bold': true, italic: false }])).toBe('text-sm font-bold');
  });
});
