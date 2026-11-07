import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import { useCustomers, useCustomer } from '@services/customersService';

vi.mock('@services/customersService', () => ({
  useCustomers: vi.fn(() => ({ data: { data: { customers: [] } }, isLoading: false })),
  useCustomer: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

describe('CustomerSearchInput — crear cliente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCustomers.mockReturnValue({ data: { data: { customers: [] } }, isLoading: false });
  });

  it('ofrece crear un cliente con el texto buscado', async () => {
    const onCreateNew = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Carlos Ruiz' } });

    const option = await screen.findByRole('button', { name: /Crear cliente "Carlos Ruiz"/ });
    fireEvent.click(option);
    expect(onCreateNew).toHaveBeenCalledWith('Carlos Ruiz');
  });

  it('no ofrece crear sin la prop onCreateNew', () => {
    renderWithProviders(<CustomerSearchInput value="" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Carlos' } });
    expect(screen.queryByText(/Crear cliente/)).not.toBeInTheDocument();
  });

  it('muestra los resultados y también la opción de crear', async () => {
    useCustomers.mockReturnValue({
      data: { data: { customers: [{ id: 1, name: 'Carlos Ruiz', phone: '1155551234' }] } },
      isLoading: false,
    });
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Carlos' } });
    await waitFor(() => expect(screen.getByText('1155551234')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Crear cliente "Carlos"/ })).toBeInTheDocument();
  });

  it('sin resultados, flecha abajo + Enter elige "+ Crear cliente"', async () => {
    const onCreateNew = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Carlos Ruiz' } });
    await screen.findByRole('button', { name: /Crear cliente "Carlos Ruiz"/ });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreateNew).toHaveBeenCalledWith('Carlos Ruiz');
  });

  it('con resultados, "+ Crear cliente" es la opción después del último cliente', async () => {
    useCustomers.mockReturnValue({
      data: { data: { customers: [{ id: 1, name: 'Carlos Ruiz', phone: '1155551234' }] } },
      isLoading: false,
    });
    const onCreateNew = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} onSelect={onSelect} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Carlos' } });
    await waitFor(() => expect(screen.getByText('1155551234')).toBeInTheDocument());

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // no pasa de la última opción
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreateNew).toHaveBeenCalledWith('Carlos');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('carga el cliente por id (respuesta de /customers/:id con el cliente en data)', async () => {
    useCustomer.mockReturnValue({ data: { data: { id: 7, name: 'Juan Pérez', phone: '1155551234' } }, isLoading: false });
    renderWithProviders(<CustomerSearchInput value="7" />);
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('Juan Pérez - 1155551234'));
  });
});
