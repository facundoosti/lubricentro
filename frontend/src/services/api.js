import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Solo setear JSON si el body no es FormData (que necesita multipart/form-data con boundary)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const conversationsAPI = {
  getAll: (params = {}) => api.get('/conversations', { params }),
  getById: (id) => api.get(`/conversations/${id}`),
  assignHuman: (id) => api.patch(`/conversations/${id}/assign_human`),
  archive: (id) => api.patch(`/conversations/${id}/archive`),
  markAsSupplier: (id) => api.patch(`/conversations/${id}/mark_as_supplier`),
};

export const messagesAPI = {
  create: (conversationId, data) =>
    api.post(`/conversations/${conversationId}/messages`, { message: data }),
};

export { api };
export default api;
