import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import InstallmentPlansSection from '@components/features/settings/InstallmentPlansSection';

const m = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('@services/installmentPlansService', () => ({
  useInstallmentPlans: () => m.list(),
  useCreateInstallmentPlan: () => ({ mutateAsync: m.create, isPending: false }),
  useUpdateInstallmentPlan: () => ({ mutateAsync: m.update, isPending: false }),
  useDeleteInstallmentPlan: () => ({ mutateAsync: m.remove, isPending: false }),
}));
vi.mock('@services/notificationService', () => ({ showSuccess: vi.fn(), showError: vi.fn() }));

const plans = [
  { id: 1, name: 'VISA', installments: 3, surcharge_percentage: '10.0', active: true, position: 0 },
  { id: 2, name: 'MASTER', installments: 6, surcharge_percentage: '20.5', active: false, position: 1 },
];

describe('InstallmentPlansSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.list.mockReturnValue({ data: { data: { installment_plans: plans } }, isLoading: false });
    [m.create, m.update, m.remove].forEach((fn) => fn.mockResolvedValue({}));
  });

  it('lista los planes con su estado', () => {
    renderWithProviders(<InstallmentPlansSection />);
    expect(screen.getByText(/3 cuotas · recargo 10%/)).toBeInTheDocument();
    expect(screen.getByText(/6 cuotas · recargo 20,5%/)).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Activar VISA' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch', { name: 'Activar MASTER' })).toHaveAttribute('aria-checked', 'false');
  });

  it('si falla la carga muestra el error y permite reintentar', () => {
    const refetch = vi.fn();
    m.list.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('Network Error'), refetch });
    renderWithProviders(<InstallmentPlansSection />);
    expect(screen.getByText('No se pudieron cargar los planes de cuotas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agregar plan/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('el orden por defecto es el mayor + 1', async () => {
    m.list.mockReturnValue({
      data: { data: { installment_plans: [{ ...plans[0], position: 5 }, { ...plans[1], position: 2 }] } },
      isLoading: false,
    });
    renderWithProviders(<InstallmentPlansSection />);
    fireEvent.click(screen.getByRole('button', { name: /Agregar plan/ }));
    fireEvent.change(screen.getByLabelText('Nombre del plan'), { target: { value: 'NARANJA' } });
    fireEvent.change(screen.getByLabelText('Cuotas'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear plan' }));
    await waitFor(() => expect(m.create).toHaveBeenCalledWith(expect.objectContaining({ position: 6 })));
  });

  it('sin planes muestra el vacío', () => {
    m.list.mockReturnValue({ data: { data: { installment_plans: [] } }, isLoading: false });
    renderWithProviders(<InstallmentPlansSection />);
    expect(screen.getByText('No hay planes de cuotas cargados.')).toBeInTheDocument();
  });

  it('crea un plan', async () => {
    renderWithProviders(<InstallmentPlansSection />);
    fireEvent.click(screen.getByRole('button', { name: /Agregar plan/ }));
    fireEvent.change(screen.getByLabelText('Nombre del plan'), { target: { value: 'VISA' } });
    fireEvent.change(screen.getByLabelText('Cuotas'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Recargo %'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear plan' }));
    await waitFor(() => expect(m.create).toHaveBeenCalledWith({ name: 'VISA', installments: 6, surcharge_percentage: 20, position: 2 }));
  });

  it('no deja crear un plan de 1 cuota', () => {
    renderWithProviders(<InstallmentPlansSection />);
    fireEvent.click(screen.getByRole('button', { name: /Agregar plan/ }));
    fireEvent.change(screen.getByLabelText('Nombre del plan'), { target: { value: 'X' } });
    fireEvent.change(screen.getByLabelText('Cuotas'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear plan' }));
    expect(screen.getByText('Las cuotas deben ser 2 o más')).toBeInTheDocument();
    expect(m.create).not.toHaveBeenCalled();
  });

  it('edita un plan', async () => {
    renderWithProviders(<InstallmentPlansSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar VISA' }));
    fireEvent.change(screen.getByLabelText('Recargo %'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar plan' }));
    await waitFor(() =>
      expect(m.update).toHaveBeenCalledWith({ id: 1, data: { name: 'VISA', installments: 3, surcharge_percentage: 12, position: 0 } }),
    );
  });

  it('desactiva un plan con el switch', async () => {
    renderWithProviders(<InstallmentPlansSection />);
    fireEvent.click(screen.getByRole('switch', { name: 'Activar VISA' }));
    await waitFor(() => expect(m.update).toHaveBeenCalledWith({ id: 1, data: { active: false } }));
  });

  it('borra un plan tras confirmar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InstallmentPlansSection />);
    await user.click(screen.getByRole('button', { name: 'Eliminar MASTER' }));
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(m.remove).toHaveBeenCalledWith(2));
  });
});
