import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerVehiclesCard from '@components/features/customers/CustomerVehiclesCard';

const vehicles = [
  { id: 10, brand: 'Ford', model: 'Ka', year: '2015', license_plate: 'AB123CD', last_service_date: '2026-08-15', last_mileage: 52000 },
  { id: 11, brand: 'Fiat', model: 'Uno', year: '1986', license_plate: 'ABC123', last_service_date: null, last_mileage: null },
];

const renderCard = (props = {}) =>
  renderWithProviders(
    <CustomerVehiclesCard customerId={4} vehicles={vehicles} onAddVehicle={vi.fn()} onEditVehicle={vi.fn()} {...props} />,
  );

describe('CustomerVehiclesCard', () => {
  it('muestra el último service y km, o "Sin services"', () => {
    renderCard();
    expect(screen.getByText('Último service: 15/08/2026 · 52.000 km')).toBeInTheDocument();
    expect(screen.getByText('Sin services')).toBeInTheDocument();
  });

  it('Presupuestar y Nueva atención llevan cliente y vehículo', () => {
    renderCard();
    expect(screen.getAllByRole('link', { name: /Presupuestar/ })[0]).toHaveAttribute('href', '/budgets/new?customer_id=4&vehicle_id=10');
    expect(screen.getAllByRole('link', { name: /Nueva atención/ })[0]).toHaveAttribute('href', '/service-records/new?customer_id=4&vehicle_id=10');
  });

  it('muestra carga, error y vacío', () => {
    const { rerender } = renderCard({ isLoading: true });
    expect(screen.getByText('Cargando vehículos...')).toBeInTheDocument();
    rerender(<CustomerVehiclesCard customerId={4} vehicles={[]} isError onRetry={vi.fn()} onAddVehicle={vi.fn()} onEditVehicle={vi.fn()} />);
    expect(screen.getByText('No se pudieron cargar los vehículos.')).toBeInTheDocument();
    rerender(<CustomerVehiclesCard customerId={4} vehicles={[]} onAddVehicle={vi.fn()} onEditVehicle={vi.fn()} />);
    expect(screen.getByText('Este cliente no tiene vehículos registrados')).toBeInTheDocument();
  });
});
