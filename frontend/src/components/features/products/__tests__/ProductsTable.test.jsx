import { screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ProductsTable from '@components/features/products/ProductsTable';
import { useSuppliers } from '@services/suppliersService';
import { useCategories } from '@services/categoriesService';
import { useProductBrands } from '@services/productsService';

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

    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
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

describe('ProductsTable — filtros múltiples (marcas, proveedores, categorías)', () => {
  afterEach(() => {
    [useProductBrands, useSuppliers, useCategories].forEach((hook) => hook.mockReturnValue({ data: null, isLoading: false }));
  });

  const filterTrigger = (placeholder) => screen.getByText(placeholder).closest('[role="combobox"]');

  it.each([
    ['Marcas...', 'Shell', { brand: ['Shell'] }],
    ['Proveedores...', 'Distribuidora Sur', { supplier_id: ['7'] }],
    ['Categorías...', 'Filtros de aire', { category_id: ['4'] }],
  ])('elegir en "%s" la opción "%s" llama onFilterChange con %o', async (placeholder, option, expected) => {
    useProductBrands.mockReturnValue({ data: { data: { brands: ['Shell', 'YPF'] } }, isLoading: false });
    useSuppliers.mockReturnValue({ data: { data: { suppliers: [{ id: 7, name: 'Distribuidora Sur' }] } }, isLoading: false });
    useCategories.mockReturnValue({
      data: { data: { categories: [{ id: 3, name: 'Filtros', parent_id: null }, { id: 4, name: 'Filtros de aire', parent_id: 3 }] } },
      isLoading: false,
    });
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    renderTable({ onFilterChange });

    await user.click(filterTrigger(placeholder));
    const list = await screen.findByRole('listbox');
    await user.click(within(list).getByRole('option', { name: option }));
    expect(onFilterChange).toHaveBeenLastCalledWith(expected);
  });

  it('con valores elegidos los muestra como chips y quitar uno llama onFilterChange sin él', async () => {
    useProductBrands.mockReturnValue({ data: { data: { brands: ['Shell', 'YPF'] } }, isLoading: false });
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    renderTable({ onFilterChange, brands: ['Shell', 'YPF'] });
    await user.click(screen.getAllByRole('button', { name: 'Quitar Shell' })[0]);
    await waitFor(() => expect(onFilterChange).toHaveBeenCalledWith({ brand: ['YPF'] }));
  });
});
