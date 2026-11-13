import { useState } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Autocomplete from '@ui/Autocomplete';
import Dialog from '@ui/Dialog';

const ITEMS = [
  { id: 1, label: 'Ana Pérez' },
  { id: 2, label: 'Ana Gómez' },
];

const Harness = ({ items = ITEMS, onSearch = vi.fn(), onItemSelect = vi.fn(), ...props }) => {
  const [value, setValue] = useState('');
  return (
    <Autocomplete
      aria-label="Cliente"
      value={value}
      onValueChange={setValue}
      items={items}
      onSearch={onSearch}
      onItemSelect={(item) => { setValue(item.label); onItemSelect(item); }}
      emptyText="No se encontraron clientes"
      clearLabel="Limpiar selección"
      {...props}
    />
  );
};

const input = () => screen.getByRole('combobox', { name: 'Cliente' });

afterEach(() => vi.useRealTimers());

describe('Autocomplete', () => {
  it('↓↓ Enter elige el segundo ítem y cierra la lista', async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(<Harness onItemSelect={onItemSelect} />);
    await user.type(input(), 'Ana');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onItemSelect).toHaveBeenCalledWith(ITEMS[1]);
    expect(input()).toHaveValue('Ana Gómez');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('busca con debounce al tipear y elegir no dispara otra búsqueda', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    await user.type(input(), 'Ana');
    expect(onSearch).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('Ana');
    await user.click(await screen.findByRole('option', { name: 'Ana Pérez' }));
    act(() => { vi.advanceTimersByTime(400); });
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('muestra "Buscando..." y el texto sin resultados', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness items={[]} loading />);
    await user.type(input(), 'Zz');
    expect(await screen.findByText('Buscando...')).toBeInTheDocument();
    rerender(<Harness items={[]} />);
    expect(await screen.findByText('No se encontraron clientes')).toBeInTheDocument();
  });

  it('la acción final se elige con el teclado', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness items={[]} action={{ label: '+ Crear cliente "Carlos"', onSelect }} />);
    await user.type(input(), 'Carlos');
    await screen.findByRole('option', { name: /Crear cliente/ });
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('la acción final se elige con click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness items={[]} action={{ label: '+ Crear cliente "Carlos"', onSelect }} />);
    await user.type(input(), 'Carlos');
    await user.click(await screen.findByRole('option', { name: /Crear cliente/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Escape con la lista cerrada no borra el texto', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Autocomplete aria-label="Cliente" value="Ana" onValueChange={onValueChange} items={[]} />);
    input().focus();
    await user.keyboard('{Escape}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue('Ana');
  });

  it('el ✕ no es enfocable con Tab', () => {
    render(<Autocomplete aria-label="Cliente" value="Ana" items={[]} clearLabel="Limpiar selección" />);
    expect(screen.getByRole('button', { name: 'Limpiar selección' })).toHaveAttribute('tabindex', '-1');
  });

  it('props del input no pisan className ni aria-invalid del wrapper', () => {
    render(<Autocomplete aria-label="Cliente" value="" items={[]} error className="w-full" aria-invalid={false} />);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input().className).toMatch(/\bborder-error\b/);
  });

  it('limpiar llama onClear', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Harness onClear={onClear} />);
    await user.type(input(), 'Ana');
    // Con la lista abierta Base UI marca aria-hidden todo menos input y trigger; el ✕ (tabIndex -1) sigue clickeable
    await user.click(screen.getByRole('button', { name: 'Limpiar selección', hidden: true }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('el input desactiva el autocompletado del navegador', () => {
    render(<Harness />);
    expect(input()).toHaveAttribute('autocomplete', 'off');
  });

  it('dentro de un Dialog, Escape cierra solo la lista', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} title="Vehículo">
        <Harness />
      </Dialog>,
    );
    await user.type(input(), 'Ana');
    const listbox = await screen.findByRole('listbox');
    expect(screen.getByRole('dialog')).toContainElement(listbox);
    await act(async () => { await user.keyboard('{Escape}'); });
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    expect(input()).toHaveValue('Ana');
  });
});
