import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@services/api';

// Query Keys
export const serviceKeys = {
  all: ['services'],
  lists: () => [...serviceKeys.all, 'list'],
  list: (filters) => [...serviceKeys.lists(), filters],
  details: () => [...serviceKeys.all, 'detail'],
  detail: (id) => [...serviceKeys.details(), id],
};

// Hooks para Services
export const useServices = (filters = {}) => {
  const {
    page = 1,
    per_page = 10,
    search = '',
    min_price,
    max_price,
    ...otherFilters
  } = filters;

  return useQuery({
    queryKey: serviceKeys.list({ page, per_page, search, min_price, max_price, ...otherFilters }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      if (min_price) {
        params.append('min_price', min_price.toString());
      }

      if (max_price) {
        params.append('max_price', max_price.toString());
      }

      // Agregar otros filtros si existen
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/services?${params}`);
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useService = (id) => {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/services/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Mutations
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData) => {
      console.log("useCreateService - mutationFn called with:", serviceData);
      const response = await api.post('/services', { service: serviceData });
      console.log("useCreateService - Response:", response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("useCreateService - onSuccess called with:", data);
      // Invalidar y refetch la lista de services
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      
      // Agregar el nuevo service al cache si es necesario
      if (data.data?.service) {
        queryClient.setQueryData(
          serviceKeys.detail(data.data.service.id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Error creating service:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, serviceData }) => {
      console.log("useUpdateService - mutationFn called with:", { id, serviceData });
      const response = await api.put(`/services/${id}`, { service: serviceData });
      console.log("useUpdateService - Response:", response);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("useUpdateService - onSuccess called with:", data);
      // Invalidar y refetch la lista de services
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      
      // Actualizar el service específico en el cache
      queryClient.setQueryData(
        serviceKeys.detail(variables.id),
        data
      );
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      console.log("useDeleteService - mutationFn called with id:", id);
      const response = await api.delete(`/services/${id}`);
      console.log("useDeleteService - Response:", response);
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log("useDeleteService - onSuccess called with:", data);
      // Invalidar y refetch la lista de services
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      
      // Remover el service del cache
      queryClient.removeQueries({ queryKey: serviceKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

// Funciones helper para el servicio
export const servicesService = {
  // Obtener todos los services con filtros
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/services?${params}`);
    return response.data;
  },

  // Obtener un service por ID
  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Crear un nuevo service
  create: async (serviceData) => {
    const response = await api.post('/services', { service: serviceData });
    return response.data;
  },

  // Actualizar un service
  update: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, { service: serviceData });
    return response.data;
  },

  // Eliminar un service
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  // Buscar services
  search: async (query) => {
    const response = await api.get('/services', { 
      params: { search: query } 
    });
    return response.data;
  },

  // Obtener services por rango de precio
  getByPriceRange: async (minPrice, maxPrice) => {
    const response = await api.get('/services', { 
      params: { min_price: minPrice, max_price: maxPrice } 
    });
    return response.data;
  },
};

// Tipos de datos para TypeScript (si se usa en el futuro)
export const serviceTypes = {
  Service: {
    id: 'number',
    name: 'string',
    description: 'string | null',
    base_price: 'string',
    created_at: 'string',
    updated_at: 'string',
  },
  
  ServiceFilters: {
    page: 'number',
    per_page: 'number',
    search: 'string',
    min_price: 'number',
    max_price: 'number',
  },
  
  ServiceCreateData: {
    name: 'string',
    description: 'string | null',
    base_price: 'number',
  },
  
  ServiceUpdateData: {
    name: 'string | null',
    description: 'string | null',
    base_price: 'number | null',
  },
}; 