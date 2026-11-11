import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';
import ServiceRecordFormPage from '@pages/ServiceRecordFormPage';

const mocks = vi.hoisted(() => ({
  useCustomer: vi.fn(),
  useVehicle: vi.fn(),
  useServiceRecord: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  useBudgets: vi.fn(),
  useBudget: vi.fn(),
}));

vi.mock('@services/api', () => ({ api: { get: vi.fn(() => Promise.resolve({ data: { data: {} } })) } }));
vi.mock('@services/appointmentsService', () => ({
  useAppointment: () => ({ data: undefined, isLoading: false }),
  appointmentKeys: { all: ['appointments'], lists: () => ['appointments', 'list'] },
}));
vi.mock('@services/serviceRecordsService', () => ({
  useServiceRecord: mocks.useServiceRecord,
  useCreateServiceRecord: () => ({ mutateAsync: mocks.create, isPending: false }),
  useUpdateServiceRecord: () => ({ mutateAsync: mocks.update, isPending: false }),
}));
vi.mock('@services/budgetsService', () => ({ useBudgets: mocks.useBudgets, useBudget: mocks.useBudget }));
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
      <Route path="/service-records/:id/edit" element={<ServiceRecordFormPage />} />
      <Route path="/service-records" element={<div>listado</div>} />
    </Routes>,
    { route },
  );

beforeEach(() => {
  mocks.useServiceRecord.mockReturnValue({ data: undefined, isLoading: false });
  mocks.create.mockResolvedValue({ data: { id: 1 } });
  mocks.update.mockResolvedValue({ data: { id: 1 } });
});

describe('ServiceRecordFormPage — desde el perfil del cliente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useServiceRecord.mockReturnValue({ data: undefined, isLoading: false });
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
    mocks.useServiceRecord.mockReturnValue({ data: undefined, isLoading: false });
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

// --- Productos y Servicios ---

const presetCustomer = () => {
  mocks.useCustomer.mockImplementation((id) => ({
    data: id ? { data: { id: 3, name: 'Juan Pérez' } } : undefined,
  }));
  mocks.useVehicle.mockImplementation((id) => ({
    data: id ? { data: { id: 10, customer_id: 3, brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' } } : undefined,
  }));
};

const rows = () => screen.getAllByTestId('item-row');
const fillItem = (index, { description, quantity, price, iva }) => {
  const row = rows()[index];
  if (description !== undefined) {
    fireEvent.change(within(row).getByRole('combobox', { name: 'Producto o servicio' }), { target: { value: description } });
  }
  if (quantity !== undefined) fireEvent.change(within(row).getByLabelText(/Cantidad/), { target: { value: quantity } });
  if (price !== undefined) fireEvent.change(within(row).getByLabelText(/Precio unit/), { target: { value: price } });
  if (iva !== undefined) fireEvent.change(within(row).getByLabelText(/% IVA/), { target: { value: iva } });
};

const budgetDetail = {
  id: 7,
  status: 'sent',
  total_list: '43620.0',
  customer: { id: 3, name: 'Juan Pérez', phone: '' },
  vehicle: { id: 11, brand: 'Fiat', model: 'Uno', license_plate: 'ABC123', year: 2010 },
  items: [
    { id: 1, position: 0, quantity: '2.0', description: 'Aceite', unit_price: '10000.0', iva_rate: '21.0' },
    { id: 2, position: 1, quantity: '1.0', description: 'Neumático', unit_price: '4000.0', iva_rate: '10.5' },
    { id: 3, position: 2, quantity: '1.0', description: 'Mano de obra', unit_price: '15000.0', iva_rate: null },
  ],
};

const copyBudget = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Copiar desde presupuesto' }));
  fireEvent.click(await screen.findByRole('radio', { name: /Presupuesto #7/ }));
  fireEvent.click(screen.getByRole('button', { name: /^(Copiar|Reemplazar ítems)$/ }));
};

describe('ServiceRecordFormPage — Productos y Servicios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useServiceRecord.mockReturnValue({ data: undefined, isLoading: false });
    mocks.create.mockResolvedValue({ data: { id: 1 } });
    mocks.update.mockResolvedValue({ data: { id: 1 } });
    mocks.useBudgets.mockReturnValue({
      data: { data: { budgets: [{ ...budgetDetail, date: '2026-11-01', status_label: 'Enviado' }] } },
      isLoading: false,
      isError: false,
    });
    mocks.useBudget.mockImplementation((id) => ({ data: id ? { data: budgetDetail } : undefined, isLoading: false }));
    presetCustomer();
  });

  it('muestra una sola sección "Productos y Servicios" y la barra con "Total" sin tarjeta', () => {
    renderPage('/service-records/new');
    expect(screen.getByRole('heading', { name: /Productos y Servicios/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Servicios$/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /^Productos$/ })).toBeNull();
    expect(screen.getByText('Datos generales')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.queryByTestId('total-card')).toBeNull();
  });

  it('una línea de 1 × $10.000 al 21% da Total $12.100', () => {
    renderPage('/service-records/new');
    fillItem(0, { description: 'Aceite 5W30', price: '10000', iva: '21' });
    expect(screen.getByTestId('line-total')).toHaveTextContent('$12.100');
    expect(screen.getByTestId('total-list')).toHaveTextContent('$12.100');
  });

  it('envía items_attributes sin total_amount ni budget_id', async () => {
    renderPage('/service-records/new?customer_id=3&vehicle_id=10');
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    fillItem(0, { description: 'Lavado de motor', price: '5000', iva: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar atención' }));

    await waitFor(() => expect(mocks.create).toHaveBeenCalled());
    const payload = mocks.create.mock.calls[0][0];
    expect(payload).toMatchObject({ customer_id: 3, vehicle_id: 10 });
    expect(payload.items_attributes).toEqual([
      { position: 0, quantity: 1, description: 'Lavado de motor', unit_price: '5000', iva_rate: null, product_id: null, service_id: null },
    ]);
    expect(payload).not.toHaveProperty('total_amount');
    expect(payload).not.toHaveProperty('budget_id');
  });

  it('copia un presupuesto: ítems, vehículo, total y vínculo', async () => {
    renderPage('/service-records/new?customer_id=3&vehicle_id=10');
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    await copyBudget();

    expect(mocks.useBudgets).toHaveBeenCalledWith(expect.objectContaining({ customer_id: 3 }));
    await waitFor(() => expect(rows()).toHaveLength(3));
    expect(within(rows()[1]).getByRole('combobox', { name: 'Producto o servicio' })).toHaveValue('Neumático');
    expect(within(rows()[1]).getByLabelText(/% IVA/)).toHaveValue(10.5);
    expect(within(rows()[2]).getByLabelText(/% IVA/)).toHaveValue(null);
    expect(screen.getByTestId('total-list')).toHaveTextContent('$43.620');
    expect(screen.getByDisplayValue('Fiat Uno — ABC123')).toBeInTheDocument();
    expect(screen.getByText('Desde presupuesto #7')).toBeInTheDocument();

    // Editar después de copiar recalcula el total
    fillItem(2, { quantity: '2' });
    expect(screen.getByTestId('total-list')).toHaveTextContent('$58.620');

    fireEvent.click(screen.getByRole('button', { name: 'Registrar atención' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalled());
    const payload = mocks.create.mock.calls[0][0];
    expect(payload).toMatchObject({ budget_id: 7, customer_id: 3, vehicle_id: 11 });
    expect(payload.items_attributes).toHaveLength(3);
    expect(payload.items_attributes[0]).toMatchObject({ description: 'Aceite', quantity: 2, unit_price: 10000, iva_rate: 21 });
    expect(payload.items_attributes[0]).not.toHaveProperty('id');
  });

  it('sin cliente elegido, copiar completa el cliente del presupuesto', async () => {
    mocks.useCustomer.mockReturnValue({ data: undefined });
    mocks.useVehicle.mockReturnValue({ data: undefined });
    renderPage('/service-records/new');
    await copyBudget();

    expect(mocks.useBudgets).toHaveBeenCalledWith(expect.objectContaining({ customer_id: undefined }));
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    expect(screen.getByDisplayValue('Fiat Uno — ABC123')).toBeInTheDocument();
  });

  it('pide confirmar antes de reemplazar líneas cargadas', async () => {
    renderPage('/service-records/new');
    fillItem(0, { description: 'Algo cargado', price: '100' });
    await copyBudget();

    expect(screen.getByText(/se reemplazan por las del presupuesto/)).toBeInTheDocument();
    expect(rows()).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar ítems' }));
    await waitFor(() => expect(rows()).toHaveLength(3));
  });

  it('quitar el vínculo guarda sin budget_id', async () => {
    renderPage('/service-records/new?customer_id=3&vehicle_id=10');
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    await copyBudget();
    fireEvent.click(await screen.findByRole('button', { name: 'Quitar vínculo con el presupuesto #7' }));
    expect(screen.queryByText('Desde presupuesto #7')).toBeNull();
    expect(rows()).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Registrar atención' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalled());
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty('budget_id');
  });
});

describe('ServiceRecordFormPage — vínculo con el presupuesto al cambiar de cliente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useServiceRecord.mockReturnValue({ data: undefined, isLoading: false });
    mocks.create.mockResolvedValue({ data: { id: 1 } });
    presetCustomer();
  });

  const mockBudget = (budget) => {
    mocks.useBudgets.mockReturnValue({
      data: { data: { budgets: [{ ...budget, date: '2026-11-01', status_label: 'Enviado' }] } },
      isLoading: false,
      isError: false,
    });
    mocks.useBudget.mockImplementation((id) => ({ data: id ? { data: budget } : undefined, isLoading: false }));
  };
  const clearCustomer = () =>
    fireEvent.change(screen.getByPlaceholderText('Buscar cliente...'), { target: { value: '' } });

  it('al quitar el cliente del presupuesto copiado se pierde el vínculo', async () => {
    mockBudget(budgetDetail);
    renderPage('/service-records/new?customer_id=3&vehicle_id=10');
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    await copyBudget();
    expect(await screen.findByText('Desde presupuesto #7')).toBeInTheDocument();

    clearCustomer();
    expect(screen.queryByText('Desde presupuesto #7')).toBeNull();
    expect(rows()).toHaveLength(3);
  });

  it('si el presupuesto no tenía cliente, cambiar de cliente mantiene el vínculo', async () => {
    mockBudget({ ...budgetDetail, customer: null, vehicle: null });
    renderPage('/service-records/new?customer_id=3&vehicle_id=10');
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    await copyBudget();
    expect(await screen.findByText('Desde presupuesto #7')).toBeInTheDocument();

    clearCustomer();
    expect(screen.getByText('Desde presupuesto #7')).toBeInTheDocument();
  });
});

describe('ServiceRecordFormPage — validación propia del formulario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useServiceRecord.mockReturnValue({ data: undefined, isLoading: false });
    presetCustomer();
  });

  it('un % fuera de rango muestra el mensaje propio (sin burbuja nativa)', async () => {
    renderPage('/service-records/new?customer_id=3&vehicle_id=10');
    await waitFor(() => expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Juan Pérez'));
    fillItem(0, { description: 'Mano de obra', price: '1000', iva: '120' });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar atención' }));
    expect(await screen.findByText('% IVA inválido (0 a 99,99)')).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe('ServiceRecordFormPage — edición de una atención migrada', () => {
  const record = {
    id: 4,
    service_date: '2026-10-01',
    customer_id: 3,
    vehicle_id: 10,
    budget_id: 7,
    total_amount: '14000.0',
    customer: { id: 3, name: 'Juan Pérez' },
    vehicle: { id: 10, brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' },
    items: [
      { id: 21, position: 0, description: 'Cambio de aceite', quantity: '1.0', unit_price: '8000.0', iva_rate: null, total: '8000.0', product_id: null, service_id: 9 },
      { id: 22, position: 1, description: 'Filtro', quantity: '2.0', unit_price: '3000.0', iva_rate: null, total: '6000.0', product_id: 4, service_id: null },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCustomer.mockReturnValue({ data: undefined });
    mocks.useVehicle.mockReturnValue({ data: undefined });
    mocks.useServiceRecord.mockReturnValue({ data: { data: record }, isLoading: false });
    mocks.update.mockResolvedValue({ data: record });
  });

  it('muestra las líneas con % vacío, el total guardado y sin "Copiar desde presupuesto"', async () => {
    renderPage('/service-records/4/edit');
    await waitFor(() => expect(rows()).toHaveLength(2));
    expect(within(rows()[0]).getByRole('combobox', { name: 'Producto o servicio' })).toHaveValue('Cambio de aceite');
    rows().forEach((row) => expect(within(row).getByLabelText(/% IVA/)).toHaveValue(null));
    expect(screen.getByTestId('total-list')).toHaveTextContent('$14.000');
    expect(screen.queryByRole('button', { name: 'Copiar desde presupuesto' })).toBeNull();
    expect(screen.queryByText(/Desde presupuesto/)).toBeNull();
  });

  it('al guardar manda _destroy de la línea quitada, conserva el catálogo y no toca budget_id', async () => {
    renderPage('/service-records/4/edit');
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar línea 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(mocks.update).toHaveBeenCalled());
    const { id, data } = mocks.update.mock.calls[0][0];
    expect(id).toBe('4');
    expect(data.items_attributes).toEqual([
      { id: 22, position: 0, quantity: 2, description: 'Filtro', unit_price: 3000, iva_rate: null, product_id: 4, service_id: null },
      { id: 21, _destroy: true },
    ]);
    expect(data).not.toHaveProperty('budget_id');
  });
});
