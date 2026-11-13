import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Header from '@layout/Header';
import { useThemeStore } from '@stores/useThemeStore';

// Store de tema real (el resto del encabezado, mockeado)
vi.mock('@stores/useAuthStore', () => ({
  useAuthStore: () => ({ user: { email: 'qa@test.com' }, logout: vi.fn() }),
}));
vi.mock('@stores/useSidebarStore', () => ({
  useSidebarStore: () => ({ isMobileOpen: false, toggleMobileSidebar: vi.fn() }),
}));
vi.mock('@hooks/useTour', () => ({ useTour: () => ({ startTour: vi.fn() }) }));

describe('Header — switch de tema', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
    document.documentElement.classList.remove('dark');
  });

  it('activar "Modo oscuro" pasa la app a oscuro y queda aria-checked="true"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    const toggle = screen.getByRole('switch', { name: 'Modo oscuro' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    expect(document.documentElement).toHaveClass('dark');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('se maneja con teclado (Enter)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    const toggle = screen.getByRole('switch', { name: 'Modo oscuro' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(useThemeStore.getState().theme).toBe('dark');
  });
});
