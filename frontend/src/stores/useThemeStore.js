import { create } from 'zustand';

const STORAGE_KEY = 'theme';

const readTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage no disponible: el tema solo dura la sesión
  }
};

// El tema inicial lo aplica el script inline de index.html (evita el flash).
export const useThemeStore = create((set, get) => ({
  theme: readTheme(),
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    set({ theme });
  },
}));
