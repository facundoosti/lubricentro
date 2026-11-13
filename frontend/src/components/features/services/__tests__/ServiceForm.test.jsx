import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ServiceForm from '@components/features/services/ServiceForm';

describe('ServiceForm — foco', () => {
  it('los campos usan el estilo común de @ui/Input/Textarea (foco con anillo del design system, sin outline nativo)', () => {
    renderWithProviders(<ServiceForm onSubmit={vi.fn()} />);
    const fields = [...screen.getAllByRole('textbox'), ...screen.queryAllByRole('spinbutton')];
    expect(fields.length).toBe(3);
    fields.forEach((el) => {
      const classes = el.className.split(/\s+/);
      expect(classes).toEqual(expect.arrayContaining(['outline-none', 'focus-visible:ring-2', 'bg-surface-variant']));
    });
  });

  it('cada campo queda asociado a su label', () => {
    renderWithProviders(<ServiceForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Nombre del Servicio/)).toHaveAttribute('id', 'name');
    expect(screen.getByLabelText(/Precio Base/)).toHaveAttribute('id', 'base_price');
    expect(screen.getByLabelText('Descripción').tagName).toBe('TEXTAREA');
  });
});
