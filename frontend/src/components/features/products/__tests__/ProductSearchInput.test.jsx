import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ProductSearchInput from '@components/features/products/ProductSearchInput';
import Modal from '@ui/Modal';

vi.mock('@services/productsService', () => ({
  useProducts: () => ({ data: null, isLoading: true }),
}));

describe('ProductSearchInput — Escape', () => {
  it('dentro de un Modal, Escape con la lista abierta cierra solo la lista; con la lista cerrada cierra el Modal', () => {
    const close = vi.fn();
    renderWithProviders(
      <Modal isOpen onClose={close} title="Precios">
        <ProductSearchInput onChange={vi.fn()} onSelect={vi.fn()} />
      </Modal>,
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
