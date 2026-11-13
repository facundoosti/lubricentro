import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ProductSearchInput from '@components/features/products/ProductSearchInput';
import Dialog from '@ui/Dialog';

vi.mock('@services/productsService', () => ({
  useProducts: () => ({ data: null, isLoading: true }),
}));

describe('ProductSearchInput — Escape', () => {
  it('dentro de un Dialog, Escape con la lista abierta cierra solo la lista; con la lista cerrada cierra el Dialog', () => {
    const close = vi.fn();
    renderWithProviders(
      <Dialog isOpen onClose={close} title="Precios" closeOnBackdrop={false}>
        <ProductSearchInput onChange={vi.fn()} onSelect={vi.fn()} />
      </Dialog>,
    );
    const input = screen.getByPlaceholderText('Buscar producto...');
    fireEvent.change(input, { target: { value: 'ace' } });
    expect(screen.getByText('Buscando...')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Buscando...')).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
