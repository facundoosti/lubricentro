import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';
import BudgetForm from '@pages/BudgetForm';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  duplicate: vi.fn(),
  useBudget: vi.fn(),
  useVehicles: vi.fn(),
}));

vi.mock('@services/budgetsService', () => ({
  useBudget: mocks.useBudget,
  useCreateBudget: () => ({ mutateAsync: mocks.create, isPending: false }),
  useUpdateBudget: () => ({ mutateAsync: mocks.update, isPending: false }),
  useDuplicateBudget: () => ({ mutateAsync: mocks.duplicate, isPending: false }),
}));
vi.mock('@services/vehiclesService', () => ({ useVehicles: mocks.useVehicles }));
vi.mock('@services/settingsService', () => ({ useSetting: () => ({ data: { data: { lubricentro_name: 'Killamet' } } }) }));
vi.mock('@services/productsService', () => ({ useProducts: () => ({ data: null, isLoading: false }) }));
vi.mock('@services/servicesService', () => ({ useServices: () => ({ data: null, isLoading: false }) }));
vi.mock('@services/notificationService', () => ({
  showBudgetSuccess: vi.fn(),
  showBudgetError: vi.fn(),
  parseApiError: (e) => e.message,
}));
// Buscador de clientes simplificado: elegir dispara onChange + onSelect como el real.
vi.mock('@components/features/customers/CustomerSearchInput', () => ({
  default: ({ value, onChange, onSelect, initialCustomer }) => (
    <div>
      <span data-testid="customer-value">{value}</span>
      <span data-testid="customer-initial">{initialCustomer?.name || ''}</span>
      <button type="button" onClick={() => { onChange(''); onSelect?.(null); }}>
        quitar cliente
      </button>
      <button type="button" onClick={() => { onChange(3); onSelect?.({ id: 3, name: 'Juan Pérez', phone: '11 5555-1234' }); }}>
        elegir Juan
      </button>
      <button type="button" onClick={() => { onChange(4); onSelect?.({ id: 4, name: 'Ana', phone: '' }); }}>
        elegir Ana
      </button>
    </div>
  ),
}));

const vehicles = [
  { id: 10, brand: 'Ford', model: 'Ka', year: 2015, license_plate: 'AB123CD' },
  { id: 11, brand: 'Fiat', model: 'Uno', year: 2010, license_plate: 'ABC123' },
];

const renderForm = (route = '/budgets/new') =>
  renderWithProviders(
    <Routes>
      <Route path="/budgets/new" element={<BudgetForm />} />
      <Route path="/budgets/:id/edit" element={<BudgetForm />} />
      <Route path="/budgets" element={<div>listado</div>} />
    </Routes>,
    { route },
  );

const items = () => screen.getAllByTestId('budget-item');
const fillItem = (index, { description, quantity, price, iva }) => {
  const row = items()[index];
  if (description !== undefined) {
    fireEvent.change(within(row).getByRole('combobox', { name: 'Artículo o descripción' }), { target: { value: description } });
  }
  if (quantity !== undefined) fireEvent.change(within(row).getByLabelText(/Cantidad/), { target: { value: quantity } });
  if (price !== undefined) fireEvent.change(within(row).getByLabelText(/Precio unit/), { target: { value: price } });
  if (iva !== undefined) fireEvent.change(within(row).getByLabelText('IVA'), { target: { value: iva } });
};
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Crear presupuesto' }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useBudget.mockReturnValue({ data: null, isLoading: false, isError: false });
  mocks.useVehicles.mockImplementation(({ customer_id }) => ({
    data: customer_id === 3 ? { data: { vehicles } } : { data: { vehicles: [] } },
    isLoading: false,
  }));
  mocks.create.mockResolvedValue({ data: { id: 99 } });
});

describe('BudgetForm — nuevo', () => {
  it('no usa la palabra "budget" en los textos', () => {
    renderForm();
    expect(screen.getByText('Completá los datos del presupuesto')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/budget/i);
  });

  it('calcula los totales con IVA en vivo', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/Recargo tarjeta/), { target: { value: '10' } });
    fillItem(0, { description: 'Aceite', quantity: '2', price: '10000', iva: '21' });

    expect(screen.getByTestId('total-list')).toHaveTextContent('$24.200');
    expect(screen.getByTestId('total-card')).toHaveTextContent('$26.620');
    expect(screen.getByText('Tarjeta de crédito (+10%)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Desglose/ }));
    expect(screen.getByTestId('subtotal-net')).toHaveTextContent('$20.000');
    expect(screen.getByTestId('iva-21')).toHaveTextContent('$4.200');
    expect(screen.getByTestId('subtotal-gross')).toHaveTextContent('$24.200');
    expect(screen.getByTestId('line-total')).toHaveTextContent('$24.200');
  });

  it('al pasar una línea a "Sin IVA" recalcula y la muestra en el desglose', () => {
    renderForm();
    fillItem(0, { description: 'Mano de obra', quantity: '1', price: '15000', iva: '21' });
    expect(screen.getByTestId('total-list')).toHaveTextContent('$18.150');

    fillItem(0, { iva: '' });
    expect(screen.getByTestId('total-list')).toHaveTextContent('$15.000');

    fireEvent.click(screen.getByRole('button', { name: /Desglose/ }));
    expect(screen.getByRole('button', { name: /Desglose/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('exempt-total')).toHaveTextContent('$15.000');
    expect(screen.queryByTestId('iva-21')).toBeNull();
  });

  it('Enter en el precio de la última línea agrega otra sin enviar', () => {
    renderForm();
    fillItem(0, { description: 'Aceite', price: '100' });
    fireEvent.keyDown(within(items()[0]).getByLabelText(/Precio unit/), { key: 'Enter' });

    expect(items()).toHaveLength(2);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(within(items()[1]).getByRole('combobox', { name: 'Artículo o descripción' })).toHaveFocus();
  });

  it('borrar la única línea deja una vacía', () => {
    renderForm();
    fillItem(0, { description: 'Aceite', price: '100' });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar línea 1' }));

    expect(items()).toHaveLength(1);
    expect(within(items()[0]).getByRole('combobox', { name: 'Artículo o descripción' })).toHaveValue('');
  });

  it('vincula el vehículo elegido y envía la alícuota de cada línea', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'elegir Juan' }));
    fireEvent.change(screen.getByLabelText('Vehículo'), { target: { value: '10' } });
    fillItem(0, { description: 'Neumático', price: '4000', iva: '10.5' });
    submit();

    await waitFor(() => expect(mocks.create).toHaveBeenCalled());
    const payload = mocks.create.mock.calls[0][0];
    expect(payload).toMatchObject({ customer_id: 3, vehicle_id: 10, vehicle_description: 'Ford Ka 2015 (AB123CD)' });
    expect(payload.items_attributes).toEqual([
      expect.objectContaining({ description: 'Neumático', unit_price: '4000', iva_rate: 10.5 }),
    ]);
  });

  it('al cambiar de cliente limpia el vehículo', () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'elegir Juan' }));
    fireEvent.change(screen.getByLabelText('Vehículo'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'elegir Ana' }));

    // Ana no tiene vehículos: queda texto libre y vacío
    expect(screen.getByLabelText('Vehículo')).toHaveValue('');
    expect(screen.getByLabelText('Vehículo').tagName).toBe('INPUT');
  });
});

describe('BudgetForm — edición', () => {
  const budget = {
    id: 5,
    updated_at: '2026-11-06T10:00:00Z',
    date: '2026-11-01',
    status: 'draft',
    customer_id: 3,
    vehicle_id: 10,
    vehicle_description: 'Ford Ka 2015 (AB123CD)',
    card_surcharge_percentage: '0.0',
    total_list: '1210.0',
    total_card: '1210.0',
    customer: { id: 3, name: 'Juan Pérez', phone: '11 5555-1234' },
    items: [
      { id: 1, quantity: '1.0', description: 'Aceite', unit_price: '1000.0', iva_rate: '21.0' },
      { id: 2, quantity: '1.0', description: 'Filtro', unit_price: '500.0', iva_rate: null },
    ],
  };

  beforeEach(() => {
    mocks.useBudget.mockReturnValue({ data: { data: budget }, isLoading: false, isError: false });
    mocks.update.mockResolvedValue({ data: budget });
  });

  it('borra en el backend la línea quitada', async () => {
    renderForm('/budgets/5/edit');
    expect(items()).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar línea 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(mocks.update).toHaveBeenCalled());
    const { id, data } = mocks.update.mock.calls[0][0];
    expect(id).toBe('5');
    expect(data.items_attributes).toEqual([
      expect.objectContaining({ id: 1, iva_rate: 21 }),
      { id: 2, _destroy: true },
    ]);
  });

  it('ofrece WhatsApp con el teléfono del cliente', () => {
    renderForm('/budgets/5/edit');
    const link = screen.getByRole('link', { name: /WhatsApp/ });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/5491155551234\?text=/);
    expect(decodeURIComponent(link.getAttribute('href'))).toContain('Total efectivo / débito: $1.210');
  });

  it('deshabilita WhatsApp mientras haya cambios sin guardar', () => {
    renderForm('/budgets/5/edit');
    fireEvent.change(screen.getByLabelText('Notas'), { target: { value: 'cambio' } });
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Duplicar' })).toBeDisabled();
  });

  it('marca la cantidad inválida solo en líneas con descripción', async () => {
    renderForm('/budgets/5/edit');
    fireEvent.change(within(items()[0]).getByLabelText(/Cantidad/), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cantidad inválida');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('al quitar el cliente no vuelve a mostrar el anterior', () => {
    renderForm('/budgets/5/edit');
    expect(screen.getByTestId('customer-initial')).toHaveTextContent('Juan Pérez');
    fireEvent.click(screen.getByRole('button', { name: 'quitar cliente' }));
    expect(screen.getByTestId('customer-initial')).toHaveTextContent('');
    expect(screen.getByLabelText('Vehículo').tagName).toBe('INPUT');
  });

  it('muestra un error si no se puede cargar', () => {
    mocks.useBudget.mockReturnValue({ data: null, isLoading: false, isError: true });
    renderForm('/budgets/5/edit');
    expect(screen.getByText('No pudimos cargar el presupuesto')).toBeInTheDocument();
  });

  it('muestra la carga', () => {
    mocks.useBudget.mockReturnValue({ data: null, isLoading: true, isError: false });
    renderForm('/budgets/5/edit');
    expect(screen.getByRole('status', { name: 'Cargando presupuesto' })).toBeInTheDocument();
  });
});
