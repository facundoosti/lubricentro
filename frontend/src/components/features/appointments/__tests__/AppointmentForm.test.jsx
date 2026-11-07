import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import AppointmentForm from '@components/features/appointments/AppointmentForm';

vi.mock('@services/vehiclesService', () => ({
  useVehicles: vi.fn(() => ({ data: { data: { vehicles: [] } }, isLoading: false, error: null })),
}));
vi.mock('@services/customersService', () => ({
  useCustomers: vi.fn(() => ({ data: { data: { customers: [] } }, isLoading: false })),
  useCustomer: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

const submitEmpty = () => {
  const onSubmit = vi.fn();
  const { container } = renderWithProviders(<AppointmentForm onSubmit={onSubmit} />);
  fireEvent.submit(container.querySelector('form'));
  return { onSubmit, container };
};

describe('AppointmentForm — errores de validación', () => {
  it('muestra el error de "Cliente" aunque también falte el vehículo', async () => {
    const { onSubmit } = submitEmpty();
    expect(await screen.findByText('Cliente es requerido')).toBeInTheDocument();
    expect(screen.getByText('Vehículo es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('marca en rojo el buscador de cliente y el select de vehículo', async () => {
    const { container } = submitEmpty();
    await screen.findByText('Vehículo es requerido');
    const vehicleSelect = container.querySelector('select[name="vehicle_id"]');
    expect(vehicleSelect).toHaveAttribute('aria-invalid', 'true');
    expect(vehicleSelect.className).toMatch(/\bborder-error\b/);
    expect(vehicleSelect.className).not.toMatch(/\bborder-outline-variant\b/);
    const customer = screen.getByPlaceholderText('Buscar cliente por nombre o email...');
    await waitFor(() => expect(customer).toHaveAttribute('aria-invalid', 'true'));
    expect(customer.className).toMatch(/\bborder-error\b/);
  });
});
