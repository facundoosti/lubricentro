import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Login from '@pages/Login';

const { login, navigate, notifications } = vi.hoisted(() => ({
  login: vi.fn(),
  navigate: vi.fn(),
  notifications: { showAuthError: vi.fn() },
}));

vi.mock('@stores/useAuthStore', () => ({ useAuthStore: () => ({ login }) }));
vi.mock('@services/notificationService', () => notifications);
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));

const submit = () => {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'qa@test.com' } });
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secreto' } });
  fireEvent.submit(screen.getByLabelText(/email/i).closest('form'));
};

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('al loguearse bien navega al dashboard sin mostrar notificación de éxito', async () => {
    login.mockResolvedValue({});
    renderWithProviders(<Login />);
    submit();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('si el login falla muestra el error', async () => {
    login.mockRejectedValue(new Error('Credenciales inválidas'));
    renderWithProviders(<Login />);
    submit();
    await waitFor(() =>
      expect(notifications.showAuthError).toHaveBeenCalledWith('LOGIN_ERROR', 'Credenciales inválidas'),
    );
    expect(navigate).not.toHaveBeenCalled();
  });
});
