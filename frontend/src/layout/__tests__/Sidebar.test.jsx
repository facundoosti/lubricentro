import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { useSidebarStore } from '@stores/useSidebarStore';
import Sidebar from '@layout/Sidebar';

vi.mock('@stores/useAuthStore', () => ({ useAuthStore: () => ({ logout: vi.fn() }) }));

const activeItems = (container) => container.querySelectorAll('.menu-item-active');

describe('Sidebar', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isExpanded: true, isHovered: false, isMobileOpen: false, openSubmenu: null });
  });

  it('H-08 · abrir un submenú no lo marca activo si la ruta actual no está dentro', () => {
    const { container } = renderWithProviders(<Sidebar />, { route: '/dashboard' });
    fireEvent.click(screen.getByRole('button', { name: /Operaciones/ }));
    expect(screen.getByRole('button', { name: /Operaciones/ })).toHaveAttribute('aria-expanded', 'true');
    expect(activeItems(container)).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass('menu-item-active');
  });

  it('el grupo sí queda activo cuando la ruta actual es uno de sus subítems', () => {
    renderWithProviders(<Sidebar />, { route: '/budgets' });
    expect(screen.getByRole('button', { name: /Operaciones/ })).toHaveClass('menu-item-active');
  });

  it('H-08 · colapsado: cada ítem tiene nombre accesible y title', () => {
    useSidebarStore.setState({ isExpanded: false });
    renderWithProviders(<Sidebar />, { route: '/dashboard' });
    ['Dashboard', 'Inbox', 'Recordatorios', 'Configuración'].forEach((name) => {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('title', name);
    });
    ['Clientes', 'Operaciones', 'Catálogo', 'Cerrar sesión'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toHaveAttribute('title', name);
    });
  });

  it('Inbox y Recordatorios muestran el badge "Beta"; el resto no', () => {
    renderWithProviders(<Sidebar />, { route: '/dashboard' });
    ['Inbox', 'Recordatorios'].forEach((name) => {
      const link = screen.getByRole('link', { name: new RegExp(name) });
      expect(within(link).getByText('Beta')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Beta')).toHaveLength(2);
  });

  it('colapsado: no muestra el badge "Beta" y el link conserva su nombre', () => {
    useSidebarStore.setState({ isExpanded: false });
    renderWithProviders(<Sidebar />, { route: '/dashboard' });
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveAttribute('title', 'Inbox');
  });
});
