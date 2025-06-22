import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

console.log("API_BASE_URL:", API_BASE_URL);

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url, config.data);
    // Agregar token de autenticación si existe (posterior)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.status, error.response?.data);
    // Manejar errores de autenticación (posterior)
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Redirigir a login (posterior)
    }
    return Promise.reject(error);
  }
);

// Servicios específicos por entidad
export const customersAPI = {
  getAll: (params = {}) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  search: (query) => api.get('/customers', { params: { search: query } }),
};

export const vehiclesAPI = {
  getAll: (params = {}) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  getByCustomer: (customerId) => api.get(`/customers/${customerId}/vehicles`),
};

export const servicesAPI = {
  getAll: (params = {}) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const appointmentsAPI = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  upcoming: () => api.get('/appointments/upcoming'),
  confirm: (id) => api.patch(`/appointments/${id}/confirm`),
  complete: (id) => api.patch(`/appointments/${id}/complete`),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
};

export const serviceRecordsAPI = {
  getAll: (params = {}) => api.get('/service_records', { params }),
  getById: (id) => api.get(`/service_records/${id}`),
  create: (data) => api.post('/service_records', data),
  update: (id, data) => api.put(`/service_records/${id}`, data),
  delete: (id) => api.delete(`/service_records/${id}`),
  overdue: () => api.get('/service_records/overdue'),
  upcoming: () => api.get('/service_records/upcoming'),
  statistics: () => api.get('/service_records/statistics'),
};

export default api; 