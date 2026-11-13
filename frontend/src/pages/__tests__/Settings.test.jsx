import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Settings from '@pages/Settings';

// Objeto estable: Settings hace reset() en un useEffect que depende de `data`
const updateMock = vi.hoisted(() => vi.fn());
const settingQuery = vi.hoisted(() => ({
  data: { data: { lubricentro_name: 'Lubri', opening_hours: { lunes: { open: true, from: '08:00', to: '17:00' } } } },
  isLoading: false,
  error: null,
}));
vi.mock('@services/settingsService', () => ({
  useSetting: () => settingQuery,
  useUpdateSetting: () => ({ mutateAsync: updateMock, isPending: false }),
}));
vi.mock('@services/notificationService', () => ({
  showSettingSuccess: vi.fn(),
  showSettingError: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));
vi.mock('@services/installmentPlansService', () => ({
  useInstallmentPlans: () => ({ data: { data: { installment_plans: [] } }, isLoading: false }),
  useCreateInstallmentPlan: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateInstallmentPlan: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteInstallmentPlan: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('Settings — horarios', () => {
  it('cada día es un switch accesible que refleja y cambia su estado', async () => {
    renderWithProviders(<Settings />);
    const lunes = await screen.findByRole('switch', { name: 'Lunes' });
    expect(lunes).toHaveAttribute('aria-checked', 'true');
    const martes = screen.getByRole('switch', { name: 'Martes' });
    expect(martes).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(martes);
    expect(martes).toHaveAttribute('aria-checked', 'true');
  });

  it('cerrar un día con teclado (Espacio) oculta sus horarios', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);
    const lunes = await screen.findByRole('switch', { name: 'Lunes' });
    expect(screen.getByRole('textbox', { name: 'Lunes desde' })).toBeInTheDocument();
    lunes.focus();
    await user.keyboard(' ');
    expect(lunes).toHaveAttribute('aria-checked', 'false');
    expect(screen.queryByRole('textbox', { name: 'Lunes desde' })).toBeNull();
  });

  it('tipear "0830" en "desde" muestra 08:30 y guarda "08:30"', async () => {
    const user = userEvent.setup();
    updateMock.mockResolvedValue({});
    renderWithProviders(<Settings />);
    const desde = await screen.findByRole('textbox', { name: 'Lunes desde' });
    expect(desde).toHaveValue('08:00');
    await user.clear(desde);
    await user.type(desde, '0830');
    expect(desde).toHaveValue('08:30');
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(updateMock.mock.calls[0][0].opening_hours.lunes).toEqual({ open: true, from: '08:30', to: '17:00' });
  });

  it.each([
    ['vacío', ''],
    ['incompleto', '08'],
    ['fuera de rango', '2575'],
  ])('no guarda un día abierto con "desde" %s y muestra el mensaje', async (_, typed) => {
    const user = userEvent.setup();
    updateMock.mockReset();
    renderWithProviders(<Settings />);
    const desde = await screen.findByRole('textbox', { name: 'Lunes desde' });
    await user.clear(desde);
    if (typed) await user.type(desde, typed);
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(await screen.findByText('Completá desde y hasta con una hora válida (hh:mm)')).toBeInTheDocument();
    expect(desde).toHaveAttribute('aria-invalid', 'true');
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('un día cerrado no exige horario', async () => {
    const user = userEvent.setup();
    updateMock.mockReset();
    updateMock.mockResolvedValue({});
    renderWithProviders(<Settings />);
    const desde = await screen.findByRole('textbox', { name: 'Lunes desde' });
    await user.clear(desde);
    fireEvent.click(screen.getByRole('switch', { name: 'Lunes' }));
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(updateMock.mock.calls[0][0].opening_hours.lunes).toMatchObject({ open: false });
  });
});

describe('Settings — contacto', () => {
  it('guarda email e Instagram', async () => {
    updateMock.mockResolvedValue({});
    renderWithProviders(<Settings />);
    fireEvent.change(await screen.findByPlaceholderText(/lubricentro@gmail.com/), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/sin @/), { target: { value: 'killamet' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(updateMock.mock.calls.at(-1)[0]).toMatchObject({ email: 'a@b.com', instagram: 'killamet' });
  });

  it('no guarda un email inválido', async () => {
    updateMock.mockClear();
    renderWithProviders(<Settings />);
    fireEvent.change(await screen.findByPlaceholderText(/lubricentro@gmail.com/), { target: { value: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    expect(await screen.findByText('Ingresá un email válido')).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('muestra la sección de planes de cuotas', async () => {
    renderWithProviders(<Settings />);
    expect(await screen.findByRole('heading', { name: 'Planes de cuotas' })).toBeInTheDocument();
  });

  it('horarios y planes de cuotas van en la columna lateral', async () => {
    renderWithProviders(<Settings />);
    const aside = await screen.findByRole('complementary', { name: 'Horarios y planes de cuotas' });
    expect(within(aside).getByRole('switch', { name: 'Lunes' })).toBeInTheDocument();
    expect(within(aside).getByRole('heading', { name: 'Planes de cuotas' })).toBeInTheDocument();
    expect(within(aside).queryByPlaceholderText('Ej: Lubricentro El Rápido')).toBeNull();
  });
});
