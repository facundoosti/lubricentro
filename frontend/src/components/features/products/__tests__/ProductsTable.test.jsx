import { screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ProductsTable from '@components/features/products/ProductsTable';

vi.mock('@services/suppliersService', () => ({ useSuppliers: vi.fn(() => ({ data: null, isLoading: false })) }));
vi.mock('@services/categoriesService', () => ({ useCategories: vi.fn(() => ({ data: null, isLoading: false })) }));
vi.mock('@services/productsService', () => ({ useProductBrands: vi.fn(() => ({ data: null, isLoading: false })) }));

const products = [
  { id: 1, name: 'Aceite 10W40', sku: 'A1', stock: 3, active: true, unit_price: '10000.0', iva_rate: '21.0', unit_price_with_iva: '12100.0' },
  { id: 2, name: 'Neumático 175', sku: 'N1', stock: 2, active: true, unit_price: '10000.0', iva_rate: '10.5', unit_price_with_iva: '11050.0' },
];

const renderTable = (props = {}) =>
  renderWithProviders(
    <ProductsTable
      products={products}
      pagination={{}}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onCreate={vi.fn()}
      onFilterChange={vi.fn()}
      onPageChange={vi.fn()}
      {...props}
    />,
  );

describe('ProductsTable — IVA', () => {
  it('muestra precio neto, alícuota y precio con IVA', () => {
    renderTable();
    const aceite = screen.getByText('Aceite 10W40').closest('tr');
    expect(within(aceite).getByText('IVA 21%')).toBeInTheDocument();
    expect(within(aceite).getByText(/12\.100/)).toBeInTheDocument();

    const neumatico = screen.getByText('Neumático 175').closest('tr');
    expect(within(neumatico).getByText('IVA 10,5%')).toBeInTheDocument();
    expect(within(neumatico).getByText(/11\.050/)).toBeInTheDocument();
  });

  it('ofrece "Cambiar IVA" en la barra de selección', () => {
    const onBulkIvaSelected = vi.fn();
    renderTable({ someSelected: true, selectedIds: new Set([1]), onBulkIvaSelected });
    fireEvent.click(screen.getByRole('button', { name: /Cambiar IVA/ }));
    expect(onBulkIvaSelected).toHaveBeenCalled();
  });

  it('no muestra "Cambiar IVA" sin selección', () => {
    renderTable({ onBulkIvaSelected: vi.fn() });
    expect(screen.queryByRole('button', { name: /Cambiar IVA/ })).toBeNull();
  });
});
