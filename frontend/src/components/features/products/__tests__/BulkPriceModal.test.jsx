import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import BulkPriceModal from '@components/features/products/BulkPriceModal';

vi.mock('@services/suppliersService', () => ({
  useSuppliers: () => ({ data: { data: { suppliers: [{ id: 3, name: 'BERAL SRL' }, { id: 4, name: 'MAXOIL' }] } } }),
}));
vi.mock('@services/categoriesService', () => ({
  useCategories: () => ({ data: { data: { categories: [{ id: 7, name: 'Aceites', parent_id: null }, { id: 8, name: 'Filtros', parent_id: null }] } } }),
}));
const previewMock = vi.hoisted(() => vi.fn());
vi.mock('@services/productsService', () => ({
  useBulkPricePreview: () => ({ mutateAsync: previewMock, isPending: false }),
  useBulkPriceUpdate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useProducts: () => ({ data: null, isLoading: false }),
  useProductBrands: () => ({ data: { data: { brands: ['PETRONAS', 'WEGA'] } }, isLoading: false }),
}));
vi.mock('@services/notificationService', () => ({ showSuccess: vi.fn(), showError: vi.fn(), parseApiError: () => 'err' }));

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
    expect(screen.getByRole('dialog', { name: 'Actualizar precios por lote' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 15')).toHaveValue(15);
  });

  it('Escape cierra', () => {
    const onClose = renderModal();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('se renderiza en un portal en document.body, con foco dentro y scroll bloqueado', async () => {
    renderModal();
    const dialog = screen.getByRole('dialog', { name: 'Actualizar precios por lote' });
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

describe('BulkPriceModal — filtros (modo libre)', () => {
  beforeEach(() => previewMock.mockReset());

  const pick = async (user, field, label) => {
    await user.click(screen.getByRole('combobox', { name: field }));
    await user.click(await screen.findByRole('option', { name: label }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  };

  it('combina marca, categoría y proveedor en la vista previa', async () => {
    const user = userEvent.setup();
    previewMock.mockResolvedValue({ data: { previews: [] } });
    renderWithProviders(<BulkPriceModal isOpen onClose={vi.fn()} />);

    await pick(user, 'Marca', 'PETRONAS');
    await pick(user, 'Categoría', 'Aceites');
    await pick(user, 'Proveedor', 'MAXOIL');
    fireEvent.change(screen.getByPlaceholderText('Ej: 15'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /Vista previa/ }));

    await waitFor(() => expect(previewMock).toHaveBeenCalled());
    expect(previewMock.mock.calls[0][0]).toMatchObject({
      brand: 'PETRONAS', category_id: '7', supplier_id: '4', adjustment_value: '15',
    });
    expect(await screen.findByText(/marca: PETRONAS · categoría: Aceites · proveedor: MAXOIL/)).toBeInTheDocument();
  });

  it('sin criterio ni valor deshabilita la vista previa y explica por qué', () => {
    renderWithProviders(<BulkPriceModal isOpen onClose={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /Vista previa/ });
    expect(btn).toBeDisabled();
    expect(screen.getByText('Elegí al menos un criterio para filtrar productos')).toBeInTheDocument();
  });
});

describe('BulkPriceModal — filtros del listado (target)', () => {
  beforeEach(() => previewMock.mockReset());

  it('manda categoría y stock del listado (antes se perdían)', async () => {
    previewMock.mockResolvedValue({ data: { previews: [] } });
    renderWithProviders(
      <BulkPriceModal isOpen onClose={vi.fn()} target={{ type: 'filters', search: '', brand: 'WEGA', supplierId: '', categoryId: '8', active: 'true' }} />,
    );
    expect(screen.getByText(/marca: WEGA · categoría: Filtros · con stock/)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Ej: 15'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: /Vista previa/ }));
    await waitFor(() => expect(previewMock).toHaveBeenCalled());
    expect(previewMock.mock.calls[0][0]).toMatchObject({ brand: 'WEGA', category_id: '8', active: 'true', adjustment_value: '-5' });
  });
});
