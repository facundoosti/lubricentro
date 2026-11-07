import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
