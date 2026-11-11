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

describe('ProductsTable — zoom de imágenes', () => {
  const withImages = [
    { ...products[0], image_url: 'https://img.test/aceite.jpg' },
    { ...products[1], image_url: 'https://img.test/neumatico.jpg' },
    { id: 3, name: 'Filtro sin foto', sku: 'F1', stock: 1, active: true, unit_price: '1.0', iva_rate: '21.0', unit_price_with_iva: '1.21' },
  ];

  it('abre el visor al clickear la imagen y navega entre productos con imagen', () => {
    renderTable({ products: withImages });
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ampliar imagen de Aceite 10W40' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: 'Aceite 10W40' })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Imagen siguiente' }));
    expect(within(dialog).getByText('2 / 2')).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: 'Neumático 175' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument();
  });

  it('hace zoom al clickear la imagen y cierra con Escape', () => {
    renderTable({ products: withImages });
    fireEvent.click(screen.getByRole('button', { name: 'Ampliar imagen de Neumático 175' }));
    const img = within(screen.getByRole('dialog')).getByRole('img', { name: 'Neumático 175' });

    expect(img.style.transform).toBe('scale(1)');
    fireEvent.click(img);
    expect(img.style.transform).toBe('scale(2.5)');
    fireEvent.click(img);
    expect(img.style.transform).toBe('scale(1)');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('no ofrece zoom para productos sin imagen', () => {
    renderTable({ products: withImages });
    expect(screen.queryByRole('button', { name: /Ampliar imagen de Filtro/ })).toBeNull();
  });
});

describe('ProductsTable — nombres largos', () => {
  it('muestra el nombre completo en el tooltip (el texto se recorta a 2 líneas)', () => {
    const name = 'Filtro de aire pesado WAP-203 - JOHN DEERE 9900 Algodonera JD 540 - JD 540A JD 440c - JD 540B JD 450E - CATERPILLAR 950 - KOMATSU WA200 - NEW HOLLAND W130 - Equivalencias MANN C 23 610 - BALDWIN PA 1890';
    renderTable({ products: [{ ...products[0], name }] });
    expect(screen.getByTitle(name)).toHaveTextContent(name);
  });
});
