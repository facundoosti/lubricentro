import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import ProductForm from '@components/features/products/ProductForm';

vi.mock('@services/suppliersService', () => ({
  useSuppliers: vi.fn(() => ({ data: { data: { suppliers: [] } } })),
}));
vi.mock('@services/categoriesService', () => ({
  useCategories: vi.fn(() => ({ data: { data: { categories: [] } } })),
}));

const submitForm = () => fireEvent.submit(document.getElementById('product-form'));

describe('ProductForm — IVA', () => {
  beforeEach(() => vi.clearAllMocks());

  it('arranca en 21% para un producto nuevo', () => {
    renderWithProviders(<ProductForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('IVA')).toHaveValue('21');
  });

  it('muestra la alícuota del producto que se edita', () => {
    renderWithProviders(
      <ProductForm onSubmit={vi.fn()} product={{ id: 1, name: 'Neumático', unit_price: '1000', iva_rate: '10.5' }} />,
    );
    expect(screen.getByLabelText('IVA')).toHaveValue('10.5');
  });

  it('muestra el precio con IVA mientras se escribe', () => {
    renderWithProviders(<ProductForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Precio sin IVA/), { target: { value: '10000' } });
    expect(screen.getByTestId('price-with-iva')).toHaveTextContent('$12.100');

    fireEvent.change(screen.getByLabelText('IVA'), { target: { value: '10.5' } });
    expect(screen.getByTestId('price-with-iva')).toHaveTextContent('$11.050');
  });

  it('envía la alícuota elegida como número', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    renderWithProviders(<ProductForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Nombre del Producto/), { target: { value: 'Neumático 175' } });
    fireEvent.change(screen.getByLabelText(/Precio sin IVA/), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('IVA'), { target: { value: '10.5' } });
    submitForm();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ iva_rate: 10.5, unit_price: 1000 });
  });
});

describe('ProductForm — nombre', () => {
  beforeEach(() => vi.clearAllMocks());

  const fillAndSubmit = (name) => {
    fireEvent.change(screen.getByLabelText(/Nombre del Producto/), { target: { value: name } });
    fireEvent.change(screen.getByLabelText(/Precio sin IVA/), { target: { value: '1000' } });
    submitForm();
  };

  it('acepta nombres de hasta 500 caracteres', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    renderWithProviders(<ProductForm onSubmit={onSubmit} />);

    const name = 'A'.repeat(500);
    fillAndSubmit(name);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name });
  });

  it('rechaza nombres de más de 500 caracteres', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ProductForm onSubmit={onSubmit} />);

    fillAndSubmit('A'.repeat(501));

    expect(await screen.findByText('El nombre no puede exceder 500 caracteres')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ProductForm — Categoría (Combobox)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useCategories } = await import('@services/categoriesService');
    useCategories.mockReturnValue({
      data: { data: { categories: [{ id: 1, name: 'Aceites', parent_id: null }, { id: 2, name: 'Filtros', parent_id: null }] } },
    });
  });

  it('escribir "Filt" busca en el backend y elegir "Filtros" envía su id', async () => {
    const { useCategories } = await import('@services/categoriesService');
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    renderWithProviders(<ProductForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('combobox', { name: 'Categoría' }));
    await user.type(await screen.findByRole('combobox', { name: 'Buscar' }), 'Filt');
    await waitFor(() => expect(useCategories).toHaveBeenLastCalledWith('Filt'));
    await user.click(screen.getByRole('option', { name: 'Filtros' }));
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveTextContent('Filtros');

    fireEvent.change(screen.getByLabelText(/Nombre del Producto/), { target: { value: 'Filtro de aceite' } });
    fireEvent.change(screen.getByLabelText(/Precio sin IVA/), { target: { value: '1000' } });
    submitForm();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ category_id: '2' });
  });
});
