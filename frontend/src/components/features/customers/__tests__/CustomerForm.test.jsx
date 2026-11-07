import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerForm from '@components/features/customers/CustomerForm';
import { useCustomersByPhone } from '@services/customersService';

vi.mock('@services/customersService', () => ({
  useCustomersByPhone: vi.fn(() => ({ data: [] })),
}));

const submitForm = () => fireEvent.submit(document.getElementById('customer-form'));

describe('CustomerForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCustomersByPhone.mockReturnValue({ data: [] });
  });

  it('crea con solo nombre y teléfono', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<CustomerForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '11 5555-1234' } });
    submitForm();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Juan Pérez', phone: '11 5555-1234', address: '' });
  });

  it('exige el teléfono', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<CustomerForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Juan Pérez' } });
    submitForm();

    expect(await screen.findByText('El teléfono es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra la foto plegada y no escribe en la consola', () => {
    const log = vi.spyOn(console, 'log');
    renderWithProviders(<CustomerForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Foto (opcional)').closest('details')).not.toHaveAttribute('open');
    expect(log).not.toHaveBeenCalled();
  });

  it('consulta el teléfono al salir del campo y avisa sin bloquear', async () => {
    useCustomersByPhone.mockImplementation((phone) => ({
      data: phone ? [{ id: 7, name: 'Juan Pérez' }] : [],
    }));
    const onSubmit = vi.fn();
    renderWithProviders(<CustomerForm onSubmit={onSubmit} />);

    const phone = screen.getByLabelText(/Teléfono/);
    fireEvent.change(phone, { target: { value: '1155551234' } });
    expect(screen.queryByText(/Ya existe/)).not.toBeInTheDocument();
    fireEvent.blur(phone);

    expect(useCustomersByPhone).toHaveBeenLastCalledWith('1155551234');
    expect(await screen.findByText(/Ya existe/)).toHaveTextContent('Ya existe Juan Pérez con este teléfono');
    expect(screen.getByRole('link', { name: 'Ver perfil' })).toHaveAttribute('href', '/customers/7');

    fireEvent.change(screen.getByLabelText(/Nombre completo/), { target: { value: 'Ana Pérez' } });
    submitForm();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('no avisa cuando el teléfono es del mismo cliente que se edita', () => {
    useCustomersByPhone.mockReturnValue({ data: [{ id: 7, name: 'Juan Pérez' }] });
    renderWithProviders(
      <CustomerForm onSubmit={vi.fn()} initialData={{ id: 7, name: 'Juan Pérez', phone: '1155551234', email: null }} />,
    );
    fireEvent.blur(screen.getByLabelText(/Teléfono/));
    expect(screen.queryByText(/Ya existe/)).not.toBeInTheDocument();
  });
});
