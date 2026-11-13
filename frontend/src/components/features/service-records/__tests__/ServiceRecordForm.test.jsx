import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import ServiceRecordForm from '@components/features/service-records/ServiceRecordForm';

vi.mock('@services/vehiclesService', () => ({
  useVehicles: vi.fn(() => ({
    data: { data: { vehicles: [{ id: 5, brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' }] } },
    isLoading: false,
  })),
}));
vi.mock('@services/customersService', () => ({
  useCustomers: vi.fn(() => ({ data: { data: { customers: [] } }, isLoading: false })),
  useCustomer: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

const record = {
  id: 9,
  vehicle_id: 5,
  vehicle: { customer_id: 1, customer: { id: 1, name: 'Ana' } },
  service_date: '2026-10-02',
  next_service_date: '2027-04-02',
  mileage: 85000,
  total_amount: '1000',
  notes: '',
};

const submit = () => fireEvent.submit(document.getElementById('service-record-form'));

describe('ServiceRecordForm', () => {
  it('al editar muestra el vehículo guardado y lo envía sin cambios', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ServiceRecordForm record={record} onSubmit={onSubmit} />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Vehículo/ })).toHaveTextContent('Ford Ka - AB123CD'));
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ vehicle_id: 5 });
  });

  it('sin cliente el vehículo está deshabilitado y es requerido', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ServiceRecordForm onSubmit={onSubmit} />);
    const trigger = screen.getByRole('combobox', { name: /Vehículo/ });
    expect(trigger).toHaveTextContent('Primero selecciona un cliente');
    submit();
    expect(await screen.findByText('Vehículo es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra las fechas guardadas en dd/mm/aaaa y las envía en ISO', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ServiceRecordForm record={record} onSubmit={onSubmit} />);
    expect(screen.getByRole('textbox', { name: /Fecha de atención/ })).toHaveValue('02/10/2026');
    expect(screen.getByRole('textbox', { name: 'Próximo servicio' })).toHaveValue('02/04/2027');
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ service_date: '2026-10-02', next_service_date: '2027-04-02' });
  });

  it('borrar el próximo servicio lo envía como null', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<ServiceRecordForm record={record} onSubmit={onSubmit} />);
    await user.clear(screen.getByRole('textbox', { name: 'Próximo servicio' }));
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ next_service_date: null });
  });

  it('un próximo servicio inválido no se envía y muestra "Fecha inválida"', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<ServiceRecordForm record={record} onSubmit={onSubmit} />);
    const next = screen.getByRole('textbox', { name: 'Próximo servicio' });
    await user.clear(next);
    await user.type(next, '3102');
    submit();
    expect(await screen.findByText('Fecha inválida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe('fecha de hoy', () => {
    afterEach(() => vi.useRealTimers());

    it('a las 22:00 hora local la fecha por defecto es la de hoy (no la UTC del día siguiente)', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 10, 13, 22, 0, 0));
      renderWithProviders(<ServiceRecordForm onSubmit={vi.fn()} />);
      expect(screen.getByRole('textbox', { name: /Fecha de atención/ })).toHaveValue('13/11/2026');
    });
  });
});
