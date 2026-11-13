import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const trigger = (name = '% IVA línea 1') => screen.getByRole('combobox', { name });

const openOptions = async (user, name) => {
  await user.click(trigger(name));
  await screen.findByRole('listbox');
  return screen.getAllByRole('option').map((o) => o.textContent);
};

const choose = async (user, label, name) => {
  await user.click(trigger(name));
  await user.click(await screen.findByRole('option', { name: label }));
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
};

describe('IvaRateSelect', () => {
  it('ofrece 21% · 10,5% · Sin IVA', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Controlled initial="21" />);
    expect(trigger()).toHaveTextContent('21%');
    expect(await openOptions(user)).toEqual(['21%', '10,5%', 'Sin IVA']);
  });

  it('normaliza el valor de la API y trata null como "Sin IVA"', () => {
    const { unmount } = renderWithProviders(<IvaRateSelect value="10.5" onChange={() => {}} />);
    expect(trigger('% IVA')).toHaveTextContent('10,5%');
    unmount();
    renderWithProviders(<IvaRateSelect value={null} onChange={() => {}} />);
    expect(trigger('% IVA')).toHaveTextContent('Sin IVA');
  });

  it('avisa el valor elegido ("" para Sin IVA)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<Controlled initial="21" onChange={onChange} />);
    await choose(user, 'Sin IVA');
    // El centinela interno ('none') nunca llega al consumidor
    expect(onChange).toHaveBeenCalledWith('');
    expect(onChange).not.toHaveBeenCalledWith('none');
    expect(trigger()).toHaveTextContent('Sin IVA');
  });

  it('muestra un % guardado fuera de la lista como "(anterior)" y lo conserva', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Controlled initial="15.0" />);
    expect(trigger()).toHaveTextContent('15% (anterior)');
    expect(await openOptions(user)).toEqual(['21%', '10,5%', 'Sin IVA', '15% (anterior)']);
    await user.click(screen.getByRole('option', { name: '21%' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent('21%');
    expect(await openOptions(user)).toContain('15% (anterior)');
  });
});

describe('IvaRateSelect — % anterior que llega después del montaje', () => {
  it('agrega "(anterior)" al recibir un % no estándar por un reset y lo mantiene al elegir otro', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(<IvaRateSelect aria-label="% IVA línea 1" value="21" onChange={onChange} />);
    expect(await openOptions(user)).toEqual(['21%', '10,5%', 'Sin IVA']);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    rerender(<IvaRateSelect aria-label="% IVA línea 1" value="15" onChange={onChange} />);
    expect(trigger()).toHaveTextContent('15% (anterior)');
    expect(await openOptions(user)).toEqual(['21%', '10,5%', 'Sin IVA', '15% (anterior)']);
    await user.click(screen.getByRole('option', { name: '21%' }));
    expect(onChange).toHaveBeenCalledWith('21');
    rerender(<IvaRateSelect aria-label="% IVA línea 1" value="21" onChange={onChange} />);
    expect(trigger()).toHaveTextContent('21%');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(await openOptions(user)).toContain('15% (anterior)');
  });
});
