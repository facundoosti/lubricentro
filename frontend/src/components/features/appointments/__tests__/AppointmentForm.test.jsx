import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import AppointmentForm from '@components/features/appointments/AppointmentForm';
import { useVehicles } from '@services/vehiclesService';

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
    const customer = screen.getByPlaceholderText('Buscar cliente por nombre o correo...');
    await waitFor(() => expect(customer).toHaveAttribute('aria-invalid', 'true'));
    expect(customer.className).toMatch(/\bborder-error\b/);
  });
});

describe('AppointmentForm — pickers y Estado', () => {
  afterEach(() => {
    delete HTMLInputElement.prototype.showPicker;
  });

  const renderForm = () => {
    const showPicker = vi.fn();
    HTMLInputElement.prototype.showPicker = showPicker;
    const utils = renderWithProviders(<AppointmentForm onSubmit={vi.fn()} />);
    return { showPicker, ...utils };
  };

  it('abre el calendario al hacer click en el campo Fecha', async () => {
    const { showPicker, container } = renderForm();
    await userEvent.click(container.querySelector('input[name="scheduled_date"]'));
    expect(showPicker).toHaveBeenCalled();
  });

  it('la Hora es una lista de horas en punto con AM/PM, arranca vacía y permite elegir', async () => {
    const { container } = renderForm();
    expect(container.querySelector('select[name="scheduled_time"]')).toBeNull();
    const trigger = screen.getByRole('combobox', { name: /Hora/ });
    expect(trigger).toHaveTextContent('Seleccionar hora');
    await userEvent.click(trigger);
    const labels = within(await screen.findByRole('listbox')).getAllByRole('option').map((o) => o.textContent);
    expect(labels[0]).toBe('8 AM');
    expect(labels).toContain('12 PM');
    expect(labels.at(-1)).toBe('8 PM');
    expect(labels.every((l) => !l.includes(':'))).toBe(true);
    await userEvent.click(await screen.findByRole('option', { name: '3 PM' }));
    expect(trigger).toHaveTextContent('3 PM');
  });

  it('la Hora es obligatoria', async () => {
    const { container } = renderForm();
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Hora es requerida')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Hora/ }).className).toMatch(/\bborder-error\b/);
  });

  it('Estado usa el dropdown de la app (no un select nativo) y permite cambiarlo', async () => {
    const { container } = renderForm();
    expect(container.querySelector('select[name="status"]')).toBeNull();
    const trigger = screen.getByRole('combobox', { name: 'Estado' });
    expect(trigger).toHaveTextContent('Agendado');
    await userEvent.click(trigger);
    expect(screen.queryByPlaceholderText('Buscar...')).toBeNull();
    await userEvent.click(await screen.findByRole('option', { name: 'Confirmado' }));
    expect(trigger).toHaveTextContent('Confirmado');
  });

  it('Estado se puede manejar con teclado', async () => {
    renderForm();
    const user = userEvent.setup();
    const trigger = screen.getByRole('combobox', { name: 'Estado' });
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Agendado' })).toHaveFocus());
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(trigger).toHaveTextContent('Completado');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('en edición carga estado y hora, y envía el estado elegido', async () => {
    useVehicles.mockReturnValue({
      data: { data: { vehicles: [{ id: 5, brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' }] } },
      isLoading: false,
      error: null,
    });
    const onSubmit = vi.fn();
    const { container } = renderWithProviders(
      <AppointmentForm
        onSubmit={onSubmit}
        initialData={{
          customer_id: 1,
          customer: { id: 1, name: 'Ana' },
          vehicle_id: 5,
          scheduled_at: '2030-01-15T10:30:00',
          status: 'confirmed',
        }}
      />
    );
    const trigger = screen.getByRole('combobox', { name: 'Estado' });
    expect(trigger).toHaveTextContent('Confirmado');
    // turno viejo con minutos: se muestra igual
    expect(screen.getByRole('combobox', { name: /Hora/ })).toHaveTextContent('10:30 AM');
    await waitFor(() => expect(container.querySelector('select[name="vehicle_id"]')).toHaveValue('5'));

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'Completado' }));
    await userEvent.click(screen.getByRole('combobox', { name: /Hora/ }));
    await userEvent.click(await screen.findByRole('option', { name: '3 PM' }));
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ status: 'completed', vehicle_id: '5' });
    expect(onSubmit.mock.calls[0][0].scheduled_at).toBe(new Date('2030-01-15T15:00').toISOString());
  });
});
