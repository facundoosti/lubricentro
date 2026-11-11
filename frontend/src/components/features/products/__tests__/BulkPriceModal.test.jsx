import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import BulkPriceModal from '@components/features/products/BulkPriceModal';

vi.mock('@services/suppliersService', () => ({
  useSuppliers: () => ({ data: { data: { suppliers: [] } } }),
}));
const previewMock = vi.hoisted(() => vi.fn());
vi.mock('@services/productsService', () => ({
  useBulkPricePreview: () => ({ mutateAsync: previewMock, isPending: false }),
  useBulkPriceUpdate: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@services/notificationService', () => ({ showSuccess: vi.fn(), showError: vi.fn() }));

const renderModal = (onClose = vi.fn()) => {
  renderWithProviders(<BulkPriceModal isOpen onClose={onClose} target={{ type: 'ids', ids: [1, 2] }} />);
  return onClose;
};

describe('BulkPriceModal — cierre', () => {
  beforeEach(() => {
    previewMock.mockReset();
    document.body.style.overflow = '';
  });

  it('click en el fondo no cierra y conserva el valor cargado', () => {
    const onClose = renderModal();
    const input = screen.getByPlaceholderText('Ej: 15');
    fireEvent.change(input, { target: { value: '15' } });

    fireEvent.click(screen.getByTestId('bulk-price-backdrop'));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Actualización de Precios por Lote' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 15')).toHaveValue(15);
  });

  it('Escape cierra', () => {
    const onClose = renderModal();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se renderiza en document.body con foco dentro y scroll bloqueado', () => {
    renderModal();
    const dialog = screen.getByRole('dialog', { name: 'Actualización de Precios por Lote' });
    expect(dialog).toHaveFocus();
    expect(screen.getByTestId('bulk-price-backdrop').parentElement.parentElement).toBe(document.body);
    expect(document.body.style.overflow).toBe('hidden');
  });
});

describe('BulkPriceModal — vista previa con nombres largos', () => {
  beforeEach(() => previewMock.mockReset());

  it('muestra el nombre completo en el tooltip', async () => {
    const name = 'Filtro de aire pesado WAP-203 - JOHN DEERE 9900 Algodonera JD 540 - JD 540A JD 440c - JD 540B JD 450E - CATERPILLAR 950 - KOMATSU WA200 - NEW HOLLAND W130 - Equivalencias MANN C 23 610 - BALDWIN PA 1890';
    previewMock.mockResolvedValue({ data: { previews: [{ id: 1, sku: 'WAP-203', name, current_price: 100, new_price: 115 }] } });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText('Ej: 15'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /Vista previa/ }));
    expect(await screen.findByTitle(name)).toHaveTextContent(name);
  });
});
