import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { renderWithProviders } from '@/test/utils';
import IvaRateSelect from '@components/features/items/IvaRateSelect';

const Controlled = ({ initial, onChange = () => {} }) => {
  const [value, setValue] = useState(initial);
  return (
    <IvaRateSelect
      aria-label="% IVA línea 1"
      value={value}
      onChange={(v) => { setValue(v); onChange(v); }}
    />
  );
};

const optionLabels = (select) => within(select).getAllByRole('option').map((o) => o.textContent);

describe('IvaRateSelect', () => {
  it('ofrece 21% · 10,5% · Sin IVA', () => {
    renderWithProviders(<Controlled initial="21" />);
    const select = screen.getByRole('combobox', { name: '% IVA línea 1' });
    expect(optionLabels(select)).toEqual(['21%', '10,5%', 'Sin IVA']);
    expect(select).toHaveValue('21');
  });

  it('normaliza el valor de la API y trata null como "Sin IVA"', () => {
    renderWithProviders(<IvaRateSelect value="10.5" onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: '% IVA' })).toHaveValue('10.5');
  });

  it('avisa el valor elegido', () => {
    const onChange = vi.fn();
    renderWithProviders(<Controlled initial="21" onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: '% IVA línea 1' });
    fireEvent.change(select, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
    expect(select).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Sin IVA' }).selected).toBe(true);
  });

  it('muestra un % guardado fuera de la lista como "(anterior)" y lo conserva', () => {
    renderWithProviders(<Controlled initial="15.0" />);
    const select = screen.getByRole('combobox', { name: '% IVA línea 1' });
    expect(optionLabels(select)).toEqual(['21%', '10,5%', 'Sin IVA', '15% (anterior)']);
    expect(select).toHaveValue('15');
    expect(screen.getByRole('option', { name: '15% (anterior)' }).selected).toBe(true);

    fireEvent.change(select, { target: { value: '21' } });
    expect(select).toHaveValue('21');
    expect(optionLabels(select)).toContain('15% (anterior)');
  });
});

describe('IvaRateSelect — % anterior que llega después del montaje', () => {
  it('agrega "(anterior)" al recibir un % no estándar por un reset y lo mantiene al elegir otro', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(<IvaRateSelect aria-label="% IVA línea 1" value="21" onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: '% IVA línea 1' });
    expect(optionLabels(select)).toEqual(['21%', '10,5%', 'Sin IVA']);

    rerender(<IvaRateSelect aria-label="% IVA línea 1" value="15" onChange={onChange} />);
    expect(optionLabels(select)).toEqual(['21%', '10,5%', 'Sin IVA', '15% (anterior)']);
    expect(select).toHaveValue('15');

    fireEvent.change(select, { target: { value: '21' } });
    expect(onChange).toHaveBeenCalledWith('21');
    rerender(<IvaRateSelect aria-label="% IVA línea 1" value="21" onChange={onChange} />);
    expect(select).toHaveValue('21');
    expect(optionLabels(select)).toContain('15% (anterior)');
  });
});
