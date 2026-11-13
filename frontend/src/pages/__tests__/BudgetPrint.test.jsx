import { screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';
import BudgetPrint from '@pages/BudgetPrint';

const mocks = vi.hoisted(() => ({ useBudget: vi.fn() }));
vi.mock('@services/budgetsService', () => ({ useBudget: mocks.useBudget }));
vi.mock('@services/settingsService', () => ({ useSetting: () => ({ data: { data: { cuit: '20-1', address: 'Calle 1' } } }) }));

const mixed = {
  id: 7,
  date: '2026-11-06',
  vehicle_description: 'Ford Ka',
  customer: { name: 'Juan', phone: '11' },
  subtotal_net: '24000.0',
  total_iva: '4620.0',
  exempt_total: '15000.0',
  total_list: '43620.0',
  total_card: '47982.0',
  iva_breakdown: [
    { rate: '21.0', base: '20000.0', amount: '4200.0' },
    { rate: '10.5', base: '4000.0', amount: '420.0' },
  ],
  items: [
    { id: 1, quantity: '2.0', description: 'Aceite', unit_price: '10000.0', iva_rate: '21.0', total: '20000.0' },
    { id: 2, quantity: '1.0', description: 'Neumático', unit_price: '4000.0', iva_rate: '10.5', total: '4000.0' },
    { id: 3, quantity: '1.0', description: 'Mano de obra', unit_price: '15000.0', iva_rate: null, total: '15000.0' },
  ],
};

const legacy = {
  id: 8,
  date: '2026-01-10',
  subtotal_net: '0.0',
  total_iva: '0.0',
  exempt_total: '50000.0',
  total_list: '50000.0',
  total_card: '55000.0',
  iva_breakdown: [],
  items: [{ id: 9, quantity: '2.0', description: 'Service', unit_price: '25000.0', iva_rate: null, total: '50000.0' }],
};

const renderPrint = (budget) => {
  mocks.useBudget.mockReturnValue({ data: budget ? { data: budget } : null, isLoading: false });
  return renderWithProviders(
    <Routes>
      <Route path="/budgets/:id/print" element={<BudgetPrint />} />
    </Routes>,
    { route: `/budgets/${budget?.id ?? 0}/print` },
  );
};

describe('BudgetPrint', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra precio unitario e importe finales, sin columna IVA, y el IVA por alícuota sin base', () => {
    renderPrint(mixed);
    const headers = screen.getAllByRole('columnheader').map((th) => th.textContent);
    expect(headers).toEqual(['CANT', 'ARTÍCULO', 'P. UNIT.', 'IMPORTE']);

    const neumatico = screen.getByText('Neumático').closest('tr');
    expect(within(neumatico).getAllByText('$4.420')).toHaveLength(2);
    expect(within(neumatico).queryByText('10,5%')).toBeNull();
    const aceite = screen.getByText('Aceite').closest('tr');
    expect(within(aceite).getByText('$12.100')).toBeInTheDocument();
    expect(within(aceite).getByText('$24.200')).toBeInTheDocument();
    const mano = screen.getByText('Mano de obra').closest('tr');
    expect(within(mano).getAllByText('$15.000')).toHaveLength(2);
    expect(within(mano).queryByText('s/IVA')).toBeNull();

    expect(screen.getByText('IVA 21%')).toBeInTheDocument();
    expect(screen.getByTestId('print-iva-21')).toHaveTextContent('$4.200');
    expect(screen.getByText('IVA 10,5%')).toBeInTheDocument();
    expect(screen.getByTestId('print-iva-10.5')).toHaveTextContent('$420');
    expect(screen.getByTestId('print-total-list')).toHaveTextContent('$43.620');
    expect(screen.getByTestId('print-total-card')).toHaveTextContent('$47.982');

    const text = document.body.textContent;
    expect(text).not.toMatch(/Subtotal neto|Subtotal con IVA|Sin IVA|s\/ \$/);
    expect(screen.queryByTestId('print-subtotal')).toBeNull();
    expect(screen.queryByTestId('print-exempt')).toBeNull();
  });

  it('no muestra la ganancia: 1 × $1.000, 21%, 30%, recargo 10%', () => {
    renderPrint({
      id: 10,
      date: '2026-11-11',
      customer: { name: 'Juan', phone: '11' },
      subtotal_net: '1000.0',
      total_iva: '210.0',
      exempt_total: '0.0',
      margin_total: '300.0',
      total_list: '1510.0',
      total_card: '1661.0',
      iva_breakdown: [{ rate: '21.0', base: '1000.0', amount: '210.0' }],
      items: [
        { id: 1, quantity: '1.0', description: 'Filtro', unit_price: '1000.0', iva_rate: '21.0', margin_percentage: '30.0', total: '1000.0' },
      ],
    });
    const row = screen.getByText('Filtro').closest('tr');
    expect(within(row).getAllByText('$1.510')).toHaveLength(2);
    expect(screen.getByText('IVA 21%')).toBeInTheDocument();
    expect(screen.getByTestId('print-iva-21')).toHaveTextContent('$210');
    expect(screen.getByTestId('print-total-list')).toHaveTextContent('$1.510');
    expect(screen.getByTestId('print-total-card')).toHaveTextContent('$1.661');

    const text = document.body.textContent;
    expect(text).not.toMatch(/Ganancia/i);
    expect(text).not.toContain('$300');
    expect(text).not.toContain('30%');
    expect(text).not.toMatch(/Subtotal/);
    expect(text).not.toMatch(/Sin IVA/);
  });

  it('muestra % anteriores con coma en el pie', () => {
    renderPrint({
      ...legacy,
      id: 9,
      subtotal_net: '2000.0',
      total_iva: '307.5',
      exempt_total: '0.0',
      total_list: '2307.5',
      total_card: '2307.5',
      iva_breakdown: [
        { rate: '15.75', base: '1000.0', amount: '157.5' },
        { rate: '15.0', base: '1000.0', amount: '150.0' },
      ],
      items: [
        { id: 1, quantity: '1.0', description: 'Mano de obra', unit_price: '1000.0', iva_rate: '15.0', total: '1000.0' },
        { id: 2, quantity: '1.0', description: 'Repuesto', unit_price: '1000.0', iva_rate: '15.75', total: '1000.0' },
      ],
    });
    expect(within(screen.getByText('Mano de obra').closest('tr')).getAllByText('$1.150')).toHaveLength(2);
    expect(within(screen.getByText('Repuesto').closest('tr')).getAllByText('$1.157,50')).toHaveLength(2);
    expect(screen.getByText('IVA 15%')).toBeInTheDocument();
    expect(screen.getByTestId('print-iva-15')).toHaveTextContent('$150');
    expect(screen.getByText('IVA 15,75%')).toBeInTheDocument();
    expect(screen.getByTestId('print-iva-15.75')).toHaveTextContent('$157,50');
  });

  it('un presupuesto viejo se imprime solo con los totales', () => {
    renderPrint(legacy);
    expect(screen.queryByTestId('print-iva-breakdown')).toBeNull();
    expect(document.body.textContent).not.toMatch(/IVA/);
    expect(within(screen.getByText('Service').closest('tr')).getByText('$25.000')).toBeInTheDocument();
    expect(screen.getByTestId('print-total-list')).toHaveTextContent('$50.000');
    expect(screen.getByTestId('print-total-card')).toHaveTextContent('$55.000');
  });

  it('muestra el año de la fecha con dos dígitos', () => {
    renderPrint({ ...legacy, date: '2026-11-13' });
    expect(screen.getByTestId('print-day')).toHaveTextContent(/^13$/);
    expect(screen.getByTestId('print-month')).toHaveTextContent(/^11$/);
    expect(screen.getByTestId('print-year')).toHaveTextContent(/^26$/);
  });

  it('deja día, mes y año vacíos si el presupuesto no tiene fecha', () => {
    renderPrint({ ...legacy, date: null });
    expect(screen.getByTestId('print-day')).toBeEmptyDOMElement();
    expect(screen.getByTestId('print-month')).toBeEmptyDOMElement();
    expect(screen.getByTestId('print-year')).toBeEmptyDOMElement();
  });

  it('muestra el nombre del cliente en NOMBRE', () => {
    renderPrint({ ...legacy, customer: { name: 'Juan Pérez', phone: '11' } });
    expect(screen.getByTestId('print-customer-name')).toHaveTextContent(/^NOMBRE: Juan Pérez$/);
  });

  it('deja NOMBRE vacío sin cliente y mantiene la descripción en el renglón Vehículo', () => {
    renderPrint({ ...legacy, customer: null, vehicle_description: 'Gol Trend' });
    expect(screen.getByTestId('print-customer-name')).toHaveTextContent(/^NOMBRE:$/);
    expect(screen.getByText('Vehículo:').parentElement).toHaveTextContent('Vehículo: Gol Trend');
  });

  it('avisa si no existe', () => {
    renderPrint(null);
    expect(screen.getByText('Presupuesto no encontrado.')).toBeInTheDocument();
  });
});
