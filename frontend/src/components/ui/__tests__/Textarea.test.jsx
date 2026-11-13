import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Textarea from '@ui/Textarea';

describe('Textarea', () => {
  it('mismo estilo que Input, 3 filas y sin redimensionar por defecto', () => {
    render(<Textarea aria-label="Notas" />);
    const textarea = screen.getByRole('textbox', { name: 'Notas' });
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveClass('px-3', 'py-2', 'bg-surface-variant', 'border-outline-variant', 'resize-none');
    expect(textarea).toHaveAttribute('rows', '3');
  });

  it('respeta rows y resize', () => {
    render(<Textarea aria-label="Notas" rows={5} resize />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).not.toHaveClass('resize-none');
  });

  it('error → aria-invalid (el borde rojo sale de aria-invalid:border-error)', () => {
    render(<Textarea aria-label="Notas" error />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveClass('aria-invalid:border-error');
  });

  it('reenvía ref', () => {
    const ref = createRef();
    render(<Textarea aria-label="Notas" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });
});
