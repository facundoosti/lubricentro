import { screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CopyFromBudgetDialog from '@components/features/service-records/CopyFromBudgetDialog';

const mocks = vi.hoisted(() => ({ useBudgets: vi.fn(), useBudget: vi.fn() }));
vi.mock('@services/budgetsService', () => ({ useBudgets: mocks.useBudgets, useBudget: mocks.useBudget }));

const list = [
  { id: 7, date: '2026-11-01', status: 'sent', status_label: 'Enviado', total_list: '43620.0', customer: { name: 'Juan Pérez' }, vehicle_description: 'Ford Ka', items: [{}, {}, {}] },
  { id: 8, date: '2026-11-02', status: 'rejected', status_label: 'Rechazado', total_list: '100.0', customer: { name: 'Juan Pérez' }, items: [] },
  { id: 9, date: '2026-11-03', status: 'draft', status_label: 'Borrador', total_list: '500.0', customer: null, items: [{}] },
];
const detail = { id: 7, items: [{ id: 1, description: 'Aceite' }] };

const renderDialog = (props = {}) => {
  const onCopy = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(<CopyFromBudgetDialog isOpen onClose={onClose} onCopy={onCopy} hasFilledItems={false} {...props} />);
  return { onCopy, onClose };
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useBudgets.mockReturnValue({ data: { data: { budgets: list } }, isLoading: false, isError: false });
  mocks.useBudget.mockImplementation((id) => ({ data: id ? { data: { ...detail, id } } : undefined, isLoading: false, isError: false }));
});
afterEach(() => { document.body.style.overflow = ''; });

describe('CopyFromBudgetDialog', () => {
  it('lista los presupuestos del cliente sin los rechazados', () => {
    renderDialog({ customerId: 3 });
    expect(screen.getByRole('dialog', { name: 'Copiar desde presupuesto' })).toBeInTheDocument();
    expect(mocks.useBudgets).toHaveBeenCalledWith(expect.objectContaining({ customer_id: 3 }));
    expect(screen.getByRole('radio', { name: /Presupuesto #7/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Presupuesto #9/ })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /Presupuesto #8/ })).toBeNull();
    expect(screen.getByRole('radio', { name: /Presupuesto #7/ }).closest('label')).toHaveTextContent('$43.620');
  });

  it('sin cliente no filtra por cliente', () => {
    renderDialog();
    expect(mocks.useBudgets).toHaveBeenCalledWith(expect.objectContaining({ customer_id: undefined }));
  });

  it('busca con debounce', () => {
    vi.useFakeTimers();
    renderDialog();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar presupuesto' }), { target: { value: 'ka' } });
    act(() => { vi.advanceTimersByTime(300); });
    expect(mocks.useBudgets).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'ka' }));
    vi.useRealTimers();
  });

  it('copia el presupuesto elegido y cierra', () => {
    const { onCopy, onClose } = renderDialog();
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /Presupuesto #7/ }));
    expect(mocks.useBudget).toHaveBeenLastCalledWith(7);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
    expect(onClose).toHaveBeenCalled();
  });

  it('pide confirmar si la atención ya tiene líneas con datos', () => {
    const { onCopy } = renderDialog({ hasFilledItems: true });
    fireEvent.click(screen.getByRole('radio', { name: /Presupuesto #7/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('se reemplazan');
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar ítems' }));
    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
  });

  it('muestra la carga', () => {
    mocks.useBudgets.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderDialog();
    expect(screen.getByRole('status')).toHaveTextContent('Buscando presupuestos...');
  });

  it('muestra el error', () => {
    mocks.useBudgets.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderDialog();
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los presupuestos');
  });

  it('muestra el vacío', () => {
    mocks.useBudgets.mockReturnValue({ data: { data: { budgets: [list[1]] } }, isLoading: false, isError: false });
    renderDialog();
    expect(screen.getByText('No hay presupuestos para copiar.')).toBeInTheDocument();
  });

  it('avisa si no se puede cargar el presupuesto elegido', () => {
    mocks.useBudget.mockImplementation((id) => ({ data: undefined, isLoading: false, isError: !!id }));
    renderDialog();
    fireEvent.click(screen.getByRole('radio', { name: /Presupuesto #7/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el presupuesto elegido');
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeDisabled();
  });
});
