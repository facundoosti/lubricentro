import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import IvaRateInput from '@components/features/items/IvaRateInput';

describe('IvaRateInput', () => {
  it('es un campo numérico de 0 a 99,99 con placeholder "Sin IVA"', () => {
    renderWithProviders(<IvaRateInput defaultValue="21" />);
    const input = screen.getByLabelText('% IVA');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '99.99');
    expect(input).toHaveAttribute('step', '0.01');
    expect(input).toHaveAttribute('placeholder', 'Sin IVA');
    expect(input).toHaveValue(21);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('acepta un % libre y vacío', () => {
    const onChange = vi.fn();
    renderWithProviders(<IvaRateInput aria-label="% IVA línea 1" onChange={onChange} />);
    const input = screen.getByLabelText('% IVA línea 1');
    fireEvent.change(input, { target: { value: '15.75' } });
    expect(input).toHaveValue(15.75);
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue(null);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('marca el error', () => {
    renderWithProviders(<IvaRateInput invalid />);
    const input = screen.getByLabelText('% IVA');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.className).toMatch(/\bborder-error\b/);
  });
});
