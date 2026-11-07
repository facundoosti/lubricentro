import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';
import BudgetActions from '@components/features/budgets/BudgetActions';

const mocks = vi.hoisted(() => ({ duplicate: vi.fn(), success: vi.fn(), error: vi.fn() }));

vi.mock('@services/budgetsService', () => ({
  useDuplicateBudget: () => ({ mutateAsync: mocks.duplicate, isPending: false }),
}));
vi.mock('@services/settingsService', () => ({ useSetting: () => ({ data: null }) }));
vi.mock('@services/notificationService', () => ({
  showBudgetSuccess: mocks.success,
  showBudgetError: mocks.error,
  parseApiError: (e) => e.message,
}));

const budget = { id: 5, date: '2026-11-06', total_list: '100', total_card: '110', customer: { name: 'Ana', phone: '' } };

const renderActions = (props) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<BudgetActions budget={budget} {...props} />} />
      <Route path="/presupuestos/:id/editar" element={<div>editando</div>} />
      <Route path="/presupuestos/:id/imprimir" element={<div>imprimiendo</div>} />
    </Routes>,
  );

describe('BudgetActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('deshabilita WhatsApp si el cliente no tiene teléfono', () => {
    renderActions();
    const btn = screen.getByRole('button', { name: /WhatsApp \(el cliente no tiene teléfono cargado\)/ });
    expect(btn).toBeDisabled();
  });

  it('duplica y abre la copia', async () => {
    mocks.duplicate.mockResolvedValue({ data: { id: 8 } });
    renderActions();
    fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));

    await waitFor(() => expect(screen.getByText('editando')).toBeInTheDocument());
    expect(mocks.duplicate).toHaveBeenCalledWith(5);
    expect(mocks.success).toHaveBeenCalledWith('DUPLICATED');
  });

  it('avisa si falla el duplicado', async () => {
    mocks.duplicate.mockRejectedValue(new Error('boom'));
    renderActions();
    fireEvent.click(screen.getByRole('button', { name: 'Duplicar' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('ERROR_DUPLICATE', 'boom'));
  });

  it('con cambios sin guardar deshabilita las acciones', () => {
    renderActions({ budget: { ...budget, customer: { name: 'Juan', phone: '1155551234' } }, isDirty: true });
    expect(screen.getByRole('button', { name: 'Imprimir' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Duplicar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /WhatsApp \(guardá los cambios primero\)/ })).toBeDisabled();
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).toBeNull();
  });

  it('en modo compacto deja los nombres accesibles', () => {
    renderActions({ compact: true });
    fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
    expect(screen.getByText('imprimiendo')).toBeInTheDocument();
  });
});
