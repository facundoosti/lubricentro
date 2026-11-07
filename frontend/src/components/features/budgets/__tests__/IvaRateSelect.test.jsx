import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import IvaRateSelect from '@components/features/budgets/IvaRateSelect';

describe('IvaRateSelect', () => {
  it('ofrece 21%, 10,5% y Sin IVA', () => {
    renderWithProviders(<IvaRateSelect value="21" onChange={vi.fn()} />);
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['21%', '10,5%', 'Sin IVA']);
  });

  it('normaliza el valor que viene de la API', () => {
    const { rerender } = renderWithProviders(<IvaRateSelect value="10.5" onChange={vi.fn()} />);
    expect(screen.getByLabelText('IVA')).toHaveValue('10.5');
    rerender(<IvaRateSelect value={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText('IVA')).toHaveValue('');
  });

  it('avisa el cambio', () => {
    const onChange = vi.fn();
    renderWithProviders(<IvaRateSelect value="21" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('IVA'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });
});
