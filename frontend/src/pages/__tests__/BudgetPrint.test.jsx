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

  it('muestra precio sin IVA, importe con IVA, alícuota por línea y el desglose', () => {
    renderPrint(mixed);
    expect(screen.getByText('P. UNIT. S/IVA')).toBeInTheDocument();
    expect(screen.getByText('IMPORTE C/IVA')).toBeInTheDocument();
    const row = screen.getByText('Neumático').closest('tr');
    expect(within(row).getByText('10,5%')).toBeInTheDocument();
    expect(within(row).getByText('$4.420')).toBeInTheDocument();
    expect(within(screen.getByText('Aceite').closest('tr')).getByText('$24.200')).toBeInTheDocument();
    expect(within(screen.getByText('Mano de obra').closest('tr')).getAllByText('$15.000')).toHaveLength(2);
    expect(within(screen.getByText('Mano de obra').closest('tr')).getByText('s/IVA')).toBeInTheDocument();

    expect(screen.getByTestId('print-subtotal')).toHaveTextContent('$24.000');
    expect(screen.getByTestId('print-iva-21')).toHaveTextContent('$4.200');
    expect(screen.getByText('IVA 21% s/ $20.000')).toBeInTheDocument();
    expect(screen.getByTestId('print-subtotal-gross')).toHaveTextContent('$28.620');
    expect(screen.getByTestId('print-iva-10.5')).toHaveTextContent('$420');
    expect(screen.getByTestId('print-exempt')).toHaveTextContent('$15.000');
    expect(screen.getByTestId('print-total-list')).toHaveTextContent('$43.620');
    expect(screen.getByTestId('print-total-card')).toHaveTextContent('$47.982');
  });

  it('un presupuesto viejo se imprime solo con los totales', () => {
    renderPrint(legacy);
    expect(screen.queryByTestId('print-iva-breakdown')).toBeNull();
    expect(screen.queryByText('IVA')).toBeNull();
    expect(screen.getByTestId('print-total-list')).toHaveTextContent('$50.000');
    expect(screen.getByTestId('print-total-card')).toHaveTextContent('$55.000');
  });

  it('avisa si no existe', () => {
    renderPrint(null);
    expect(screen.getByText('Presupuesto no encontrado.')).toBeInTheDocument();
  });
});
