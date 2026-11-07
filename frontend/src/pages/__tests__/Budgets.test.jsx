import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Budgets from '@pages/Budgets';

const mocks = vi.hoisted(() => ({
  useBudgets: vi.fn(),
  updateStatus: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@services/budgetsService', () => ({
  useBudgets: mocks.useBudgets,
  useDeleteBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBudgetStatus: () => ({ mutateAsync: mocks.updateStatus, isPending: false }),
}));
vi.mock('@services/settingsService', () => ({ useSetting: () => ({ data: null }) }));
vi.mock('@services/notificationService', () => ({
  showBudgetSuccess: mocks.success,
  showBudgetError: mocks.error,
  parseApiError: (e) => e.message,
}));

const budgets = [
  { id: 1, date: '2026-11-01', status: 'draft', customer: { name: 'Juan', phone: '1155551234' }, total_list: '1210', total_card: '1331' },
  { id: 2, date: '2026-11-02', status: 'approved', customer: { name: 'Ana', phone: '' }, total_list: '500', total_card: '500' },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useBudgets.mockReturnValue({ data: { data: { budgets, pagination: {} } }, isLoading: false, error: null });
});

describe('Budgets', () => {
  it('filtra por estado', () => {
    renderWithProviders(<Budgets />);
    fireEvent.click(screen.getByRole('button', { name: 'Aprobado' }));

    expect(screen.getByRole('button', { name: 'Aprobado' })).toHaveAttribute('aria-pressed', 'true');
    expect(mocks.useBudgets).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'approved', page: 1 }));
  });

  it('cambia el estado desde la fila', async () => {
    mocks.updateStatus.mockResolvedValue({});
    renderWithProviders(<Budgets />);
    fireEvent.change(screen.getByLabelText('Estado del presupuesto #1'), { target: { value: 'sent' } });

    await waitFor(() => expect(mocks.updateStatus).toHaveBeenCalledWith({ id: 1, status: 'sent' }));
    expect(mocks.success).toHaveBeenCalledWith('STATUS_UPDATED');
  });

  it('avisa si falla el cambio de estado', async () => {
    mocks.updateStatus.mockRejectedValue(new Error('boom'));
    renderWithProviders(<Budgets />);
    fireEvent.change(screen.getByLabelText('Estado del presupuesto #1'), { target: { value: 'rejected' } });
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('ERROR_STATUS', 'boom'));
  });

  it('muestra las acciones rápidas por fila', () => {
    renderWithProviders(<Budgets />);
    expect(screen.getAllByRole('button', { name: 'Duplicar' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'WhatsApp' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /WhatsApp \(el cliente no tiene teléfono/ })).toBeDisabled();
  });

  it('usa etiquetas claras y sin "budget"', () => {
    renderWithProviders(<Budgets />);
    expect(screen.getByText('Efectivo / Débito')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/budget/i);
  });

  it('muestra el vacío según filtros', () => {
    mocks.useBudgets.mockReturnValue({ data: { data: { budgets: [], pagination: {} } }, isLoading: false, error: null });
    renderWithProviders(<Budgets />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviado' }));
    expect(screen.getByText('No hay presupuestos con esos filtros')).toBeInTheDocument();
  });

  it('muestra el error de carga', () => {
    mocks.useBudgets.mockReturnValue({ data: null, isLoading: false, error: new Error('falló') });
    renderWithProviders(<Budgets />);
    expect(screen.getByText('Error al cargar los presupuestos')).toBeInTheDocument();
  });
});
