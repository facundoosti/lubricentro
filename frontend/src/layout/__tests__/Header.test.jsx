import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Header from '@layout/Header';

const { logout, navigate, notifications } = vi.hoisted(() => ({
  logout: vi.fn(),
  navigate: vi.fn(),
  notifications: { showSuccess: vi.fn() },
}));

vi.mock('@stores/useAuthStore', () => ({
  useAuthStore: () => ({ user: { email: 'qa@test.com' }, logout }),
}));
vi.mock('@stores/useSidebarStore', () => ({
  useSidebarStore: () => ({ isMobileOpen: false, toggleMobileSidebar: vi.fn() }),
}));
vi.mock('@stores/useThemeStore', () => ({
  useThemeStore: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));
vi.mock('@hooks/useTour', () => ({ useTour: () => ({ startTour: vi.fn() }) }));
vi.mock('@services/notificationService', () => notifications);
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}));

describe('Header — cerrar sesión', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cierra sesión y va al login sin mostrar notificación de éxito', () => {
    renderWithProviders(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /qa/i }));
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/login');
    expect(notifications.showSuccess).not.toHaveBeenCalled();
  });
});
