import api from '@services/api';

export const authAPI = {
  // Login con email y password
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        auth: {
          email,
          password
        }
      });
      
      if (response.data.success) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error en login');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirigir a login (se manejará en el contexto)
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar token con el backend
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data.success;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  // Refresh token (si es necesario en el futuro)
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.data.token);
        return response.data;
      }
      throw new Error(response.data.message || 'Error refreshing token');
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
};

export default authAPI; 