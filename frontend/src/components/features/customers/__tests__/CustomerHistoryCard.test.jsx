import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerHistoryCard from '@components/features/customers/CustomerHistoryCard';

const mocks = vi.hoisted(() => ({
  useServiceRecords: vi.fn(),
  useBudgets: vi.fn(),
  useAppointments: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock('@services/serviceRecordsService', () => ({ useServiceRecords: mocks.useServiceRecords }));
vi.mock('@services/budgetsService', () => ({ useBudgets: mocks.useBudgets }));
vi.mock('@services/appointmentsService', () => ({ useAppointments: mocks.useAppointments }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}));

const ok = (data) => ({ data, isLoading: false, isError: false, refetch: vi.fn() });

describe('CustomerHistoryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useServiceRecords.mockReturnValue(ok({ data: { service_records: [] } }));
    mocks.useBudgets.mockReturnValue(ok({
      data: {
        budgets: [
          { id: 1, date: '2026-10-01', status_label: 'Enviado', total_list: '15000' },
          { id: 2, date: '2026-10-05', status_label: 'Borrador', total_list: '8000' },
        ],
      },
    }));
    mocks.useAppointments.mockReturnValue(ok({ data: [] }));
  });

  it('arranca en Atenciones y muestra el vacío con "Nueva atención"', () => {
    renderWithProviders(<CustomerHistoryCard customerId={4} />);
    expect(mocks.useServiceRecords).toHaveBeenCalledWith({ customer_id: 4, per_page: 5 });
    expect(mocks.useBudgets).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Nueva atención/ }));
    expect(mocks.navigate).toHaveBeenCalledWith('/service-records/new?customer_id=4');
  });

  it('pestaña Presupuestos: fecha, estado, total y abre la edición', () => {
    renderWithProviders(<CustomerHistoryCard customerId={4} />);
    fireEvent.click(screen.getByRole('tab', { name: /Presupuestos/ }));
    expect(mocks.useBudgets).toHaveBeenCalledWith({ customer_id: 4, per_page: 5 });
    expect(screen.getByText('#1 · 01/10/2026')).toBeInTheDocument();
    expect(screen.getByText('Enviado')).toBeInTheDocument();
    fireEvent.click(screen.getByText('#2 · 05/10/2026'));
    expect(mocks.navigate).toHaveBeenCalledWith('/budgets/2/edit');
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/budgets?customer_id=4');
  });

  it('pestaña Turnos pide los próximos desde hoy', () => {
    renderWithProviders(<CustomerHistoryCard customerId={4} />);
    fireEvent.click(screen.getByRole('tab', { name: /Turnos/ }));
    const filters = mocks.useAppointments.mock.calls[0][0];
    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    expect(filters).toMatchObject({ customer_id: 4, per_page: 5, start_date: localToday });
    expect(screen.getByText('No hay turnos próximos.')).toBeInTheDocument();
  });

  it('pestaña Turnos no muestra "Ver todos" (la agenda no filtra por cliente)', () => {
    mocks.useAppointments.mockReturnValue(ok({
      data: [{ id: 7, formatted_date: '10/11/2026 09:00', display_status: 'Programado' }],
    }));
    renderWithProviders(<CustomerHistoryCard customerId={4} />);
    fireEvent.click(screen.getByRole('tab', { name: /Turnos/ }));
    expect(screen.getByText('10/11/2026 09:00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver todos' })).not.toBeInTheDocument();
  });

  it('muestra carga y error con reintento', () => {
    const refetch = vi.fn();
    mocks.useServiceRecords.mockReturnValue({ isLoading: true, isError: false, refetch });
    const { rerender } = renderWithProviders(<CustomerHistoryCard customerId={4} />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    mocks.useServiceRecords.mockReturnValue({ isLoading: false, isError: true, refetch });
    rerender(<CustomerHistoryCard customerId={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });
});
