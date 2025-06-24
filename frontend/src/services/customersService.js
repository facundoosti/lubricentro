import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';

// Query Keys
export const customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  list: (filters) => [...customerKeys.lists(), filters],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
};

// Hooks para Customers
export const useCustomers = (filters = {}) => {
  const {
    page = 1,
    per_page = 10,
    search = '',
    ...otherFilters
  } = filters;

  return useQuery({
    queryKey: customerKeys.list({ page, per_page, search, ...otherFilters }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      // Agregar otros filtros si existen
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/customers?${params}`);
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCustomer = (id) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 0, // Siempre considerar los datos como stale para forzar refetch
  });
};

// Mutations
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData) => {
      console.log("useCreateCustomer - mutationFn called with:", customerData);
      console.log("useCreateCustomer - API URL:", '/customers');
      console.log("useCreateCustomer - Request data:", { customer: customerData });
      
      const response = await api.post('/customers', { customer: customerData });
      console.log("useCreateCustomer - Response:", response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("useCreateCustomer - onSuccess called with:", data);
      // Invalidar y refetch la lista de customers
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Agregar el nuevo customer al cache si es necesario
      if (data.data?.customer) {
        queryClient.setQueryData(
          customerKeys.detail(data.data.customer.id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      console.error('Error response:', error.response);
      throw error;
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customerData }) => {
      const response = await api.put(`/customers/${id}`, { customer: customerData });
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("useUpdateCustomer - onSuccess called with:", data);
      console.log("useUpdateCustomer - variables:", variables);
      
      // Invalidar y refetch la lista de customers
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Forzar refetch del customer específico
      queryClient.refetchQueries({ queryKey: customerKeys.detail(variables.id) });
      
      // También actualizar el cache directamente como respaldo
      queryClient.setQueryData(
        customerKeys.detail(variables.id),
        data
      );
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      throw error;
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidar y refetch la lista de customers
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Remover el customer del cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      throw error;
    },
  });
};

// Funciones helper para el servicio
export const customersService = {
  // Obtener todos los customers con filtros
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/customers?${params}`);
    return response.data;
  },

  // Obtener un customer por ID
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Crear un nuevo customer
  create: async (customerData) => {
    const response = await api.post('/customers', { customer: customerData });
    return response.data;
  },

  // Actualizar un customer
  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, { customer: customerData });
    return response.data;
  },

  // Eliminar un customer
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Buscar customers
  search: async (query) => {
    const response = await api.get('/customers', { 
      params: { search: query } 
    });
    return response.data;
  },
};

// Tipos de datos para TypeScript (si se usa en el futuro)
export const customerTypes = {
  Customer: {
    id: 'number',
    name: 'string',
    email: 'string | null',
    phone: 'string | null',
    address: 'string | null',
    vehicles_count: 'number',
    created_at: 'string',
    updated_at: 'string',
  },
  
  CustomerFilters: {
    page: 'number',
    per_page: 'number',
    search: 'string',
  },
  
  CustomerCreateData: {
    name: 'string',
    email: 'string | null',
    phone: 'string | null',
    address: 'string | null',
  },
  
  CustomerUpdateData: {
    name: 'string | null',
    email: 'string | null',
    phone: 'string | null',
    address: 'string | null',
  },
}; 