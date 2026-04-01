import { create } from 'zustand';
import authAPI from '@services/authService';

export const useAuthStore = create((set) => {
  // Auto-initialize on store creation
  const init = async () => {
    try {
      const currentUser = authAPI.getCurrentUser();
      if (currentUser && authAPI.isAuthenticated()) {
        const isValid = await authAPI.verifyToken();
        if (isValid) {
          set({ user: currentUser, isAuthenticated: true });
        } else {
          authAPI.logout();
        }
      }
    } catch {
      authAPI.logout();
    } finally {
      set({ loading: false });
    }
  };

  init();

  return {
    user: null,
    loading: true,
    isAuthenticated: false,

    login: async (email, password) => {
      set({ loading: true });
      const response = await authAPI.login(email, password);
      set({ user: response.data.user, isAuthenticated: true, loading: false });
      return response;
    },

    logout: () => {
      authAPI.logout();
      set({ user: null, isAuthenticated: false });
    },

    updateUser: (userData) => {
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData });
    },
  };
});
