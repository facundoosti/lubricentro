import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ProductSearchInput from '@components/features/products/ProductSearchInput';
import Dialog from '@ui/Dialog';
import { useProducts } from '@services/productsService';

vi.mock('@services/productsService', () => ({ useProducts: vi.fn() }));

const OIL = { id: 1, name: 'Aceite 10W40', sku: 'AC-1', unit_price: '1500', unit: 'lt' };
const OIL2 = { id: 2, name: 'Aceite 5W30', sku: 'AC-2', unit_price: '2000' };

const mockProducts = (products, { loading = false } = {}) => {
  useProducts.mockImplementation(({ search }) => ({
    data: search && !loading ? { data: { products } } : undefined,
    isLoading: loading,
  }));
};

const input = () => screen.getByPlaceholderText('Buscar producto...');

describe('ProductSearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProducts([OIL, OIL2]);
  });

  it('↓ Enter elige el primer producto, muestra su nombre y cierra la lista', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onChange = vi.fn();
    renderWithProviders(<ProductSearchInput onChange={onChange} onSelect={onSelect} />);
    await user.type(input(), 'aceite');
    await screen.findByRole('option', { name: /Aceite 10W40/ });
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(OIL);
    expect(onChange).toHaveBeenLastCalledWith('Aceite 10W40');
    expect(input()).toHaveValue('Aceite 10W40');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('texto libre: avisa cada cambio con onChange sin elegir', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<ProductSearchInput onChange={onChange} onSelect={onSelect} />);
    await user.type(input(), 'fil');
    expect(onChange).toHaveBeenLastCalledWith('fil');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('sin resultados muestra el texto buscado', async () => {
    mockProducts([]);
    const user = userEvent.setup();
    renderWithProviders(<ProductSearchInput />);
    await user.type(input(), 'zzz');
    expect(await screen.findByText('Sin resultados para "zzz"')).toBeInTheDocument();
  });

  it('Escape con la lista cerrada no vacía el texto', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<ProductSearchInput value="Aceite 10W40" onChange={onChange} onSelect={onSelect} />);
    input().focus();
    await user.keyboard('{Escape}');
    expect(onChange).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(input()).toHaveValue('Aceite 10W40');
  });

  it('después de elegir, tipear de nuevo no muestra \'Sin resultados para ""\'', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductSearchInput />);
    await user.type(input(), 'aceite');
    await user.click(await screen.findByRole('option', { name: /Aceite 10W40/ }));
    await user.type(input(), 'x');
    expect(screen.queryByText('Sin resultados para ""')).not.toBeInTheDocument();
  });

  it('limpiar vacía el campo y avisa con "" / null', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<ProductSearchInput value="aceite" onChange={onChange} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(onChange).toHaveBeenCalledWith('');
    expect(onSelect).toHaveBeenCalledWith(null);
    expect(input()).toHaveValue('');
  });

  it('dentro de un Dialog, Escape con la lista abierta cierra solo la lista', async () => {
    mockProducts([], { loading: true });
    const user = userEvent.setup();
    const close = vi.fn();
    renderWithProviders(
      <Dialog isOpen onClose={close} title="Precios" closeOnBackdrop={false}>
        <ProductSearchInput onChange={vi.fn()} onSelect={vi.fn()} />
      </Dialog>,
    );
    await user.type(input(), 'ace');
    expect(await screen.findByText('Buscando...')).toBeInTheDocument();
    await act(async () => { await user.keyboard('{Escape}'); });
    await waitFor(() => expect(screen.queryByText('Buscando...')).not.toBeInTheDocument());
    expect(close).not.toHaveBeenCalled();
    expect(input()).toHaveValue('ace');
  });
});
