import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import BulkPriceModal from '@components/features/products/BulkPriceModal';

vi.mock('@services/suppliersService', () => ({
  useSuppliers: () => ({ data: { data: { suppliers: [{ id: 3, name: 'BERAL SRL' }, { id: 4, name: 'MAXOIL' }] } } }),
}));
const previewMock = vi.hoisted(() => vi.fn());
vi.mock('@services/productsService', () => ({
  useBulkPricePreview: () => ({ mutateAsync: previewMock, isPending: false }),
  useBulkPriceUpdate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useProducts: () => ({ data: null, isLoading: false }),
}));
vi.mock('@services/notificationService', () => ({ showSuccess: vi.fn(), showError: vi.fn() }));

const renderModal = (onClose = vi.fn()) => {
  renderWithProviders(<BulkPriceModal isOpen onClose={onClose} target={{ type: 'ids', ids: [1, 2] }} />);
  return onClose;
};

describe('BulkPriceModal — cierre', () => {
  beforeEach(() => {
    previewMock.mockReset();
  });

  // Base UI detecta el click en el fondo en pointerdown/mousedown
  const pressBackdrop = () => {
    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.pointerDown(backdrop);
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
  };

  it('click en el fondo no cierra y conserva el valor cargado', () => {
    const onClose = renderModal();
    const input = screen.getByPlaceholderText('Ej: 15');
    fireEvent.change(input, { target: { value: '15' } });

    pressBackdrop();

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Actualización de Precios por Lote' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 15')).toHaveValue(15);
  });

  it('Escape cierra', () => {
    const onClose = renderModal();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se renderiza en un portal en document.body, con foco dentro y scroll bloqueado', async () => {
    renderModal();
    const dialog = screen.getByRole('dialog', { name: 'Actualización de Precios por Lote' });
    expect(dialog.closest('[data-base-ui-portal]').parentElement).toBe(document.body);
    await waitFor(() => expect(dialog).toHaveFocus());
    await waitFor(() => expect(document.documentElement.style.overflowY || document.body.style.overflowY).toBe('hidden'));
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

describe('BulkPriceModal — proveedor (modo libre)', () => {
  beforeEach(() => previewMock.mockReset());

  const pick = async (user, label) => {
    await user.click(screen.getByRole('combobox', { name: 'Proveedor' }));
    await user.click(await screen.findByRole('option', { name: label }));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  };

  it('elegir un proveedor lo manda en la vista previa; "Todos los proveedores" lo quita', async () => {
    const user = userEvent.setup();
    previewMock.mockResolvedValue({ data: { previews: [] } });
    renderWithProviders(<BulkPriceModal isOpen onClose={vi.fn()} />);
    const trigger = screen.getByRole('combobox', { name: 'Proveedor' });
    expect(trigger).toHaveTextContent('Todos los proveedores');
    expect(trigger).toHaveAttribute('id', 'bulk-price-supplier');
    expect(screen.getByText('Proveedor', { selector: 'label' })).toHaveAttribute('for', 'bulk-price-supplier');

    await pick(user, 'MAXOIL');
    expect(trigger).toHaveTextContent('MAXOIL');
    fireEvent.change(screen.getByPlaceholderText('Ej: 15'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /Vista previa/ }));
    await waitFor(() => expect(previewMock).toHaveBeenCalled());
    expect(previewMock.mock.calls[0][0]).toMatchObject({ supplier_id: '4', adjustment_value: '15' });
  });

  it('volver a "Todos los proveedores" deja el filtro vacío (pide otro criterio)', async () => {
    const user = userEvent.setup();
    const { showError } = await import('@services/notificationService');
    renderWithProviders(<BulkPriceModal isOpen onClose={vi.fn()} />);
    await pick(user, 'BERAL SRL');
    await pick(user, 'Todos los proveedores');
    expect(screen.getByRole('combobox', { name: 'Proveedor' })).toHaveTextContent('Todos los proveedores');
    fireEvent.change(screen.getByPlaceholderText('Ej: 15'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /Vista previa/ }));
    expect(showError).toHaveBeenCalledWith('Criterio requerido', expect.any(String));
    expect(previewMock).not.toHaveBeenCalled();
  });
});
