import { screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';
import ServiceRecordFormPage from '@pages/ServiceRecordFormPage';

const mocks = vi.hoisted(() => ({ useCustomer: vi.fn(), useVehicle: vi.fn() }));

vi.mock('@services/api', () => ({ api: { get: vi.fn(() => Promise.resolve({ data: { data: {} } })) } }));
vi.mock('@services/appointmentsService', () => ({
  useAppointment: () => ({ data: undefined, isLoading: false }),
  appointmentKeys: { all: ['appointments'], lists: () => ['appointments', 'list'] },
}));
vi.mock('@services/serviceRecordsService', () => ({
  useServiceRecord: () => ({ data: undefined, isLoading: false }),
  useCreateServiceRecord: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateServiceRecord: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@services/servicesService', () => ({ useServices: () => ({ data: null }) }));
vi.mock('@services/productsService', () => ({ useProducts: () => ({ data: null }) }));
vi.mock('@services/notificationService', () => ({ showServiceRecordSuccess: vi.fn(), showServiceRecordError: vi.fn() }));
vi.mock('@services/customersService', () => ({
  useCustomer: mocks.useCustomer,
  customerKeys: { lists: () => ['customers', 'list'] },
}));
vi.mock('@services/vehiclesService', () => ({
  useVehicle: mocks.useVehicle,
  vehicleKeys: { lists: () => ['vehicles', 'list'] },
}));

const renderPage = (route) =>
  renderWithProviders(
    <Routes>
      <Route path="/service-records/new" element={<ServiceRecordFormPage />} />
    </Routes>,
    { route },
  );

describe('ServiceRecordFormPage — desde el perfil del cliente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCustomer.mockImplementation((id) => ({
      data: id ? { data: { id: 3, name: 'Juan Pérez' } } : undefined,
    }));
    mocks.useVehicle.mockImplementation((id) => ({
      data: id ? { data: { id: 10, customer_id: 3, brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' } } : undefined,
    }));
  });

  it('preselecciona cliente y vehículo de la URL', async () => {
    renderPage('/service-records/new?customer_id=3&vehicle_id=10');
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    expect(screen.getByDisplayValue('Ford Ka — AB123CD')).toBeInTheDocument();
    expect(mocks.useCustomer).toHaveBeenCalledWith('3');
    expect(mocks.useVehicle).toHaveBeenCalledWith('10');
  });

  it('sin parámetros no preselecciona nada', () => {
    renderPage('/service-records/new');
    expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('');
    expect(mocks.useCustomer).toHaveBeenCalledWith(null);
  });
});

describe('ServiceRecordFormPage — validación de cliente y vehículo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCustomer.mockReturnValue({ data: undefined });
    mocks.useVehicle.mockReturnValue({ data: undefined });
  });

  it('al guardar sin cliente ni vehículo marca ambos buscadores en rojo', async () => {
    renderPage('/service-records/new');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar atención' }));
    await screen.findByText('El cliente es obligatorio');
    const customer = screen.getByPlaceholderText('Buscar cliente...');
    const vehicle = screen.getByPlaceholderText('Primero seleccioná un cliente');
    [customer, vehicle].forEach((el) => {
      expect(el).toHaveAttribute('aria-invalid', 'true');
      expect(el.className).toMatch(/\bborder-error\b/);
      expect(el.className).not.toMatch(/\bborder-outline-variant\b/);
    });
  });
});
