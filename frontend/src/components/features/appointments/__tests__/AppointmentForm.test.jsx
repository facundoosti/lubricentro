import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
    submitEmpty();
    await screen.findByText('Vehículo es requerido');
    const vehicleSelect = screen.getByRole('combobox', { name: /Vehículo/ });
    expect(vehicleSelect).toHaveAttribute('aria-invalid', 'true');
    expect(vehicleSelect.className).toMatch(/\bborder-error\b/);
    const customer = screen.getByPlaceholderText('Buscar cliente por nombre o correo...');
    await waitFor(() => expect(customer).toHaveAttribute('aria-invalid', 'true'));
    expect(customer.className).toMatch(/\bborder-error\b/);
  });

  it('el error de "Cliente" se muestra una sola vez y queda referenciado por el buscador', async () => {
    submitEmpty();
    const [message] = await screen.findAllByText('Cliente es requerido');
    expect(screen.getAllByText('Cliente es requerido')).toHaveLength(1);
    expect(screen.getByLabelText(/^Cliente/)).toHaveAttribute('aria-describedby', message.id);
  });
});

describe('AppointmentForm — Cliente', () => {
  it('el label "Cliente" queda asociado al input del buscador', () => {
    renderWithProviders(<AppointmentForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/^Cliente/)).toBe(screen.getByPlaceholderText('Buscar cliente por nombre o correo...'));
  });
});

describe('AppointmentForm — Vehículo', () => {
  it('sin cliente el Select de vehículo está deshabilitado y lo pide', () => {
    renderWithProviders(<AppointmentForm onSubmit={vi.fn()} />);
    const trigger = screen.getByRole('combobox', { name: /Vehículo/ });
    expect(trigger).toHaveTextContent('Primero selecciona un cliente');
    expect(trigger).toHaveAttribute('data-disabled');
  });
});

describe('AppointmentForm — Fecha (DateInput)', () => {
  const dateInput = () => screen.getByRole('textbox', { name: /Fecha/ });

  it('arranca con la fecha de hoy en dd/mm/aaaa', () => {
    renderWithProviders(<AppointmentForm onSubmit={vi.fn()} />);
    const today = new Date();
    const expected = [today.getDate(), today.getMonth() + 1].map((n) => String(n).padStart(2, '0')).join('/');
    expect(dateInput()).toHaveValue(`${expected}/${today.getFullYear()}`);
  });

  it('tipear "13112026" muestra 13/11/2026 y el turno sale ese día', async () => {
    useVehicles.mockReturnValue({
      data: { data: { vehicles: [{ id: 5, brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' }] } },
      isLoading: false,
      error: null,
    });
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = renderWithProviders(
      <AppointmentForm
        onSubmit={onSubmit}
        initialData={{ customer_id: 1, customer: { id: 1, name: 'Ana' }, vehicle_id: 5, scheduled_at: '2030-01-15T10:00:00', status: 'scheduled' }}
      />,
    );
    expect(dateInput()).toHaveValue('15/01/2030');
    await user.clear(dateInput());
    await user.type(dateInput(), '13112026');
    expect(dateInput()).toHaveValue('13/11/2026');
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Vehículo/ })).toHaveTextContent('Ford Ka'));
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].scheduled_at).toBe(new Date('2026-11-13T10:00').toISOString());
  });

  it('una fecha incompleta es "Fecha inválida" y no envía', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = renderWithProviders(<AppointmentForm onSubmit={onSubmit} />);
    await user.clear(dateInput());
    await user.type(dateInput(), '1311');
    expect(dateInput()).toHaveValue('13/11');
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Fecha inválida')).toBeInTheDocument();
    expect(dateInput()).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('borrar la fecha y enviar es "Fecha es requerida"', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = renderWithProviders(<AppointmentForm onSubmit={onSubmit} />);
    await user.clear(dateInput());
    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('Fecha es requerida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('tipear sobre la fecha no muestra errores a mitad de tipeo; una parcial avisa recién al salir', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppointmentForm onSubmit={vi.fn()} />);
    // Seleccionar todo y tipear encima, tecla por tecla
    await user.tripleClick(dateInput());
    for (const key of '131120') {
      await user.keyboard(key);
      expect(screen.queryByText('Fecha es requerida')).not.toBeInTheDocument();
      expect(screen.queryByText('Fecha inválida')).not.toBeInTheDocument();
    }
    expect(dateInput()).toHaveValue('13/11/20');
    await user.tab();
    expect(await screen.findByText('Fecha inválida')).toBeInTheDocument();
    // Completarla quita el error
    await user.click(dateInput());
    await user.keyboard('26');
    await waitFor(() => expect(screen.queryByText('Fecha inválida')).not.toBeInTheDocument());
    expect(dateInput()).toHaveValue('13/11/2026');
  });

  it('el botón "Abrir calendario" abre el calendario dentro del formulario', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppointmentForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Abrir calendario' }));
    expect(await screen.findByRole('grid')).toBeInTheDocument();
  });
});

describe('AppointmentForm — pickers y Estado', () => {
  const renderForm = () => renderWithProviders(<AppointmentForm onSubmit={vi.fn()} />);

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
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Vehículo/ })).toHaveTextContent('Ford Ka - AB123CD'));

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
