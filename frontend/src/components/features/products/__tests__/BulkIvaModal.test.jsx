import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import BulkIvaModal from '@components/features/products/BulkIvaModal';

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn(), showSuccess: vi.fn(), showError: vi.fn() }));

vi.mock('@services/productsService', () => ({
  useBulkIvaUpdate: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
}));
vi.mock('@services/notificationService', () => ({
  showSuccess: mocks.showSuccess,
  showError: mocks.showError,
  parseApiError: () => 'detalle',
}));

describe('BulkIvaModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica 10,5% a los productos seleccionados', async () => {
    mocks.mutateAsync.mockResolvedValue({ message: 'Alícuota actualizada en 2 producto(s)', data: { updated: 2 } });
    const onClose = vi.fn();
    const onDone = vi.fn();
    renderWithProviders(
      <BulkIvaModal isOpen onClose={onClose} onDone={onDone} count={2} target={{ type: 'ids', ids: [1, 2] }} />,
    );

    expect(screen.getByRole('radio', { name: /10,5%/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar a 2 productos' }));

    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledWith({ iva_rate: 10.5, product_ids: [1, 2] }));
    expect(mocks.showSuccess).toHaveBeenCalledWith('Alícuota actualizada en 2 producto(s)');
    expect(onDone).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('envía los filtros cuando se seleccionaron todos los que coinciden', async () => {
    mocks.mutateAsync.mockResolvedValue({ data: { updated: 40 } });
    renderWithProviders(
      <BulkIvaModal
        isOpen
        onClose={vi.fn()}
        count={40}
        target={{ type: 'filters', search: 'neum', brand: '', supplierId: '3', categoryId: '7', active: '' }}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /21%/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar a 40 productos' }));

    await waitFor(() =>
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        iva_rate: 21, search: 'neum', brand: undefined, supplier_id: '3', category_id: '7', active: undefined,
      }),
    );
  });

  it('pide all=true explícito cuando no hay filtros', async () => {
    mocks.mutateAsync.mockResolvedValue({ data: { updated: 1597 } });
    renderWithProviders(<BulkIvaModal isOpen onClose={vi.fn()} count={1597} target={{ type: 'filters' }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar a 1597 productos' }));

    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ all: true, iva_rate: 10.5 })));
  });

  it('muestra el error y no cierra si falla', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('boom'));
    const onClose = vi.fn();
    renderWithProviders(<BulkIvaModal isOpen onClose={onClose} count={1} target={{ type: 'ids', ids: [1] }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar a 1 producto' }));

    await waitFor(() => expect(mocks.showError).toHaveBeenCalledWith('Error al cambiar el IVA', 'detalle'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('click en el fondo no cierra; Escape sí', () => {
    const onClose = vi.fn();
    renderWithProviders(<BulkIvaModal isOpen onClose={onClose} count={2} target={{ type: 'ids', ids: [1, 2] }} />);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Cambiar IVA' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

