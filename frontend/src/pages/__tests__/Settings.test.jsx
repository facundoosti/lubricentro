import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Settings from '@pages/Settings';

// Objeto estable: Settings hace reset() en un useEffect que depende de `data`
const settingQuery = vi.hoisted(() => ({
  data: { data: { lubricentro_name: 'Lubri', opening_hours: { lunes: { open: true, from: '08:00', to: '17:00' } } } },
  isLoading: false,
  error: null,
}));
vi.mock('@services/settingsService', () => ({
  useSetting: () => settingQuery,
  useUpdateSetting: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@services/notificationService', () => ({ showSettingSuccess: vi.fn(), showSettingError: vi.fn() }));

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
});
