import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { renderWithProviders } from '@/test/utils';
import CustomerProfile from '@pages/CustomerProfile';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  showCustomerError: vi.fn(),
  showCustomerSuccess: vi.fn(),
  useVehicles: vi.fn(),
}));

vi.mock('@services/customersService', () => ({
  useCustomer: () => ({
    data: { data: { id: 4, name: 'Juan Pérez', phone: '1155551234', email: null, address: null, vehicles_count: 1 } },
    isLoading: false,
    error: null,
  }),
  useUpdateCustomer: () => ({ mutateAsync: mocks.update, isPending: false }),
  customerKeys: { detail: (id) => ['customers', 'detail', id] },
}));
vi.mock('@services/vehiclesService', () => ({ useVehicles: mocks.useVehicles }));
vi.mock('@services/notificationService', () => ({
  showCustomerError: mocks.showCustomerError,
  showCustomerSuccess: mocks.showCustomerSuccess,
  parseApiError: (e) => e.message,
}));
// Componentes pesados con sus propias queries: se prueban por separado
vi.mock('@components/features/customers/CustomerHistoryCard', () => ({ default: () => <div>historial</div> }));
vi.mock('@components/features/customers/CustomerForm', () => ({
  default: ({ onSubmit, formId }) => (
    <form id={formId} onSubmit={(e) => { e.preventDefault(); onSubmit({ name: 'Juan' }); }} />
  ),
}));
vi.mock('@components/features/vehicles/VehicleModal', () => ({
  default: ({ isOpen, customerId, onSuccess }) => (isOpen ? (
    <div role="dialog">
      Nuevo vehículo de {customerId}
      <button type="button" onClick={onSuccess}>Simular guardado</button>
    </div>
  ) : null),
}));

const Location = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname + location.search}</span>;
};

const renderPage = (route = '/customers/4') =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/customers/:id" element={<CustomerProfile />} />
        <Route path="/budgets/new" element={<div>nuevo presupuesto</div>} />
      </Routes>
      <Location />
    </>,
    { route },
  );

describe('CustomerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useVehicles.mockReturnValue({ data: { data: { vehicles: [] } }, isLoading: false, isError: false });
  });

  it('pide los vehículos con último service (sin vista with_customer)', () => {
    renderPage();
    expect(mocks.useVehicles).toHaveBeenCalledWith({ customer_id: '4', per_page: 50, view: null });
  });

  it('informa el error al editar con un toast, sin alert()', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mocks.update.mockRejectedValue(new Error('Email ya existe'));
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Editar/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => expect(mocks.showCustomerError).toHaveBeenCalledWith('ERROR_UPDATE', 'Email ya existe'));
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('con ?addVehicle=1 abre el alta de vehículo y quita el parámetro', async () => {
    renderPage('/customers/4?addVehicle=1');
    expect(await screen.findByRole('dialog')).toHaveTextContent('Nuevo vehículo de 4');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/customers\/4$/));
  });

  it('"Nuevo presupuesto" abre el presupuesto con el cliente elegido', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Nuevo presupuesto/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/budgets/new?customer_id=4');
  });

  it('muestra vehicles_count del detalle del cliente aunque la lista venga recortada', () => {
    mocks.useVehicles.mockReturnValue({
      data: { data: { vehicles: [] } }, isLoading: false, isError: false,
    });
    renderPage();
    expect(screen.getByText(/Cliente #4 · 1 vehículos/)).toBeInTheDocument();
  });

  it('al guardar un vehículo invalida el detalle del cliente (refresca el conteo)', async () => {
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries');
    renderPage('/customers/4?addVehicle=1');
    fireEvent.click(await screen.findByRole('button', { name: 'Simular guardado' }));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['customers', 'detail', '4'] });
    invalidateSpy.mockRestore();
  });
});
