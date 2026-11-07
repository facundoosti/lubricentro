import { create } from 'zustand';
import authAPI from '@services/authService';

// Se incrementa en cada login/logout. init() lo usa para descartar su resultado si la
// sesión cambió mientras esperaba verifyToken() (si no, borraría un login recién hecho).
let sessionVersion = 0;

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  init: async () => {
    const version = sessionVersion;
    try {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser && authAPI.isAuthenticated()) {
        const isValid = await authAPI.verifyToken();
        if (version !== sessionVersion) return;
        if (isValid) {
          set({ user: currentUser, isAuthenticated: true });
        } else {
          authAPI.logout();
        }
      }
    } catch {
      if (version === sessionVersion) authAPI.logout();
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    sessionVersion += 1;
    set({ loading: true });
    try {
      const response = await authAPI.login(email, password);
      set({ user: response.data.user, isAuthenticated: true });
      return response;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    sessionVersion += 1;
    authAPI.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
}));

// Se inicializa después de crear el store: si init() corre dentro del callback de
// create() y no hay sesión, su set({ loading: false }) se pierde (lo pisa el estado inicial).
useAuthStore.getState().init();
