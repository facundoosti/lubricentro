import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import VehicleForm from '@components/features/vehicles/VehicleForm';
import VehicleModal from '@components/features/vehicles/VehicleModal';
import { api } from '@services/api';

vi.mock('@services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('@services/notificationService', () => ({
  showCustomerSuccess: vi.fn(),
  showCustomerError: vi.fn(),
  showVehicleSuccess: vi.fn(),
  showVehicleError: vi.fn(),
  parseApiError: vi.fn(() => 'error'),
}));

const notFound = () => Promise.reject(Object.assign(new Error('404'), { response: { status: 404 } }));
const unavailable = () => Promise.reject(Object.assign(new Error('503'), { response: { status: 503 } }));
const found = (plate) => Promise.resolve({
  data: { data: { vehicle: { status: 'found', make: 'Toyota', model: 'Corolla', year: 2018, plate } } },
});

// Respuestas por URL: lookup, vehículos por patente, clientes
let lookupImpl;
let vehiclesByPlate;
let customersList;
const setupApi = () => {
  api.get.mockImplementation((url, config = {}) => {
    if (url.startsWith('/vehicles/lookup')) return lookupImpl(url);
    if (url === '/vehicles') return Promise.resolve({ data: { data: { vehicles: vehiclesByPlate(config.params?.license_plate) } } });
    if (url.startsWith('/customers?')) return Promise.resolve({ data: { data: { customers: customersList } } });
    if (url === '/customers') return Promise.resolve({ data: { data: { customers: [] } } });
    if (url.startsWith('/customers/')) return Promise.resolve({ data: { data: { id: 99, name: 'Carlos Ruiz' } } });
    return Promise.resolve({ data: {} });
  });
};
const lookupCalls = () => api.get.mock.calls.filter(([url]) => url.startsWith('/vehicles/lookup'));

const typePlate = (value) => fireEvent.change(screen.getByLabelText(/Patente/), { target: { value } });

describe('VehicleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lookupImpl = notFound;
    vehiclesByPlate = () => [];
    customersList = [];
    setupApi();
  });

  it('ofrece años hasta 1950', () => {
    renderWithProviders(<VehicleForm onSubmit={vi.fn()} />);
    const years = [...screen.getByLabelText(/Año/).options].map((o) => o.value);
    expect(years).toContain('1986');
    expect(years).toContain('1950');
    expect(years).not.toContain('1949');
    expect(years[1]).toBe(String(new Date().getFullYear()));
  });

  it('autocompleta marca, modelo y año al escribir una patente válida', async () => {
    lookupImpl = () => found('AB123CD');
    renderWithProviders(<VehicleForm onSubmit={vi.fn()} />);
    typePlate('AB123CD');

    await waitFor(() => expect(screen.getByLabelText(/Marca/)).toHaveValue('Toyota'));
    expect(screen.getByLabelText(/Modelo/)).toHaveValue('Corolla');
    expect(screen.getByLabelText(/Año/)).toHaveValue('2018');
    expect(screen.getAllByText('Autocompletado')).toHaveLength(3);
  });

  it('no pisa la marca escrita a mano', async () => {
    lookupImpl = () => found('AB123CD');
    renderWithProviders(<VehicleForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Marca/), { target: { value: 'Ford' } });
    typePlate('AB123CD');

    await waitFor(() => expect(screen.getByLabelText(/Modelo/)).toHaveValue('Corolla'));
    expect(screen.getByLabelText(/Marca/)).toHaveValue('Ford');
  });

  it('consulta una sola vez por patente', async () => {
    renderWithProviders(<VehicleForm onSubmit={vi.fn()} />);
    typePlate('AB123CD');
    await screen.findByText(/No encontramos datos/);
    typePlate('AB123C');
    typePlate('AB123CD');
    await new Promise((r) => setTimeout(r, 700));
    expect(lookupCalls()).toHaveLength(1);
  });

  it('avisa cuando la patente no tiene datos', async () => {
    renderWithProviders(<VehicleForm onSubmit={vi.fn()} />);
    typePlate('ABC123');
    expect(await screen.findByText('No encontramos datos para esta patente. Completalos a mano.')).toBeInTheDocument();
  });

  it('avisa cuando el servicio no responde y permite reintentar', async () => {
    lookupImpl = unavailable;
    renderWithProviders(<VehicleForm onSubmit={vi.fn()} />);
    typePlate('ABC123');
    expect(await screen.findByText(/El servicio de búsqueda no responde/)).toBeInTheDocument();

    lookupImpl = () => found('ABC123');
    fireEvent.click(screen.getByRole('button', { name: 'Buscar datos de la patente' }));
    await waitFor(() => expect(screen.getByLabelText(/Marca/)).toHaveValue('Toyota'));
    expect(lookupCalls()).toHaveLength(2);
  });

  it('avisa si la patente es de otro cliente y deshabilita Guardar', async () => {
    vehiclesByPlate = (plate) => (plate === 'AB123CD'
      ? [{ id: 3, license_plate: 'AB123CD', customer: { id: 8, name: 'María Gómez' } }]
      : []);
    renderWithProviders(<VehicleModal isOpen onClose={vi.fn()} />);
    typePlate('ab123cd');

    expect(await screen.findByRole('alert')).toHaveTextContent('Patente registrada a María Gómez · Ver perfil');
    expect(screen.getByRole('link', { name: 'Ver perfil' })).toHaveAttribute('href', '/customers/8');
    expect(screen.getByRole('button', { name: 'Crear Vehículo' })).toBeDisabled();
  });

  it('no avisa al editar el mismo vehículo', async () => {
    vehiclesByPlate = () => [{ id: 3, license_plate: 'AB123CD', customer: { id: 8, name: 'María Gómez' } }];
    const vehicle = { id: 3, brand: 'Fiat', model: 'Uno', license_plate: 'AB123CD', year: '2010', customer_id: 8, customer: { id: 8, name: 'María Gómez' } };
    renderWithProviders(<VehicleModal isOpen onClose={vi.fn()} vehicle={vehicle} />);

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/vehicles', expect.anything()));
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Guardar Cambios' })).toBeEnabled();
    });
    expect(lookupCalls()).toHaveLength(0);
  });

  it('crea un cliente en línea, lo elige y conserva los datos del vehículo', async () => {
    api.post.mockResolvedValue({ data: { success: true, data: { id: 99, name: 'Carlos Ruiz', phone: '1155551234' } } });
    renderWithProviders(<VehicleModal isOpen onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Marca/), { target: { value: 'Ford' } });
    fireEvent.change(screen.getByLabelText(/Modelo/), { target: { value: 'Focus' } });
    fireEvent.change(screen.getByLabelText(/Año/), { target: { value: '1986' } });

    fireEvent.change(screen.getByPlaceholderText(/cliente/), { target: { value: 'Carlos Ruiz' } });
    fireEvent.click(await screen.findByRole('button', { name: /Crear cliente "Carlos Ruiz"/ }));

    expect(await screen.findByRole('dialog', { name: 'Nuevo Cliente' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre completo/)).toHaveValue('Carlos Ruiz');
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '1155551234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Cliente' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Nuevo Cliente' })).not.toBeInTheDocument());
    expect(api.post).toHaveBeenCalledWith('/customers', { customer: expect.objectContaining({ name: 'Carlos Ruiz', phone: '1155551234' }) });
    expect(screen.getByPlaceholderText(/cliente/)).toHaveValue('Carlos Ruiz - 1155551234');
    expect(screen.getByLabelText(/Marca/)).toHaveValue('Ford');
    expect(screen.getByLabelText(/Año/)).toHaveValue('1986');
  });
});
