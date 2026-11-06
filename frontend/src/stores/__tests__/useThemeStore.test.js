import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@stores/useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.add('dark');
    useThemeStore.setState({ theme: 'dark' });
  });

  it('alterna a claro: quita la clase dark y persiste', () => {
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('vuelve a oscuro en el segundo toggle', () => {
    useThemeStore.getState().toggleTheme();
    useThemeStore.getState().toggleTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
